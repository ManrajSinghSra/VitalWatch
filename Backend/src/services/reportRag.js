import { getBucket } from "../db/gridfs.js";
import { Report } from "../models/Report.js";

const MAX_REPORTS = 20;
const CHUNK_SIZE = 900;
const CHUNK_OVERLAP = 180;
const TOP_CHUNKS = 4;
const cache = new Map();

const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "has",
  "have", "how", "i", "in", "is", "it", "me", "near", "of", "on", "or",
  "our", "the", "this", "to", "was", "what", "when", "where", "which",
  "with", "you", "your",
]);

const streamToBuffer = (stream) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks)));
  });

const normalizeText = (text) =>
  text
    .replace(/\\r|\\n/g, " ")
    .replace(/\s+/g, " ")
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, " ")
    .trim();

const extractPdfText = (buffer) => {
  const raw = buffer.toString("latin1");
  const snippets = [];
  const textOperatorPattern = /\(([^()]|\\.){4,}\)\s*Tj|\[((?:.|\n){8,}?)\]\s*TJ/g;
  let match;

  while ((match = textOperatorPattern.exec(raw)) !== null) {
    snippets.push(
      match[0]
        .replace(/\\[nrtbf()\\]/g, " ")
        .replace(/[()[\]]/g, " ")
        .replace(/\s*T[Jj]$/g, " ")
    );
  }

  const extracted = normalizeText(snippets.join(" "));
  if (extracted.length > 200) return extracted;

  return normalizeText(raw.replace(/[^A-Za-z0-9.,:;/%()\- ]/g, " "));
};

const extractDocxText = async (buffer) => {
  const zlib = await import("zlib");
  const textParts = [];
  let offset = 0;

  while (offset < buffer.length - 30) {
    const signature = buffer.readUInt32LE(offset);
    if (signature !== 0x04034b50) {
      offset += 1;
      continue;
    }

    const method = buffer.readUInt16LE(offset + 8);
    const compressedSize = buffer.readUInt32LE(offset + 18);
    const fileNameLength = buffer.readUInt16LE(offset + 26);
    const extraLength = buffer.readUInt16LE(offset + 28);
    const nameStart = offset + 30;
    const dataStart = nameStart + fileNameLength + extraLength;
    const name = buffer.toString("utf8", nameStart, nameStart + fileNameLength);
    const dataEnd = dataStart + compressedSize;

    if (name.endsWith(".xml") && dataEnd <= buffer.length) {
      const compressed = buffer.subarray(dataStart, dataEnd);
      let xml = "";

      if (method === 0) xml = compressed.toString("utf8");
      if (method === 8) xml = zlib.inflateRawSync(compressed).toString("utf8");

      if (xml) {
        textParts.push(
          xml
            .replace(/<w:tab\/>/g, " ")
            .replace(/<\/w:p>/g, ". ")
            .replace(/<[^>]+>/g, " ")
        );
      }
    }

    offset = dataEnd;
  }

  return normalizeText(textParts.join(" "));
};

const extractText = async (buffer, mimeType) => {
  if (mimeType === "application/pdf") return extractPdfText(buffer);
  if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    return extractDocxText(buffer);
  }
  return normalizeText(buffer.toString("utf8"));
};

const tokenize = (text) =>
  normalizeText(text)
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));

const chunkText = (text) => {
  const chunks = [];
  for (let start = 0; start < text.length; start += CHUNK_SIZE - CHUNK_OVERLAP) {
    const chunk = text.slice(start, start + CHUNK_SIZE).trim();
    if (chunk.length > 80) chunks.push(chunk);
  }
  return chunks;
};

const scoreChunk = (chunk, queryTokens) => {
  const chunkTokens = tokenize(chunk);
  const frequencies = new Map();
  chunkTokens.forEach((token) => frequencies.set(token, (frequencies.get(token) || 0) + 1));
  return queryTokens.reduce((score, token) => score + (frequencies.get(token) || 0), 0);
};

const getReportText = async (report) => {
  const cacheKey = `${report._id}:${report.updatedAt?.getTime?.() || report.createdAt?.getTime?.()}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const bucket = getBucket();
  const buffer = await streamToBuffer(bucket.openDownloadStream(report.gridfsFileId));
  const text = await extractText(buffer, report.mimeType);
  const searchableText = normalizeText(
    `${report.originalName}. Source: ${report.source}. ${report.description || ""}. ${text}`
  );

  cache.set(cacheKey, searchableText);
  return searchableText;
};

const pickSentences = (text, queryTokens) => {
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 40);

  return sentences
    .map((sentence) => ({ sentence, score: scoreChunk(sentence, queryTokens) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((item) => item.sentence);
};

export const askReportRag = async (question, userLocation) => {
  const queryTokens = tokenize(`${question} ${userLocation || ""}`);
  const reports = await Report.find()
    .sort({ createdAt: -1 })
    .limit(MAX_REPORTS)
    .select("-__v");

  if (!reports.length) {
    return {
      answer: "No uploaded reports are available yet. Upload IDSP/WHO/NCDC reports first, then ask me about outbreaks, diseases, locations, or precautions from those reports.",
      sources: [],
    };
  }

  const allChunks = [];

  for (const report of reports) {
    const text = await getReportText(report);
    const chunks = chunkText(text);

    chunks.forEach((chunk, index) => {
      const sourceBoost = scoreChunk(`${report.originalName} ${report.source} ${report.description}`, queryTokens);
      allChunks.push({
        chunk,
        report,
        index,
        score: scoreChunk(chunk, queryTokens) + sourceBoost,
      });
    });
  }

  const ranked = allChunks
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, TOP_CHUNKS);

  if (!ranked.length) {
    const latest = reports.slice(0, 3).map((report) => report.originalName).join(", ");
    return {
      answer: `I checked the uploaded reports, but I could not find a clear match for your question. Try asking with a disease, state, district, source, or report name. Latest reports searched: ${latest}.`,
      sources: reports.slice(0, 3).map((report) => ({
        id: report._id,
        name: report.originalName,
        source: report.source,
      })),
    };
  }

  const evidence = ranked.flatMap((item) => pickSentences(item.chunk, queryTokens));
  const fallbackEvidence = ranked.map((item) => `${item.chunk.slice(0, 420)}...`);
  const uniqueEvidence = [...new Set(evidence.length ? evidence : fallbackEvidence)].slice(0, 5);
  const sourceList = ranked.map(({ report, score }) => ({
    id: report._id,
    name: report.originalName,
    source: report.source,
    uploadedAt: report.createdAt,
    score,
  }));

  return {
    answer: [
      "Based on the uploaded reports I found these relevant points:",
      ...uniqueEvidence.map((sentence) => `- ${sentence}`),
      "Use this as report-based guidance, not a medical diagnosis. For severe symptoms or emergencies, contact a healthcare professional.",
    ].join("\n"),
    sources: sourceList,
  };
};
