"use client";

import Link from "next/link";
import { useActionState } from "react";
import { FormError } from "@/components/auth/form-error";
import { PasswordField, TextField } from "@/components/auth/form-field";
import { GoogleLogin } from "@/components/auth/google-login";
import { SubmitButton } from "@/components/shared/submit-button";
import { useActionToast } from "@/hooks/use-action-toast";
import { demoLoginAction, loginAction } from "@/lib/auth/actions";

const demoAccounts = [
  { role: "user", label: "User", description: "Student demo account" },
  { role: "teacher", label: "Teacher", description: "Instructor demo account" },
  {
    role: "super-admin",
    label: "Super admin",
    description: "Full administration access",
  },
] as const;

function DemoLoginButton({
  role,
  label,
  description,
  next,
}: {
  role: (typeof demoAccounts)[number]["role"];
  label: string;
  description: string;
  next?: string | null;
}) {
  const [state, formAction] = useActionState(demoLoginAction, undefined);
  useActionToast(state);

  return (
    <form action={formAction} className="flex">
      <input type="hidden" name="demoRole" value={role} />
      <input type="hidden" name="next" value={next ?? ""} />
      <SubmitButton
        variant="outline"
        className="h-auto w-full justify-between px-4 py-3 text-left"
        pendingLabel="Signing in..."
      >
        <span className="flex flex-col items-start gap-0.5">
          <span>{label}</span>
          <span className="text-xs font-normal text-muted-foreground">
            {description}
          </span>
        </span>
      </SubmitButton>
    </form>
  );
}

export function LoginForm({ next }: { next?: string | null }) {
  const [state, formAction] = useActionState(loginAction, undefined);
  const fieldErrors = state && !state.ok ? state.fieldErrors : undefined;
  useActionToast(state);

  return (
    <div className="flex flex-col gap-5">
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
      <div className="relative py-1">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">
            Or try a demo
          </span>
        </div>
      </div>
      <div className="grid gap-2">
        {demoAccounts.map((account) => (
          <DemoLoginButton key={account.role} {...account} next={next} />
        ))}
      </div>
    </div>
  );
}
