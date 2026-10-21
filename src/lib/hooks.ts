"use client";

import { useState, useSyncExternalStore } from "react";

/** Subscribes to a media query; false during SSR. */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (cb) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", cb);
      return () => mql.removeEventListener("change", cb);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

const noop = () => () => {};
/** True after hydration, without a setState-in-effect round trip. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}

/** Resets a boolean (e.g. a menu) whenever `key` changes, computed during render. */
export function useResetOn<T>(key: T, initial = false) {
  const [state, setState] = useState(initial);
  const [prev, setPrev] = useState(key);
  if (prev !== key) {
    setPrev(key);
    setState(initial);
  }
  return [state, setState] as const;
}

/**
 * prefers-reduced-motion, but false until hydrated so server and client markup match.
 * Components re-render with the real preference immediately after hydration.
 */
export function useSafeReducedMotion(): boolean {
  const hydrated = useHydrated();
  const reduce = useMediaQuery("(prefers-reduced-motion: reduce)");
  return hydrated && reduce;
}
