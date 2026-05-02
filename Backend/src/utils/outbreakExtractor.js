// utils/outbreakExtractor.js
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 90_000,    // 🔥 90s — gpt-4o-mini can be slow on bigger batches
  maxRetries: 3,      // SDK auto-retries on 429/5xx/network
});

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const UNIQUE_ID_REGEX = /([A-Z]{2,3}\/[A-Z]{3}\/\d{4}\/\d+\/\d+)/;
const UNIQUE_ID_SPLIT = /(?=[A-Z]{2,3}\/[A-Z]{3}\/\d{4}\/\d+\/\d+)/;

const splitIntoBlocks = (rawText) => {
  const cleaned = rawText
    .replace(/(\d+)\s*-\s*(\d+)\s*-\s*(\d{4})/g, "$1-$2-$3")
    .replace(/\s+-\s+/g, "-")
    .replace(/\d+\s*\|\s*Page/gi, " ")
    .replace(/INTEGRATED DISEASE SURVEILLANCE PROGRAMME/gi, " ")
    .replace(/NATIONAL CENTRE FOR DISEASE CONTROL/gi, " ")
    .replace(/([A-Z]{2,3})\s*\/\s*([A-Z]{3})\s*\/\s*(\d{4})\s*\/\s*(\d+)\s*\/\s*(\d+)/g, "$1/$2/$3/$4/$5")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned
    .split(UNIQUE_ID_SPLIT)
    .filter(b => UNIQUE_ID_REGEX.test(b))
    .map(b => b.trim().slice(0, 2500));
};

/**
 * Extract metadata for a batch with manual retries on top of SDK retries.
 */
const extractMetadataBatch = async (blocks, attempt = 1) => {
  const MAX_ATTEMPTS = 4;

  const numbered = blocks.map((b, i) => `--- ENTRY ${i + 1} ---\n${b}`).join("\n\n");

  const prompt = `You are extracting structured data from Indian IDSP (Integrated Disease Surveillance Program) outbreak reports.

For each numbered entry below, extract these fields.

Required fields per entry:
- uniqueId: the ID like "AP/GUN/2026/12/453"
- state: full state/UT name (e.g. "Andhra Pradesh", "Tamil Nadu")
- district: the district name only (e.g. "Guntur", "Kozhikode")
- disease: the disease name (e.g. "Measles", "Acute Diarrhoeal Disease", "Shigellosis", "Mpox (Clade II)")
- cases: number of cases (integer, 0 if not stated)
- deaths: number of deaths (integer, 0 if not stated)
- startDate: outbreak start date in DD-MM-YYYY format, or null
- status: "Under Control" or "Under Surveillance" or null
- year: the 4-digit year extracted from the uniqueId (e.g. 2026 from "AP/GUN/2026/12/453")
- weekNumber: the week number extracted from the uniqueId (e.g. 12 from "AP/GUN/2026/12/453")

Rules:
- If a field is genuinely missing, use null (or 0 for cases/deaths).
- Do not invent data. Extract only what's in the entry.
- The PDF may have OCR artifacts (split words like "Jharkhan d", "Karnatak a") — interpret them correctly.
- The uniqueId format is: STATE_CODE/DISTRICT_CODE/YEAR/WEEK/SERIAL — extract year and weekNumber from positions 3 and 4.

Return your response as a JSON object with this exact structure:
{ "entries": [ {...}, {...}, ... ] }

The "entries" array must contain exactly ${blocks.length} objects, one per entry, in the same order as the input.

Entries:
${numbered}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0].message.content;
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error("LLM returned invalid JSON");
    }

    let arr;
    if (Array.isArray(parsed)) {
      arr = parsed;
    } else if (typeof parsed === "object" && parsed !== null) {
      const wrapperKeys = ["entries", "outbreaks", "data", "results", "items"];
      const wrapperKey = wrapperKeys.find(k => Array.isArray(parsed[k]));

      if (wrapperKey) {
        arr = parsed[wrapperKey];
      } else {
        const values = Object.values(parsed);
        if (values.every(v => typeof v === "object" && v !== null)) {
          arr = values;
        } else if (parsed.uniqueId) {
          arr = [parsed];
        }
      }
    }

    if (!Array.isArray(arr)) {
      throw new Error("Could not normalize LLM output");
    }

    return arr;

  } catch (err) {
    if (attempt >= MAX_ATTEMPTS) {
      console.error(`❌ Batch failed after ${MAX_ATTEMPTS} attempts: ${err.message}`);
      throw err;
    }
    const backoff = 2000 * Math.pow(2, attempt - 1); // 2s, 4s, 8s
    console.warn(`⚠️  Batch attempt ${attempt} failed (${err.message}), retrying in ${backoff}ms...`);
    await sleep(backoff);
    return extractMetadataBatch(blocks, attempt + 1);
  }
};

/**
 * Main export: split + extract → returns chunks ready for embedding.
 */
export const extractOutbreakChunks = async (rawText) => {
  const blocks = splitIntoBlocks(rawText);
  console.log(`📑 Split into ${blocks.length} outbreak blocks`);

  if (blocks.length === 0) return [];

  // 🔥 Smaller batches = faster individual calls = less timeout risk
  const BATCH_SIZE = 5;
  const allMetadata = [];

  for (let i = 0; i < blocks.length; i += BATCH_SIZE) {
    const batch = blocks.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(blocks.length / BATCH_SIZE);
    console.log(`🤖 Extracting metadata for batch ${batchNum}/${totalBatches} (${batch.length} entries)...`);
    
    const metadata = await extractMetadataBatch(batch);
    allMetadata.push(...metadata);
  }

  return blocks.map((text, i) => {
    const meta = allMetadata[i] || {};

    let year = typeof meta.year === "number" ? meta.year : null;
    let weekNumber = typeof meta.weekNumber === "number" ? meta.weekNumber : null;

    if ((!year || !weekNumber) && meta.uniqueId) {
      const parts = meta.uniqueId.split("/");
      if (parts.length >= 4) {
        if (!year) year = parseInt(parts[2], 10) || null;
        if (!weekNumber) weekNumber = parseInt(parts[3], 10) || null;
      }
    }

    return {
      text,
      metadata: {
        uniqueId: meta.uniqueId || null,
        state: meta.state || null,
        district: meta.district || null,
        disease: meta.disease || null,
        cases: typeof meta.cases === "number" ? meta.cases : 0,
        deaths: typeof meta.deaths === "number" ? meta.deaths : 0,
        startDate: meta.startDate || null,
        status: meta.status || null,
        year,
        weekNumber,
        chunkType: "outbreak_entry",
      },
    };
  });
};