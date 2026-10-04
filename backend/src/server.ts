import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/db.js";

const PORT = process.env.PORT;

async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Voxa backend running on http://localhost:${PORT}`);
  });
}

startServer();
