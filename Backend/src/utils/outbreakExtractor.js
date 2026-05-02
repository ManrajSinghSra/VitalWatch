// utils/outbreakExtractor.js
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 30_000,
  maxRetries: 3,
});

const UNIQUE_ID_REGEX = /([A-Z]{2,3}\/[A-Z]{3}\/\d{4}\/\d+\/\d+)/;
const UNIQUE_ID_SPLIT = /(?=[A-Z]{2,3}\/[A-Z]{3}\/\d{4}\/\d+\/\d+)/;

/**
 * Step 1: split the raw PDF text into one block per outbreak entry.
 * Uses only the Unique ID pattern as the boundary — no hardcoded lists.
 */
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
 * Step 2: use LLM to extract structured metadata from a batch of blocks.
 * One API call per batch — cheap, accurate, format-agnostic.
 */
const extractMetadataBatch = async (blocks) => {
  const numbered = blocks.map((b, i) => `--- ENTRY ${i + 1} ---\n${b}`).join("\n\n");

  const prompt = `You are extracting structured data from Indian IDSP (Integrated Disease Surveillance Program) outbreak reports.

For each numbered entry below, extract these fields. Return a JSON array with one object per entry, in the same order.

Required fields per entry:
- uniqueId: the ID like "AP/GUN/2026/12/453"
- state: full state/UT name (e.g. "Andhra Pradesh", "Tamil Nadu")
- district: the district name only (e.g. "Guntur", "Kozhikode")
- disease: the disease name (e.g. "Measles", "Acute Diarrhoeal Disease", "Shigellosis", "Mpox (Clade II)")
- cases: number of cases (integer, 0 if not stated)
- deaths: number of deaths (integer, 0 if not stated)
- startDate: outbreak start date in DD-MM-YYYY format, or null
- status: "Under Control" or "Under Surveillance" or null

Rules:
- If a field is genuinely missing, use null (or 0 for cases/deaths).
- Do not invent data. Extract only what's in the entry.
- The PDF may have OCR artifacts (split words like "Jharkhan d", "Karnatak a") — interpret them correctly.

Return your response as a JSON object with this exact structure:
{ "entries": [ {...}, {...}, ... ] }

The "entries" array must contain exactly ${blocks.length} objects, one per entry, in the same order as the input.

Entries:
${numbered}`;

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
} catch (e) {
  console.error("LLM returned invalid JSON:", raw.slice(0, 500));
  throw new Error("LLM returned invalid JSON");
}

// Normalize to array — handle every shape gpt-4o-mini might return
let arr;
if (Array.isArray(parsed)) {
  arr = parsed;
} else if (typeof parsed === "object" && parsed !== null) {
  // Try common wrapper keys
  const wrapperKeys = ["entries", "outbreaks", "data", "results", "items"];
  const wrapperKey = wrapperKeys.find(k => Array.isArray(parsed[k]));
  
  if (wrapperKey) {
    arr = parsed[wrapperKey];
  } else {
    // Maybe it's an object with numbered keys: {"1": {...}, "2": {...}}
    const values = Object.values(parsed);
    if (values.every(v => typeof v === "object" && v !== null)) {
      arr = values;
    } else if (parsed.uniqueId) {
      // Single entry returned as a flat object (happens with batch of 1)
      arr = [parsed];
    }
  }
}

if (!Array.isArray(arr)) {
  console.error("Could not normalize LLM output. Raw:", raw.slice(0, 500));
  throw new Error("LLM did not return an array");
}

return arr;
};

/**
 * Main export: split + extract → returns chunks ready for embedding.
 */
export const extractOutbreakChunks = async (rawText) => {
  const blocks = splitIntoBlocks(rawText);
  console.log(`📑 Split into ${blocks.length} outbreak blocks`);

  if (blocks.length === 0) return [];

  // Process in batches of 10 to keep prompts manageable and reliable
  const BATCH_SIZE = 10;
  const allMetadata = [];

  for (let i = 0; i < blocks.length; i += BATCH_SIZE) {
    const batch = blocks.slice(i, i + BATCH_SIZE);
    console.log(`🤖 Extracting metadata for batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} entries)...`);
    const metadata = await extractMetadataBatch(batch);
    allMetadata.push(...metadata);
  }

  // Pair each block with its extracted metadata
  return blocks.map((text, i) => {
    const meta = allMetadata[i] || {};
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
        chunkType: "outbreak_entry",
      },
    };
  });
};