"use client";

import { useActionState, useState } from "react";
import { FormError } from "@/components/auth/form-error";
import { PasswordField, TextField } from "@/components/auth/form-field";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { PasswordRules } from "@/components/auth/password-rules";
import { SubmitButton } from "@/components/auth/submit-button";
import {
  Field,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { registerAction } from "@/lib/auth/actions";

export function RegisterForm() {
  const [password, setPassword] = useState("");
  const [state, formAction] = useActionState(registerAction, undefined);
  const fieldErrors = state && !state.ok ? state.fieldErrors : undefined;

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <FormError message={state && !state.ok ? state.message : undefined} />
      <TextField
        id="name"
        name="name"
        label="Full name"
        autoComplete="name"
        required
        minLength={3}
        maxLength={10}
        description="3 to 10 characters"
        error={fieldErrors?.name?.[0]}
      />
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
      <Field data-invalid={fieldErrors?.role ? true : undefined}>
        <FieldLabel htmlFor="role">I am registering as</FieldLabel>
        <NativeSelect
          id="role"
          name="role"
          defaultValue="STUDENT"
          className="w-full"
        >
          <NativeSelectOption value="STUDENT">Student</NativeSelectOption>
          <NativeSelectOption value="INSTRUCTOR">Instructor</NativeSelectOption>
        </NativeSelect>
        <FieldError
          errors={
            fieldErrors?.role ? [{ message: fieldErrors.role[0] }] : undefined
          }
        />
      </Field>
      <div className="flex flex-col gap-2">
        <PasswordField
          id="password"
          name="password"
          label="Password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={fieldErrors?.password?.[0]}
        />
        <PasswordRules value={password} />
      </div>
      <SubmitButton className="w-full" pendingLabel="Creating account...">
        Create account
      </SubmitButton>
      <GoogleSignInButton />
    </form>
  );
}
