"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { AvatarWithFallback } from "@/components/shared/avatar-with-fallback";
import { Button } from "@/components/ui/button";

const MAX_BYTES = 5 * 1024 * 1024;

export function AvatarUpload({
  name,
  currentUrl,
}: {
  name: string;
  currentUrl: string | null;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Choose an image file.");
      return;
    }

    if (file.size > MAX_BYTES) {
      toast.error("Image must be 5 MB or smaller.");
      return;
    }

    setUploading(true);
    try {
      const body = new FormData();
      body.append("avatar", file);
      const response = await fetch("/api/proxy/api/student/avatar", {
        method: "PATCH",
        body,
      });
      const json = (await response.json().catch(() => null)) as {
        success?: boolean;
        message?: string;
      } | null;

      if (!response.ok || json?.success === false) {
        toast.error(json?.message ?? "We could not upload your photo.");
        return;
      }

      toast.success("Photo updated");
      router.refresh();
    } catch {
      toast.error("We could not upload your photo. Please try again.");
    } finally {
      setUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <AvatarWithFallback name={name} src={currentUrl} size="lg" />
      <div className="flex flex-col gap-1">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleChange}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-fit"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? "Uploading..." : "Change photo"}
        </Button>
        <p className="text-xs text-muted-foreground">JPG or PNG, up to 5 MB.</p>
      </div>
    </div>
  );
}
