import express from "express";
import cors from "cors";
import liveKitRoutes from "./routes/livekit.route.js";
import sessionRoutes from "./routes/session.route.js";
import messageRoutes from "./routes/message.route.js";
import agentRoutes from "./routes/agent.route.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Voxa backend is running",
  });
});

app.use("/api/livekit", liveKitRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/sessions", messageRoutes);
app.use("/api/agent", agentRoutes);

export default app;
