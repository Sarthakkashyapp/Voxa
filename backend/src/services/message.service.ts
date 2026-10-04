import { Message } from "../models/message.model.js";
import { Session } from "../models/session.model.js";

export async function createMessage(
  sessionId: string,
  role: "user" | "assistant",
  content: string,
) {
  const session = await Session.findById(sessionId);

  if (!session) {
    throw new Error("Session not found");
  }

  const message = await Message.create({
    sessionId,
    role,
    content,
  });

  return message;
}

export async function getSessionMessages(sessionId: string) {
  const session = await Session.findById(sessionId);

  if (!session) {
    throw new Error("Session not found");
  }

  const messages = await Message.find({ sessionId }).sort({ createdAt: 1 });

  return messages;
}
