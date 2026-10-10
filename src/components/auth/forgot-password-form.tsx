"use client";

import Link from "next/link";
import { useActionState } from "react";
import { FormError } from "@/components/auth/form-error";
import { TextField } from "@/components/auth/form-field";
import { SubmitButton } from "@/components/auth/submit-button";
import { forgotPasswordAction } from "@/lib/auth/actions";

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState(forgotPasswordAction, undefined);
  const fieldErrors = state && !state.ok ? state.fieldErrors : undefined;

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <FormError message={state && !state.ok ? state.message : undefined} />
      <TextField
        id="email"
        name="email"
        type="email"
        label="Email"
        autoComplete="email"
        placeholder="you@example.com"
        required
        description="We will send a 6-digit code to this address."
        error={fieldErrors?.email?.[0]}
      />
      <SubmitButton className="w-full" pendingLabel="Sending code...">
        Send reset code
      </SubmitButton>
      <p className="text-sm text-muted-foreground">
        Remembered it?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Back to log in
        </Link>
      </p>
    </form>
  );
}
