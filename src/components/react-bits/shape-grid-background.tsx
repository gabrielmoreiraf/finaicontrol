"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { usePageVisible } from "@/lib/use-page-visible";

const ShapeGrid = dynamic(() => import("@/components/ShapeGrid"), { ssr: false });

export function ShapeGridBackground() {
  const [mounted, setMounted] = useState(false);
  const pageVisible = usePageVisible();

  useEffect(() => {
    const run = () => setMounted(true);

    if (typeof requestIdleCallback === "function") {
      const id = requestIdleCallback(run, { timeout: 1500 });
      return () => cancelIdleCallback(id);
    }

    const timer = window.setTimeout(run, 80);
    return () => window.clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
      <ShapeGrid
        active={pageVisible}
        speed={0.5}
        squareSize={40}
        direction="diagonal"
        borderColor="rgba(0, 230, 118, 0.08)"
        hoverFillColor="#00e676"
        shape="square"
        hoverTrailAmount={5}
        className="h-full w-full"
      />
      <div className="absolute inset-0 bg-background/88" />
    </div>
  );
}
