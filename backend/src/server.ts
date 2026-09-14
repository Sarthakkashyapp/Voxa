import "dotenv/config";
import app from "./app.js";

const PORT = process.env.PORT;

console.log("LiveKit URL:", process.env.LIVEKIT_URL);
console.log("LiveKit API Key exists:", !!process.env.LIVEKIT_API_KEY);
console.log("LiveKit API Secret exists:", !!process.env.LIVEKIT_API_SECRET);

app.listen(PORT, () => {
  console.log(`Voxa backend running on http://localhost:${PORT}`);
});
