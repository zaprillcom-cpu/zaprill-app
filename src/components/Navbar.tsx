"use client";

import { ArrowLeft, Gift } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type React from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/user-avatar";
import { signOut } from "@/lib/auth-client";

// ── helpers ────────────────────────────────────────────────────────────────

export interface NavUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  isPro?: boolean;
}

export interface NavbarProps {
  /** Page-specific left slot: icon + title, shown to the right of the back button */
  pageTitle?: React.ReactNode;
  /** Extra badge/pill rendered in the centre area (e.g. the "Complete" badge) */
  centreBadge?: React.ReactNode;
  /** Whether to show the back-button (defaults to true) */
  showBack?: boolean;
  /** Override the back destination (defaults to "/") */
  backHref?: string;
  /** Label for the back button (defaults to "Back") */
  backLabel?: string;
  /** Whether the nav is sticky (true) or fixed (false). Default: sticky */
  sticky?: boolean;
  /** Authenticated user — if omitted the nav shows a Sign In button */
  user?: NavUser | null;
  /**
   * Pass `true` while the session is being fetched client-side.
   * The nav will render an inert skeleton instead of Sign In / avatar so
   * users can't accidentally trigger the proxy redirect loop during loading.
   */
  sessionLoading?: boolean;
}

export default function Navbar({
  pageTitle,
  centreBadge,
  showBack = false,
  backHref = "/",
  backLabel = "Back",
  sticky = true,
  user,
  sessionLoading = false,
}: NavbarProps) {
  const router = useRouter();
  const positionClass = sticky ? "sticky top-0" : "fixed top-0 left-0 right-0";

  return (
    <nav
      className={`${positionClass} z-50 border-border border-b bg-background/95 px-6 backdrop-blur-xl`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4">
        {/* ── Logo (always visible when no back button) / Back button ── */}
        {showBack ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(backHref)}
            className="shrink-0 font-bold text-sm"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {backLabel}
          </Button>
        ) : (
          <Link href="/" className="group flex shrink-0 items-center gap-2.5">
            <span className="hidden sm:block">
              <Image
                src={"/logo.png"}
                alt={"Zaprill"}
                width={100}
                height={100}
                loading="eager"
              />
            </span>
          </Link>
        )}

        {/* ── Page title slot ── */}
        {pageTitle && (
          <div className="flex min-w-0 flex-1 items-center gap-3 border-border border-l pl-4">
            {pageTitle}
          </div>
        )}

        {/* push everything else right when no pageTitle */}
        {!pageTitle && <div className="flex-1" />}

        {/* ── Centre badge (optional) ── */}
        {centreBadge && (
          <div className="hidden items-center sm:flex">{centreBadge}</div>
        )}

        {/* ── Right-side actions ── */}
        <div className="flex shrink-0 items-center gap-3">
          {sessionLoading ? (
            // Skeleton placeholder — prevents Sign In being clicked before session resolves
            <div
              className="h-9 w-20 animate-pulse rounded-md bg-muted"
              aria-hidden
            />
          ) : user ? (
            <>
              <Link href="/resumes/primary">
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden font-bold text-xs sm:inline-flex"
                >
                  Resume Architect
                </Button>
              </Link>

              <Link href="/history">
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden font-bold text-xs sm:inline-flex"
                >
                  Insights
                </Button>
              </Link>

              <Link href="/jobs">
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden font-bold text-xs sm:inline-flex"
                >
                  My Jobs
                </Button>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger
                  className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  aria-label="User menu"
                >
                  <UserAvatar
                    name={user.name}
                    email={user.email}
                    image={user.image}
                    isPro={user.isPro}
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="mb-1 border-border border-b px-3 py-2">
                    {user.name && (
                      <p className="truncate font-bold text-sm">{user.name}</p>
                    )}
                    {user.email && (
                      <p className="truncate text-muted-foreground text-xs">
                        {user.email}
                      </p>
                    )}
                  </div>
                  <DropdownMenuItem
                    onClick={() => router.push("/resumes/primary")}
                    className="cursor-pointer font-semibold"
                  >
                    Resume Architect
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push("/profile")}
                    className="cursor-pointer font-semibold"
                  >
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push("/billing")}
                    className="cursor-pointer font-semibold"
                  >
                    Billing
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push("/referrals")}
                    className="cursor-pointer font-semibold text-emerald-600 focus:text-emerald-600 dark:text-emerald-400 dark:focus:text-emerald-400"
                  >
                    <Gift size={14} className="mr-2 shrink-0" />
                    Refer &amp; Earn
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push("/history")}
                    className="cursor-pointer font-semibold"
                  >
                    Insights
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push("/jobs")}
                    className="cursor-pointer font-semibold"
                  >
                    My Jobs
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      signOut({
                        fetchOptions: { onSuccess: () => router.push("/") },
                      })
                    }
                    className="cursor-pointer font-semibold text-destructive focus:text-destructive"
                  >
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link href="/sign-in">
              <Button variant="default" size="sm" className="h-9 font-bold">
                Sign In
              </Button>
            </Link>
          )}

          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
