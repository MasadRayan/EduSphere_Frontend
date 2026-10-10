"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { consumeFlashCookie } from "@/lib/flash";

function FlashToast() {
  useEffect(() => {
    const flash = consumeFlashCookie();
    if (!flash) {
      return;
    }

    toast[flash.type](
      flash.message,
      flash.description ? { description: flash.description } : undefined,
    );
  }, []);

  return null;
}

/**
 * Consumes a flash message after each navigation. Keying on the pathname
 * remounts the consumer so it runs again when a redirect lands on a new route.
 */
export function FlashToaster() {
  const pathname = usePathname();

  return <FlashToast key={pathname} />;
}
