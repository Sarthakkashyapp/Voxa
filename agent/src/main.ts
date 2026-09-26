import {
  cli,
  defineAgent,
  ServerOptions,
  type JobContext,
} from "@livekit/agents";
import { fileURLToPath } from "node:url";

export default defineAgent({
  entry: async (ctx: JobContext) => {
    console.log("Voxa agent job started");

    await ctx.connect();

    console.log("Voxa agent connected to room");
  },
});

cli.runApp(
  new ServerOptions({
    agent: fileURLToPath(import.meta.url),
  }),
);
