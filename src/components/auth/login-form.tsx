"use client";

import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";
import { FormError } from "@/components/auth/form-error";
import { PasswordField, TextField } from "@/components/auth/form-field";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { SubmitButton } from "@/components/auth/submit-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FieldSeparator } from "@/components/ui/field";
import { loginAction } from "@/lib/auth/actions";

export function LoginForm({
  next,
  justReset,
}: {
  next?: string | null;
  justReset?: boolean;
}) {
  const [state, formAction] = useActionState(loginAction, undefined);
  const fieldErrors = state && !state.ok ? state.fieldErrors : undefined;

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {justReset ? (
        <Alert>
          <CheckCircle2 aria-hidden="true" />
          <AlertDescription>
            Your password was reset. Log in with your new password.
          </AlertDescription>
        </Alert>
      ) : null}
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
      <GoogleSignInButton next={next} />
    </form>
  );
}
