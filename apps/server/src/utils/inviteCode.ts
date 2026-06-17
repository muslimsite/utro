import { randomBytes } from "node:crypto";

// Excludes visually ambiguous characters (0/O, 1/I).
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const LENGTH = 6;

export function generateInviteCode(): string {
  const bytes = randomBytes(LENGTH);
  let code = "";
  for (let i = 0; i < LENGTH; i++) {
    code += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return code;
}
