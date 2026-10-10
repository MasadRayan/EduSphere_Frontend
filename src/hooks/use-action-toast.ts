"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import type { ActionResult } from "@/types/api";

/**
 * Shows an error toast whenever a Server Action result changes to a failed
 * state. Field-level errors stay inline; this surfaces the top-level message.
 */
export function useActionToast(
  state: ActionResult<unknown> | undefined,
  fallbackMessage = "Something went wrong. Please try again.",
) {
  const lastState = useRef(state);

  useEffect(() => {
    if (state === lastState.current) {
      return;
    }
    lastState.current = state;

    if (state && !state.ok) {
      toast.error(state.message || fallbackMessage);
    }
  }, [state, fallbackMessage]);
}
