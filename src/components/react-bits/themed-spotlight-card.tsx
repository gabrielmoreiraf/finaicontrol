"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

const GlareHover = dynamic(() => import("@/components/GlareHover"), {
  ssr: false,
});

interface ThemedSpotlightCardProps {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: `rgba(${number}, ${number}, ${number}, ${number})`;
  padding?: "sm" | "md" | "lg";
}

const paddingMap = {
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export function ThemedSpotlightCard({
  children,
  className,
  spotlightColor = "rgba(16, 185, 129, 0.18)",
  padding = "md",
}: ThemedSpotlightCardProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);
  const moveFrame = useRef<number | null>(null);
  const pendingMove = useRef<{ x: number; y: number } | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    pendingMove.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    if (moveFrame.current !== null) return;
    moveFrame.current = requestAnimationFrame(() => {
      moveFrame.current = null;
      if (pendingMove.current) setPosition(pendingMove.current);
    });
  };

  return (
    <GlareHover
      width="100%"
      height="100%"
      background="rgba(10, 10, 10, 0.72)"
      borderRadius="16px"
      borderColor="rgba(255, 255, 255, 0.08)"
      glareColor="#ffffff"
      glareOpacity={0.2}
      glareAngle={-30}
      glareSize={280}
      transitionDuration={750}
      className={cn("glare-hover--fill h-full w-full shadow-lg backdrop-blur-xl", className)}
    >
      <div
        ref={divRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setOpacity(0.55)}
        onMouseLeave={() => setOpacity(0)}
        className={cn("relative h-full w-full overflow-hidden rounded-2xl", paddingMap[padding])}
      >
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-500"
          style={{
            opacity,
            background: `radial-gradient(circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 75%)`,
          }}
        />
        {children}
      </div>
    </GlareHover>
  );
}
