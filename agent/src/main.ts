import "dotenv/config";

import {
  cli,
  defineAgent,
  Agent,
  AgentSession,
  ServerOptions,
  inference,
  voice,
  type JobContext,
} from "@livekit/agents";

import * as deepgram from "@livekit/agents-plugin-deepgram";
import * as google from "@livekit/agents-plugin-google";

import { fileURLToPath } from "node:url";

async function saveMessage(
  sessionId: string,
  role: "user" | "assistant",
  content: string,
): Promise<void> {
  const backendUrl = process.env.VOXA_BACKEND_URL;

  if (!backendUrl) {
    throw new Error("VOXA_BACKEND_URL is not configured");
  }

  const response = await fetch(
    `${backendUrl}/api/sessions/${sessionId}/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ role, content }),
    },
  );

  if (!response.ok) {
    const errorBody = await response.text();

    throw new Error(
      `Failed to save ${role} message (${response.status}): ${errorBody}`,
    );
  }

  console.log(`Saved ${role} message for session ${sessionId}`);
}

const VOXA_INSTRUCTIONS = `
You are Voxa, a conversational AI learning companion.

Your goal is to help users understand concepts clearly through natural,
engaging conversation.

Response style:
- Give the direct answer first.
- Keep explanations concise and focused.
- Use simple, conversational language rather than textbook-style wording.
- Use examples or analogies when they genuinely make the concept easier.
- Do not explain every possible detail unless the user asks for more depth.
- Avoid long paragraphs, unnecessary repetition, and filler.
- For simple questions, give a short and direct answer.
- For complex questions, break the explanation into a few clear parts.
- Sound like a helpful human tutor, not like someone reading documentation.
- Do not automatically provide a complete lecture after every question.
- Answer the immediate question first and let the user ask for more.

When teaching technical concepts:
- Start with the intuition or main idea.
- Then explain the technical concept.
- Give a small practical example when useful.
- Introduce advanced details only when relevant to the question.

Adapt the length and depth of your response to the user's question.
Do not use the same response structure for every question.

Because you are a voice-first tutor:
- Prefer natural spoken language.
- Keep individual responses comfortable to listen to.
- Avoid long lists unless they genuinely help.
- Make the conversation feel interactive rather than like reading an article.

Handling interruptions and topic changes:
- Prioritize the user's latest complete request.
- If the user interrupts an explanation to ask a different question,
  stop the previous explanation and answer the new question.
- Do not combine two topics unless the user explicitly asks you to
  compare, connect, or explain both.
- Do not resume an interrupted explanation unless the user asks you to
  continue it.
- Do not interpret a new question as a request to finish the previous topic.
- If the user corrects your interpretation, follow the correction directly.
- If the user's request is unclear or incomplete, ask one brief
  clarifying question.
- Keep every answer focused on what the user is asking now.
`;

class VoxaAgent extends Agent {
  constructor() {
    super({
      instructions: VOXA_INSTRUCTIONS,
    });
  }
}

export default defineAgent({
  entry: async (ctx: JobContext) => {
    console.log("Voxa agent job started");

    let sessionId: string | undefined;

    try {
      const metadata = JSON.parse(ctx.job.metadata || "{}");
      sessionId = metadata.sessionId;
    } catch (error) {
      console.error("Failed to parse agent job metadata:", error);
      throw error;
    }

    if (!sessionId) {
      throw new Error("Missing sessionId in agent job metadata");
    }

    console.log("Voxa session ID:", sessionId);

    await ctx.connect();

    console.log("Voxa agent connected to room");

    const voxa = new VoxaAgent();

    const session = new AgentSession({
      turnHandling: {
        preemptiveGeneration: {
          enabled: false,
        },
      },

      stt: new deepgram.STT({
        model: "nova-3",
        language: "en",
      }),

      llm: new google.LLM({
        model: "gemini-2.5-flash",
      }),

      tts: new inference.TTS({
        model: "fishaudio/s2.1-pro",
        voice: "fa4c9eb3dccc4806b382b40d61c6b10a",
        language: "en",
      }),
    });

    const savedMessageIds = new Set<string>();

    session.on(voice.AgentSessionEventTypes.ConversationItemAdded, (event) => {
      const item = event.item;

      console.log("\n=== NEW CONVERSATION ITEM ===");
      console.log("Type:", item.type);

      if (item.type === "message") {
        console.log("Role:", item.role);
        console.log("Interrupted:", item.interrupted);

        const content = item.content
          .filter((part): part is string => typeof part === "string")
          .join(" ")
          .trim();

        console.log("Content preview:", content.slice(0, 120));

        const isValidRole = item.role === "user" || item.role === "assistant";

        const isInterruptedAssistant =
          item.role === "assistant" && item.interrupted;

        if (
          isValidRole &&
          content.length > 0 &&
          !isInterruptedAssistant &&
          !savedMessageIds.has(item.id)
        ) {
          // Mark this item before starting the request
          // to prevent duplicate submissions.
          savedMessageIds.add(item.id);

          void saveMessage(sessionId, item.role, content).catch((error) => {
            // Allow a retry if saving fails.
            savedMessageIds.delete(item.id);

            console.error("Failed to persist conversation message:", error);
          });
        } else if (isInterruptedAssistant) {
          console.log("Skipping interrupted assistant message.");
        }
      }

      console.log("=== CURRENT CHAT CONTEXT ===");

      for (const ctxItem of session.chatCtx.items) {
        if (ctxItem.type !== "message") {
          console.log("Context item type:", ctxItem.type);
          continue;
        }

        const contextPreview = ctxItem.content
          .filter((part): part is string => typeof part === "string")
          .join(" ")
          .slice(0, 100);

        console.log({
          role: ctxItem.role,
          interrupted: ctxItem.interrupted,
          preview: contextPreview,
        });
      }

      console.log("=== END CHAT CONTEXT ===");
    });

    await session.start({
      room: ctx.room,
      agent: voxa,
    });

    console.log("Voxa AgentSession started");
  },
});

cli.runApp(
  new ServerOptions({
    agent: fileURLToPath(import.meta.url),
    agentName: "voxa-agent",
  }),
);
