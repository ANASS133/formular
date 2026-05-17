import { useEffect, useCallback, useRef } from "react";

const STORAGE_KEY = "active_promo_code";

/**
 * Promo-code lifecycle hook.
 *
 * 1. When a :promoCode URL param is present, persist it to localStorage
 *    so it survives refreshes and intra-site navigation.
 * 2. Expose a `clearPromoCode` callback that formHandler.js calls
 *    after the counter has been atomically incremented in Supabase.
 *
 * The hook is intentionally read-only at the React layer — the actual
 * increment RPC call lives in formHandler.js alongside the rest of the
 * submission pipeline.
 */
export function usePromoCode(promoCodeFromUrl) {
  const storedRef = useRef(null);

  // ── Persist URL code ──────────────────────────────────────────
  useEffect(() => {
    const code = promoCodeFromUrl?.trim();
    if (code) {
      localStorage.setItem(STORAGE_KEY, code);
      storedRef.current = code;
    } else {
      // Read back on mount — the user may have landed on "/" after visiting "/29841"
      storedRef.current = localStorage.getItem(STORAGE_KEY);
    }
  }, [promoCodeFromUrl]);

  // ── Attach clear helper to window (for vanilla-JS formHandler) ──
  useEffect(() => {
    window.__clearPromoCode = () => {
      localStorage.removeItem(STORAGE_KEY);
      storedRef.current = null;
    };
    return () => {
      delete window.__clearPromoCode;
    };
  }, []);

  // ── Public API ────────────────────────────────────────────────
  const getStoredCode = useCallback(() => {
    return localStorage.getItem(STORAGE_KEY);
  }, []);

  const clearPromoCode = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    storedRef.current = null;
  }, []);

  return {
    /** The promo code currently in localStorage (or null). */
    storedCode: storedRef.current ?? getStoredCode(),
    /** Remove the promo code from localStorage. */
    clearPromoCode,
    /** The localStorage key — exported so formHandler.js can stay in sync. */
    STORAGE_KEY,
  };
}
