"use client";

import { FileText, Loader2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const MAX_BYTES = 5 * 1024 * 1024;

export function ResumeUpload({ resumeName }: { resumeName: string | null }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (file.size > MAX_BYTES) {
      toast.error("Resume must be 5 MB or smaller.");
      return;
    }

    setUploading(true);
    try {
      const body = new FormData();
      body.append("resume", file);
      const response = await fetch("/api/proxy/api/instructor/resume", {
        method: "POST",
        body,
      });
      const json = (await response.json().catch(() => null)) as {
        success?: boolean;
        message?: string;
      } | null;

      if (!response.ok || json?.success === false) {
        toast.error(json?.message ?? "We could not upload your resume.");
        return;
      }

      toast.success("Resume uploaded");
      router.refresh();
    } catch {
      toast.error("We could not upload your resume. Please try again.");
    } finally {
      setUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <span className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <FileText className="size-5" aria-hidden="true" />
      </span>
      <div className="flex min-w-0 flex-col">
        <p className="truncate text-sm font-medium">
          {resumeName ?? "No resume uploaded yet"}
        </p>
        <p className="text-xs text-muted-foreground">PDF or DOC, up to 5 MB.</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx,image/*"
        className="hidden"
        onChange={handleChange}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="ml-auto w-fit"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="size-4" aria-hidden="true" />
            {resumeName ? "Replace resume" : "Upload resume"}
          </>
        )}
      </Button>
    </div>
  );
}
