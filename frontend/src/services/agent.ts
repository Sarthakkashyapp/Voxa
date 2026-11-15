const API_URL = "http://localhost:5000";

export async function dispatchAgent(roomName: string, sessionId: string) {
  const response = await fetch(`${API_URL}/api/agent/dispatch`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      roomName,
      sessionId,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to dispatch AI agent: ${errorText}`);
  }

  const data = await response.json();

  console.log("AI agent dispatched successfully:", data);

  return data;
}
