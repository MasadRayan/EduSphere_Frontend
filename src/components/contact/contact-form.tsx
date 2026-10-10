"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FormField } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ContactValues {
  name: string;
  email: string;
  subject: string;
  message: string;
}

type ContactErrors = Partial<Record<keyof ContactValues, string>>;

const EMPTY: ContactValues = { name: "", email: "", subject: "", message: "" };

function validate(values: ContactValues): ContactErrors {
  const errors: ContactErrors = {};
  if (values.name.trim().length < 2) {
    errors.name = "Enter your full name.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = "Enter a valid email address.";
  }
  if (values.subject.trim().length < 3) {
    errors.subject = "Add a short subject.";
  }
  if (values.message.trim().length < 10) {
    errors.message = "Tell us a little more so we can help.";
  }
  return errors;
}

export function ContactForm({ to }: { to: string }) {
  const [values, setValues] = useState<ContactValues>(EMPTY);
  const [errors, setErrors] = useState<ContactErrors>({});

  function update<K extends keyof ContactValues>(key: K, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
    if (errors[key]) {
      setErrors((current) => ({ ...current, [key]: undefined }));
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      toast.error("Check the highlighted fields and try again.");
      return;
    }

    const subject = encodeURIComponent(values.subject.trim());
    const body = encodeURIComponent(
      `${values.message.trim()}\n\n- ${values.name.trim()} (${values.email.trim()})`,
    );
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
    toast.success("Opening your email app", {
      description: "Finish sending the message from there.",
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          label="Full name"
          htmlFor="contact-name"
          required
          error={errors.name}
        >
          <Input
            id="contact-name"
            name="name"
            autoComplete="name"
            value={values.name}
            onChange={(event) => update("name", event.target.value)}
            aria-invalid={Boolean(errors.name)}
          />
        </FormField>
        <FormField
          label="Email"
          htmlFor="contact-email"
          required
          error={errors.email}
        >
          <Input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(event) => update("email", event.target.value)}
            aria-invalid={Boolean(errors.email)}
          />
        </FormField>
      </div>
      <FormField
        label="Subject"
        htmlFor="contact-subject"
        required
        error={errors.subject}
      >
        <Input
          id="contact-subject"
          name="subject"
          value={values.subject}
          onChange={(event) => update("subject", event.target.value)}
          aria-invalid={Boolean(errors.subject)}
        />
      </FormField>
      <FormField
        label="Message"
        htmlFor="contact-message"
        required
        hint="Include your student ID if you already have one."
        error={errors.message}
      >
        <Textarea
          id="contact-message"
          name="message"
          rows={5}
          value={values.message}
          onChange={(event) => update("message", event.target.value)}
          aria-invalid={Boolean(errors.message)}
        />
      </FormField>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit">Send message</Button>
        <p className="text-xs text-muted-foreground">
          This opens your email app so you can send it yourself.
        </p>
      </div>
    </form>
  );
}
