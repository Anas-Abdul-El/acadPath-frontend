import { z } from "zod";

/** Letters (any script), spaces, and common name punctuation — no digits or symbols. */
const PLACE_NAME = /^[\p{L}\p{M}\s.'’()-]+$/u;

export const universitySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter your university's name.")
    .min(3, "Enter your university's full name.")
    .max(120, "Use 120 characters or fewer."),
  country: z
    .string()
    .trim()
    .min(1, "Enter the country your university is in.")
    .min(2, "Enter the full country name.")
    .max(60, "Use 60 characters or fewer.")
    .regex(PLACE_NAME, "Use letters only — no numbers or symbols."),
  city: z
    .string()
    .trim()
    .min(1, "Enter the city of your campus.")
    .max(80, "Use 80 characters or fewer.")
    .regex(PLACE_NAME, "Use letters only — no numbers or symbols."),
});

export type UniversityValues = z.infer<typeof universitySchema>;

/** Onboarding University step: the university plus the student's major there. */
export const universityStepSchema = universitySchema.extend({
  major: z
    .string()
    .trim()
    .min(1, "Enter your major.")
    .min(2, "Enter your major's full name, like Computer Science.")
    .max(100, "Use 100 characters or fewer."),
});

export type UniversityStepValues = z.infer<typeof universityStepSchema>;
