import { z } from "zod";

export const scenarioSchema = z.object({
  scenario: z
    .string()
    .trim()
    .min(1, "Describe a scenario to analyze.")
    .min(
      10,
      "Add a little more detail — for example, which course and what happens to it.",
    )
    .max(500, "Keep the scenario under 500 characters."),
});

export type ScenarioValues = z.infer<typeof scenarioSchema>;
