import OpenAI from "openai";
import { ReportChunk } from "../models/ReportChunk.js";
import { getEmbedding } from "../utils/embedding.js";
import { cosineSimilarity } from "../utils/cosineSimilarity.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 30_000,
  maxRetries: 3,
});

const TOP_K = 8;
const MIN_SIMILARITY = 0.20;

/**
 * Use LLM to classify the user's intent and pull out filters.
 * Replaces brittle keyword matching.
 */
const classifyIntent = async (question) => {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You classify questions about Indian disease outbreak reports. Return JSON only.

Schema:
{
  "intent": "aggregation" | "lookup" | "general",
  "state": string | null,
  "district": string | null,
  "disease": string | null,
  "wantsDeaths": boolean
}

- "aggregation": user asks for counts/totals/sums ("how many measles cases", "total deaths", "which states have outbreaks")
- "lookup": user asks about a specific location or disease ("what's happening in Kerala", "tell me about the Shigellosis outbreak")
- "general": anything else (symptoms, prevention, advice)

Extract state/district/disease only if explicitly mentioned. Use proper Indian state names (e.g. "Tamil Nadu" not "TN").`
      },
      { role: "user", content: question }
    ],
    temperature: 0,
    response_format: { type: "json_object" },
  });

  try {
    return JSON.parse(completion.choices[0].message.content);
  } catch {
    return { intent: "general", state: null, district: null, disease: null, wantsDeaths: false };
  }
};

/**
 * Aggregation path: structured Mongo query, no vector search needed.
 */
const handleAggregation = async (filters) => {
  const match = {};
  if (filters.state) match["metadata.state"] = new RegExp(filters.state, "i");
  if (filters.disease) match["metadata.disease"] = new RegExp(filters.disease, "i");
  if (filters.district) match["metadata.district"] = new RegExp(filters.district, "i");

  return ReportChunk.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          disease: "$metadata.disease",
          state: "$metadata.state",
        },
        totalCases: { $sum: "$metadata.cases" },
        totalDeaths: { $sum: "$metadata.deaths" },
        outbreaks: { $sum: 1 },
        districts: { $addToSet: "$metadata.district" },
      },
    },
    { $sort: { totalCases: -1 } },
    { $limit: 30 },
  ]);
};

/**
 * Vector search with metadata pre-filtering when possible.
 */
const vectorSearch = async (question, filters) => {
  const queryEmbedding = await getEmbedding(question);

  const mongoFilter = {};
  if (filters.state) mongoFilter["metadata.state"] = new RegExp(filters.state, "i");
  if (filters.disease) mongoFilter["metadata.disease"] = new RegExp(filters.disease, "i");
  if (filters.district) mongoFilter["metadata.district"] = new RegExp(filters.district, "i");

  let pool = await ReportChunk.find(mongoFilter)
    .select("text embedding metadata reportId")
    .lean();

  // fall back to all chunks if filter returned nothing
  if (pool.length === 0) {
    pool = await ReportChunk.find().select("text embedding metadata reportId").lean();
  }

  return pool
    .map(c => ({ ...c, similarity: cosineSimilarity(queryEmbedding, c.embedding) }))
    .filter(c => c.similarity >= MIN_SIMILARITY)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, TOP_K);
};

/**
 * Build the LLM prompt for natural-sounding answers.
 */
const SYSTEM_PROMPT = `You are a public health assistant analyzing Indian IDSP weekly outbreak reports.

ANSWER RULES:
1. Answer the user's question directly using ONLY the provided context.
2. Use natural prose. Use bullet points ONLY when listing 3+ distinct outbreaks the user explicitly asked to list.
3. Always include specific numbers: cases, deaths, locations (state + district + village when available).
4. Mention outbreak status (Under Control / Under Surveillance) when reporting an outbreak.
5. If a death is reported, highlight it clearly.
6. If the data isn't in the context, say so explicitly. Never invent numbers or locations.
7. For aggregation questions, lead with the total, then break it down by state/disease.
8. Keep responses focused. Don't repeat back the user's question.`;

export const askReportRag = async (question) => {
  // 1. understand the question
  const intent = await classifyIntent(question);
  console.log("🎯 Intent:", intent);

  // 2. aggregation path
  if (intent.intent === "aggregation") {
    const stats = await handleAggregation(intent);

    if (stats.length > 0) {
      const summary = stats.map(s =>
        `${s._id.disease || "Unknown disease"} in ${s._id.state || "Unknown state"}: ${s.totalCases} cases, ${s.totalDeaths} deaths across ${s.outbreaks} outbreak(s) in districts [${s.districts.filter(Boolean).join(", ") || "unknown"}]`
      ).join("\n");

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Aggregated statistics from IDSP reports:\n${summary}\n\nQuestion: ${question}` }
        ],
        temperature: 0.2,
      });

      return {
        answer: completion.choices[0].message.content,
        sources: stats.slice(0, 5),
        mode: "aggregation",
      };
    }
  }

  // 3. semantic / lookup path
  const topChunks = await vectorSearch(question, intent);

  if (topChunks.length === 0) {
    return {
      answer: "I couldn't find relevant outbreak data for that question. Try specifying a state, district, or disease, or rephrasing your question.",
      sources: [],
      mode: "semantic",
    };
  }

  const context = topChunks.map((c, i) =>
    `[Source ${i + 1}] State: ${c.metadata.state || "N/A"} | District: ${c.metadata.district || "N/A"} | Disease: ${c.metadata.disease || "N/A"} | Cases: ${c.metadata.cases} | Deaths: ${c.metadata.deaths} | Status: ${c.metadata.status || "N/A"} | Start: ${c.metadata.startDate || "N/A"}\n${c.text}`
  ).join("\n\n---\n\n");

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `Context from IDSP reports:\n\n${context}\n\nQuestion: ${question}` }
    ],
    temperature: 0.2,
  });

  return {
    answer: completion.choices[0].message.content,
    sources: topChunks.map(c => ({
      reportId: c.reportId,
      disease: c.metadata.disease,
      location: `${c.metadata.district || ""}, ${c.metadata.state || ""}`.trim(),
      cases: c.metadata.cases,
      deaths: c.metadata.deaths,
      similarity: c.similarity.toFixed(3),
    })),
    mode: "semantic",
  };
};