import * as React from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Loader2, LocateFixed, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { PAYMENT_METHODS, SHOP, formatKz, paymentWindow } from "@/lib/shop-config";
import { criarPedido } from "@/lib/checkout.functions";
import { supabase } from "@/integrations/supabase/client";

export function CartDrawer() {
  const { items, subtotal, open, setOpen, setQty, remove, clear } = useCart();
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const criar = useServerFn(criarPedido);

  const [pagamento, setPagamento] = React.useState<string>(PAYMENT_METHODS[0].value);
  const [entrega, setEntrega] = React.useState<"entrega" | "levantamento">("entrega");
  const [enviando, setEnviando] = React.useState(false);
  const [localizando, setLocalizando] = React.useState(false);
  const [localizacaoUrl, setLocalizacaoUrl] = React.useState<string | null>(null);
  const [janela, setJanela] = React.useState(() => paymentWindow());

  React.useEffect(() => {
    const id = setInterval(() => setJanela(paymentWindow()), 30000);
    return () => clearInterval(id);
  }, []);

  const taxa = entrega === "entrega" ? SHOP.deliveryFee : 0;
  const total = subtotal + taxa;

  function obterLocalizacao() {
    if (!("geolocation" in navigator)) {
      toast.error(lang === "pt" ? "O GPS não está disponível neste dispositivo." : "GPS is not available on this device.");
      return;
    }
    setLocalizando(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const lat = coords.latitude.toFixed(7);
        const lng = coords.longitude.toFixed(7);
        setLocalizacaoUrl(`https://maps.google.com/?q=${lat},${lng}`);
        setLocalizando(false);
        toast.success(lang === "pt" ? "Localização adicionada à encomenda." : "Location added to your order.");
      },
      () => {
        setLocalizando(false);
        toast.error(lang === "pt" ? "Não foi possível obter a localização. Verifica a permissão do GPS." : "Could not get your location. Check GPS permission.");
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
    );
  }

  async function finalizar() {
    if (!user) {
      toast.error(t("need_login"));
      setOpen(false);
      navigate({ to: "/auth" });
      return;
    }
    if (!janela.open) {
      toast.error(`${t("pay_closed")} ${janela.opensAt}`);
      return;
    }
    setEnviando(true);
    try {
      const { data: perfil } = await supabase
        .from("profiles")
        .select("nome_completo, telefone, morada")
        .eq("id", user.id)
        .maybeSingle();

      const res = await criar({
        data: {
          itens: items.map((i) => ({ produto_id: i.id, quantidade: i.quantidade })),
          metodo_pag: pagamento,
          tipo_entrega: entrega,
          nome_cliente: perfil?.nome_completo || user.email || "Cliente",
          telefone: perfil?.telefone ?? null,
          morada: perfil?.morada ?? null,
          localizacao_url: entrega === "entrega" ? localizacaoUrl : null,
        },
      });

      const linhas = items
        .map((i) => `• ${i.quantidade}x ${i.nome} — ${formatKz(i.preco * i.quantidade)}`)
        .join("\n");
      const texto =
        `*${SHOP.name}* — ${lang === "pt" ? "Novo pedido" : "New order"} #${res.numero}\n\n` +
        `${linhas}\n\n` +
        `${t("subtotal")}: ${formatKz(res.subtotal)}\n` +
        `${t("del_fee")}: ${formatKz(res.taxa)}\n` +
        `*${t("total")}: ${formatKz(res.total)}*\n\n` +
        `${t("pay_method")}: ${pagamento}\n` +
        `${t("delivery_type")}: ${entrega === "entrega" ? t("delivery") : t("pickup")}\n` +
        `${t("full_name")}: ${perfil?.nome_completo ?? ""}\n` +
        (perfil?.telefone ? `${t("phone")}: ${perfil.telefone}\n` : "") +
        (entrega === "entrega" && perfil?.morada ? `${t("address")}: ${perfil.morada}\n` : "") +
        (entrega === "entrega" && localizacaoUrl ? `Localização GPS: ${localizacaoUrl}\n` : "");

      clear();
      setOpen(false);
      toast.success(lang === "pt" ? `Pedido #${res.numero} registado!` : `Order #${res.numero} placed!`);
      window.open(`https://wa.me/${SHOP.phone}?text=${encodeURIComponent(texto)}`, "_blank");
      navigate({ to: "/perfil" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao finalizar o pedido.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b px-5 py-4">
          <SheetTitle className="flex items-center gap-2 font-display text-lg">
            <ShoppingBag className="size-5 text-primary" /> {t("cart")}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 py-16 text-center">
              <ShoppingBag className="size-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{t("empty_cart")}</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((i) => (
                <li key={i.id} className="flex gap-3 rounded-xl border p-3">
                  <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {i.imagem_url ? (
                      <img src={i.imagem_url} alt={i.nome} className="size-full object-cover" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{i.nome}</p>
                    <p className="text-sm font-bold text-primary">{formatKz(i.preco)}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        className="size-7"
                        onClick={() => setQty(i.id, i.quantidade - 1)}
                        aria-label="-"
                      >
                        <Minus className="size-3" />
                      </Button>
                      <span className="w-6 text-center text-sm font-semibold">{i.quantidade}</span>
                      <Button
                        size="icon"
                        variant="outline"
                        className="size-7"
                        onClick={() => setQty(i.id, i.quantidade + 1)}
                        aria-label="+"
                      >
                        <Plus className="size-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="ml-auto size-7 text-muted-foreground"
                        onClick={() => remove(i.id)}
                        aria-label={t("remove")}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="space-y-4 border-t px-5 py-4">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                {t("pay_method")}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {PAYMENT_METHODS.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setPagamento(m.value)}
                    className={`rounded-lg border px-2 py-2 text-left text-xs font-medium transition ${
                      pagamento === m.value
                        ? "border-primary bg-primary/10 text-foreground"
                        : "hover:border-primary/50"
                    }`}
                  >
                    {m.icon} {lang === "pt" ? m.labelPt : m.labelEn}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                {t("delivery_type")}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setEntrega("entrega")}
                  className={`rounded-lg border px-2 py-2 text-left text-xs font-medium transition ${
                    entrega === "entrega" ? "border-primary bg-primary/10" : "hover:border-primary/50"
                  }`}
                >
                  🚚 {t("delivery")}
                  <span className="block text-[10px] opacity-70">+{formatKz(SHOP.deliveryFee)}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEntrega("levantamento")}
                  className={`rounded-lg border px-2 py-2 text-left text-xs font-medium transition ${
                    entrega === "levantamento"
                      ? "border-primary bg-primary/10"
                      : "hover:border-primary/50"
                  }`}
                >
                  🏪 {t("pickup")}
                  <span className="block text-[10px] opacity-70">{t("free")}</span>
                </button>
              </div>
              {entrega === "entrega" && (
                <div className="mt-3 space-y-2">
                  <p className="rounded-lg bg-warning/15 px-3 py-2 text-[11px] leading-snug text-foreground">
                    {t("del_warn")}
                  </p>
                  <Button type="button" variant="outline" className="w-full justify-center" onClick={obterLocalizacao} disabled={localizando}>
                    {localizando ? <Loader2 className="size-4 animate-spin" /> : localizacaoUrl ? <CheckCircle2 className="size-4 text-success" /> : <LocateFixed className="size-4" />}
                    {localizando
                      ? lang === "pt" ? "A obter localização…" : "Getting location…"
                      : localizacaoUrl
                        ? lang === "pt" ? "Localização GPS adicionada" : "GPS location added"
                        : lang === "pt" ? "Usar minha localização GPS atual" : "Use my current GPS location"}
                  </Button>
                  {localizacaoUrl && (
                    <a href={localizacaoUrl} target="_blank" rel="noreferrer" className="block text-center text-xs font-semibold text-primary hover:underline">
                      {lang === "pt" ? "Pré-visualizar no Google Maps" : "Preview on Google Maps"}
                    </a>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>{t("subtotal")}</span>
                <span>{formatKz(subtotal)}</span>
              </div>
              {taxa > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>{t("del_fee")}</span>
                  <span>{formatKz(taxa)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold">
                <span>{t("total")}</span>
                <span className="text-primary">{formatKz(total)}</span>
              </div>
            </div>

            {!janela.open && (
              <p className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
                <X className="size-3.5" /> {t("pay_closed")} {janela.opensAt}
              </p>
            )}

            <Button
              className="w-full font-semibold"
              size="lg"
              disabled={enviando || !janela.open}
              onClick={finalizar}
            >
              💬 {t("checkout")}
            </Button>
            {!user && (
              <p className="text-center text-xs text-muted-foreground">
                {t("need_login")}{" "}
                <Link to="/auth" className="font-semibold text-primary" onClick={() => setOpen(false)}>
                  {t("login")}
                </Link>
              </p>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
