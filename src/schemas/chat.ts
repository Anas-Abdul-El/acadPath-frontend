import { z } from "zod";

export const CHAT_MESSAGE_MAX = 1000;

export const chatMessageSchema = z
  .string()
  .trim()
  .min(1, "Type a question first.")
  .max(
    CHAT_MESSAGE_MAX,
    `Keep your question under ${CHAT_MESSAGE_MAX} characters.`,
  );
