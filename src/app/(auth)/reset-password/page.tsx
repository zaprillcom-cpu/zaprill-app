"use client";

import { ArrowRight, KeyRound, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { authClient } from "@/lib/auth-client";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      setLoading(false);
      return;
    }

    if (!email) {
      setError("Email is missing. Please restart the password reset process.");
      setLoading(false);
      return;
    }

    if (!otp) {
      setError("Please enter the verification code.");
      setLoading(false);
      return;
    }

    const { error } = await authClient.emailOtp.resetPassword({
      email,
      otp,
      password: password,
    });

    if (error) {
      setError(
        error.message ||
          "Failed to reset password. The link might be invalid or expired.",
      );
    } else {
      setSuccess(true);
      // Optional: redirect to sign-in after a few seconds
      setTimeout(() => {
        router.push("/sign-in");
      }, 3000);
    }

    setLoading(false);
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background p-4">
      <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02]" />

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center">
        <Link href="/" className="group mb-8 flex items-center gap-2">
          <span className="font-bold text-2xl tracking-tight">Zaprill</span>
        </Link>

        <Card className="w-full border-border shadow-lg">
          <CardHeader className="pb-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <KeyRound className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="font-black text-2xl tracking-tight">
              Reset password
            </CardTitle>
            <CardDescription className="mt-1 font-medium text-sm">
              Enter your new password below.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 font-medium text-destructive text-sm">
                {error}
              </div>
            )}

            {success ? (
              <div className="rounded-md border border-green-200 bg-green-50 p-4 text-center font-medium text-green-600 text-sm dark:border-green-900 dark:bg-green-950/30">
                Your password has been reset successfully! Redirecting to
                login...
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="otp"
                    className="font-bold text-muted-foreground text-xs uppercase tracking-wider"
                  >
                    Verification Code
                  </label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    disabled={loading}
                    required
                    className="h-11 bg-background font-medium tracking-widest"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="font-bold text-muted-foreground text-xs uppercase tracking-wider"
                  >
                    New Password
                  </label>
                  <PasswordInput
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                    className="h-11 bg-background font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="confirmPassword"
                    className="font-bold text-muted-foreground text-xs uppercase tracking-wider"
                  >
                    Confirm Password
                  </label>
                  <PasswordInput
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    required
                    className="h-11 bg-background font-medium"
                  />
                </div>
                <Button
                  type="submit"
                  className="h-11 w-full font-bold"
                  disabled={loading || !password || !confirmPassword}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Reset Password
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
