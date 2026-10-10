"use client";

import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useActionState, useState } from "react";
import { FormError } from "@/components/auth/form-error";
import { PasswordField } from "@/components/auth/form-field";
import { PasswordRules } from "@/components/auth/password-rules";
import { SubmitButton } from "@/components/auth/submit-button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldTitle,
} from "@/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { resetPasswordAction } from "@/lib/auth/actions";

const OTP_SLOTS = [0, 1, 2, 3, 4, 5];

export function ResetPasswordForm({ email }: { email: string }) {
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [state, formAction] = useActionState(resetPasswordAction, undefined);
  const fieldErrors = state && !state.ok ? state.fieldErrors : undefined;

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <FormError message={state && !state.ok ? state.message : undefined} />
      <input type="hidden" name="email" value={email} />
      <input type="hidden" name="otp" value={otp} />
      <Field data-invalid={fieldErrors?.otp ? true : undefined}>
        <FieldTitle>Reset code</FieldTitle>
        <InputOTP
          maxLength={6}
          pattern={REGEXP_ONLY_DIGITS}
          value={otp}
          onChange={setOtp}
          aria-label="Reset code"
          containerClassName="justify-center"
        >
          <InputOTPGroup>
            {OTP_SLOTS.map((slot) => (
              <InputOTPSlot key={slot} index={slot} />
            ))}
          </InputOTPGroup>
        </InputOTP>
        <FieldDescription>
          Enter the 6-digit code we sent to {email}.
        </FieldDescription>
        <FieldError
          errors={
            fieldErrors?.otp ? [{ message: fieldErrors.otp[0] }] : undefined
          }
        />
      </Field>
      <div className="flex flex-col gap-2">
        <PasswordField
          id="newPassword"
          name="newPassword"
          label="New password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={fieldErrors?.newPassword?.[0]}
        />
        <PasswordRules value={password} />
      </div>
      <SubmitButton className="w-full" pendingLabel="Resetting...">
        Reset password
      </SubmitButton>
    </form>
  );
}
