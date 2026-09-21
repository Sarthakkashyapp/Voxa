import { useRef, useState } from "react";
import { Room } from "livekit-client";
import { getLiveKitToken } from "./services/livekit";

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const roomRef = useRef<Room | null>(null);

  const handleStart = async () => {
    try {
      setIsConnecting(true);

      // 1. Ask our backend for a LiveKit token
      const token = await getLiveKitToken("sarthak", "voxa-session-123");

      // 2. Create the client-side LiveKit Room object
      const room = new Room();

      // 3. Keep the same Room object across React renders
      roomRef.current = room;

      // 4. Get our LiveKit Cloud URL
      const liveKitUrl = import.meta.env.VITE_LIVEKIT_URL;

      // 5. Connect to LiveKit
      await room.connect(liveKitUrl, token);

      // 6. Enable microphone
      await room.localParticipant.setMicrophoneEnabled(true);

      console.log(
        "Microphone enabled:",
        room.localParticipant.isMicrophoneEnabled,
      );

      // 7. Connection succeeded
      setIsConnected(true);

      console.log("Connected to LiveKit room");
      console.log("Room:", room.name);
      console.log("Participant:", room.localParticipant.identity);
    } catch (error) {
      console.error("Failed to connect to LiveKit:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div>
      <h1>Voxa</h1>

      <button onClick={handleStart} disabled={isConnecting || isConnected}>
        {isConnecting
          ? "Connecting..."
          : isConnected
            ? "Connected"
            : "Start Learning"}
      </button>

      {isConnected && <p>Connected to LiveKit successfully!</p>}
    </div>
  );
}

export default App;
