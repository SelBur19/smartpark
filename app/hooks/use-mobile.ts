"use client";

import { useEffect, useState } from "react";

/**
 * A small hook to determine whether the viewport is currently a mobile width.
 *
 * This is a simplistic implementation intended for UI behavior only.
 */
export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(`(max-width: ${breakpoint}px)`).matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const handler = (event: MediaQueryListEvent) => setIsMobile(event.matches);

    // Modern browsers
    mediaQuery.addEventListener?.("change", handler);
    // Safari
    mediaQuery.addListener?.(handler);

    return () => {
      mediaQuery.removeEventListener?.("change", handler);
      mediaQuery.removeListener?.(handler);
    };
  }, [breakpoint]);

  return isMobile;
}
