/**
 * Cryptographic utilities for LUPAH parent access codes using Bun's native password hashing
 *
 * This module provides functions for:
 * - Generating secure random access codes
 * - Hashing access codes with Bun's native Argon2id
 * - Validating access codes against stored hashes
 */

/**
 * Generates a cryptographically secure random string
 * @param length - Length of the string to generate
 * @param charset - Character set to use
 * @returns Random string
 */
function generateRandomString(
  length: number,
  charset: string = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
): string {
  // Remove ambiguous characters (0, O, I, 1, etc.) for better readability
  const chars = charset.split("");
  let result = "";

  // Use crypto.randomBytes equivalent for better randomness
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
 * Hashes an access code using Bun's native Argon2id implementation
 * @param accessCode - The access code to hash
 * @returns Hash string in PHC format
 */
export async function hashAccessCode(accessCode: string): Promise<string> {
  // Normalize the code (remove hyphens, uppercase)
  const normalized = accessCode.replace(/-/g, "").toUpperCase();

  // Use Bun's native password hashing with Argon2id
  const hash = await Bun.password.hash(normalized, {
    algorithm: "argon2id",
    memoryCost: 65536, // 64 MiB (default, good balance)
    timeCost: 3, // 3 iterations (default, suitable for production)
  });

  return hash;
}

/**
 * Validates an access code against a stored hash using Bun's native verify
 * @param accessCode - The access code to validate
 * @param storedHash - The stored hash to compare against
 * @returns True if the access code is valid
 */
export async function validateAccessCode(
  accessCode: string,
  storedHash: string
): Promise<boolean> {
  // Normalize the code (remove hyphens, uppercase)
  const normalized = accessCode.replace(/-/g, "").toUpperCase();

  // Use Bun's native password verification
  // This automatically detects the algorithm from the hash format
  const isValid = await Bun.password.verify(normalized, storedHash);

  return isValid;
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
