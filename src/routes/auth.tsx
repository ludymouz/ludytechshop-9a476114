import * as React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { ShopLayout } from "@/components/shop/ShopLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar ou criar conta — Ludy Tech Shop" },
      {
        name: "description",
        content:
          "Inicia sessão na Ludy Tech Shop para guardar favoritos, acompanhar encomendas e finalizar pedidos.",
      },
      { property: "og:title", content: "Entrar — Ludy Tech Shop" },
      { property: "og:description", content: "Acede à tua conta da Ludy Tech Shop." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [modo, setModo] = React.useState<"login" | "registo">("login");
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (user) navigate({ to: "/perfil" });
  }, [user, navigate]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    setLoading(true);
    try {
      if (modo === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw new Error(error.message);
        toast.success("Bem-vindo de volta!");
        navigate({ to: "/" });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: {
              nome_completo: String(fd.get("nome_completo") ?? ""),
              username: String(fd.get("username") ?? ""),
              telefone: String(fd.get("telefone") ?? ""),
              morada: String(fd.get("morada") ?? ""),
              genero: String(fd.get("genero") ?? ""),
              idade: String(fd.get("idade") ?? ""),
            },
          },
        });
        if (error) throw new Error(error.message);
        if (data.session) {
          navigate({ to: "/perfil" });
        } else {
          toast.success("Conta criada! Confirma o teu email para entrares.");
          setModo("login");
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ShopLayout>
      <div className="mx-auto max-w-md px-4 py-14">
        <h1 className="font-display text-2xl font-black">
          {modo === "login" ? t("login") : t("register")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {modo === "login"
            ? "Acede à tua conta Ludy Tech Shop."
            : "Cria a tua conta para comprares em poucos cliques."}
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          {modo === "registo" && (
            <>
              <div>
                <Label htmlFor="nome_completo">{t("full_name")}</Label>
                <Input id="nome_completo" name="nome_completo" required className="mt-1.5" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="username">{t("username")}</Label>
                  <Input id="username" name="username" className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="telefone">{t("phone")}</Label>
                  <Input id="telefone" name="telefone" className="mt-1.5" placeholder="9xx xxx xxx" />
                </div>
              </div>
              <div>
                <Label htmlFor="morada">{t("address")}</Label>
                <Input id="morada" name="morada" className="mt-1.5" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="genero">{t("gender")}</Label>
                  <Input id="genero" name="genero" className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="idade">{t("age")}</Label>
                  <Input id="idade" name="idade" type="number" min={0} className="mt-1.5" />
                </div>
              </div>
            </>
          )}

          <div>
            <Label htmlFor="email">{t("email")}</Label>
            <Input id="email" name="email" type="email" required className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="password">{t("password")}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              className="mt-1.5"
            />
          </div>

          <Button type="submit" className="w-full font-semibold" size="lg" disabled={loading}>
            {modo === "login" ? t("login") : t("register")}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {modo === "login" ? (
            <>
              Ainda não tens conta?{" "}
              <button
                type="button"
                className="font-semibold text-primary hover:underline"
                onClick={() => setModo("registo")}
              >
                {t("register")}
              </button>
            </>
          ) : (
            <>
              Já tens conta?{" "}
              <button
                type="button"
                className="font-semibold text-primary hover:underline"
                onClick={() => setModo("login")}
              >
                {t("login")}
              </button>
            </>
          )}
        </p>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          <Link to="/" className="hover:text-primary">
            {t("back")}
          </Link>
        </p>
      </div>
    </ShopLayout>
  );
}
