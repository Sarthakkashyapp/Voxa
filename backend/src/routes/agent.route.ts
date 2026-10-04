import { Router } from "express";
import { createAgentDispatch } from "../services/agent.service.js";

const router = Router();

router.post("/dispatch", async (req, res) => {
  try {
    const { roomName, sessionId } = req.body;

    if (!roomName || !sessionId) {
      return res.status(400).json({
        message: "roomName and sessionId are required",
      });
    }

    const dispatch = await createAgentDispatch(roomName, sessionId);

    return res.status(201).json({
      dispatch,
    });
  } catch (error) {
    console.error("Failed to dispatch Voxa agent:", error);

    return res.status(500).json({
      message: "Failed to dispatch Voxa agent",
    });
  }
});

export default router;
