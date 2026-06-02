import { Button } from "@/components/ui/button";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { completeOnboardingAction } from "@/lib/actions/onboarding";

export function OnboardingWizard() {
  return (
    <form action={completeOnboardingAction} className="mx-auto w-full max-w-lg">
      <h2 className="text-2xl font-bold">Vamos começar</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Só o essencial para montar seu painel. O restante (receitas, despesas,
        dívidas e metas) você cadastra direto no sistema quando quiser.
      </p>

      <div className="mt-8 space-y-2">
        <Label htmlFor="profession">Profissão (opcional)</Label>
        <Input id="profession" name="profession" placeholder="Ex: Designer, Médico..." />
      </div>

      <div className="mt-6 space-y-2">
        <Label htmlFor="fixedMonthlyIncome">Renda fixa mensal (opcional)</Label>
        <CurrencyInput
          id="fixedMonthlyIncome"
          name="fixedMonthlyIncome"
          placeholder="R$ 0,00"
        />
        <p className="text-xs text-muted-foreground">
          Ajuda a montar uma visão inicial do seu saldo. Você pode editar depois.
        </p>
      </div>

      <Button type="submit" className="btn-brand mt-10 w-full" size="lg">
        Ir para o dashboard
      </Button>
    </form>
  );
}
