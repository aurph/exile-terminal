"use client";

import type { ParsedBuild } from "./pob";
import { BUILD_STORAGE_KEY, SAVE_MAX_AGE } from "./save";

/**
 * Client half of the browser-owned save. Cookie writes are plain
 * document.cookie sets (not httpOnly, on purpose: the browser is the owner),
 * so a toggle is instant and needs no network. The server sees the new value
 * on the next request and SSRs the same state the client is holding.
 */
export function readCookie(name: string): string | null {
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

export function writeCookie(name: string, value: string): void {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${SAVE_MAX_AGE}; SameSite=Lax${secure}`;
}

/* ------------------------- PoB build (localStorage) ------------------------- */

/** Fired on same-tab writes; the cross-tab case rides the native storage event. */
export const BUILD_CHANGE_EVENT = "exile:build-change";

// getSnapshot must be referentially stable, so cache by the raw string.
let snapshotCache: { raw: string | null; build: ParsedBuild | null } = { raw: "", build: null };

export function readStoredBuild(): ParsedBuild | null {
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(BUILD_STORAGE_KEY);
  } catch {
    raw = null;
  }
  if (snapshotCache.raw !== raw) {
    let build: ParsedBuild | null = null;
    if (raw) {
      try {
        const b = JSON.parse(raw) as ParsedBuild;
        if (b && typeof b === "object" && typeof b.stats === "object") build = b;
      } catch {
        /* corrupt save: treat as empty */
      }
    }
    snapshotCache = { raw, build };
  }
  return snapshotCache.build;
}

export function subscribeToBuild(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(BUILD_CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(BUILD_CHANGE_EVENT, onChange);
  };
}

export function writeBuild(build: ParsedBuild | null): void {
  try {
    if (build) window.localStorage.setItem(BUILD_STORAGE_KEY, JSON.stringify(build));
    else window.localStorage.removeItem(BUILD_STORAGE_KEY);
  } catch {
    /* storage blocked or full; the UI still updates for this session */
  }
  window.dispatchEvent(new Event(BUILD_CHANGE_EVENT));
}
