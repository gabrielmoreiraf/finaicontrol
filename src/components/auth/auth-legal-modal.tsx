"use client";

import type { ComponentType } from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { FileText, Lock, Shield, X } from "lucide-react";
import {
  legalDocuments,
  type LegalDocumentId,
} from "@/lib/legal-content";
import { cn } from "@/lib/utils";

const documentIcons: Record<
  LegalDocumentId,
  ComponentType<{ className?: string }>
> = {
  privacy: Shield,
  terms: FileText,
  security: Lock,
};

type AuthLegalModalProps = {
  documentId: LegalDocumentId;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AuthLegalModal({
  documentId,
  open,
  onOpenChange,
}: AuthLegalModalProps) {
  const doc = legalDocuments[documentId];
  const Icon = documentIcons[documentId];

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-100 bg-black/70 backdrop-blur-sm",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
          )}
        />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-101 w-[min(calc(100vw-2rem),40rem)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-emerald-500/25 bg-neutral-950 p-6 shadow-[0_0_60px_rgba(16,185,129,0.12)] outline-none sm:p-8",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          )}
        >
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-emerald-400/60 to-transparent"
            aria-hidden
          />

          <div className="flex items-start gap-4 pr-8">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
              <Icon className="size-5" aria-hidden />
            </div>
            <div className="min-w-0 space-y-1.5">
              <DialogPrimitive.Title className="text-xl font-bold tracking-tight text-white">
                {doc.title}
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="text-sm leading-relaxed text-white/60">
                {doc.intro}
              </DialogPrimitive.Description>
            </div>
          </div>

          <ul className="mt-6 space-y-3">
            {doc.points.map((point) => (
              <li
                key={point}
                className="relative pl-5 text-sm leading-relaxed text-white/55 before:absolute before:left-0 before:top-[0.6em] before:size-1.5 before:rounded-full before:bg-emerald-500/60"
              >
                {point}
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="auth-submit-btn mt-8 w-full rounded-xl bg-brand py-3 text-sm font-semibold text-black transition-opacity hover:opacity-90"
          >
            Entendi
          </button>

          <DialogPrimitive.Close
            className="absolute right-5 top-5 rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/8 hover:text-emerald-400 sm:right-6 sm:top-6"
            aria-label="Fechar"
          >
            <X className="size-4" />
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
