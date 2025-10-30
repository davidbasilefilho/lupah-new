/**
 * Cryptographic utilities for LUPAH parent access codes
 *
 * This module provides functions for:
 * - Generating secure random access codes
 * - Validating access code formats
 * - Normalizing access codes
 *
 * Note: Actual hashing/verification operations are in cryptoActions.ts
 * which runs in Node.js runtime.
 */

/**
 * Generates a cryptographically secure random string
 * @param length - Length of the string to generate
 * @param charset - Character set to use
 * @returns Random string
 */
function generateRandomString(
  length: number,
  charset: string = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789"
): string {
  // Remove ambiguous characters (0, O, I, 1, l, etc.) for better readability
  const chars = charset.split("");
  let result = "";

  // Use crypto.getRandomValues for cryptographically secure randomness
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);

  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length];
  }

  return result;
}

/**
 * Generates an 8-character alphanumeric access code
 * Format: XXXX-XXXX (with hyphen for readability)
 * @returns Access code string
 */
export function generateAccessCode(): string {
  const part1 = generateRandomString(4);
  const part2 = generateRandomString(4);
  return `${part1}-${part2}`;
}

/**
 * Validates the format of an access code
 * @param accessCode - The access code to validate
 * @returns True if the format is valid
 */
export function isValidAccessCodeFormat(accessCode: string): boolean {
  // Allow both formats: XXXX-XXXX or XXXXXXXX (8 alphanumeric chars)
  const withHyphen = /^[A-Z0-9]{4}-[A-Z0-9]{4}$/i;
  const withoutHyphen = /^[A-Z0-9]{8}$/i;

  return withHyphen.test(accessCode) || withoutHyphen.test(accessCode);
}

/**
 * Normalizes an access code (removes hyphens, converts to uppercase)
 * @param accessCode - The access code to normalize
 * @returns Normalized access code
 */
export function normalizeAccessCode(accessCode: string): string {
  return accessCode.replace(/-/g, "").toUpperCase();
}
