import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ShopLayout } from "@/components/shop/ShopLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { formatKz } from "@/lib/shop-config";

export const Route = createFileRoute("/perfil")({
  head: () => ({
    meta: [
      { title: "A minha conta — Ludy Tech Shop" },
      {
        name: "description",
        content: "Gere os teus dados pessoais e acompanha o estado das tuas encomendas.",
      },
      { property: "og:title", content: "A minha conta — Ludy Tech Shop" },
      { property: "og:description", content: "Dados pessoais e histórico de encomendas." },
    ],
  }),
  component: Perfil,
});

const estadoCor: Record<string, string> = {
  Pendente: "bg-warning text-warning-foreground",
  Confirmado: "bg-primary text-primary-foreground",
  "Em entrega": "bg-primary/70 text-primary-foreground",
  Entregue: "bg-emerald-600 text-white",
  Cancelado: "bg-destructive text-destructive-foreground",
};

function Perfil() {
  const { t } = useI18n();
  const { user, loading } = useAuth();
  const qc = useQueryClient();

  const { data: perfil } = useQuery({
    queryKey: ["perfil", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      return data;
    },
  });

  const { data: pedidos } = useQuery({
    queryKey: ["meus-pedidos", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("pedidos")
        .select("*, pedido_itens(*)")
        .order("criado_em", { ascending: false });
      return data ?? [];
    },
  });

  const guardar = useMutation({
    mutationFn: async (fd: FormData) => {
      const { error } = await supabase
        .from("profiles")
        .update({
          nome_completo: String(fd.get("nome_completo") ?? ""),
          username: String(fd.get("username") ?? "") || null,
          telefone: String(fd.get("telefone") ?? "") || null,
          morada: String(fd.get("morada") ?? "") || null,
          genero: String(fd.get("genero") ?? "") || null,
          idade: Number(fd.get("idade")) || null,
        })
        .eq("id", user!.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Dados guardados.");
      qc.invalidateQueries({ queryKey: ["perfil"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro"),
  });

  if (!user && !loading) {
    return (
      <ShopLayout>
        <div className="mx-auto max-w-md px-4 py-24 text-center">
          <p className="text-sm text-muted-foreground">{t("need_login")}</p>
          <Button asChild className="mt-4">
            <Link to="/auth">{t("login")}</Link>
          </Button>
        </div>
      </ShopLayout>
    );
  }

  return (
    <ShopLayout>
      <div className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="font-display text-2xl font-black">{t("account")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{user?.email}</p>

        <Tabs defaultValue="dados" className="mt-8">
          <TabsList>
            <TabsTrigger value="dados">{t("profile")}</TabsTrigger>
            <TabsTrigger value="pedidos">{t("my_orders")}</TabsTrigger>
          </TabsList>

          <TabsContent value="dados" className="mt-6">
            <form
              className="grid gap-4 rounded-2xl border p-6 sm:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                guardar.mutate(new FormData(e.currentTarget));
              }}
            >
              <div className="sm:col-span-2">
                <Label htmlFor="nome_completo">{t("full_name")}</Label>
                <Input
                  id="nome_completo"
                  name="nome_completo"
                  defaultValue={perfil?.nome_completo ?? ""}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="username">{t("username")}</Label>
                <Input id="username" name="username" defaultValue={perfil?.username ?? ""} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="telefone">{t("phone")}</Label>
                <Input id="telefone" name="telefone" defaultValue={perfil?.telefone ?? ""} className="mt-1.5" />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="morada">{t("address")}</Label>
                <Input id="morada" name="morada" defaultValue={perfil?.morada ?? ""} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="genero">{t("gender")}</Label>
                <Input id="genero" name="genero" defaultValue={perfil?.genero ?? ""} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="idade">{t("age")}</Label>
                <Input
                  id="idade"
                  name="idade"
                  type="number"
                  defaultValue={perfil?.idade ?? ""}
                  className="mt-1.5"
                />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" disabled={guardar.isPending} className="font-semibold">
                  {t("save")}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="pedidos" className="mt-6 space-y-4">
            {(pedidos ?? []).length === 0 && (
              <p className="rounded-2xl border border-dashed p-12 text-center text-sm text-muted-foreground">
                {t("no_orders")}
              </p>
            )}
            {(pedidos ?? []).map((p) => (
              <article key={p.id} className="rounded-2xl border p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-display font-bold">
                    {t("order")} #{p.numero}
                  </span>
                  <Badge className={estadoCor[p.estado] ?? ""}>{p.estado}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(p.criado_em).toLocaleString("pt-PT")}
                  </span>
                  <span className="ml-auto font-display font-bold text-primary">
                    {formatKz(Number(p.total))}
                  </span>
                </div>
                <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                  {(p.pedido_itens ?? []).map((i) => (
                    <li key={i.id}>
                      {i.quantidade}× {i.nome} — {formatKz(Number(i.preco) * i.quantidade)}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-muted-foreground">
                  {p.metodo_pag} · {p.tipo_entrega === "entrega" ? t("delivery") : t("pickup")}
                </p>
              </article>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </ShopLayout>
  );
}
