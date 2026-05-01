import { askReportRag } from "../services/reportRag.js";
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
      sources: result.sources,
    });
  } catch (err) {
    console.error("Chat error:", err);
    return res.status(500).json({ message: "Mr.Vital could not process your request" });
  }
};
