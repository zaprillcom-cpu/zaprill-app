"use client";

import { ArrowLeft, Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await authClient.emailOtp.sendVerificationOtp({
      email,
      type: "forget-password",
    });

    if (error) {
      setError(error.message || "Failed to send OTP code");
      setLoading(false);
    } else {
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background p-4">
      <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02]" />

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center">
        <Link
          href="/sign-in"
          className="group mb-8 flex items-center gap-2 font-medium text-muted-foreground text-sm hover:text-foreground"
        >
          <ArrowLeft className="group-hover:-translate-x-1 h-4 w-4 transition-transform" />
          Back to login
        </Link>

        <Card className="w-full border-border shadow-lg">
          <CardHeader className="pb-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="font-black text-2xl tracking-tight">
              Forgot password?
            </CardTitle>
            <CardDescription className="mt-1 font-medium text-sm">
              No worries, we'll send you reset instructions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 font-medium text-destructive text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="font-bold text-muted-foreground text-xs uppercase tracking-wider"
                >
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                  className="h-11 bg-background font-medium"
                />
              </div>
              <Button
                type="submit"
                className="h-11 w-full font-bold"
                disabled={loading || !email}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Reset password"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col border-border border-t bg-muted/20 pt-6 pb-6">
            <p className="text-center font-medium text-muted-foreground text-sm">
              Remember your password?{" "}
              <Link
                href="/sign-in"
                className="font-bold text-foreground hover:underline"
              >
                Log in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
