import { Router } from "express";
import { createSession } from "../services/session.service.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { userId, title } = req.body;

    if (!userId || !title) {
      return res.status(400).json({
        message: "userId and title are required",
      });
    }

    const session = await createSession(userId, title);

    return res.status(201).json({
      session,
    });
  } catch (error) {
    console.error("Failed to create session:", error);

    if (error instanceof Error && error.message === "User not found") {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(500).json({
      message: "Failed to create session",
    });
  }
});

export default router;
