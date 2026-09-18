import { useState } from "react";
import { getLiveKitToken } from "./services/livekit";

function App() {
  const [token, setToken] = useState<string | null>(null);

  const handleStart = async () => {
    try {
      const newToken = await getLiveKitToken("sarthak", "voxa-session-123");

      setToken(newToken);
    } catch (error) {
      console.error("Failed to get token:", error);
    }
  };

  return (
    <div>
      <h1>Voxa</h1>

      <button onClick={handleStart}>Start Learning</button>

      {token && <p>Token received successfully!</p>}
    </div>
  );
}

export default App;
