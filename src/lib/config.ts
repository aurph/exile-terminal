/**
 * Single-user personalization. Reads from env on the server, with sensible
 * defaults so the app runs out of the box. Safe to import in client components
 * (only the NEXT_PUBLIC_* and literal defaults are inlined client-side).
 */
export const PROFILE = {
  account: process.env.NEXT_PUBLIC_POE_ACCOUNT ?? "aurph",
  character: process.env.NEXT_PUBLIC_POE_CHARACTER ?? "alangreenspan",
  league: process.env.NEXT_PUBLIC_POE_LEAGUE ?? "Rise of the Abyssal",
  patch: process.env.NEXT_PUBLIC_POE_PATCH ?? "0.5",
} as const;

export type Profile = typeof PROFILE;
