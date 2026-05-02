import { getBucket } from "../../db/gridfs.js";
import { extractPdfText } from "../../utils/pdfParser.js";
import { getEmbeddingsBatch } from "../../utils/embedding.js";
import { ReportChunk } from "../../models/ReportChunk.js";
import { Report } from "../../models/Report.js";
import { extractOutbreakChunks } from "../../utils/outbreakExtractor.js";

export const ingestReport = async (report) => {
  try {
    console.log("🚀 INGEST START:", report.originalName);

    // idempotency check
    const existingCount = await ReportChunk.countDocuments({ reportId: report._id });
    if (existingCount > 0) {
      console.log(`⏭️  Already ingested (${existingCount} chunks). Skipping.`);
      await Report.findByIdAndUpdate(report._id, { status: "processed" });
      return;
    }

    await Report.findByIdAndUpdate(report._id, { status: "processing" });

    // download from GridFS
    const bucket = getBucket();
    const stream = bucket.openDownloadStream(report.gridfsFileId);
    const buffer = await new Promise((resolve, reject) => {
      const parts = [];
      stream.on("data", c => parts.push(c));
      stream.on("end", () => resolve(Buffer.concat(parts)));
      stream.on("error", reject);
    });

    // parse → extract (LLM does the heavy lifting now)
    const rawText = await extractPdfText(buffer);
    const chunks = await extractOutbreakChunks(rawText);

    console.log(`🔪 Extracted ${chunks.length} outbreak entries`);
    if (chunks.length === 0) throw new Error("No outbreak entries extracted from PDF");

    // batch embed all chunks in one API call (or split if huge)
    const EMBED_BATCH_SIZE = 100;
    let totalInserted = 0;

    for (let i = 0; i < chunks.length; i += EMBED_BATCH_SIZE) {
      const batch = chunks.slice(i, i + EMBED_BATCH_SIZE);

      const inputs = batch.map(c =>
        `${c.metadata.disease || ""} ${c.metadata.state || ""} ${c.metadata.district || ""}\n${c.text}`
      );

      console.log(`🔮 Embedding batch ${Math.floor(i / EMBED_BATCH_SIZE) + 1} (${batch.length} chunks)...`);
      const embeddings = await getEmbeddingsBatch(inputs);

      const docs = batch.map((c, idx) => ({
        reportId: report._id,
        text: c.text,
        embedding: embeddings[idx],
        metadata: c.metadata,
      }));

      await ReportChunk.insertMany(docs, { ordered: false });
      totalInserted += docs.length;
      console.log(`📦 Inserted ${totalInserted}/${chunks.length}`);
    }

    await Report.findByIdAndUpdate(report._id, { status: "processed" });
    console.log("✅ INGEST DONE:", report.originalName);
  } catch (err) {
    console.error("🔥 INGEST ERROR:", err.message);
    await Report.findByIdAndUpdate(report._id, { status: "failed" });
    throw err;
  }
};