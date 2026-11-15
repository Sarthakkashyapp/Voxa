const API_URL = "http://localhost:5000";

export interface Message {
  _id: string;
  sessionId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  updatedAt: string;
}

export async function getSessionMessages(
  sessionId: string,
): Promise<Message[]> {
  const response = await fetch(`${API_URL}/api/sessions/${sessionId}/messages`);

  if (!response.ok) {
    throw new Error("Failed to fetch session messages");
  }

  const data = await response.json();

  return data.messages;
}
