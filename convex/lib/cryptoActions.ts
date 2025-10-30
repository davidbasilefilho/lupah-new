"use node";
/**
 * Convex actions for cryptographic operations using bcrypt-ts
 * These run in Node.js runtime and use bcrypt-ts (pure TypeScript implementation)
 */

import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import { hash, compare } from "bcrypt-ts";

/**
 * Internal action to hash an access code using bcrypt-ts
 */
export const hashAccessCodeAction = internalAction({
  args: {
    accessCode: v.string(),
  },
  handler: async (_ctx, args) => {
    // Normalize the code (remove hyphens, uppercase)
    const normalized = args.accessCode.replace(/-/g, "").toUpperCase();

    // Use bcrypt-ts with 10 rounds (good balance between security and performance)
    const saltRounds = 10;
    const hashedCode = await hash(normalized, saltRounds);

    return hashedCode;
  },
});

/**
 * Internal action to validate an access code against a stored hash using bcrypt-ts
 */
export const validateAccessCodeAction = internalAction({
  args: {
    accessCode: v.string(),
    storedHash: v.string(),
  },
  handler: async (_ctx, args) => {
    // Normalize the code (remove hyphens, uppercase)
    const normalized = args.accessCode.replace(/-/g, "").toUpperCase();

    // Use bcrypt-ts's compare function
    const isValid = await compare(normalized, args.storedHash);

    return isValid;
  },
});
