import { useRef, useState } from "react";
import { Room, RoomEvent } from "livekit-client";
import { getLiveKitToken } from "./services/livekit";

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const roomRef = useRef<Room | null>(null);

  const handleStart = async () => {
    try {
      setIsConnecting(true);

      console.log("Requesting LiveKit token...");

      const token = await getLiveKitToken("sarthak", "voxa-session-123");

      console.log("LiveKit token received");

      const room = new Room();
      roomRef.current = room;

      // Listen for remote audio/video tracks BEFORE connecting.
      room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
        console.log("Remote track subscribed:", {
          kind: track.kind,
          participant: participant.identity,
          trackSid: publication.trackSid,
        });

        if (track.kind === "audio") {
          track.attach();
          console.log("Remote audio track attached");
        }
      });

      room.on(
        RoomEvent.TrackUnsubscribed,
        (track, publication, participant) => {
          console.log("Remote track unsubscribed:", {
            kind: track.kind,
            participant: participant.identity,
            trackSid: publication.trackSid,
          });

          track.detach();
        },
      );

      room.on(RoomEvent.ParticipantConnected, (participant) => {
        console.log("Remote participant connected:", {
          identity: participant.identity,
          sid: participant.sid,
        });
      });

      room.on(RoomEvent.ParticipantDisconnected, (participant) => {
        console.log("Remote participant disconnected:", {
          identity: participant.identity,
          sid: participant.sid,
        });
      });

      room.on(RoomEvent.ConnectionStateChanged, (state) => {
        console.log("LiveKit connection state:", state);
      });

      const liveKitUrl = import.meta.env.VITE_LIVEKIT_URL;

      if (!liveKitUrl) {
        throw new Error("VITE_LIVEKIT_URL is not configured");
      }

      console.log("Connecting to LiveKit...");

      await room.connect(liveKitUrl, token);

      console.log("Connected to LiveKit room");

      // Explicitly unlock browser audio playback.
      await room.startAudio();

      console.log("Can playback audio:", room.canPlaybackAudio);

      // Inspect remote participants and their published tracks.
      console.log(
        "Remote participants:",
        [...room.remoteParticipants.values()].map((participant) => ({
          identity: participant.identity,
          sid: participant.sid,

          audioTracks: [...participant.audioTrackPublications.values()].map(
            (publication) => ({
              kind: publication.kind,
              trackSid: publication.trackSid,
              isSubscribed: publication.isSubscribed,
            }),
          ),
        })),
      );

      // Enable microphone.
      await room.localParticipant.setMicrophoneEnabled(true);

      console.log(
        "Microphone enabled:",
        room.localParticipant.isMicrophoneEnabled,
      );

      setIsConnected(true);

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
