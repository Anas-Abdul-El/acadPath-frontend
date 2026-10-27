import { z } from "zod";

export const PASSWORD_MIN_LENGTH = 8;

const emailField = z
  .string()
  .trim()
  .min(1, "Enter your email address.")
  .pipe(z.email("Enter a valid email address, like name@university.edu."));

export const signInSchema = z.object({
  email: emailField,
  // Sign-in only checks presence — strength rules belong to registration.
  password: z.string().min(1, "Enter your password."),
});

export const signUpSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter your full name.")
    .min(2, "Enter your full name as it appears on university records.")
    .max(100, "Use 100 characters or fewer."),
  email: emailField,
  password: z
    .string()
    .min(1, "Create a password.")
    .min(PASSWORD_MIN_LENGTH, `Use at least ${PASSWORD_MIN_LENGTH} characters.`)
    .regex(/[A-Za-z]/, "Include at least one letter.")
    .regex(/\d/, "Include at least one number."),
});

export type SignInValues = z.infer<typeof signInSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;
