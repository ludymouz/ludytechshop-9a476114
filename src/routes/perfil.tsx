import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import { toast } from "sonner";

import { ShopLayout } from "@/components/shop/ShopLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { formatKz, orderStateLabel } from "@/lib/shop-config";

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

const PASSOS = ["Pendente", "Confirmado", "Em entrega", "Entregue"] as const;

function Progresso({ estado, lang }: { estado: string; lang: "pt" | "en" }) {
  if (estado === "Cancelado") return null;
  const idx = PASSOS.indexOf(estado as (typeof PASSOS)[number]);
  return (
    <ol className="mt-4 grid gap-2 sm:grid-cols-4">
      {PASSOS.map((p, i) => (
        <li
          key={p}
          className={`rounded-xl border px-3 py-2 text-[11px] font-semibold ${
            i <= idx ? "border-primary bg-primary/10 text-foreground" : "text-muted-foreground"
          }`}
        >
          {i + 1}. {orderStateLabel(p, lang)}
        </li>
      ))}
    </ol>
  );
}

function Perfil() {
  const { t, lang } = useI18n();
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
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
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
      const telefone = String(fd.get("telefone") ?? "").trim();
      if (telefone && !/^9\d{8}$/.test(telefone)) {
        throw new Error(t("invalid_phone"));
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          nome_completo: String(fd.get("nome_completo") ?? ""),
          username: String(fd.get("username") ?? "") || null,
          telefone: telefone || null,
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

  const [novaPass, setNovaPass] = React.useState("");
  const [confirmPass, setConfirmPass] = React.useState("");
  const [aGuardarPass, setAGuardarPass] = React.useState(false);

  async function mudarPalavraPasse(e: React.FormEvent) {
    e.preventDefault();
    if (novaPass.length < 6) {
      toast.error(
        lang === "pt"
          ? "A palavra-passe deve ter pelo menos 6 caracteres."
          : "Password must be at least 6 characters.",
      );
      return;
    }
    if (novaPass !== confirmPass) {
      toast.error(lang === "pt" ? "As palavras-passe não coincidem." : "Passwords do not match.");
      return;
    }
    setAGuardarPass(true);
    const { error } = await supabase.auth.updateUser({ password: novaPass });
    setAGuardarPass(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setNovaPass("");
    setConfirmPass("");
    toast.success(lang === "pt" ? "Palavra-passe actualizada." : "Password updated.");
  }

  if (!user && !loading) {
    return (
      <ShopLayout>
        <div className="mx-auto max-w-md px-4 py-24 text-center">
          <p className="text-sm text-muted-foreground">{t("need_login")}</p>
          <Button asChild className="mt-4">
            <Link to="/auth" search={{ redirect: "/perfil" }}>
              {t("login")}
            </Link>
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
          <TabsList className="flex-wrap">
            <TabsTrigger value="dados">
              {lang === "pt" ? "Dados e Configurações" : "Details & Settings"}
            </TabsTrigger>
            <TabsTrigger value="pedidos">
              {lang === "pt" ? "Meus Pedidos e Requisições" : "My Orders & Requests"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dados" className="mt-6 space-y-6">
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
                <div className="relative mt-1.5">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">+244</span>
                  <Input
                    id="telefone"
                    name="telefone"
                    defaultValue={perfil?.telefone ?? ""}
                    className="pl-12"
                    placeholder="9xx xxx xxx"
                    inputMode="numeric"
                    maxLength={9}
                    pattern="9[0-9]{8}"
                    onInput={(e) => {
                      e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "").slice(0, 9);
                    }}
                  />
                </div>
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="morada">
                  {lang === "pt" ? "Morada de entrega predefinida" : "Default delivery address"}
                </Label>
                <Input id="morada" name="morada" defaultValue={perfil?.morada ?? ""} className="mt-1.5" />
              </div>
              <div className="space-y-2">
                <Label>{t("gender")}</Label>
                <RadioGroup name="genero" defaultValue={perfil?.genero || "other"} className="mt-1.5 flex flex-col gap-2">
                  {[
                    { value: "male", label: t("male") },
                    { value: "female", label: t("female") },
                    { value: "other", label: t("other_gender") },
                  ].map((g) => (
                    <div key={g.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={g.value} id={`perfil-${g.value}`} />
                      <Label htmlFor={`perfil-${g.value}`} className="cursor-pointer font-normal">
                        {g.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
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

            <form onSubmit={mudarPalavraPasse} className="grid gap-4 rounded-2xl border p-6 sm:grid-cols-2">
              <p className="font-display font-bold sm:col-span-2">
                {lang === "pt" ? "Alterar palavra-passe" : "Change password"}
              </p>
              <div>
                <Label htmlFor="nova_pass">{lang === "pt" ? "Nova palavra-passe" : "New password"}</Label>
                <Input
                  id="nova_pass"
                  type="password"
                  autoComplete="new-password"
                  minLength={6}
                  value={novaPass}
                  onChange={(e) => setNovaPass(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="conf_pass">{lang === "pt" ? "Confirmar" : "Confirm"}</Label>
                <Input
                  id="conf_pass"
                  type="password"
                  autoComplete="new-password"
                  minLength={6}
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" variant="outline" disabled={aGuardarPass} className="font-semibold">
                  {lang === "pt" ? "Actualizar palavra-passe" : "Update password"}
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
                  <Badge className={estadoCor[p.estado] ?? ""}>{orderStateLabel(p.estado, lang)}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(p.criado_em).toLocaleString("pt-PT")}
                  </span>
                  <span className="ml-auto font-display font-bold text-primary">
                    {formatKz(Number(p.total))}
                  </span>
                </div>

                <Progresso estado={p.estado} lang={lang} />

                <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
                  {(p.pedido_itens ?? []).map((i) => (
                    <li key={i.id}>
                      {i.quantidade}× {i.nome} — {formatKz(Number(i.preco) * i.quantidade)}
                    </li>
                  ))}
                </ul>

                <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                  <p>
                    {t("subtotal")}: {formatKz(Number(p.subtotal))} · {t("del_fee")}:{" "}
                    {formatKz(Number(p.taxa_entrega))}
                  </p>
                  <p>
                    {p.metodo_pag} · {p.tipo_entrega === "entrega" ? t("delivery") : t("pickup")}
                    {p.morada ? ` · ${p.morada}` : ""}
                  </p>
                </div>

                {p.comprovativo_url && (
                  <Button asChild size="sm" variant="outline" className="mt-3">
                    <a href={p.comprovativo_url} target="_blank" rel="noreferrer">
                      <ExternalLink className="size-4" />
                      {lang === "pt" ? "Ver comprovativo enviado" : "View uploaded receipt"}
                    </a>
                  </Button>
                )}
              </article>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </ShopLayout>
  );
}
