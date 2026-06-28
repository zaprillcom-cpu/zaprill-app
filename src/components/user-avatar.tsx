"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export interface UserAvatarProps {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  isPro?: boolean;
}

function getInitials(name?: string | null, email?: string | null): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  if (email) return email[0].toUpperCase();
  return "?";
}

export function UserAvatar({ name, email, image, isPro }: UserAvatarProps) {
  const [pro, setPro] = useState(isPro ?? false);

  useEffect(() => {
    if (isPro !== undefined) {
      setPro(isPro);
      return;
    }

    fetch("/api/billing/subscription")
      .then((res) => res.json())
      .then((data) => {
        setPro(!!(data.isPro ?? data.subscription));
      })
      .catch(() => setPro(false));
  }, [isPro]);

  return (
    <div className="relative">
      <div
        className={cn(
          "rounded-full",
          pro && "ring-2 ring-primary ring-offset-1 ring-offset-background",
        )}
      >
        <Avatar size="default" className="cursor-pointer">
          {image && <AvatarImage src={image} alt={name ?? "User avatar"} />}
          <AvatarFallback className="font-bold text-xs tracking-wide">
            {getInitials(name, email)}
          </AvatarFallback>
        </Avatar>
      </div>
      <div
        className={`absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 rounded border px-0.5 py-px font-semibold text-[8px] uppercase leading-none tracking-tight shadow-sm ${
          pro
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-muted text-muted-foreground"
        }`}
      >
        {pro ? "PRO" : "FREE"}
      </div>
    </div>
  );
}
