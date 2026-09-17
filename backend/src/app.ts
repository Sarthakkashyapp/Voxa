import express from "express";
import cors from "cors";
import liveKitRoutes from "./routes/livekit.route.js";

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

export default app;
