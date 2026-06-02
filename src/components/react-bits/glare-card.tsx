"use client";

import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

const GlareHover = dynamic(() => import("@/components/GlareHover"), {
  ssr: false,
});

interface GlareCardProps {
  children: React.ReactNode;
  className?: string;
  borderRadius?: string;
  interactive?: boolean;
}

export function GlareCard({
  children,
  className,
  borderRadius = "16px",
  interactive = false,
}: GlareCardProps) {
  return (
    <GlareHover
      width="100%"
      height="100%"
      background="transparent"
      borderRadius={borderRadius}
      borderColor="rgba(255,255,255,0.1)"
      glareColor="#ffffff"
      glareOpacity={0.22}
      glareAngle={-30}
      glareSize={280}
      transitionDuration={750}
      className={cn(
        "glare-hover--fill h-full w-full",
        interactive && "glare-hover--interactive",
        className,
      )}
    >
      {children}
    </GlareHover>
  );
}
