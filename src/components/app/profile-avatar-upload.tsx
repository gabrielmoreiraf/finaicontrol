"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { UserAvatar } from "@/components/app/premium/user-avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { removeAvatarAction, uploadAvatarAction } from "@/lib/actions/profile";
import { notify } from "@/lib/toast";
import { cn } from "@/lib/utils";

type ProfileAvatarUploadProps = {
  userName: string;
  avatarUrl?: string | null;
};

export function ProfileAvatarUpload({ userName, avatarUrl }: ProfileAvatarUploadProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const displayUrl = previewUrl ?? avatarUrl ?? null;
  const hasPhoto = Boolean(displayUrl);

  useEffect(() => {
    if (!avatarUrl || !previewUrl) return;
    URL.revokeObjectURL(previewUrl);
    previewRef.current = null;
    setPreviewUrl(null);
  }, [avatarUrl, previewUrl]);

  useEffect(() => {
    return () => {
      if (previewRef.current) {
        URL.revokeObjectURL(previewRef.current);
      }
    };
  }, []);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
    }

    const objectUrl = URL.createObjectURL(file);
    previewRef.current = objectUrl;
    setPreviewUrl(objectUrl);

    const formData = new FormData();
    formData.set("avatar", file);

    startTransition(async () => {
      const result = await uploadAvatarAction(formData);

      if (result.error) {
        URL.revokeObjectURL(objectUrl);
        previewRef.current = null;
        setPreviewUrl(null);
        notify.error(result.error);
        return;
      }

      notify.success(result.message ?? "Foto adicionada.");
      router.refresh();
    });

    event.target.value = "";
  }

  function handleRemove() {
    startTransition(async () => {
      const result = await removeAvatarAction();
      if (result.error) {
        notify.error(result.error);
        return;
      }
      if (previewRef.current) {
        URL.revokeObjectURL(previewRef.current);
        previewRef.current = null;
      }
      setPreviewUrl(null);
      setViewerOpen(false);
      notify.success(result.message ?? "Foto removida.");
      router.refresh();
    });
  }

  function openFilePicker() {
    inputRef.current?.click();
  }

  function handleAvatarClick() {
    if (hasPhoto) {
      setViewerOpen(true);
      return;
    }
    openFilePicker();
  }

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative shrink-0 self-start">
          <button
            type="button"
            className={cn(
              "relative block rounded-full outline-none focus-visible:ring-2 focus-visible:ring-brand/50",
              hasPhoto && "cursor-zoom-in",
            )}
            disabled={isPending}
            onClick={handleAvatarClick}
            aria-label={
              hasPhoto ? "Ver foto de perfil em tamanho maior" : "Adicionar foto de perfil"
            }
          >
            <UserAvatar
              name={userName}
              imageUrl={displayUrl}
              size="xl"
              className={cn(isPending && "opacity-70")}
            />
          </button>
          <button
            type="button"
            className="absolute -bottom-0.5 -right-0.5 flex size-7 items-center justify-center rounded-full border-2 border-background bg-brand text-black shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
            disabled={isPending}
            onClick={openFilePicker}
            aria-label={hasPhoto ? "Trocar foto de perfil" : "Adicionar foto de perfil"}
          >
            <Camera className="size-3.5" aria-hidden />
          </button>
          {isPending && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
              <Loader2 className="size-6 animate-spin text-brand" aria-hidden />
            </div>
          )}
        </div>

        <div className="min-w-0 space-y-2">
          <p className="text-sm font-semibold">Foto de perfil</p>
          <p className="text-xs text-muted-foreground">
            PNG ou JPG. Recomendamos imagens quadradas.
            {hasPhoto ? " Clique na foto para ampliar." : null}
          </p>
          <div className="flex flex-wrap gap-2">
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              className="sr-only"
              onChange={handleFileChange}
              disabled={isPending}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl border-white/10"
              disabled={isPending}
              onClick={openFilePicker}
            >
              <Camera className="size-4" aria-hidden />
              {hasPhoto ? "Trocar foto" : "Adicionar foto"}
            </Button>
            {hasPhoto && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-400"
                disabled={isPending}
                onClick={handleRemove}
              >
                <Trash2 className="size-4" aria-hidden />
                Remover
              </Button>
            )}
          </div>
        </div>
      </div>

      <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
        <DialogContent className="max-w-sm gap-0 overflow-hidden p-0 sm:max-w-md">
          <DialogHeader className="border-b border-white/10 px-4 py-3">
            <DialogTitle className="text-base">Sua foto de perfil</DialogTitle>
          </DialogHeader>
          {displayUrl && (
            <div className="relative aspect-square w-full bg-black/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={displayUrl}
                alt={`Foto de ${userName}`}
                className="size-full object-cover"
              />
            </div>
          )}
          <div className="flex flex-wrap gap-2 border-t border-white/10 p-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl border-white/10"
              disabled={isPending}
              onClick={() => {
                setViewerOpen(false);
                openFilePicker();
              }}
            >
              <Camera className="size-4" aria-hidden />
              Trocar foto
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-400"
              disabled={isPending}
              onClick={handleRemove}
            >
              <Trash2 className="size-4" aria-hidden />
              Remover
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
