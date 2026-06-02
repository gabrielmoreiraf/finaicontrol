"use client";

import { useState } from "react";
import { AuthLegalModal } from "@/components/auth/auth-legal-modal";
import { legalLinkLabels, type LegalDocumentId } from "@/lib/legal-content";

export function AuthFooterLinks() {
  const [openDoc, setOpenDoc] = useState<LegalDocumentId | null>(null);

  return (
    <>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[11px] text-white/45 sm:text-xs">
        {legalLinkLabels.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setOpenDoc(id)}
            className="transition-colors hover:text-emerald-400"
          >
            {label}
          </button>
        ))}
      </div>

      {openDoc && (
        <AuthLegalModal
          documentId={openDoc}
          open={openDoc !== null}
          onOpenChange={(open) => {
            if (!open) setOpenDoc(null);
          }}
        />
      )}
    </>
  );
}
