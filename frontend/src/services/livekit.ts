const API_URL = "http://localhost:5000";

export async function getLiveKitToken(identity: string, roomName: string) {
  const response = await fetch(`${API_URL}/api/livekit/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      identity,
      roomName,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to get LiveKit token");
  }

  const data = await response.json();

  return data.token;
}
