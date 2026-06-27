import { CalendarClock } from "lucide-react";

interface RenewalReminderProps {
  expiresAt: Date;
  daysLeft: number;
}

export function RenewalReminder({ expiresAt, daysLeft }: RenewalReminderProps) {
  const expiryLabel = expiresAt.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const timingLabel =
    daysLeft <= 0
      ? "expires today"
      : daysLeft === 1
        ? "expires tomorrow"
        : `expires in ${daysLeft} days`;

  return (
    <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
      <div className="flex gap-3">
        <CalendarClock className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        <div>
          <p className="font-medium text-sm">
            Your plan {timingLabel} ({expiryLabel})
          </p>
          <p className="mt-1 text-muted-foreground text-sm">
            Renew before {expiryLabel} to keep uninterrupted access to pro
            features. Plans are prepaid — you won&apos;t be charged
            automatically.
          </p>
        </div>
      </div>
    </div>
  );
}
