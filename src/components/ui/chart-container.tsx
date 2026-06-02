"use client";

import { useEffect, useRef, useState } from "react";
import { ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

interface ChartContainerProps {
  children: React.ReactElement;
  className?: string;
  height?: number | string;
}

export function ChartContainer({
  children,
  className,
  height = 208,
}: ChartContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const updateSize = () => {
      setSize({
        width: node.clientWidth,
        height: node.clientHeight,
      });
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  const ready = size.width > 0 && size.height > 0;

  return (
    <div
      ref={containerRef}
      className={cn("w-full min-w-0", height === undefined && "h-52", className)}
      style={height !== undefined ? { height } : undefined}
    >
      {ready ? (
        <ResponsiveContainer width={size.width} height={size.height} minWidth={0}>
          {children}
        </ResponsiveContainer>
      ) : null}
    </div>
  );
}
