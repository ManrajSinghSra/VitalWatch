import { getBucket } from "../../db/gridfs.js";
import { extractPdfText } from "../../utils/pdfParser.js";
import { getEmbedding } from "../../utils/embedding.js";
import { ReportChunk } from "../../models/ReportChunk.js";

const DISEASE_WORDS = [
  "dengue", "malaria", "measles", "chickenpox",
  "diarrhoeal", "poisoning", "hepatitis",
  "chikungunya", "fever"
];


const normalizeText = (text) =>
  text
    .replace(/\s+/g, " ")
    .replace(/[^\x20-\x7E]/g, " ")
    .trim();

// ✅ your existing chunker
const chunkText = (text) => {
  const clean = normalizeText(text);

  const parts = clean.match(/.{120,300}/g) || [];

  const chunks = [];

  for (const p of parts) {
    const hasDisease = DISEASE_WORDS.some(d =>
      p.toLowerCase().includes(d)
    );

    const hasNumber = /\d+/.test(p);

    if (hasDisease || hasNumber) {
      chunks.push(p.trim());
    }
  }

  // 🔥 fallback (critical)
  if (chunks.length === 0) {
    console.log("⚠️ chunk fallback used");
    return parts.slice(0, 20);
  }

  return chunks;
};

// 🔥 ADD THIS (this is what your import expects)
export const ingestReport = async (report) => {
  try {
    console.log("🚀 INGEST START");

    const bucket = getBucket();

    const stream = bucket.openDownloadStream(report.gridfsFileId);

    const buffer = await new Promise((resolve, reject) => {
      const chunks = [];
      stream.on("data", (chunk) => chunks.push(chunk));
      stream.on("end", () => resolve(Buffer.concat(chunks)));
      stream.on("error", reject);
    });

    const rawText = await extractPdfText(buffer);

    const text = rawText
      .replace(/\d+\s*\|\s*Page/gi, "")
      .replace(/\s+/g, " ")
      .trim();

    const chunks = chunkText(text);

    console.log("🔪 CHUNKS:", chunks.length);

    for (const chunk of chunks) {
      const embedding = await getEmbedding(chunk);

      await ReportChunk.create({
        reportId: report._id,
        text: chunk,
        embedding,
      });
    }

    console.log("✅ INGEST DONE");

  } catch (err) {
    console.error("🔥 INGEST ERROR:", err.message);
  }
};