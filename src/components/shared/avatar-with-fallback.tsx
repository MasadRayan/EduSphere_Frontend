import Image from "next/image";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const SIZE_PX = { sm: 28, default: 32, lg: 40 } as const;

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "?";
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function AvatarWithFallback({
  name,
  src,
  size = "default",
  className,
}: {
  name: string;
  src?: string | null;
  size?: keyof typeof SIZE_PX;
  className?: string;
}) {
  const px = SIZE_PX[size];

  return (
    <Avatar size={size} className={cn(className)}>
      {src ? (
        <Image
          src={src}
          alt={name}
          width={px}
          height={px}
          className="size-full rounded-full object-cover"
        />
      ) : (
        <AvatarFallback>{initials(name)}</AvatarFallback>
      )}
    </Avatar>
  );
}
