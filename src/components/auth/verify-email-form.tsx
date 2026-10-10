"use client";

import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useActionState, useState } from "react";
import { FormError } from "@/components/auth/form-error";
import { SubmitButton } from "@/components/shared/submit-button";
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
import { useActionToast } from "@/hooks/use-action-toast";
import { verifyEmailAction } from "@/lib/auth/actions";

const OTP_SLOTS = [0, 1, 2, 3, 4, 5];

export function VerifyEmailForm({
  email,
  next,
}: {
  email: string;
  next?: string | null;
}) {
  const [otp, setOtp] = useState("");
  const [state, formAction] = useActionState(verifyEmailAction, undefined);
  const fieldErrors = state && !state.ok ? state.fieldErrors : undefined;
  useActionToast(state);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <FormError message={state && !state.ok ? state.message : undefined} />
      <input type="hidden" name="email" value={email} />
      <input type="hidden" name="next" value={next ?? ""} />
      <input type="hidden" name="otp" value={otp} />
      <Field data-invalid={fieldErrors?.otp ? true : undefined}>
        <FieldTitle>Verification code</FieldTitle>
        <InputOTP
          maxLength={6}
          pattern={REGEXP_ONLY_DIGITS}
          value={otp}
          onChange={setOtp}
          aria-label="Verification code"
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
      <SubmitButton
        className="w-full"
        pendingLabel="Verifying..."
        disabled={otp.length !== 6}
      >
        Verify email
      </SubmitButton>
    </form>
  );
}
