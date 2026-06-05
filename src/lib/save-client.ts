"use client";

import { SAVE_MAX_AGE } from "./save";

/**
 * Client half of the browser-owned save. Writes are plain document.cookie
 * sets (not httpOnly, on purpose: the browser is the owner), so a toggle is
 * instant and needs no network. The server sees the new value on the next
 * request and SSRs the same state the client is holding.
 */
export function readCookie(name: string): string | null {
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

export function writeCookie(name: string, value: string): void {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${SAVE_MAX_AGE}; SameSite=Lax${secure}`;
}
