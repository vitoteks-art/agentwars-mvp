import { z } from "zod";

export const CategoryEnum = z.enum([
  "ai_sales_automation",
  "ai_support_ops",
  "ai_marketing_systems",
  "devtools_agents",
]);

export const CreateProjectSchema = z.object({
  repoUrl: z.string().url().refine((u) => u.includes("github.com/"), {
    message: "Repo must be a GitHub URL",
  }),
  category: CategoryEnum,
  demoUrl: z.string().url(),
  demoType: z.enum(["video", "live"]).default("video"),
  // For MVP we let name/team be inferred from hackathon.json during ticks.
});
