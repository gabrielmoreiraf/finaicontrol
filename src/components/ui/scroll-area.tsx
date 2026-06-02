"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ScrollAreaProps = {
  children: React.ReactNode;
  className?: string;
  viewportClassName?: string;
  showScrollTop?: boolean;
  scrollTopThreshold?: number;
};

export function ScrollArea({
  children,
  className,
  viewportClassName,
  showScrollTop = true,
  scrollTopThreshold = 240,
}: ScrollAreaProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [showTopButton, setShowTopButton] = useState(false);

  const handleScroll = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    setShowTopButton(viewport.scrollTop > scrollTopThreshold);
  }, [scrollTopThreshold]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    handleScroll();
    viewport.addEventListener("scroll", handleScroll, { passive: true });
    return () => viewport.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  function scrollToTop() {
    viewportRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className={cn("finia-scroll-area relative flex min-h-0 flex-1 flex-col", className)}>
      <div
        ref={viewportRef}
        className={cn(
          "finia-scroll min-h-0 flex-1 overflow-x-hidden overflow-y-auto scroll-smooth",
          viewportClassName,
        )}
      >
        {children}
      </div>

      {showScrollTop && showTopButton && (
        <Button
          type="button"
          size="icon"
          variant="outline"
          onClick={scrollToTop}
          aria-label="Voltar ao topo"
          className={cn(
            "absolute right-3 z-20 size-10 rounded-xl border-border bg-card/90 text-foreground shadow-lg backdrop-blur-md dark:border-white/10",
            "transition-all hover:border-brand/30 hover:bg-brand/10 hover:text-brand",
            "bottom-[calc(4.5rem+env(safe-area-inset-bottom))] sm:right-4 lg:bottom-6",
          )}
        >
          <ChevronUp className="size-5" aria-hidden />
        </Button>
      )}
    </div>
  );
}
