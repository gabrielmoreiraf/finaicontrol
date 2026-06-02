"use client";

import { Bot, Sparkles, User } from "lucide-react";
import AnimatedContent from "@/components/AnimatedContent";
import { Badge } from "@/components/ui/badge";
import { ThemedSpotlightCard } from "@/components/react-bits/themed-spotlight-card";
import { SectionHeader, SectionWrapper } from "@/components/landing/section-wrapper";
import { aiChatDemo, aiQuestions } from "@/lib/landing-data";

export function AiSection() {
  return (
    <SectionWrapper id="ia-financeira" variant="muted">
      <div className="grid items-start gap-12 lg:grid-cols-2">
        <AnimatedContent distance={35}>
          <SectionHeader
            align="left"
            eyebrow="Assistente com IA"
            title="Uma IA que entende seus números."
            subtitle="Pergunte em linguagem natural. A IA responde com base nos seus dados reais e nunca inventa valores."
          />

          <div className="mt-8 flex flex-wrap gap-2">
            {aiQuestions.map((question) => (
              <Badge
                key={question}
                variant="outline"
                className="cursor-default border-border/60 bg-card/60 px-3 py-1.5 text-sm font-normal backdrop-blur-sm hover:bg-brand/5"
              >
                {question}
              </Badge>
            ))}
          </div>

          <ThemedSpotlightCard
            className="mt-8"
            spotlightColor="rgba(139, 92, 246, 0.15)"
            padding="sm"
          >
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">Princípio fundamental:</span>{" "}
                a IA analisa somente os dados que você cadastrou. Se faltar
                informação, ela avisa. Nunca preenche lacunas com números fictícios.
              </p>
            </div>
          </ThemedSpotlightCard>
        </AnimatedContent>

        <AnimatedContent distance={40} delay={0.12}>
          <ThemedSpotlightCard
            className="!p-0 overflow-hidden"
            spotlightColor="rgba(16, 185, 129, 0.2)"
            padding="sm"
          >
            <div className="flex items-center gap-3 border-b border-border/40 px-4 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand to-violet-600 text-brand-foreground">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">Assistente FinIA</p>
                <p className="text-xs text-muted-foreground">Online · baseado nos seus dados</p>
              </div>
            </div>
            <div className="space-y-4 p-4">
              {aiChatDemo.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      message.role === "user"
                        ? "bg-muted text-muted-foreground"
                        : "bg-gradient-to-br from-brand to-violet-600 text-white"
                    }`}
                  >
                    {message.role === "user" ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      message.role === "user"
                        ? "bg-gradient-to-br from-brand to-emerald-700 text-white"
                        : "border border-border/40 bg-muted/60 text-foreground backdrop-blur-sm"
                    }`}
                  >
                    {message.message}
                  </div>
                </div>
              ))}
            </div>
          </ThemedSpotlightCard>
        </AnimatedContent>
      </div>
    </SectionWrapper>
  );
}
