import { Clock, Mail, MapPin, MessagesSquare, Phone } from "lucide-react";
import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/contact-form";

export const metadata: Metadata = {
  title: "Contact us",
  description:
    "Reach the EduSphere admissions, registrar and support desks, or send us a message.",
};

const CHANNELS = [
  {
    icon: Mail,
    title: "Admissions",
    body: "Applications, eligibility and program questions.",
    href: "mailto:admissions@edusphere.edu",
    label: "admissions@edusphere.edu",
  },
  {
    icon: MessagesSquare,
    title: "Registrar's office",
    body: "Enrollment, results, transcripts and student records.",
    href: "mailto:registrar@edusphere.edu",
    label: "registrar@edusphere.edu",
  },
  {
    icon: Phone,
    title: "Technical support",
    body: "Sign-in, payments, or anything that will not load.",
    href: "tel:+88025550142",
    label: "+880 2 555 0142",
  },
];

export default function ContactPage() {
  return (
    <div className="flex flex-col">
      <section className="border-b border-border">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 md:py-20">
          <p className="font-mono text-xs tracking-[0.2em] text-primary uppercase">
            Contact us
          </p>
          <h1 className="mt-3 max-w-2xl font-display text-4xl font-semibold tracking-tight text-balance">
            Talk to the desk that can help.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Admissions, the registrar and support all read these messages. Tell
            us what you need and we will point you to the right record.
          </p>
        </div>
      </section>

      <section className="border-b border-border bg-card">
        <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 py-16 lg:grid-cols-[1fr_1.1fr]">
          <div className="space-y-8">
            <div className="space-y-3">
              <h2 className="font-display text-2xl font-semibold tracking-tight">
                Reach the right desk
              </h2>
              <p className="text-sm text-muted-foreground">
                Direct lines for each office, usually answered within one
                working day.
              </p>
            </div>

            <ul className="space-y-3">
              {CHANNELS.map((channel) => (
                <li
                  key={channel.title}
                  className="flex gap-4 rounded-xl border border-border bg-background p-4"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <channel.icon className="size-5" aria-hidden="true" />
                  </span>
                  <div className="space-y-1">
                    <p className="font-display text-base font-semibold">
                      {channel.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {channel.body}
                    </p>
                    <a
                      href={channel.href}
                      className="inline-block pt-1 font-mono text-sm text-primary underline-offset-4 hover:underline"
                    >
                      {channel.label}
                    </a>
                  </div>
                </li>
              ))}
            </ul>

            <div className="space-y-3 rounded-xl border border-border bg-background p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <MapPin
                  className="size-4 text-muted-foreground"
                  aria-hidden="true"
                />
                Campus
              </div>
              <p className="text-sm text-muted-foreground">
                12 Sher-e-Bangla Road, Dhaka 1205, Bangladesh
              </p>
              <div className="flex items-center gap-2 pt-1 text-sm text-muted-foreground">
                <Clock className="size-4" aria-hidden="true" />
                Sunday to Thursday, 9:00 - 17:00
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-background p-6 sm:p-8">
            <div className="mb-6 space-y-2">
              <h2 className="font-display text-2xl font-semibold tracking-tight">
                Send us a message
              </h2>
              <p className="text-sm text-muted-foreground">
                We reply to the email you give us. No account needed.
              </p>
            </div>
            <ContactForm to="admissions@edusphere.edu" />
          </div>
        </div>
      </section>
    </div>
  );
}
