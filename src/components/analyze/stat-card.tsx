import { Card, CardContent } from "@/components/ui/card";

export function StatCard({
  value,
  label,
}: {
  value: string | number;
  label: string;
}) {
  return (
    <Card className="border-border bg-card text-center shadow-sm">
      <CardContent className="pt-8 pb-6">
        <div className="mb-2 font-black text-5xl text-foreground tracking-tighter">
          {value}
        </div>
        <div className="font-bold text-muted-foreground text-sm uppercase tracking-widest">
          {label}
        </div>
      </CardContent>
    </Card>
  );
}
