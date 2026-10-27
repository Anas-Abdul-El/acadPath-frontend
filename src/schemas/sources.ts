import { z } from "zod";

export const resourceSearchSchema = z.object({
  query: z
    .string()
    .trim()
    .min(1, "Enter a course name, course code, or topic.")
    .min(2, "Add a little more — at least 2 characters.")
    .max(100, "Keep the search under 100 characters."),
  goal: z.string().trim().max(300, "Keep this under 300 characters."),
  platforms: z
    .array(z.enum(["youtube", "udemy", "coursera"]))
    .min(1, "Choose at least one platform."),
});

export type ResourceSearchValues = z.infer<typeof resourceSearchSchema>;
