import { getBucket } from "../db/gridfs.js";
import { Report } from "../models/Report.js";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MAX_REPORTS = 20;
const TOP_CHUNKS = 5;
const cache = new Map();

// 🔥 disease vocabulary
const DISEASE_WORDS = [
  "dengue", "malaria", "measles", "chickenpox",
  "diarrhoeal", "poisoning", "hepatitis",
  "chikungunya", "fever"
];

const STOP_WORDS = new Set([
  "a","an","and","are","as","at","be","by","for","from","has","have","how",
  "i","in","is","it","me","near","of","on","or","our","the","this","to",
  "was","what","when","where","which","with","you","your"
]);

/* ---------------- HELPERS ---------------- */

const streamToBuffer = (stream) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks)));
  });

const normalizeText = (text) =>
  text
    .replace(/\s+/g, " ")
    .replace(/[^\x20-\x7E]/g, " ")
    .trim();

/* ---------------- PDF PARSER ---------------- */

const extractPdfText = async (buffer) => {
  const uint8Array = new Uint8Array(buffer);

  const pdf = await pdfjsLib.getDocument({
    data: uint8Array,
  }).promise;

  let text = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();

    const strings = content.items.map((item) => item.str);
    text += strings.join(" ") + " ";
  }

  return normalizeText(text);
};

const extractText = async (buffer, mimeType) => {
  if (mimeType === "application/pdf") {
    return await extractPdfText(buffer);
  }
  return normalizeText(buffer.toString("utf8"));
};

/* ---------------- TOKENIZE ---------------- */

const tokenize = (text) =>
  normalizeText(text)
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 2 && !STOP_WORDS.has(t));

/* ---------------- CHUNKING ---------------- */

const chunkText = (text) => {
  const clean = normalizeText(text);

  const parts = clean.match(/.{120,300}/g) || [];
  const chunks = [];

  for (const p of parts) {
    const hasDisease = DISEASE_WORDS.some(d =>
      p.toLowerCase().includes(d)
    );

    const hasNumber = /\d+/.test(p);

    if (
      (hasDisease || hasNumber) &&
      !p.toLowerCase().includes("page") &&
      !p.toLowerCase().includes("nic.in")
    ) {
      chunks.push(p.trim());
    }
  }

  if (chunks.length === 0) {
    console.log("⚠️ chunk fallback used");
    return parts.slice(0, 20);
  }

  return chunks;
};

/* ---------------- SCORING ---------------- */

const scoreChunk = (chunk, queryTokens) => {
  const tokens = tokenize(chunk);
  const freq = new Map();

  tokens.forEach(t => freq.set(t, (freq.get(t) || 0) + 1));

  let score = queryTokens.reduce((s, t) => s + (freq.get(t) || 0), 0);

  if (DISEASE_WORDS.some(d => chunk.toLowerCase().includes(d))) {
    score += 5;
  }

  if (/\d+/.test(chunk)) {
    score += 2;
  }

  return score;
};

/* ---------------- CACHE ---------------- */

const getReportText = async (report) => {
  const key = `${report._id}`;
  if (cache.has(key)) return cache.get(key);

  const bucket = getBucket();
  const buffer = await streamToBuffer(
    bucket.openDownloadStream(report.gridfsFileId)
  );

  const text = await extractText(buffer, report.mimeType);

  cache.set(key, text);
  return text;
};

/* ---------------- MAIN RAG ---------------- */

export const askReportRag = async (question, userLocation) => {
  const queryTokens = [
    ...tokenize(`${question} ${userLocation || ""}`),
    ...DISEASE_WORDS
  ];

  const reports = await Report.find()
    .sort({ createdAt: -1 })
    .limit(MAX_REPORTS);

  const allChunks = [];

  for (const report of reports) {
    const text = await getReportText(report);
    const chunks = chunkText(text);

    console.log(`📄 ${report.originalName} → CHUNKS:`, chunks.length);

    for (const chunk of chunks) {
      allChunks.push({
        chunk,
        report,
        score: scoreChunk(chunk, queryTokens)
      });
    }
  }

  console.log("📊 TOTAL CHUNKS:", allChunks.length);

  const ranked = allChunks
    .sort((a, b) => b.score - a.score)
    .slice(0, TOP_CHUNKS);

  console.log("🏆 TOP RESULTS COUNT:", ranked.length);

  if (!ranked.length) {
    return {
      answer: "No relevant data found.",
      sources: []
    };
  }

  /* ---------------- OPENAI ANSWER ---------------- */

  const context = ranked.map(r => r.chunk).join("\n\n");

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a medical outbreak analyst. Extract diseases, locations, and case numbers clearly in bullet points."
      },
      {
        role: "user",
        content: `Context:\n${context}\n\nQuestion: ${question}`
      }
    ],
  });

  return {
    answer: completion.choices[0].message.content,
    sources: ranked.map(r => ({
      id: r.report._id,
      name: r.report.originalName
    }))
  };
};