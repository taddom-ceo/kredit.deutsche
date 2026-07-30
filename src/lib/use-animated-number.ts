"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Eases a displayed number toward `target` instead of snapping instantly.
 * The underlying value used for calculations should stay on the raw target —
 * only the on-screen number gets the lag/inertia.
 */
export function useAnimatedNumber(target: number, durationMs = 350) {
  const [display, setDisplay] = useState(target);
  const displayRef = useRef(target);
  const rafRef = useRef(0);

  useEffect(() => {
    const from = displayRef.current;
    const start = performance.now();
    cancelAnimationFrame(rafRef.current);

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = from + (target - from) * eased;
      displayRef.current = next;
      setDisplay(next);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }
    rafRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafRef.current);
  }, [target, durationMs]);

  return display;
}
