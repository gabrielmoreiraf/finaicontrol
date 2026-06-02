"use client";

import { useEffect, useState } from "react";

/** true quando a aba está visível e o usuário não pediu menos movimento. */
export function usePageVisible() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const update = () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      setVisible(!reduced && document.visibilityState === "visible");
    };

    update();
    document.addEventListener("visibilitychange", update);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    mq.addEventListener("change", update);

    return () => {
      document.removeEventListener("visibilitychange", update);
      mq.removeEventListener("change", update);
    };
  }, []);

  return visible;
}
