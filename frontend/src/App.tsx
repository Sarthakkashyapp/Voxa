import { useRef, useState } from "react";
import { Room, RoomEvent } from "livekit-client";
import { getLiveKitToken } from "./services/livekit";
import { createSession } from "./services/session";

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const roomRef = useRef<Room | null>(null);

  const handleStart = async () => {
    try {
      setIsConnecting(true);

      // -----------------------------------
      // 1. Create MongoDB learning session
      // -----------------------------------

      console.log("Creating learning session...");

      const session = await createSession(
        "6ab9034b5bb706d85045a1a7",
        "Learning Session",
      );

      console.log("MongoDB session created:", session);

      const sessionId = session._id;

      console.log("Session ID:", sessionId);

      // -----------------------------------
      // 2. Get LiveKit token
      // -----------------------------------

      console.log("Requesting LiveKit token...");

      const roomName = `voxa-session-${Date.now()}`;
      // const roomName = "voxa-test-metadata";

      const token = await getLiveKitToken("sarthak", roomName);

      console.log("LiveKit token received");

      // -----------------------------------
      // 3. Create LiveKit room
      // -----------------------------------

      const room = new Room();

      roomRef.current = room;

      // -----------------------------------
      // 4. Listen for remote tracks
      // -----------------------------------

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

      // -----------------------------------
      // 5. Participant events
      // -----------------------------------

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

      // -----------------------------------
      // 6. Check LiveKit URL
      // -----------------------------------

      const liveKitUrl = import.meta.env.VITE_LIVEKIT_URL;

      if (!liveKitUrl) {
        throw new Error("VITE_LIVEKIT_URL is not configured");
      }

      // -----------------------------------
      // 7. Connect to LiveKit
      // -----------------------------------

      console.log("Connecting to LiveKit...");

      await room.connect(liveKitUrl, token);

      console.log("Connected to LiveKit room");

      // -----------------------------------
      // 8. Enable browser audio playback
      // -----------------------------------

      await room.startAudio();

      console.log("Can playback audio:", room.canPlaybackAudio);

      // -----------------------------------
      // 9. Inspect remote participants
      // -----------------------------------

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

      // -----------------------------------
      // 10. Enable microphone
      // -----------------------------------

      await room.localParticipant.setMicrophoneEnabled(true);

      console.log(
        "Microphone enabled:",
        room.localParticipant.isMicrophoneEnabled,
      );

      // -----------------------------------
      // 11. Update UI
      // -----------------------------------

      setIsConnected(true);

      console.log("Room:", room.name);

      console.log("Participant:", room.localParticipant.identity);

      // -----------------------------------
      // Temporary debugging
      // -----------------------------------

      console.log("Learning session:", sessionId);
    } catch (error) {
      console.error("Failed to start learning session:", error);
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
