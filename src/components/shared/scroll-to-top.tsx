"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export function ScrollToTop() {
  const pathname = usePathname();
  const renderedPathname = useRef(pathname);
  const previousPathname = useRef<string | null>(null);
  const isPopState = useRef(false);

  useEffect(() => {
    renderedPathname.current = pathname;
  }, [pathname]);

  useEffect(() => {
    const onPopState = () => {
      if (window.location.pathname !== renderedPathname.current) {
        isPopState.current = true;
      }
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    const previous = previousPathname.current;
    previousPathname.current = pathname;

    if (previous === null || previous === pathname) {
      isPopState.current = false;
      return;
    }

    if (isPopState.current) {
      isPopState.current = false;
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}
