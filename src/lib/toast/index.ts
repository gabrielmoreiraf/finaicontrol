import { toast } from "sonner";

type ToastOptions = {
  description?: string;
  duration?: number;
};

export const notify = {
  success(title: string, options?: ToastOptions) {
    toast.success(title, {
      description: options?.description,
      duration: options?.duration ?? 4000,
    });
  },

  error(title: string, options?: ToastOptions) {
    toast.error(title, {
      description: options?.description,
      duration: options?.duration ?? 5000,
    });
  },

  info(title: string, options?: ToastOptions) {
    toast.info(title, {
      description: options?.description,
      duration: options?.duration ?? 4000,
    });
  },

  warning(title: string, options?: ToastOptions) {
    toast.warning(title, {
      description: options?.description,
      duration: options?.duration ?? 4500,
    });
  },
};

export { TOAST_MESSAGES, TOAST_URL_KEYS, TOAST_URL_MESSAGES } from "@/lib/toast/messages";
export type { ToastUrlKey } from "@/lib/toast/messages";
