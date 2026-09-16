import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { ShopLayout } from "@/components/shop/ShopLayout";
import { ProductCard } from "@/components/shop/ProductCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useFavoritos } from "@/lib/favoritos";
import { useI18n } from "@/lib/i18n";
import { produtosQuery } from "@/lib/shop-queries";

export const Route = createFileRoute("/favoritos")({
  head: () => ({
    meta: [
      { title: "Lista de desejos — Ludy Tech Shop" },
      {
        name: "description",
        content: "Os produtos que guardaste como favoritos na Ludy Tech Shop.",
      },
      { property: "og:title", content: "Lista de desejos — Ludy Tech Shop" },
      { property: "og:description", content: "Os teus produtos favoritos." },
    ],
  }),
  component: Favoritos,
});

function Favoritos() {
  const { t } = useI18n();
  const { user, loading } = useAuth();
  const { ids, isFavorito, toggle } = useFavoritos();
  const { data: produtos } = useQuery(produtosQuery);

  const lista = (produtos ?? []).filter((p) => ids.includes(p.id));

  return (
    <ShopLayout>
      <div className="mx-auto max-w-7xl px-4 py-10">
        <h1 className="font-display text-2xl font-black">{t("favorites")}</h1>

        {!user && !loading ? (
          <div className="mt-8 rounded-2xl border border-dashed p-12 text-center">
            <p className="text-sm text-muted-foreground">{t("need_login")}</p>
            <Button asChild className="mt-4">
              <Link to="/auth">{t("login")}</Link>
            </Button>
          </div>
        ) : lista.length === 0 ? (
          <p className="mt-8 rounded-2xl border border-dashed p-12 text-center text-sm text-muted-foreground">
            {t("no_favorites")}
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
