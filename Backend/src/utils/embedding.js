import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 30_000,    // 30s per request (default is 10 min, way too long)
  maxRetries: 3,      // built-in retries on 429/5xx/network errors
});

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

/**
 * Get embedding for a single string.
 * Handles transient failures with manual exponential backoff
 * on top of the SDK's built-in retries.
 */
export const getEmbedding = async (text, attempt = 1) => {
  const MAX_ATTEMPTS = 4;
  
  try {
    const res = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });
    return res.data[0].embedding;
  } catch (err) {
    if (attempt >= MAX_ATTEMPTS) {
      console.error(`❌ Embedding failed after ${MAX_ATTEMPTS} attempts:`, err.message);
      throw err;
    }
    const backoff = 1000 * Math.pow(2, attempt); // 2s, 4s, 8s
    console.warn(`⚠️ Embedding attempt ${attempt} failed (${err.message}), retrying in ${backoff}ms`);
    await sleep(backoff);
    return getEmbedding(text, attempt + 1);
  }
};

/**
 * Batch embed multiple texts in a single API call.
 * MUCH faster than one-at-a-time and uses fewer requests.
 * OpenAI allows up to 2048 inputs per call.
 */
export const getEmbeddingsBatch = async (texts, attempt = 1) => {
  const MAX_ATTEMPTS = 4;
  
  try {
    const res = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: texts,
    });
    // results come back in the same order as inputs
    return res.data.map(d => d.embedding);
  } catch (err) {
    if (attempt >= MAX_ATTEMPTS) {
      console.error(`❌ Batch embedding failed after ${MAX_ATTEMPTS} attempts:`, err.message);
      throw err;
    }
    const backoff = 1000 * Math.pow(2, attempt);
    console.warn(`⚠️ Batch embedding attempt ${attempt} failed (${err.message}), retrying in ${backoff}ms`);
    await sleep(backoff);
    return getEmbeddingsBatch(texts, attempt + 1);
  }
};