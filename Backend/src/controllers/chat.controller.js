import { askReportRag, retrieveContext, streamAnswer } from "../services/reportRag.js";
import { AuditLog } from "../models/AuditLog.js";
import { incrementAiQueries } from "../utils/updateStats.js";

export const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    const result = await askReportRag(message, req.user?.location);

    await incrementAiQueries();

    if (req.user) {
      await AuditLog.create({
        level: "INFO",
        action: `Asked Mr.Vital: ${message.slice(0, 80)}`,
        performedBy: req.user.name,
        performedById: req.user._id,
      });
    }

    return res.status(200).json({
      question: message,
      answer: result.answer,
      reply: result.answer,
      sources: result.sources || [],
      mode: result.mode,
    });
  } catch (err) {
    console.error("Chat error:", err);
    return res.status(500).json({ message: "Mr.Vital could not process your request" });
  }
};

export const streamMessage = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    // Set up SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no"); // disable nginx buffering if behind proxy
    if (res.flushHeaders) res.flushHeaders();

    const sendEvent = (payload) => {
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    };

    // 1. Retrieve context (non-streamed; this is fast)
    const ctx = await retrieveContext(message);

    // 2. If retrieval produced a "no-data" prefix, send it as one chunk and finish
    if (ctx.prefix) {
      sendEvent({ type: "token", content: ctx.prefix });
      sendEvent({ type: "sources", sources: ctx.sources || [] });
      sendEvent({ type: "done", mode: ctx.mode, intent: ctx.intent });
      res.end();
      return;
    }

    // 3. Stream tokens from OpenAI
    let fullAnswer = "";
    try {
      fullAnswer = await streamAnswer(ctx.messages, (token) => {
        sendEvent({ type: "token", content: token });
      });
    } catch (err) {
      console.error("Stream error:", err.message);
      sendEvent({ type: "error", message: "Streaming failed mid-response." });
      res.end();
      return;
    }

    // 4. Send sources, then done
    sendEvent({ type: "sources", sources: ctx.sources || [] });
    sendEvent({ type: "done", mode: ctx.mode, intent: ctx.intent });
    res.end();

    // 5. Optional: increment AI query counter / audit log here
    //    (do this after res.end() so it doesn't delay the response)
    (async () => {
      try {
        await incrementAiQueries();
        if (req.user) {
          await AuditLog.create({
            level: "INFO",
            action: `Asked Mr.Vital: ${message.slice(0, 80)}`,
            performedBy: req.user.name,
            performedById: req.user._id,
          });
        }
      } catch (logErr) {
        console.error("Audit log error:", logErr);
      }
    })();
  } catch (err) {
    console.error("streamMessage error:", err);
    if (!res.headersSent) {
      res.status(500).json({ message: "Stream failed", error: err.message });
    } else {
      res.write(`data: ${JSON.stringify({ type: "error", message: err.message })}\n\n`);
      res.end();
    }
  }
};
