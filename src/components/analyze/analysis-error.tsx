import { AlertCircle, RefreshCw, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface AnalysisErrorProps {
  error: string | null;
}

export function AnalysisError({ error }: AnalysisErrorProps) {
  const router = useRouter();

  return (
    <div className="mx-auto my-32 max-w-xl rounded-2xl border bg-card p-12 text-center shadow-sm">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-xl border border-border bg-muted/80">
        <AlertCircle className="h-8 w-8 text-foreground" />
      </div>
      <h2 className="mb-3 font-black text-3xl text-foreground tracking-tight">
        {error === "LIMIT_REACHED"
          ? "Monthly Limit Reached"
          : "Analysis Paused"}
      </h2>
      <p className="mb-8 font-semibold text-base text-muted-foreground leading-relaxed">
        {error === "LIMIT_REACHED"
          ? "You have reached your limit of 2 free job searches for this month. Upgrade to Pro to get unlimited job searches and unlock all features."
          : error}
      </p>
      {error === "LIMIT_REACHED" ? (
        <Button
          onClick={() => router.push("/billing")}
          variant="default"
          size="lg"
          className="h-14 w-full font-bold text-base"
        >
          <Zap className="mr-2 h-5 w-5 fill-current" /> Upgrade to Pro
        </Button>
      ) : (
        <Button
          onClick={() => router.push("/")}
          variant="default"
          size="lg"
          className="h-14 w-full font-bold text-base"
        >
          <RefreshCw className="mr-2 h-5 w-5" /> Try Again
        </Button>
      )}
    </div>
  );
}
