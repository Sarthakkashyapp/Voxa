import { defineAgent } from "@livekit/agents";

export default defineAgent({
  entry: async (ctx) => {
    console.log("Voxa agent job started");

    await ctx.connect();

    console.log("Voxa agent connected to room");
  },
});
