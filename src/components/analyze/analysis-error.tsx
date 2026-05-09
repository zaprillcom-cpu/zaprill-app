import { AlertCircle, RefreshCw, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface AnalysisErrorProps {
  error: string | null;
}

export function AnalysisError({ error }: AnalysisErrorProps) {
  const router = useRouter();

  return (
    <div className="max-w-xl mx-auto my-32 text-center border p-12 rounded-2xl bg-card shadow-sm">
      <div className="w-16 h-16 rounded-xl bg-muted/80 border border-border flex items-center justify-center mx-auto mb-6">
        <AlertCircle className="h-8 w-8 text-foreground" />
      </div>
      <h2 className="text-3xl font-black mb-3 text-foreground tracking-tight">
        {error === "LIMIT_REACHED"
          ? "Monthly Limit Reached"
          : "Analysis Paused"}
      </h2>
      <p className="text-base text-muted-foreground mb-8 font-semibold leading-relaxed">
        {error === "LIMIT_REACHED"
          ? "You have reached your limit of 2 free job searches for this month. Upgrade to Pro to get unlimited job searches and unlock all features."
          : error}
      </p>
      {error === "LIMIT_REACHED" ? (
        <Button
          onClick={() => router.push("/billing")}
          variant="default"
          size="lg"
          className="w-full text-base font-bold h-14"
        >
          <Zap className="mr-2 h-5 w-5 fill-current" /> Upgrade to Pro
        </Button>
      ) : (
        <Button
          onClick={() => router.push("/")}
          variant="default"
          size="lg"
          className="w-full text-base font-bold h-14"
        >
          <RefreshCw className="mr-2 h-5 w-5" /> Try Again
        </Button>
      )}
    </div>
  );
}
