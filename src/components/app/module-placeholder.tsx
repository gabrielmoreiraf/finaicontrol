import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ModulePlaceholder({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand">
            <Icon className="h-5 w-5" />
          </div>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{description}</p>
          <p className="mt-4 text-sm text-muted-foreground">
            Em breve. Por enquanto, cadastre suas receitas, despesas, dívidas e metas
            para alimentar seu dashboard.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
