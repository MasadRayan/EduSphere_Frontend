"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

interface BaseFieldProps extends React.ComponentProps<"input"> {
  label: string;
  error?: string;
  description?: string;
}

function FieldShell({
  id,
  label,
  error,
  description,
  children,
}: {
  id?: string;
  label: string;
  error?: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Field data-invalid={error ? true : undefined}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      {children}
      {description ? (
        <FieldDescription id={id ? `${id}-description` : undefined}>
          {description}
        </FieldDescription>
      ) : null}
      <FieldError errors={error ? [{ message: error }] : undefined} />
    </Field>
  );
}

export function TextField({
  label,
  error,
  description,
  id,
  ...props
}: BaseFieldProps) {
  return (
    <FieldShell id={id} label={label} error={error} description={description}>
      <Input id={id} aria-invalid={error ? true : undefined} {...props} />
    </FieldShell>
  );
}

export function PasswordField({
  label,
  error,
  description,
  id,
  ...props
}: BaseFieldProps) {
  const [visible, setVisible] = useState(false);
  const describedBy = description ? `${id}-description` : undefined;

  return (
    <FieldShell id={id} label={label} error={error} description={description}>
      <div className="relative">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className="pr-9"
          {...props}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="absolute top-1/2 right-1 -translate-y-1/2 text-muted-foreground"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
        >
          {visible ? (
            <EyeOff className="size-4" aria-hidden="true" />
          ) : (
            <Eye className="size-4" aria-hidden="true" />
          )}
        </Button>
      </div>
    </FieldShell>
  );
}
