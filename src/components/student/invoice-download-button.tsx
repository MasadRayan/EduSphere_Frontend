"use client";

import { DownloadIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { apiClient } from "@/lib/api/client-fetch";
import { endpoints } from "@/lib/api/endpoints";

function parseFilename(disposition: string | null, fallback: string): string {
  if (!disposition) {
    return fallback;
  }

  const utf8Match = /filename\*=UTF-8''([^;]+)/i.exec(disposition);
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1]);
    } catch {
      return fallback;
    }
  }

  const plainMatch = /filename="([^"]+)"/i.exec(disposition);
  return plainMatch?.[1] ?? fallback;
}

function errorMessageFrom(raw: string): string {
  try {
    const parsed = JSON.parse(raw) as { message?: unknown };
    if (typeof parsed.message === "string" && parsed.message.length > 0) {
      return parsed.message;
    }
  } catch {
    // Not JSON: fall through to the generic message.
  }
  return "The invoice could not be generated. Please try again.";
}

export function InvoiceDownloadButton({
  enrollmentId,
  invoiceNumber,
  variant = "outline",
}: {
  enrollmentId: string;
  invoiceNumber?: string | null;
  variant?: "default" | "outline" | "ghost";
}) {
  const [pending, setPending] = useState(false);

  const onDownload = async () => {
    setPending(true);
    try {
      const response = await apiClient.raw(
        `${endpoints.courseRegistrations.base}/${enrollmentId}/invoice`,
        { method: "GET", responseType: "arrayBuffer" },
      );

      const contentType = response.headers.get("content-type") ?? "";
      const data = response._data;

      if (data === undefined) {
        toast.error("The invoice response was empty. Please try again.");
        return;
      }

      if (!response.ok || !contentType.includes("application/pdf")) {
        const raw = new TextDecoder().decode(data);
        toast.error(errorMessageFrom(raw));
        return;
      }

      const blob = new Blob([data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = parseFilename(
        response.headers.get("content-disposition"),
        `invoice-${invoiceNumber ?? enrollmentId}.pdf`,
      );
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      toast.success("Invoice downloaded");
    } catch {
      toast.error("We could not reach the server. Please try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size="sm"
      onClick={onDownload}
      disabled={pending}
    >
      {pending ? (
        <Spinner aria-hidden="true" />
      ) : (
        <DownloadIcon aria-hidden="true" />
      )}
      Download invoice
    </Button>
  );
}
