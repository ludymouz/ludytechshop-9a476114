import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, ShieldCheck, Truck, Wallet } from "lucide-react";

import { ShopLayout } from "@/components/shop/ShopLayout";
import { ProductCard } from "@/components/shop/ProductCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/lib/i18n";
import { useFavoritos } from "@/lib/favoritos";
import { bannersQuery, categoriasQuery, produtosQuery } from "@/lib/shop-queries";
import { SHOP } from "@/lib/shop-config";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ludy Tech Shop — Acessórios, electrónicos, roupa e calçado no Uíge" },
      {
        name: "description",
        content:
          "Compra online no Uíge, Angola: acessórios, electrónicos, roupa e calçado com preços em Kwanza, entrega ao domicílio ou levantamento.",
      },
      { property: "og:title", content: "Ludy Tech Shop — Loja online em Angola" },
      {
        property: "og:description",
        content: "Preços em Kwanza, entrega no Uíge e pedidos finalizados no WhatsApp.",
      },
    ],
  }),
  component: Home,
});

function Banners() {
  const { data, isLoading } = useQuery(bannersQuery);
  const [i, setI] = React.useState(0);
  const banners = data ?? [];

  React.useEffect(() => {
    if (banners.length < 2) return;
    const id = setInterval(() => setI((v) => (v + 1) % banners.length), 6000);
    return () => clearInterval(id);
  }, [banners.length]);

  if (isLoading) return <Skeleton className="h-36 w-full rounded-3xl sm:h-48" />;
  if (banners.length === 0) return null;

  const b = banners[Math.min(i, banners.length - 1)]!;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-ink text-ink-foreground shadow-card">
      {b.imagem_url && (
        <img
          src={b.imagem_url}
          alt={b.titulo ?? "Banner"}
          className="absolute inset-0 size-full object-cover opacity-45"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-transparent" />
      <div className="relative flex min-h-36 flex-col justify-center gap-2 p-5 sm:min-h-48 sm:gap-3 sm:p-8">
        <p className="w-fit rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary-foreground">
          {SHOP.name}
        </p>
        <h2 className="max-w-xl font-display text-xl font-black leading-tight sm:text-3xl">
          {b.titulo}
        </h2>
        {b.subtitulo && <p className="max-w-lg text-xs opacity-80 sm:text-sm">{b.subtitulo}</p>}
        <div>
          <Button asChild size="lg" className="mt-2 font-semibold">
            <Link to="/produtos" search={{ q: undefined, cat: undefined }}>
              Ver produtos
            </Link>
          </Button>
        </div>
      </div>

      {banners.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Anterior"
            onClick={() => setI((v) => (v - 1 + banners.length) % banners.length)}
            className="absolute left-3 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-background/20 backdrop-blur hover:bg-background/40"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            aria-label="Seguinte"
            onClick={() => setI((v) => (v + 1) % banners.length)}
            className="absolute right-3 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-background/20 backdrop-blur hover:bg-background/40"
          >
            <ChevronRight className="size-5" />
          </button>
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
            {banners.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  idx === i ? "w-6 bg-primary" : "w-1.5 bg-white/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Home() {
  const { t, lang } = useI18n();
  const { data: categorias } = useQuery(categoriasQuery);
  const { data: produtos, isLoading } = useQuery(produtosQuery);
  const { isFavorito, toggle } = useFavoritos();

  const lista = produtos ?? [];
  const promos = lista.filter((p) => p.em_promocao).slice(0, 8);

  return (
    <ShopLayout>
      <div className="mx-auto max-w-7xl px-4 py-6">
        <h1 className="sr-only">Ludy Tech Shop — loja online no Uíge, Angola</h1>
        <Banners />

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            { icon: Truck, pt: "Entrega no Uíge", en: "Delivery in Uíge", sub: "600 Kz" },
            { icon: Wallet, pt: "Multicaixa, BAI, BFA", en: "Multicaixa, BAI, BFA", sub: "08:00 – 16:00" },
            { icon: ShieldCheck, pt: "Produtos garantidos", en: "Trusted products", sub: SHOP.phoneDisplay },
          ].map((f) => (
            <div key={f.pt} className="flex items-center gap-3 rounded-2xl border bg-card p-4">
              <f.icon className="size-6 text-primary" />
              <div>
                <p className="text-sm font-semibold">{lang === "pt" ? f.pt : f.en}</p>
                <p className="text-xs text-muted-foreground">{f.sub}</p>
              </div>
            </div>
          ))}
        </div>

        <section className="mt-10">
          <h2 className="font-display text-xl font-bold">{t("categories")}</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {(categorias ?? []).map((c) => (
              <Link
                key={c.id}
                to="/produtos"
                search={{ cat: c.slug, q: undefined }}
                className="rounded-2xl border bg-card px-5 py-4 text-sm font-semibold shadow-card transition hover:-translate-y-0.5 hover:border-primary hover:text-primary"
              >
                {c.nome}
              </Link>
            ))}
          </div>
        </section>

        {promos.length > 0 && (
          <section className="mt-12">
            <h2 className="font-display text-xl font-bold">{t("promo")}</h2>
            <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {promos.map((p) => (
                <ProductCard
                  key={p.id}
                  produto={p}
                  favorito={isFavorito(p.id)}
                  onToggleFavorito={toggle}
                />
              ))}
            </div>
          </section>
        )}

        <section className="mt-12">
          <div className="flex items-end justify-between">
            <h2 className="font-display text-xl font-bold">{t("newest")}</h2>
            <Link
              to="/produtos"
              search={{ q: undefined, cat: undefined }}
              className="text-sm font-semibold text-primary hover:underline"
            >
              {t("products")}
            </Link>
          </div>

          {isLoading ? (
            <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-72 rounded-2xl" />
              ))}
            </div>
          ) : lista.length === 0 ? (
            <p className="mt-6 rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
              {t("no_products")}
            </p>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {lista.slice(0, 12).map((p) => (
                <ProductCard
                  key={p.id}
                  produto={p}
                  favorito={isFavorito(p.id)}
                  onToggleFavorito={toggle}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </ShopLayout>
  );
}
