import { Router } from "express";
import { createLiveKitToken } from "../services/livekit.service.js";

const router = Router();

router.post("/token", async (req, res) => {
  try {
    const { identity, roomName } = req.body;

    if (!identity || !roomName) {
      return res.status(400).json({
        message: "identity and roomName are required",
      });
    }

    const token = await createLiveKitToken(identity, roomName);

    return res.json({
      token,
    });
  } catch (error) {
    console.error("Failed to generate LiveKit token:", error);

    return res.status(500).json({
      message: "Failed to generate LiveKit token",
    });
  }
});

export default router;
