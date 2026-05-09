import { Card, CardContent } from "@/components/ui/card";

export function StatCard({
  value,
  label,
}: {
  value: string | number;
  label: string;
}) {
  return (
    <Card className="text-center shadow-sm border-border bg-card">
      <CardContent className="pt-8 pb-6">
        <div className="text-5xl font-black tracking-tighter text-foreground mb-2">
          {value}
        </div>
        <div className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
          {label}
        </div>
      </CardContent>
    </Card>
  );
}
