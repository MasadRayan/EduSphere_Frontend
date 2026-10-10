"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { googleLoginAction } from "@/lib/auth/actions";

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const SCRIPT_ID = "google-identity-services";

interface GoogleIdConfiguration {
  client_id: string;
  callback: (response: { credential?: string }) => void;
}

interface GoogleButtonOptions {
  type?: string;
  theme?: string;
  size?: string;
  text?: string;
  shape?: string;
  width?: number;
  logo_alignment?: string;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: GoogleIdConfiguration) => void;
          renderButton: (
            parent: HTMLElement,
            options: GoogleButtonOptions,
          ) => void;
        };
      };
    };
  }
}

export function GoogleSignInButton({ next }: { next?: string | null }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [, startTransition] = useTransition();

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
          const digest =
            typeof error === "object" && error && "digest" in error
              ? String((error as { digest?: unknown }).digest)
              : "";
          if (digest.startsWith("NEXT_REDIRECT")) {
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

  useEffect(() => {
    if (!CLIENT_ID) {
      return;
    }

    let cancelled = false;

    const render = () => {
      const container = containerRef.current;
      if (cancelled || !container || !window.google) {
        return;
      }
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: (response) => handleCredential(response.credential),
      });
      container.replaceChildren();
      window.google.accounts.id.renderButton(container, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "rectangular",
        logo_alignment: "left",
        width: Math.min(container.clientWidth || 320, 400),
      });
      setReady(true);
    };

    if (document.getElementById(SCRIPT_ID)) {
      render();
      return () => {
        cancelled = true;
      };
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.addEventListener("load", render);
    document.head.appendChild(script);

    return () => {
      cancelled = true;
    };
  }, [handleCredential]);

  if (!CLIENT_ID) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <div ref={containerRef} className="flex w-full justify-center" />
      {!ready ? (
        <p className="text-center text-xs text-muted-foreground">
          Loading Google sign-in...
        </p>
      ) : null}
    </div>
  );
}
