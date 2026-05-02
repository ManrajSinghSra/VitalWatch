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

/* ─────────── Intent classification ─────────── */

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
  "wantsDeaths": boolean,
  "timeFrame": "latest" | "all" | "specific_week",
  "weekNumber": number | null,
  "year": number | null
}

Intent:
- "aggregation": user asks for counts/totals/sums ("how many measles cases", "total deaths", "which states have outbreaks")
- "lookup": user asks about a specific location, disease, or week ("what's happening in Kerala", "show me week 10", "tell me about the Shigellosis outbreak")
- "general": anything else (symptoms, prevention, advice)

Time frame:
- "latest": ONLY when user uses present-tense temporal words: "this week", "currently", "right now", "now", "latest", "current"
- "specific_week": user mentions ANY specific week number ("week 9", "week 10")
- "all" (DEFAULT): everything else — generic questions about the data, lookups, or anything without a clear time hint

CRITICAL RULES FOR YEAR:
- ONLY set year if the user EXPLICITLY mentions a 4-digit year like "2024", "2025", "2026"
- If the user says "week 9" or "week 10" without a year, year MUST be null
- NEVER infer or guess the year. NEVER default to the current year. NEVER use your training data to fill it in.
- If unsure about year, year is null.

Use proper Indian state names (e.g. "Tamil Nadu" not "TN"). Use proper disease names (e.g. "Measles" not "measles").`,
      },
      { role: "user", content: question },
    ],
    temperature: 0,
    response_format: { type: "json_object" },
  });

  try {
    const parsed = JSON.parse(completion.choices[0].message.content);
    return {
      intent: parsed.intent || "general",
      state: parsed.state || null,
      district: parsed.district || null,
      disease: parsed.disease || null,
      wantsDeaths: !!parsed.wantsDeaths,
      timeFrame: parsed.timeFrame || "all",
      weekNumber: parsed.weekNumber || null,
      year: parsed.year || null,
    };
  } catch {
    return {
      intent: "general",
      state: null,
      district: null,
      disease: null,
      wantsDeaths: false,
      timeFrame: "all",
      weekNumber: null,
      year: null,
    };
  }
};

/* ─────────── Temporal filter helpers ─────────── */

const getLatestWeek = async () => {
  const latest = await ReportChunk.findOne({
    "metadata.weekNumber": { $ne: null },
    "metadata.year": { $ne: null },
  })
    .sort({ "metadata.year": -1, "metadata.weekNumber": -1 })
    .select("metadata.year metadata.weekNumber")
    .lean();

  return latest
    ? { year: latest.metadata.year, weekNumber: latest.metadata.weekNumber }
    : null;
};

const buildTemporalFilter = async (intent) => {
  const filter = {};

  if (intent.timeFrame === "latest") {
    const latest = await getLatestWeek();
    if (latest) {
      filter["metadata.year"] = latest.year;
      filter["metadata.weekNumber"] = latest.weekNumber;
    }
  } else if (intent.timeFrame === "specific_week" && intent.weekNumber) {
    filter["metadata.weekNumber"] = intent.weekNumber;
    if (intent.year) {
      filter["metadata.year"] = intent.year;
    }
  }

  return filter;
};

/* ─────────── Aggregation path with filter relaxation ─────────── */

const handleAggregation = async (intent) => {
  const buildMatch = async (opts = {}) => {
    const match = opts.skipTemporal ? {} : await buildTemporalFilter(intent);
    if (intent.state && !opts.skipState) match["metadata.state"] = new RegExp(intent.state, "i");
    if (intent.disease && !opts.skipDisease) match["metadata.disease"] = new RegExp(intent.disease, "i");
    if (intent.district && !opts.skipDistrict) match["metadata.district"] = new RegExp(intent.district, "i");
    return match;
  };

  const runAggregation = async (match) => {
    return ReportChunk.aggregate([
      { $match: match },
      {
        $group: {
          _id: { disease: "$metadata.disease", state: "$metadata.state" },
          totalCases: { $sum: "$metadata.cases" },
          totalDeaths: { $sum: "$metadata.deaths" },
          outbreaks: { $sum: 1 },
          districts: { $addToSet: "$metadata.district" },
          weeks: { $addToSet: "$metadata.weekNumber" },
        },
      },
      { $sort: { totalCases: -1 } },
      { $limit: 30 },
    ]);
  };

  let results = await runAggregation(await buildMatch());
  if (results.length > 0) return { results, relaxed: null };

  if (intent.timeFrame === "latest" || intent.timeFrame === "specific_week") {
    results = await runAggregation(await buildMatch({ skipTemporal: true }));
    if (results.length > 0) return { results, relaxed: "time" };
  }

  if (intent.district) {
    results = await runAggregation(await buildMatch({ skipDistrict: true, skipTemporal: true }));
    if (results.length > 0) return { results, relaxed: "district+time" };
  }

  return { results: [], relaxed: null };
};

/* ─────────── Vector retrieval with filter relaxation ─────────── */

const vectorSearch = async (question, intent) => {
  const queryEmbedding = await getEmbedding(question);

  const buildFilter = async (opts = {}) => {
    const filter = opts.skipTemporal ? {} : await buildTemporalFilter(intent);
    if (intent.state && !opts.skipState) filter["metadata.state"] = new RegExp(intent.state, "i");
    if (intent.disease && !opts.skipDisease) filter["metadata.disease"] = new RegExp(intent.disease, "i");
    if (intent.district && !opts.skipDistrict) filter["metadata.district"] = new RegExp(intent.district, "i");
    return filter;
  };

  const searchPool = async (filter) => {
    const pool = await ReportChunk.find(filter)
      .select("text embedding metadata reportId")
      .lean();
    if (pool.length === 0) return [];
    return pool
      .map(c => ({ ...c, similarity: cosineSimilarity(queryEmbedding, c.embedding) }))
      .filter(c => c.similarity >= MIN_SIMILARITY)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, TOP_K);
  };

  let results = await searchPool(await buildFilter());
  if (results.length > 0) return { results, relaxed: null };

  if (intent.timeFrame === "latest" || intent.timeFrame === "specific_week") {
    results = await searchPool(await buildFilter({ skipTemporal: true }));
    if (results.length > 0) return { results, relaxed: "time" };
  }

  if (intent.district) {
    results = await searchPool(await buildFilter({ skipDistrict: true, skipTemporal: true }));
    if (results.length > 0) return { results, relaxed: "district+time" };
  }

  results = await searchPool({});
  return { results, relaxed: results.length > 0 ? "all_filters" : null };
};

/* ─────────── Prompt ─────────── */

const SYSTEM_PROMPT = `You are a public health assistant analyzing Indian IDSP weekly outbreak reports.

ANSWER RULES:
1. Answer the user's question directly using ONLY the provided context. If the context doesn't contain the answer, say so explicitly — do NOT invent data.
2. Use natural prose. Use bullet points ONLY when listing 3+ distinct outbreaks the user explicitly asked to list.
3. Always include specific numbers: cases, deaths, locations (state + district + village when available).
4. Mention outbreak status (Under Control / Under Surveillance) when reporting an outbreak.
5. If a death is reported, highlight it clearly.
6. NEVER invent numbers, locations, dates, or outbreaks. If something is not in the context, say "not reported in the available data".
7. For aggregation questions, lead with the total, then break it down by state/disease.
8. Keep responses focused. Don't repeat back the user's question.
9. When referring to a time period, mention the week number and year if available.
10. If the user asks about a state, district, or disease that does NOT appear in the context, tell them clearly that no data was found for it. Do not substitute with similar-sounding alternatives.`;

/* ─────────── Main entry ─────────── */

export const askReportRag = async (question) => {
  const totalChunks = await ReportChunk.countDocuments();
  if (totalChunks === 0) {
    return {
      answer: "No outbreak reports have been uploaded yet. Please upload an IDSP report first.",
      sources: [],
      mode: "no_data",
    };
  }

  const intent = await classifyIntent(question);
  console.log("🎯 Intent:", intent);

  const describeFilters = () => {
    const parts = [];
    if (intent.disease) parts.push(`disease: ${intent.disease}`);
    if (intent.state) parts.push(`state: ${intent.state}`);
    if (intent.district) parts.push(`district: ${intent.district}`);
    if (intent.timeFrame === "specific_week" && intent.weekNumber) {
      parts.push(intent.year
        ? `week ${intent.weekNumber} of ${intent.year}`
        : `week ${intent.weekNumber}`);
    } else if (intent.timeFrame === "latest") {
      parts.push("the latest week");
    }
    return parts.length ? parts.join(", ") : null;
  };

  /* ─────────── Aggregation path ─────────── */
  if (intent.intent === "aggregation") {
    const { results: stats, relaxed } = await handleAggregation(intent);

    if (stats.length === 0) {
      const filterDesc = describeFilters();
      return {
        answer: filterDesc
          ? `No outbreak data found for ${filterDesc}. Try broadening your question (e.g. ask about a different state, disease, or time period).`
          : "No outbreak data found matching your question.",
        sources: [],
        mode: "aggregation",
        intent,
      };
    }

    const summary = stats
      .map(s => {
        const weeks = s.weeks.filter(Boolean).sort((a, b) => a - b).join(", ");
        const districts = s.districts.filter(Boolean).join(", ") || "unknown";
        return `${s._id.disease || "Unknown disease"} in ${s._id.state || "Unknown state"}: ${s.totalCases} cases, ${s.totalDeaths} deaths across ${s.outbreaks} outbreak(s) | districts: [${districts}] | weeks: [${weeks}]`;
      })
      .join("\n");

    const timeContext = relaxed === "time"
      ? "Note: no data matched the exact time frame requested, so this answer covers all uploaded weeks."
      : intent.timeFrame === "latest"
      ? "Time scope: latest week available."
      : intent.timeFrame === "all"
      ? "Time scope: all uploaded reports combined."
      : `Time scope: week ${intent.weekNumber}${intent.year ? ` of ${intent.year}` : ""}.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `${timeContext}\n\nAggregated statistics from IDSP reports:\n${summary}\n\nQuestion: ${question}`,
        },
      ],
      temperature: 0.2,
    });

    return {
      answer: completion.choices[0].message.content,
      sources: stats.slice(0, 5),
      mode: "aggregation",
      intent,
      relaxed,
    };
  }

  /* ─────────── Semantic / lookup path ─────────── */
  const { results: topChunks, relaxed } = await vectorSearch(question, intent);

  if (topChunks.length === 0) {
    const filterDesc = describeFilters();

    if (filterDesc) {
      return {
        answer: `No outbreak data found for ${filterDesc} in the uploaded reports. This could mean no outbreaks were reported there, or the relevant report hasn't been uploaded yet.`,
        sources: [],
        mode: "semantic",
        intent,
      };
    }

    return {
      answer:
        "I couldn't find anything relevant to your question in the uploaded outbreak reports. The reports cover specific disease outbreaks across Indian states — try asking about a particular disease, state, or district.",
      sources: [],
      mode: "semantic",
      intent,
    };
  }

  const relaxationNote = relaxed === "time"
    ? "(Note: no data in the requested time frame, showing matches from all weeks.)\n\n"
    : relaxed === "district+time"
    ? "(Note: no data for that exact district/time, showing related state-level data.)\n\n"
    : relaxed === "all_filters"
    ? "(Note: no exact filter match, showing closest semantic results.)\n\n"
    : "";

  const context = topChunks
    .map(
      (c, i) =>
        `[Source ${i + 1}] State: ${c.metadata.state || "N/A"} | District: ${c.metadata.district || "N/A"} | Disease: ${c.metadata.disease || "N/A"} | Cases: ${c.metadata.cases} | Deaths: ${c.metadata.deaths} | Status: ${c.metadata.status || "N/A"} | Start: ${c.metadata.startDate || "N/A"} | Week: ${c.metadata.weekNumber || "N/A"}/${c.metadata.year || "N/A"}\n${c.text}`
    )
    .join("\n\n---\n\n");

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `${relaxationNote}Context from IDSP reports:\n\n${context}\n\nQuestion: ${question}` },
    ],
    temperature: 0.2,
  });

  return {
    answer: completion.choices[0].message.content,
    sources: topChunks.map(c => ({
      reportId: c.reportId,
      disease: c.metadata.disease,
      location: `${c.metadata.district || ""}, ${c.metadata.state || ""}`.trim(),
      week: c.metadata.weekNumber,
      year: c.metadata.year,
      cases: c.metadata.cases,
      deaths: c.metadata.deaths,
      similarity: c.similarity.toFixed(3),
    })),
    mode: "semantic",
    intent,
    relaxed,
  };
};

/* ─────────── Streaming variants ─────────── */

/**
 * Performs all retrieval + filter relaxation + context building.
 * Returns { messages, sources, intent, mode, prefix } where:
 *   - messages: array ready to pass to OpenAI
 *   - sources: array for the SourceChips UI
 *   - prefix: text to send before streaming starts (e.g. "no data" message)
 *             If prefix is set, do NOT call streamAnswer — just send prefix as the answer.
 */
export const retrieveContext = async (question) => {
  const totalChunks = await ReportChunk.countDocuments();
  if (totalChunks === 0) {
    return {
      messages: null,
      sources: [],
      intent: null,
      mode: "no_data",
      prefix: "No outbreak reports have been uploaded yet. Please upload an IDSP report first.",
    };
  }

  const intent = await classifyIntent(question);
  console.log("🎯 Intent:", intent);

  const describeFilters = () => {
    const parts = [];
    if (intent.disease) parts.push(`disease: ${intent.disease}`);
    if (intent.state) parts.push(`state: ${intent.state}`);
    if (intent.district) parts.push(`district: ${intent.district}`);
    if (intent.timeFrame === "specific_week" && intent.weekNumber) {
      parts.push(intent.year ? `week ${intent.weekNumber} of ${intent.year}` : `week ${intent.weekNumber}`);
    } else if (intent.timeFrame === "latest") {
      parts.push("the latest week");
    }
    return parts.length ? parts.join(", ") : null;
  };

  // Aggregation path
  if (intent.intent === "aggregation") {
    const { results: stats, relaxed } = await handleAggregation(intent);

    if (stats.length === 0) {
      const filterDesc = describeFilters();
      return {
        messages: null,
        sources: [],
        intent,
        mode: "aggregation",
        prefix: filterDesc
          ? `No outbreak data found for ${filterDesc}. Try broadening your question.`
          : "No outbreak data found matching your question.",
      };
    }

    const summary = stats
      .map(s => {
        const weeks = s.weeks.filter(Boolean).sort((a, b) => a - b).join(", ");
        const districts = s.districts.filter(Boolean).join(", ") || "unknown";
        return `${s._id.disease || "Unknown disease"} in ${s._id.state || "Unknown state"}: ${s.totalCases} cases, ${s.totalDeaths} deaths across ${s.outbreaks} outbreak(s) | districts: [${districts}] | weeks: [${weeks}]`;
      })
      .join("\n");

    const timeContext = relaxed === "time"
      ? "Note: no data matched the exact time frame requested, so this answer covers all uploaded weeks."
      : intent.timeFrame === "latest" ? "Time scope: latest week available."
      : intent.timeFrame === "all" ? "Time scope: all uploaded reports combined."
      : `Time scope: week ${intent.weekNumber}${intent.year ? ` of ${intent.year}` : ""}.`;

    return {
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `${timeContext}\n\nAggregated statistics from IDSP reports:\n${summary}\n\nQuestion: ${question}` },
      ],
      sources: stats.slice(0, 5),
      intent,
      mode: "aggregation",
      prefix: null,
    };
  }

  // Semantic / lookup path
  const { results: topChunks, relaxed } = await vectorSearch(question, intent);

  if (topChunks.length === 0) {
    const filterDesc = describeFilters();
    return {
      messages: null,
      sources: [],
      intent,
      mode: "semantic",
      prefix: filterDesc
        ? `No outbreak data found for ${filterDesc} in the uploaded reports. This could mean no outbreaks were reported there, or the relevant report hasn't been uploaded yet.`
        : "I couldn't find anything relevant to your question in the uploaded outbreak reports. Try asking about a particular disease, state, or district.",
    };
  }

  const relaxationNote = relaxed === "time" ? "(Note: no data in the requested time frame, showing matches from all weeks.)\n\n"
    : relaxed === "district+time" ? "(Note: no data for that exact district/time, showing related state-level data.)\n\n"
    : relaxed === "all_filters" ? "(Note: no exact filter match, showing closest semantic results.)\n\n"
    : "";

  const context = topChunks
    .map((c, i) =>
      `[Source ${i + 1}] State: ${c.metadata.state || "N/A"} | District: ${c.metadata.district || "N/A"} | Disease: ${c.metadata.disease || "N/A"} | Cases: ${c.metadata.cases} | Deaths: ${c.metadata.deaths} | Status: ${c.metadata.status || "N/A"} | Start: ${c.metadata.startDate || "N/A"} | Week: ${c.metadata.weekNumber || "N/A"}/${c.metadata.year || "N/A"}\n${c.text}`
    )
    .join("\n\n---\n\n");

  return {
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `${relaxationNote}Context from IDSP reports:\n\n${context}\n\nQuestion: ${question}` },
    ],
    sources: topChunks.map(c => ({
      reportId: c.reportId,
      disease: c.metadata.disease,
      location: `${c.metadata.district || ""}, ${c.metadata.state || ""}`.trim(),
      week: c.metadata.weekNumber,
      year: c.metadata.year,
      cases: c.metadata.cases,
      deaths: c.metadata.deaths,
      similarity: c.similarity.toFixed(3),
    })),
    intent,
    mode: "semantic",
    prefix: null,
  };
};

/**
 * Streams an OpenAI response. Calls onToken for each chunk of text.
 * Returns the full assembled answer when complete.
 */
export const streamAnswer = async (messages, onToken) => {
  const stream = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    temperature: 0.2,
    stream: true,
  });

  let fullText = "";
  for await (const chunk of stream) {
    const delta = chunk.choices?.[0]?.delta?.content || "";
    if (delta) {
      fullText += delta;
      onToken(delta);
    }
  }
  return fullText;
};