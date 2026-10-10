"use client";

import { GoogleLogin as GoogleLoginButton } from "@react-oauth/google";
import { useCallback, useTransition } from "react";
import { toast } from "sonner";
import { googleLoginAction } from "@/lib/auth/actions";
import clientId from "@/lib/google-client";

function isRedirectError(error: unknown): boolean {
  const digest =
    typeof error === "object" && error !== null && "digest" in error
      ? String((error as { digest?: unknown }).digest)
      : "";
  return digest.startsWith("NEXT_REDIRECT");
}

export function GoogleLogin({ next }: { next?: string | null }) {
  const [pending, startTransition] = useTransition();

  const handleCredential = useCallback(
    (credential: string | undefined) => {
      if (!credential) {
        toast.error("Google sign-in did not return a token. Please try again.");
        return;
      }

      startTransition(async () => {
        try {
          const result = await googleLoginAction(credential, next);
          if (result && result.ok === false) {
            toast.error(result.message);
          }
        } catch (error) {
          if (isRedirectError(error)) {
            return;
          }
          toast.error(
            "We could not sign you in with Google. Please try again.",
          );
        }
      });
    },
    [next],
  );

  if (!clientId) {
    return null;
  }

  return (
    <div
      className={pending ? "pointer-events-none opacity-60" : undefined}
      aria-busy={pending}
    >
      <GoogleLoginButton
        type="standard"
        theme="outline"
        size="large"
        text="continue_with"
        shape="rectangular"
        logo_alignment="left"
        containerProps={{ className: "flex w-full justify-center" }}
        onSuccess={(response) => handleCredential(response.credential)}
        onError={() =>
          toast.error("We could not start Google sign-in. Please try again.")
        }
      />
    </div>
  );
}
