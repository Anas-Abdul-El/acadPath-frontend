import { z } from "zod";

import { universitySchema } from "@/schemas/university";

const optionalText = (max: number, message: string) =>
  z.string().trim().max(max, message);

/** Admin university form: the finder's name/country/city rules plus admin-only fields. */
export const adminUniversitySchema = universitySchema.extend({
  shortName: optionalText(12, "Use 12 characters or fewer."),
  website: z
    .string()
    .trim()
    .refine(
      (value) =>
        value === "" ||
        z.url({ protocol: /^https?$/ }).safeParse(value).success,
      {
        message: "Enter a full address starting with https://",
      },
    ),
  catalogYear: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || /^\d{4}[–-]\d{2}$/.test(value),
      "Use the format 2025–26.",
    ),
});

export type AdminUniversityValues = z.infer<typeof adminUniversitySchema>;

const COURSE_CODE = /^[A-Z]{2,5} \d{3,4}[A-Z]?$/;

/** Normalizes "cs3110" / "cs-3110" / "CS  3110" to "CS 3110". */
export function normalizeCode(value: string) {
  const compact = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const match = compact.match(/^([A-Z]+)(\d+[A-Z]?)$/);
  return match ? `${match[1]} ${match[2]}` : value.trim().toUpperCase();
}

/** "CS 1110, MATH 1210" → ["CS 1110", "MATH 1210"] */
export const parseCodeList = (value: string) =>
  value
    .split(/[,;\n]/)
    .map((code) => code.trim())
    .filter(Boolean)
    .map(normalizeCode);

/**
 * Course form schema. Format rules only: whether a code is already used, or whether requisite
 * codes exist in the major, is checked by the API (400/409 errors land on the matching field).
 */
export const courseFormSchema = z
  .object({
    universityId: z.string().min(1, "Choose a university."),
    majorId: z.string().min(1, "Choose a major."),
    code: z
      .string()
      .trim()
      .min(1, "Enter a course code.")
      .refine(
        (value) => COURSE_CODE.test(normalizeCode(value)),
        "Use a code like CS 3110 or MATH 101.",
      ),
    name: z
      .string()
      .trim()
      .min(3, "Enter the course name.")
      .max(100, "Use 100 characters or fewer."),
    description: z
      .string()
      .trim()
      .min(20, "Write at least a sentence (20+ characters).")
      .max(400, "Keep the description under 400 characters."),
    credits: z
      .number({ error: "Enter credit hours." })
      .int("Use a whole number.")
      .min(0, "Credits can't be negative.")
      .max(8, "Courses carry at most 8 credits."),
    category: z.enum(
      ["MAJOR_REQUIREMENT", "MAJOR_ELECTIVE", "MATH_SCIENCE", "GENERAL_EDUCATION"],
      { error: "Choose a category." },
    ),
    offeredTerms: z.array(z.enum(["FALL", "SPRING", "SUMMER"])),
    prerequisites: z.string(),
    corequisites: z.string(),
  })
  .superRefine((values, ctx) => {
    const code = normalizeCode(values.code);
    for (const field of ["prerequisites", "corequisites"] as const) {
      const codes = parseCodeList(values[field]);
      const invalid = codes.filter((c) => !COURSE_CODE.test(c));
      const message = invalid.length
        ? `Check the format of ${invalid.join(", ")}.`
        : codes.includes(code)
          ? "A course can't require itself."
          : null;
      if (message) ctx.addIssue({ code: "custom", path: [field], message });
    }
  });

export type CourseFormValues = z.infer<typeof courseFormSchema>;

/** Admin major form (inside the university details sheet). */
export const majorFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter the major's name.")
    .max(100, "Use 100 characters or fewer."),
  degreeType: z.enum(["BACHELOR", "MASTER", "DOCTORATE", "ASSOCIATE", "OTHER"]),
  totalRequiredCredits: z
    .string()
    .trim()
    .refine(
      (value) =>
        value === "" ||
        (/^\d+$/.test(value) && Number(value) >= 1 && Number(value) <= 300),
      "Use a whole number from 1 to 300, or leave it empty.",
    ),
});

export type MajorFormValues = z.infer<typeof majorFormSchema>;
