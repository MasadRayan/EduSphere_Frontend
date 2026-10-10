import type { Metadata } from "next";
import { Inbox, Plus, Search } from "lucide-react";
import { AvatarWithFallback } from "@/components/shared/avatar-with-fallback";
import { CourseCodeTag } from "@/components/shared/course-code-tag";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ReactNode } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const metadata = {
  title: "UI gallery",
  robots: { index: false, follow: false },
} satisfies Metadata;

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export default function UiGalleryPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-10 px-4 py-10">
      <div className="space-y-1">
        <h1 className="font-display text-2xl font-semibold">UI gallery</h1>
        <p className="text-sm text-muted-foreground">
          Every shared building block in one place. Toggle the theme from the
          header to check light and dark.
        </p>
      </div>

      <Section title="Buttons">
        <div className="flex flex-wrap items-center gap-2">
          <Button>Primary action</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
          <Button disabled>Disabled</Button>
        </div>
      </Section>

      <Section title="Status language">
        <div className="flex flex-wrap items-center gap-2">
          {[
            "PENDING",
            "APPROVED",
            "ENROLLED",
            "SUCCEEDED",
            "REJECTED",
            "BLOCKED",
            "FAILED",
            "CANCELLED",
            "COMPLETED",
            "PAID",
            "REFUNDED",
          ].map((status) => (
            <StatusBadge key={status} status={status} />
          ))}
          <Badge variant="outline">Neutral</Badge>
        </div>
      </Section>

      <Section title="Course code signature">
        <div className="flex flex-wrap gap-6">
          <CourseCodeTag code="CSE-101" credits={3} />
          <CourseCodeTag code="MAT-201" credits={4} />
          <CourseCodeTag code="ENG-105" credits={2} />
        </div>
      </Section>

      <Section title="Cards and stats">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle>Card title</CardTitle>
              <CardDescription>A short supporting line.</CardDescription>
            </CardHeader>
            <CardContent>Card body content.</CardContent>
          </Card>
          <Card className="sm:col-span-1">
            <CardContent className="space-y-3 pt-6">
              <Progress value={64} />
              <p className="text-sm text-muted-foreground">64% complete</p>
            </CardContent>
          </Card>
          <div className="sm:col-span-2 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">CGPA</p>
              <p className="font-mono text-2xl font-semibold">3.72</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">Credits</p>
              <p className="font-mono text-2xl font-semibold">96</p>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Forms">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="gallery-email">Email</Label>
              <Input id="gallery-email" placeholder="you@example.com" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="gallery-note">Note</Label>
              <Textarea id="gallery-note" placeholder="Add a note" />
            </div>
            <div className="space-y-1.5">
              <Label>Semester</Label>
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fall-2026">Fall 2026</SelectItem>
                  <SelectItem value="spring-2027">Spring 2027</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Checkbox id="gallery-terms" />
              <Label htmlFor="gallery-terms">I agree to the terms</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="gallery-active" />
              <Label htmlFor="gallery-active">Active semester</Label>
            </div>
            <RadioGroup defaultValue="full" className="gap-2">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="full" id="gallery-full" />
                <Label htmlFor="gallery-full">Full time</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="part" id="gallery-part" />
                <Label htmlFor="gallery-part">Part time</Label>
              </div>
            </RadioGroup>
            <div className="space-y-1.5">
              <Label>One-time code</Label>
              <InputOTP maxLength={6}>
                <InputOTPGroup>
                  {Array.from({ length: 6 }).map((_, index) => (
                    <InputOTPSlot key={index} index={index} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Feedback">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <div className="rounded-lg border border-success/40 bg-success/10 p-3 text-sm text-foreground">
              Approved. The application was accepted.
            </div>
            <div className="rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm text-foreground">
              Pending review.
            </div>
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-foreground">
              Payment failed. Try again.
            </div>
          </div>
          <div className="space-y-3">
            <Alert>
              <AlertTitle>Heads up</AlertTitle>
              <AlertDescription>
                Enrollment closes on the registration deadline.
              </AlertDescription>
            </Alert>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
          </div>
        </div>
      </Section>

      <Section title="Overlays">
        <div className="flex flex-wrap items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">Hover me</Button>
            </TooltipTrigger>
            <TooltipContent>Tooltip content</TooltipContent>
          </Tooltip>
          <div>
            <Button
              variant="outline"
              onClick={undefined}
              render={undefined}
              type="button"
            >
              Trigger
            </Button>
          </div>
        </div>
      </Section>

      <Section title="Avatars and separators">
        <div className="flex items-center gap-4">
          <div className="rounded-full border border-border">
            <span className="flex size-10 items-center justify-center rounded-full bg-muted text-sm text-muted-foreground">
              AR
            </span>
          </div>
          <Separator orientation="vertical" className="h-8" />
          <p className="text-sm text-muted-foreground">
            Avatars fall back to initials when there is no image.
          </p>
        </div>
      </Section>
    </div>
  );
}
