import Image from "next/image";
import { getUserInitials } from "@/lib/user/initials";
import { cn } from "@/lib/utils";

const AVATAR_SIZES = {
  sm: { box: "size-8", text: "text-xs" },
  md: { box: "size-10", text: "text-sm" },
  lg: { box: "size-11", text: "text-base" },
  xl: { box: "size-20", text: "text-lg" },
} as const;

type AvatarSize = keyof typeof AVATAR_SIZES;

export function UserAvatar({
  name,
  imageUrl,
  className,
  size = "md",
}: {
  name: string;
  imageUrl?: string | null;
  className?: string;
  size?: AvatarSize;
}) {
  const initials = getUserInitials(name);
  const { box, text } = AVATAR_SIZES[size];

  const shellClass = cn(
    "relative shrink-0 overflow-hidden rounded-full ring-2 ring-brand/20",
    box,
    className,
  );

  if (imageUrl) {
    const isBlob = imageUrl.startsWith("blob:");

    return (
      <div className={shellClass}>
        {isBlob ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={`Foto de ${name}`} className="size-full object-cover" />
        ) : (
          <Image
            src={imageUrl}
            alt={`Foto de ${name}`}
            fill
            unoptimized
            className="object-cover"
            sizes={size === "xl" ? "80px" : size === "md" ? "40px" : "32px"}
            key={imageUrl}
          />
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand/30 to-brand/10 font-semibold leading-none text-brand ring-2 ring-brand/20",
        box,
        text,
        className,
      )}
      aria-hidden={!name}
      aria-label={name ? `Avatar de ${name}` : undefined}
    >
      <span className="select-none">{initials || "?"}</span>
    </div>
  );
}
