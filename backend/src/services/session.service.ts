import { Session } from "../models/session.model.js";
import { User } from "../models/user.model.js";

export async function createSession(userId: string, title: string) {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const session = await Session.create({
    userId,
    title,
  });

  return session;
}
