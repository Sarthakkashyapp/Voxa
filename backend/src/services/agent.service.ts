import { LiveKitAPI } from "livekit-server-sdk";

const liveKitApi = new LiveKitAPI({
  host: process.env.LIVEKIT_URL!,
  apiKey: process.env.LIVEKIT_API_KEY!,
  secret: process.env.LIVEKIT_API_SECRET!,
});

export async function createAgentDispatch(roomName: string, sessionId: string) {
  const dispatch = await liveKitApi.agentDispatch.createDispatch(
    roomName,
    "voxa-agent",
    {
      metadata: JSON.stringify({
        sessionId,
      }),
    },
  );

  return dispatch;
}
