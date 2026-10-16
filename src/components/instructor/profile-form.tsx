"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { FormError } from "@/components/auth/form-error";
import { FormField } from "@/components/shared/form-field";
import { SubmitButton } from "@/components/shared/submit-button";
import { Input } from "@/components/ui/input";
import { useActionToast } from "@/hooks/use-action-toast";
import { updateInstructorProfileAction } from "@/lib/instructor/actions";

export function ProfileForm({
  defaults,
}: {
  defaults: { fullName: string; phone: string | null };
}) {
  const [state, formAction] = useActionState(
    updateInstructorProfileAction,
    undefined,
  );
  const fieldErrors = state && !state.ok ? state.fieldErrors : undefined;
  useActionToast(state);

  const lastState = useRef(state);
  useEffect(() => {
    if (state === lastState.current) {
      return;
    }
    lastState.current = state;
    if (state?.ok) {
      toast.success(state.message);
    }
  }, [state]);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <FormError message={state && !state.ok ? state.message : undefined} />
      <FormField
        label="Full name"
        htmlFor="fullName"
        required
        error={fieldErrors?.fullName?.[0]}
      >
        <Input
          id="fullName"
          name="fullName"
          autoComplete="name"
          defaultValue={defaults.fullName}
          aria-invalid={fieldErrors?.fullName ? true : undefined}
        />
      </FormField>
      <FormField label="Phone" htmlFor="phone" error={fieldErrors?.phone?.[0]}>
        <Input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="+8801XXXXXXXXX"
          defaultValue={defaults.phone ?? ""}
          aria-invalid={fieldErrors?.phone ? true : undefined}
        />
      </FormField>
      <SubmitButton className="w-full sm:w-auto" pendingLabel="Saving...">
        Save changes
      </SubmitButton>
    </form>
  );
}
