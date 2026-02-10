import { z } from "zod";

export const HackathonJsonSchema = z.object({
  agentwars: z.object({
    season: z.string(),
    name: z.string(),
    team: z.string(),
    category: z.enum([
      "ai-sales-automation",
      "ai-support-ops",
      "ai-marketing-systems",
      "devtools-agents",
    ]),
    repo: z.string().url(),
    demo: z.object({
      type: z.enum(["video", "live"]),
      url: z.string().url(),
      notes: z.string().optional(),
    }),
    setup: z
      .object({
        requirements: z.array(z.string()).optional(),
        commands: z.array(z.string()).default([]),
      })
      .optional(),
    features: z.array(z.string()).optional(),
    agent_usage: z
      .object({
        what_agents_did: z.array(z.string()).optional(),
        proof: z.array(z.string()).optional(),
      })
      .optional(),
  }),
});

export type HackathonJson = z.infer<typeof HackathonJsonSchema>;
