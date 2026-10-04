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

export default defineAgent({
  entry: async (ctx: JobContext) => {
    console.log("Voxa agent job started");

    const metadata = JSON.parse(ctx.job.metadata);

    const sessionId = metadata.sessionId;

    console.log("Voxa session ID:", sessionId);

    await ctx.connect();

    console.log("Voxa agent connected to room");

    const voxa = new Agent({
      instructions: `
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
- When more depth could be useful, answer the immediate question first and
  let the user ask for more.

When teaching technical concepts:
- Start with the intuition or main idea.
- Then explain the technical concept.
- Give a small practical example when useful.
- Introduce advanced details only when they are relevant to the question.

Adapt the length and depth of your response to the user's question.
Do not use the same response structure for every question.

Because you are a voice-first tutor:
- Prefer natural spoken language.
- Keep individual responses comfortable to listen to.
- Avoid long lists unless they genuinely help.
- Make the conversation feel interactive rather than like reading an article.
`,
    });

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

    session.on(voice.AgentSessionEventTypes.ConversationItemAdded, (event) => {
      const item = event.item;

      console.log("=== CONVERSATION ITEM ===");
      console.log("Type:", item.type);

      if (item.type !== "message") {
        console.log("Skipping non-message item");
        return;
      }

      console.log("Role:", item.role);
      console.log("Interrupted:", item.interrupted);
      console.log("Content:", item.content);
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
