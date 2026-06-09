"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Plus,
  Target,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResourceItemEditForm } from "@/components/app/resource-item-edit-form";
import { ResourceItemCard } from "@/components/app/resource-item-card";
import {
  ResourceFormFields,
  type ResourceField,
  type ResourceFieldOption,
  type ResourceItem,
} from "@/components/app/resource-fields";
import type { ActionResult } from "@/lib/actions/result";
import { notify } from "@/lib/toast";
import { cn } from "@/lib/utils";

export type { ResourceField, ResourceFieldOption, ResourceItem };

export type ResourceIconName = "receitas" | "despesas" | "dividas" | "metas";

const RESOURCE_ICONS: Record<ResourceIconName, LucideIcon> = {
  receitas: TrendingUp,
  despesas: CreditCard,
  dividas: Wallet,
  metas: Target,
};

interface ResourceManagerProps {
  title: string;
  description: string;
  icon: ResourceIconName;
  fields: ResourceField[];
  items: ResourceItem[];
  emptyLabel: string;
  createAction: (formData: FormData) => Promise<ActionResult>;
  updateAction: (formData: FormData) => Promise<ActionResult>;
  deleteAction: (formData: FormData) => Promise<ActionResult>;
  embedded?: boolean;
  createLabel?: string;
}

function applyActionResult(result: ActionResult) {
  if (result.ok) {
    notify.success(result.message ?? "Operação concluída.");
    return;
  }
  notify.error(result.error);
}

export function ResourceManager({
  title,
  description,
  icon: iconName,
  fields,
  items,
  emptyLabel,
  createAction,
  updateAction,
  deleteAction,
  embedded = false,
  createLabel = "Adicionar",
}: ResourceManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [createFormKey, setCreateFormKey] = useState(0);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const Icon = RESOURCE_ICONS[iconName];

  function runAction(
    action: (formData: FormData) => Promise<ActionResult>,
    formData: FormData,
    onSuccess?: () => void,
  ) {
    startTransition(async () => {
      const result = await action(formData);
      applyActionResult(result);
      if (result.ok) {
        onSuccess?.();
        router.refresh();
      }
    });
  }

  const formGridClass = cn(
    "grid gap-4 sm:grid-cols-2",
    fields.length >= 3 && "lg:grid-cols-3",
    fields.length >= 4 && "xl:grid-cols-4",
    fields.length >= 5 && "2xl:grid-cols-5",
  );

  return (
    <div className={cn("w-full", embedded ? "space-y-6" : "space-y-6 xl:space-y-8")}>
      {!embedded && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand xl:h-14 xl:w-14">
            <Icon className="h-6 w-6 xl:h-7 xl:w-7" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight xl:text-4xl">{title}</h1>
            <p className="mt-1 text-base text-muted-foreground xl:text-lg">{description}</p>
          </div>
        </div>
      )}

      <Card className="border-border/50 bg-card/70 backdrop-blur-sm">
        {!embedded && (
          <CardHeader className="pb-4">
            <CardTitle className="text-lg xl:text-xl">Adicionar</CardTitle>
          </CardHeader>
        )}
        <CardContent className={embedded ? "pt-6" : "pt-0"}>
          <form
            key={createFormKey}
            onSubmit={(event) => {
              event.preventDefault();
              runAction(createAction, new FormData(event.currentTarget), () =>
                setCreateFormKey((key) => key + 1),
              );
            }}
            className={formGridClass}
          >
            <ResourceFormFields fields={fields} />
            <div className="flex items-end sm:col-span-2 lg:col-span-1">
              <Button
                type="submit"
                size="lg"
                disabled={isPending}
                className="btn-brand w-full sm:w-auto sm:min-w-[11rem]"
              >
                <Plus className="h-4 w-4" />
                {isPending ? "Salvando..." : createLabel}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card/70 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg xl:text-xl">Cadastrados ({items.length})</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {items.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">{emptyLabel}</p>
          ) : (
            <ul className="space-y-3">
              {items.map((item) => (
                <li
                  key={item.id}
                  className={cn(
                    editingId && editingId !== item.id && "pointer-events-none opacity-35",
                  )}
                >
                  {editingId === item.id ? (
                    <ResourceItemEditForm
                      fields={fields}
                      item={item}
                      isPending={isPending}
                      onCancel={() => setEditingId(null)}
                      onSubmit={(formData) => {
                        runAction(updateAction, formData);
                        setEditingId(null);
                      }}
                    />
                  ) : (
                    <ResourceItemCard
                      fields={fields}
                      item={item}
                      isPending={isPending}
                      onEdit={() => setEditingId(item.id)}
                      onDelete={(formData) => runAction(deleteAction, formData)}
                    />
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
