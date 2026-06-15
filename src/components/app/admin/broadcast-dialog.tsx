"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Megaphone } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FormSelect } from "@/components/ui/form-select";
import { Label } from "@/components/ui/label";
import { sendBroadcastAction } from "@/lib/actions/admin";
import { notify } from "@/lib/toast";

const inputClass =
  "h-10 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-brand/40 focus:ring-2 focus:ring-brand/15 dark:border-white/[0.08] dark:bg-card/60";

const SITE = "https://finiacontrol.com.br";

type BroadcastUser = { name: string; email: string };

/** Modelos prontos: ao escolher um, os campos são preenchidos (e podem ser editados). */
type Preset = {
  value: string;
  label: string;
  subject?: string;
  title?: string;
  message?: string;
  highlightLabel?: string;
  highlightValue?: string;
  ctaLabel?: string;
  ctaUrl?: string;
};

const PRESETS: Preset[] = [
  { value: "blank", label: "Começar em branco" },
  {
    value: "30dias",
    label: "🎁 Você ganhou 30 dias grátis",
    subject: "Você ganhou 30 dias grátis no FinIA Control 🎉",
    title: "Você ganhou 30 dias grátis 🎉",
    message:
      "Boas notícias! Liberamos 30 dias de acesso completo ao FinIA Control para você, sem custo nenhum.\nAproveite todos os recursos para organizar suas finanças sem limites.",
    highlightLabel: "Cortesia",
    highlightValue: "30 dias grátis",
    ctaLabel: "Aproveitar agora",
    ctaUrl: `${SITE}/dashboard`,
  },
  {
    value: "novidades",
    label: "🚀 Novidades / atualização",
    subject: "Novidades no FinIA Control",
    title: "Novidades chegaram 🚀",
    message:
      "Acabamos de lançar melhorias no FinIA Control para deixar seu controle financeiro ainda melhor.\nDê uma olhada e confira o que mudou.",
    ctaLabel: "Ver novidades",
    ctaUrl: `${SITE}/dashboard`,
  },
  {
    value: "promo_premium",
    label: "💎 Promoção Premium",
    subject: "Oferta especial: Premium com condições exclusivas",
    title: "Uma oferta especial pra você 💎",
    message:
      "Por tempo limitado, você pode desbloquear o plano Premium IA com condições especiais.\nMais relatórios, inteligência artificial e recursos avançados para cuidar do seu dinheiro.",
    highlightLabel: "Oferta",
    highlightValue: "Premium IA",
    ctaLabel: "Quero o Premium",
    ctaUrl: `${SITE}/escolher-plano`,
  },
  {
    value: "agradecimento",
    label: "💚 Agradecimento",
    subject: "Obrigado por usar o FinIA Control 💚",
    title: "Obrigado por estar com a gente 💚",
    message:
      "Queremos agradecer por você fazer parte do FinIA Control.\nSe tiver qualquer sugestão, é só responder este e-mail — adoramos ouvir você.",
  },
];

const TARGET_OPTIONS = [
  { value: "all", label: "Todos os usuários" },
  { value: "single", label: "Um usuário específico" },
];

export function BroadcastDialog({
  totalUsers,
  users,
}: {
  totalUsers: number;
  users: BroadcastUser[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isSending, startSending] = useTransition();

  const [preset, setPreset] = useState("blank");
  const [target, setTarget] = useState("all");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [highlightLabel, setHighlightLabel] = useState("");
  const [highlightValue, setHighlightValue] = useState("");
  const [ctaLabel, setCtaLabel] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [grantTrial, setGrantTrial] = useState(false);

  const userOptions = users.map((u) => ({
    value: u.email,
    label: u.name ? `${u.name} — ${u.email}` : u.email,
  }));

  function applyPreset(value: string) {
    setPreset(value);
    const p = PRESETS.find((x) => x.value === value);
    if (!p || value === "blank") return;
    setSubject(p.subject ?? "");
    setTitle(p.title ?? "");
    setMessage(p.message ?? "");
    setHighlightLabel(p.highlightLabel ?? "");
    setHighlightValue(p.highlightValue ?? "");
    setCtaLabel(p.ctaLabel ?? "");
    setCtaUrl(p.ctaUrl ?? "");
    // O modelo de 30 dias já liga a concessão do trial (link individual).
    if (value === "30dias") setGrantTrial(true);
  }

  function validate(): string | null {
    if (!subject.trim() || !title.trim() || !message.trim()) {
      return "Preencha assunto, título e mensagem.";
    }
    if (target === "single" && !email.trim()) return "Escolha o usuário destinatário.";
    // Com trial, o link do botão é gerado por usuário — não validamos URL manual.
    if (!grantTrial) {
      if (ctaLabel.trim() && !/^https?:\/\//i.test(ctaUrl.trim())) {
        return "O botão precisa de um link válido (começando com http).";
      }
      if (ctaUrl.trim() && !ctaLabel.trim()) return "Informe também o texto do botão.";
    }
    return null;
  }

  function handleSend() {
    const error = validate();
    if (error) {
      notify.error(error);
      return;
    }
    setConfirmOpen(true);
  }

  function confirmSend() {
    setConfirmOpen(false);
    const formData = new FormData();
    formData.set("target", target);
    formData.set("email", email.trim());
    formData.set("subject", subject.trim());
    formData.set("title", title.trim());
    formData.set("message", message.trim());
    formData.set("highlightLabel", highlightLabel.trim());
    formData.set("highlightValue", highlightValue.trim());
    formData.set("ctaLabel", ctaLabel.trim());
    formData.set("ctaUrl", ctaUrl.trim());
    formData.set("grantTrial", String(grantTrial));

    startSending(async () => {
      const result = await sendBroadcastAction(formData);
      if (result.ok) {
        notify.success(result.message ?? "Comunicado enviado.");
        setOpen(false);
        setPreset("blank");
        setSubject("");
        setTitle("");
        setMessage("");
        setHighlightLabel("");
        setHighlightValue("");
        setCtaLabel("");
        setCtaUrl("");
        setGrantTrial(false);
        setEmail("");
        router.refresh();
      } else {
        notify.error(result.error);
      }
    });
  }

  const recipientDescription =
    target === "single"
      ? `o usuário ${email.trim() || "(nenhum)"}`
      : `TODOS os ${totalUsers} usuário(s)`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" className="gap-2">
          <Megaphone className="size-4" aria-hidden />
          Comunicado
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] gap-4 overflow-y-auto sm:max-w-lg">
        <DialogHeader className="text-left">
          <DialogTitle className="flex items-center gap-2">
            <Megaphone className="size-5 text-brand" aria-hidden />
            Enviar comunicado
          </DialogTitle>
          <DialogDescription>
            Escolha um modelo pronto e edite o que quiser, ou comece em branco.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 rounded-xl border border-border bg-muted/30 p-4 dark:border-white/[0.06]">
          <div className="space-y-1.5">
            <Label htmlFor="bc-preset">Modelo</Label>
            <FormSelect
              id="bc-preset"
              name="preset"
              options={PRESETS.map((p) => ({ value: p.value, label: p.label }))}
              value={preset}
              onValueChange={applyPreset}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bc-target">Destinatários</Label>
            <FormSelect
              id="bc-target"
              name="target"
              options={TARGET_OPTIONS}
              value={target}
              onValueChange={setTarget}
            />
          </div>

          {target === "single" && (
            <div className="space-y-1.5">
              <Label htmlFor="bc-user">Usuário</Label>
              <FormSelect
                id="bc-user"
                name="email"
                options={userOptions}
                value={email}
                onValueChange={setEmail}
                placeholder="Selecione um usuário cadastrado..."
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="bc-subject">Assunto (linha do e-mail)</Label>
            <input
              id="bc-subject"
              type="text"
              maxLength={150}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Ex.: Novidades no FinIA Control"
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bc-title">Título (dentro do e-mail)</Label>
            <input
              id="bc-title"
              type="text"
              maxLength={150}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex.: Você ganhou 30 dias grátis 🎉"
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bc-message">Mensagem</Label>
            <textarea
              id="bc-message"
              rows={5}
              maxLength={4000}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escreva o comunicado. Uma linha em branco separa parágrafos."
              className={`${inputClass} h-auto resize-y py-2 leading-relaxed`}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label htmlFor="bc-hl-label">Destaque — rótulo (opcional)</Label>
              <input
                id="bc-hl-label"
                type="text"
                maxLength={60}
                value={highlightLabel}
                onChange={(e) => setHighlightLabel(e.target.value)}
                placeholder="Ex.: Cortesia"
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bc-hl-value">Destaque — valor (opcional)</Label>
              <input
                id="bc-hl-value"
                type="text"
                maxLength={60}
                value={highlightValue}
                onChange={(e) => setHighlightValue(e.target.value)}
                placeholder="Ex.: 30 dias grátis"
                className={inputClass}
              />
            </div>
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 dark:border-white/[0.06]">
            <Checkbox
              checked={grantTrial}
              onCheckedChange={(checked) => setGrantTrial(checked === true)}
              className="mt-0.5"
            />
            <span className="text-sm">
              <span className="font-medium">Conceder 30 dias de acesso completo</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                O botão vira um link de resgate <strong>exclusivo por usuário</strong> — só
                funciona para o e-mail de cada um, não dá pra compartilhar.
              </span>
            </span>
          </label>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label htmlFor="bc-cta-label">Botão — texto (opcional)</Label>
              <input
                id="bc-cta-label"
                type="text"
                maxLength={40}
                value={ctaLabel}
                onChange={(e) => setCtaLabel(e.target.value)}
                placeholder={grantTrial ? "Ativar meus 30 dias grátis" : "Ex.: Acessar agora"}
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bc-cta-url">Botão — link (opcional)</Label>
              <input
                id="bc-cta-url"
                type="url"
                maxLength={500}
                value={grantTrial ? "" : ctaUrl}
                onChange={(e) => setCtaUrl(e.target.value)}
                disabled={grantTrial}
                placeholder={grantTrial ? "Gerado por usuário" : "https://..."}
                className={`${inputClass} disabled:cursor-not-allowed disabled:opacity-50`}
              />
            </div>
          </div>

          <Button
            type="button"
            onClick={handleSend}
            disabled={isSending}
            className="btn-brand w-full"
          >
            {isSending ? "Enviando..." : "Enviar comunicado"}
          </Button>
        </div>
      </DialogContent>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar envio</AlertDialogTitle>
            <AlertDialogDescription>
              Este comunicado será enviado por e-mail para {recipientDescription}.
              {grantTrial && " Cada um receberá um link exclusivo de 30 dias de acesso completo."}{" "}
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="btn-brand" onClick={confirmSend}>
              Enviar agora
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
