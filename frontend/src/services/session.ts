const API_URL = "http://localhost:5000";

export async function createSession(userId: string, title: string) {
  const response = await fetch(`${API_URL}/api/sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId,
      title,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create session");
  }

  const data = await response.json();

  return data.session;
}
