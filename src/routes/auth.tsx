import * as React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { ShopLayout } from "@/components/shop/ShopLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string | undefined } => ({
    redirect:
      typeof search["redirect"] === "string" && search["redirect"].startsWith("/")
        ? search["redirect"]
        : undefined,
  }),
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
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const [modo, setModo] = React.useState<"login" | "registo">("login");
  const [loading, setLoading] = React.useState(false);
  const [captcha, setCaptcha] = React.useState({ a: 3, b: 4 });

  React.useEffect(() => {
    setCaptcha({ a: Math.floor(Math.random() * 8) + 1, b: Math.floor(Math.random() * 8) + 1 });
  }, []);

  React.useEffect(() => {
    if (user) navigate({ to: redirect ?? "/perfil" });
  }, [user, navigate, redirect]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email);
    if (!emailValido) {
      toast.error(t("invalid_email"));
      return;
    }
    if (modo === "registo") {
      const telefone = String(fd.get("telefone") ?? "").trim();
      if (!/^9\d{8}$/.test(telefone)) {
        toast.error(t("invalid_phone"));
        return;
      }
      if (Number(fd.get("captcha")) !== captcha.a + captcha.b) {
        toast.error(t("captcha_error"));
        setCaptcha({ a: Math.floor(Math.random() * 8) + 1, b: Math.floor(Math.random() * 8) + 1 });
        return;
      }
    }
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
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="username">{t("username")}</Label>
                  <Input id="username" name="username" className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="telefone">{t("phone")}</Label>
                  <div className="relative mt-1.5">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">+244</span>
                    <Input
                      id="telefone"
                      name="telefone"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      required
                      minLength={9}
                      maxLength={9}
                      pattern="9[0-9]{8}"
                      className="pl-12"
                      placeholder="9xx xxx xxx"
                      onInput={(e) => {
                        e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "").slice(0, 9);
                      }}
                    />
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="morada">{t("address")}</Label>
                <Input id="morada" name="morada" className="mt-1.5" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t("gender")}</Label>
                  <RadioGroup name="genero" defaultValue="other" className="flex flex-wrap gap-4 pt-1">
                    {([
                      { value: "male", label: t("male") },
                      { value: "female", label: t("female") },
                      { value: "other", label: t("other_gender") },
                    ] as const).map(({ value, label }) => (
                      <div key={value} className="flex items-center gap-2">
                        <RadioGroupItem value={value} id={`reg-${value}`} />
                        <Label htmlFor={`reg-${value}`} className="cursor-pointer font-normal">{label}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                <div>
                  <Label htmlFor="idade">{t("age")}</Label>
                  <Input id="idade" name="idade" type="number" min={0} className="mt-1.5" />
                </div>
              </div>
              <div className="rounded-lg border bg-muted/40 p-4">
                <Label htmlFor="captcha">
                  {lang === "pt" ? "Confirma que és humano" : "Confirm you are human"}: {captcha.a} + {captcha.b} = ?
                </Label>
                <Input id="captcha" name="captcha" type="number" inputMode="numeric" required className="mt-2" />
              </div>
            </>
          )}

          <div>
            <Label htmlFor="email">{t("email")}</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required maxLength={254} className="mt-1.5" />
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
