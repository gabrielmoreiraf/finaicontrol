"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { notify, TOAST_URL_MESSAGES, type ToastUrlKey } from "@/lib/toast";

function isToastUrlKey(value: string): value is ToastUrlKey {
  return value in TOAST_URL_MESSAGES;
}

export function ToastFromUrl() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const handled = useRef<string | null>(null);

  useEffect(() => {
    const toastKey = searchParams.get("toast");
    if (!toastKey || !isToastUrlKey(toastKey)) return;

    const signature = `${pathname}?toast=${toastKey}`;
    if (handled.current === signature) return;
    handled.current = signature;

    const payload = TOAST_URL_MESSAGES[toastKey];
    notify.success(payload.title, { description: payload.description });

    const params = new URLSearchParams(searchParams.toString());
    params.delete("toast");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  return null;
}
