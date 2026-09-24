import * as React from "react";
import { createFileRoute, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowLeft, Heart, MessageCircle, Minus, Plus, ShoppingCart, Star } from "lucide-react";
import { toast } from "sonner";

import { ShopLayout } from "@/components/shop/ShopLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { useFavoritos } from "@/lib/favoritos";
import { useI18n } from "@/lib/i18n";
import { avaliacoesQuery, produtoQuery } from "@/lib/shop-queries";
import { SHOP, effectivePrice, formatKz } from "@/lib/shop-config";

export const Route = createFileRoute("/produto/$id")({
  head: () => ({
    meta: [
      { title: "Produto — Ludy Tech Shop" },
      {
        name: "description",
        content: "Detalhes do produto, fotos, preço em Kwanza, stock e avaliações de clientes.",
      },
      { property: "og:title", content: "Produto — Ludy Tech Shop" },
      { property: "og:description", content: "Fotos, preço em Kwanza, stock e avaliações." },
    ],
  }),
  component: ProdutoDetalhe,
});

function Estrelas({ n, onSelect }: { n: number; onSelect?: (v: number) => void }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((v) => (
        <button
          key={v}
          type="button"
          disabled={!onSelect}
          onClick={() => onSelect?.(v)}
          aria-label={`${v}`}
          className={onSelect ? "cursor-pointer" : "cursor-default"}
        >
          <Star className={`size-4 ${v <= n ? "fill-primary text-primary" : "text-muted-foreground"}`} />
        </button>
      ))}
    </div>
  );
}

function ProdutoDetalhe() {
  const { id } = Route.useParams();
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const { add, setOpen } = useCart();
  const { isFavorito, toggle } = useFavoritos();
  const navigate = useNavigate();
  const href = useRouterState({ select: (s) => s.location.href });
  const qc = useQueryClient();

  const { data: produto, isLoading } = useQuery(produtoQuery(id));
  const { data: avaliacoes } = useQuery(avaliacoesQuery(id));
  const [qty, setQty] = React.useState(1);
  const [estrelas, setEstrelas] = React.useState(5);
  const [comentario, setComentario] = React.useState("");
  const [foto, setFoto] = React.useState(0);
  const [tab, setTab] = React.useState("descricao");
  const infoRef = React.useRef<HTMLDivElement | null>(null);

  const enviar = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error(t("need_login"));
      const { error } = await supabase.from("avaliacoes").upsert(
        {
          user_id: user.id,
          produto_id: id,
          autor: user.email?.split("@")[0] ?? "Cliente",
          estrelas,
          comentario: comentario.trim() || null,
        },
        { onConflict: "user_id,produto_id" },
      );
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      setComentario("");
      toast.success("Obrigado pela avaliação!");
      qc.invalidateQueries({ queryKey: ["avaliacoes", id] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro"),
  });

  if (isLoading) {
    return (
      <ShopLayout>
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-2">
          <Skeleton className="aspect-square rounded-3xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </ShopLayout>
    );
  }

  if (!produto) {
    return (
      <ShopLayout>
        <div className="mx-auto max-w-2xl px-4 py-24 text-center">
          <p className="font-display text-2xl font-bold">{t("no_products")}</p>
          <Button asChild className="mt-6">
            <Link to="/produtos" search={{ q: undefined, cat: undefined }}>
              {t("products")}
            </Link>
          </Button>
        </div>
      </ShopLayout>
    );
  }

  const galeria = [
    produto.imagem_url,
    ...(Array.isArray(produto.imagens) ? (produto.imagens as string[]) : []),
  ].filter(Boolean) as string[];
  const preco = effectivePrice(produto);
  const esgotado = produto.stock <= 0;
  const lista = avaliacoes ?? [];
  const media = lista.length > 0 ? lista.reduce((s, a) => s + a.estrelas, 0) / lista.length : 0;

  function irParaDescricao() {
    setTab("descricao");
    requestAnimationFrame(() => {
      infoRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  const especificacoes: Array<[string, string]> = [
    [lang === "pt" ? "Preço" : "Price", formatKz(preco)],
    [t("stock"), esgotado ? t("out_of_stock") : `${produto.stock}`],
    [
      lang === "pt" ? "Disponibilidade" : "Availability",
      esgotado ? t("out_of_stock") : lang === "pt" ? "Disponível" : "Available",
    ],
    [
      lang === "pt" ? "Entrega" : "Delivery",
      lang === "pt" ? "Entrega no Uíge ou levantamento na loja" : "Delivery in Uíge or store pickup",
    ],
    [
      lang === "pt" ? "Pagamento" : "Payment",
      "Dinheiro vivo, Multicaixa Express, BAI, BFA, Atlântico",
    ],
  ];

  return (
    <ShopLayout>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Link
          to="/produtos"
          search={{ q: undefined, cat: undefined }}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="size-4" /> {t("back")}
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-2">
          <div>
            <div className="aspect-square overflow-hidden rounded-3xl border bg-muted">
              {galeria[foto] ? (
                <img src={galeria[foto]} alt={produto.nome} className="size-full object-cover" />
              ) : (
                <div className="grid size-full place-items-center text-6xl">📦</div>
              )}
            </div>
            {galeria.length > 1 && (
              <div className="mt-3 flex gap-2">
                {galeria.map((g, i) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setFoto(i)}
                    className={`size-16 overflow-hidden rounded-xl border-2 ${
                      i === foto ? "border-primary" : "border-transparent"
                    }`}
                  >
                    <img src={g} alt="" className="size-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <h1 className="font-display text-2xl font-black leading-tight sm:text-3xl">
              {produto.nome}
            </h1>
            <div className="mt-2 flex items-center gap-2">
              <Estrelas n={Math.round(media)} />
              <span className="text-xs text-muted-foreground">
                {lista.length} {t("reviews").toLowerCase()}
              </span>
            </div>

            <div className="mt-5 flex items-baseline gap-3">
              <span className="font-display text-3xl font-black text-primary">{formatKz(preco)}</span>
              {produto.em_promocao && produto.preco_promo != null && (
                <span className="text-base text-muted-foreground line-through">
                  {formatKz(produto.preco)}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {esgotado ? t("out_of_stock") : `${produto.stock} ${t("in_stock")}`}
            </p>

            <button
              type="button"
              onClick={irParaDescricao}
              className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-primary/40 px-4 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/10"
            >
              <ArrowDown className="size-3.5" />
              {lang === "pt" ? "Ver descrição" : "See description"}
            </button>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-full border px-2 py-1">
                <Button size="icon" variant="ghost" className="size-8" onClick={() => setQty(Math.max(1, qty - 1))}>
                  <Minus className="size-4" />
                </Button>
                <span className="w-8 text-center font-semibold">{qty}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-8"
                  onClick={() => setQty(Math.min(produto.stock || 1, qty + 1))}
                >
                  <Plus className="size-4" />
                </Button>
              </div>

              <Button
                size="lg"
                className="flex flex-1 items-center justify-center gap-2 whitespace-nowrap font-semibold sm:flex-none"
                disabled={esgotado}
                onClick={() => {
                  if (!user) {
                    toast.error(
                      lang === "pt"
                        ? "Inicia sessão para adicionares ao carrinho."
                        : "Sign in to add items to your cart.",
                    );
                    navigate({ to: "/auth", search: { redirect: href } });
                    return;
                  }
                  add(
                    {
                      id: produto.id,
                      nome: produto.nome,
                      preco,
                      imagem_url: produto.imagem_url,
                      stock: produto.stock,
                    },
                    qty,
                  );
                  toast.success(produto.nome);
                  setOpen(true);
                }}
              >
                <ShoppingCart className="size-4 shrink-0" />
                <span className="truncate">{t("add_cart")}</span>
              </Button>

              <Button asChild size="lg" variant="secondary" className="font-semibold">
                <a
                  target="_blank"
                  rel="noreferrer"
                  href={`https://wa.me/${SHOP.phone}?text=${encodeURIComponent(
                    `Olá, Ludy Tech Shop! Tenho interesse em comprar este produto:\n- Produto: ${produto.nome}\n- Preço: ${formatKz(preco)}\n- Link: ${typeof window !== "undefined" ? window.location.href : ""}\nPodem confirmar a disponibilidade para entrega?`,
                  )}`}
                >
                  <MessageCircle className="size-4 shrink-0" />
                  Comprar via WhatsApp
                </a>
              </Button>

              <Button size="lg" variant="outline" onClick={() => toggle(produto.id)}>
                <Heart className={`size-4 ${isFavorito(produto.id) ? "fill-primary text-primary" : ""}`} />
                {t("favorites")}
              </Button>
            </div>
          </div>
        </div>

        <div ref={infoRef} className="mt-14 max-w-3xl scroll-mt-28">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="flex-wrap">
              <TabsTrigger value="descricao">{t("description")}</TabsTrigger>
              <TabsTrigger value="especificacoes">
                {lang === "pt" ? "Especificações" : "Specifications"}
              </TabsTrigger>
              <TabsTrigger value="avaliacoes">
                {t("reviews")} ({lista.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="descricao" className="mt-6">
              {produto.descricao ? (
                <p className="whitespace-pre-line text-sm leading-relaxed">{produto.descricao}</p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {lang === "pt"
                    ? "Este produto ainda não tem descrição."
                    : "This product has no description yet."}
                </p>
              )}
            </TabsContent>

            <TabsContent value="especificacoes" className="mt-6">
              <dl className="divide-y rounded-2xl border">
                {especificacoes.map(([k, v]) => (
                  <div key={k} className="flex flex-wrap gap-2 px-4 py-3 text-sm">
                    <dt className="font-semibold">{k}</dt>
                    <dd className="ml-auto text-right text-muted-foreground">{v}</dd>
                  </div>
                ))}
              </dl>
            </TabsContent>

            <TabsContent value="avaliacoes" className="mt-6">
              {user ? (
                <div className="rounded-2xl border p-4">
                  <p className="text-sm font-semibold">{t("write_review")}</p>
                  <div className="mt-2">
                    <Estrelas n={estrelas} onSelect={setEstrelas} />
                  </div>
                  <Textarea
                    className="mt-3"
                    rows={3}
                    placeholder={t("your_comment")}
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                  />
                  <Button className="mt-3" disabled={enviar.isPending} onClick={() => enviar.mutate()}>
                    {t("send")}
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {t("need_login")}{" "}
                  <Link to="/auth" search={{ redirect: href }} className="font-semibold text-primary hover:underline">
                    {t("login")}
                  </Link>
                </p>
              )}

              <ul className="mt-6 space-y-4">
                {lista.length === 0 && (
                  <li className="text-sm text-muted-foreground">{t("no_reviews")}</li>
                )}
                {lista.map((a) => (
                  <li key={a.id} className="rounded-2xl border p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">{a.autor || "Cliente"}</span>
                      <Estrelas n={a.estrelas} />
                    </div>
                    {a.comentario && <p className="mt-2 text-sm">{a.comentario}</p>}
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      {new Date(a.criado_em).toLocaleDateString("pt-PT")}
                    </p>
                  </li>
                ))}
              </ul>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ShopLayout>
  );
}
