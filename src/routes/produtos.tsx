import * as React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { ShopLayout } from "@/components/shop/ShopLayout";
import { ProductCard } from "@/components/shop/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/lib/i18n";
import { useFavoritos } from "@/lib/favoritos";
import { categoriasQuery, produtosQuery } from "@/lib/shop-queries";
import { effectivePrice } from "@/lib/shop-config";

type Search = { q?: string | undefined; cat?: string | undefined };

export const Route = createFileRoute("/produtos")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    q: typeof search["q"] === "string" && search["q"] ? search["q"] : undefined,
    cat: typeof search["cat"] === "string" && search["cat"] ? search["cat"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Produtos — Ludy Tech Shop" },
      {
        name: "description",
        content:
          "Catálogo completo da Ludy Tech Shop: acessórios, electrónicos, roupa e calçado com preços em Kwanza.",
      },
      { property: "og:title", content: "Produtos — Ludy Tech Shop" },
      { property: "og:description", content: "Vê todo o catálogo com preços em Kwanza." },
    ],
  }),
  component: Produtos,
});

function Produtos() {
  const { q, cat } = Route.useSearch();
  const navigate = useNavigate({ from: "/produtos" });
  const { t } = useI18n();
  const { data: categorias } = useQuery(categoriasQuery);
  const { data: produtos, isLoading } = useQuery(produtosQuery);
  const { isFavorito, toggle } = useFavoritos();
  const [ordem, setOrdem] = React.useState("newest");

  const categoria = (categorias ?? []).find((c) => c.slug === cat);

  const lista = React.useMemo(() => {
    let out = [...(produtos ?? [])];
    if (categoria) out = out.filter((p) => p.categoria_id === categoria.id);
    if (q) {
      const needle = q.toLowerCase();
      out = out.filter(
        (p) =>
          p.nome.toLowerCase().includes(needle) ||
          (p.descricao ?? "").toLowerCase().includes(needle),
      );
    }
    if (ordem === "cheapest") out.sort((a, b) => effectivePrice(a) - effectivePrice(b));
    if (ordem === "priciest") out.sort((a, b) => effectivePrice(b) - effectivePrice(a));
    return out;
  }, [produtos, categoria, q, ordem]);

  return (
    <ShopLayout>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="font-display text-2xl font-black sm:text-3xl">
          {categoria ? categoria.nome : t("products")}
        </h1>

        <div className="relative mt-4 max-w-lg">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={termo}
            onChange={(e) => setTermo(e.target.value)}
            placeholder={t("search_ph")}
            aria-label={t("search")}
            className="rounded-full pl-9 pr-9"
          />
          {termo && (
            <button
              type="button"
              aria-label="Limpar pesquisa"
              onClick={() => {
                setTermo("");
                navigate({ search: { q: undefined, cat } });
              }}
              className="absolute right-2 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>


        <div className="mt-6 flex flex-wrap items-center gap-2">
          <Link
            to="/produtos"
            search={{ q, cat: undefined }}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
              !cat ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary"
            }`}
          >
            {t("all")}
          </Link>
          {(categorias ?? []).map((c) => (
            <Link
              key={c.id}
              to="/produtos"
              search={{ q, cat: c.slug }}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                cat === c.slug
                  ? "border-primary bg-primary text-primary-foreground"
                  : "hover:border-primary"
              }`}
            >
              {c.nome}
            </Link>
          ))}

          <div className="ml-auto w-44">
            <Select value={ordem} onValueChange={setOrdem}>
              <SelectTrigger aria-label={t("sort")}>
                <SelectValue placeholder={t("sort")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">{t("newest")}</SelectItem>
                <SelectItem value="cheapest">{t("cheapest")}</SelectItem>
                <SelectItem value="priciest">{t("priciest")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          {lista.length} {lista.length === 1 ? "produto" : "produtos"}
        </p>



        {isLoading ? (
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-2xl" />
            ))}
          </div>
        ) : lista.length === 0 ? (
          <p className="mt-10 rounded-2xl border border-dashed p-12 text-center text-sm text-muted-foreground">
            {t("no_products")}
          </p>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {lista.map((p) => (
              <ProductCard
                key={p.id}
                produto={p}
                favorito={isFavorito(p.id)}
                onToggleFavorito={toggle}
              />
            ))}
          </div>
        )}
      </div>
    </ShopLayout>
  );
}
