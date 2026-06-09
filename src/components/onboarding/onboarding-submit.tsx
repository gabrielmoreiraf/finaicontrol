"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function OnboardingSubmit() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      className="btn-brand mt-10 w-full"
      size="lg"
      disabled={pending}
      aria-busy={pending}
    >
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Salvando...
        </>
      ) : (
        "Ir para o dashboard"
      )}
    </Button>
  );
}
