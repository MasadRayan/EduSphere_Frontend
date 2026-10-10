"use client";

import Link from "next/link";
import { useActionState } from "react";
import { FormError } from "@/components/auth/form-error";
import { PasswordField, TextField } from "@/components/auth/form-field";
import { GoogleLogin } from "@/components/auth/google-login";
import { SubmitButton } from "@/components/shared/submit-button";
import { useActionToast } from "@/hooks/use-action-toast";
import { loginAction } from "@/lib/auth/actions";

export function LoginForm({ next }: { next?: string | null }) {
  const [state, formAction] = useActionState(loginAction, undefined);
  const fieldErrors = state && !state.ok ? state.fieldErrors : undefined;
  useActionToast(state);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <FormError message={state && !state.ok ? state.message : undefined} />
      <input type="hidden" name="next" value={next ?? ""} />
      <TextField
        id="email"
        name="email"
        type="email"
        label="Email"
        autoComplete="email"
        placeholder="you@example.com"
        required
        error={fieldErrors?.email?.[0]}
      />
      <div className="flex flex-col gap-1.5">
        <PasswordField
          id="password"
          name="password"
          label="Password"
          autoComplete="current-password"
          required
          error={fieldErrors?.password?.[0]}
        />
        <Link
          href="/forgot-password"
          className="self-end text-xs text-primary hover:underline"
        >
          Forgot password?
        </Link>
      </div>
      <SubmitButton className="w-full" pendingLabel="Logging in...">
        Log in
      </SubmitButton>
      <GoogleLogin next={next} />
    </form>
  );
}
