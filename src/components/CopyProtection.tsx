"use client";

import { useEffect } from "react";

export function CopyProtection() {
  useEffect(() => {
    const isEditable = (target: EventTarget | null) => {
      const el = target as HTMLElement | null;
      return el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
    };

    const blockEvent = (e: Event) => {
      if (!isEditable(e.target)) {
        e.preventDefault();
      }
    };

    document.addEventListener("copy", blockEvent);
    document.addEventListener("selectstart", blockEvent);

    return () => {
      document.removeEventListener("copy", blockEvent);
      document.removeEventListener("selectstart", blockEvent);
    };
  }, []);

  return null;
}
