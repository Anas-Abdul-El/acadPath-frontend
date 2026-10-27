import type { SignInValues, SignUpValues } from "@/schemas/auth";

/**
 * PROTOTYPE authentication. Nothing is sent anywhere and no account is created:
 * any well-formed credentials succeed after a short delay. Replace with real API calls later.
 */
export type Account = {
  name: string;
  email: string;
};

const delay = (ms: number) =>
  new Promise((resolve) => window.setTimeout(resolve, ms));

/** Derives a display name from the email local part, e.g. "maya.chen@…" → "Maya Chen". */
function nameFromEmail(email: string): string {
  return email
    .split("@")[0]
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

export async function signIn(input: SignInValues): Promise<Account> {
  await delay(700);
  const email = input.email.trim().toLowerCase();
  return { email, name: nameFromEmail(email) };
}

export async function register(input: SignUpValues): Promise<Account> {
  await delay(900);
  return {
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
  };
}
