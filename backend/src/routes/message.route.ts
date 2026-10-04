import { Router } from "express";
import {
  createMessage,
  getSessionMessages,
} from "../services/message.service.js";

const router = Router();

router.post("/:sessionId/messages", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { role, content } = req.body;

    if (!role || !content) {
      return res.status(400).json({
        message: "role and content are required",
      });
    }

    if (role !== "user" && role !== "assistant") {
      return res.status(400).json({
        message: "role must be either user or assistant",
      });
    }

    const message = await createMessage(sessionId, role, content);

    return res.status(201).json({
      message,
    });
  } catch (error) {
    console.error("Failed to create message:", error);

    if (error instanceof Error && error.message === "Session not found") {
      return res.status(404).json({
        message: "Session not found",
      });
    }

    return res.status(500).json({
      message: "Failed to create message",
    });
  }
});

router.get("/:sessionId/messages", async (req, res) => {
  try {
    const { sessionId } = req.params;

    const messages = await getSessionMessages(sessionId);

    return res.json({
      messages,
    });
  } catch (error) {
    console.error("Failed to get messages:", error);

    if (error instanceof Error && error.message === "Session not found") {
      return res.status(404).json({
        message: "Session not found",
      });
    }

    return res.status(500).json({
      message: "Failed to get messages",
    });
  }
});

export default router;
