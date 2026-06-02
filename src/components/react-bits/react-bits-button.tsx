"use client";

import Link from "next/link";
import StarBorder from "@/components/StarBorder";
import { cn } from "@/lib/utils";

interface ReactBitsButtonProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  color?: string;
  onClick?: () => void;
}

export function ReactBitsButton({
  href,
  children,
  className,
  color = "#10b981",
  onClick,
}: ReactBitsButtonProps) {
  return (
    <StarBorder
      as={Link}
      href={href}
      onClick={onClick}
      color={color}
      speed="5s"
      className={cn("rounded-2xl", className)}
    >
      {children}
    </StarBorder>
  );
}
