import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Heart, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";
import { effectivePrice, formatKz } from "@/lib/shop-config";

export type Produto = {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number;
  preco_promo: number | null;
  em_promocao: boolean;
  stock: number;
  imagem_url: string | null;
  categoria_id: string | null;
};

export function ProductCard({
  produto,
  favorito,
  onToggleFavorito,
}: {
  produto: Produto;
  favorito?: boolean;
  onToggleFavorito?: (id: string) => void;
}) {
  const { add, setOpen } = useCart();
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const href = useRouterState({ select: (s) => s.location.href });
  const preco = effectivePrice(produto);
  const esgotado = produto.stock <= 0;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border bg-card shadow-card transition hover:-translate-y-1 hover:shadow-glow">
      <Link
        to="/produto/$id"
        params={{ id: produto.id }}
        className="relative block aspect-square overflow-hidden bg-muted"
      >
        {produto.imagem_url ? (
          <img
            src={produto.imagem_url}
            alt={produto.nome}
            loading="lazy"
            className="size-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-4xl">📦</div>
        )}
        {produto.em_promocao && !esgotado && (
          <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-primary-foreground">
            {t("promo")}
          </span>
        )}
        {esgotado && (
          <span className="absolute inset-0 flex items-center justify-center bg-ink/60 text-sm font-bold uppercase tracking-wide text-ink-foreground">
            {t("out_of_stock")}
          </span>
        )}
      </Link>

      {onToggleFavorito && (
        <button
          type="button"
          aria-label={t("favorites")}
          onClick={() => onToggleFavorito(produto.id)}
          className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-background/90 backdrop-blur transition hover:bg-background"
        >
          <Heart className={`size-4 ${favorito ? "fill-primary text-primary" : "text-foreground"}`} />
        </button>
      )}

      <div className="flex flex-1 flex-col gap-2 p-3 sm:p-4">
        <Link
          to="/produto/$id"
          params={{ id: produto.id }}
          className="line-clamp-2 font-display text-sm font-semibold leading-snug hover:text-primary"
        >
          {produto.nome}
        </Link>
        <div className="mt-auto flex flex-wrap items-baseline gap-x-2">
          <span className="font-display text-base font-bold text-primary sm:text-lg">
            {formatKz(preco)}
          </span>
          {produto.em_promocao && produto.preco_promo != null && (
            <span className="text-xs text-muted-foreground line-through">
              {formatKz(produto.preco)}
            </span>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground">
          {esgotado ? t("out_of_stock") : `${produto.stock} ${t("in_stock")}`}
        </p>
        <Button
          size="sm"
          className="mt-1 flex w-full items-center justify-center gap-1.5 whitespace-nowrap px-2 text-[12px] font-semibold leading-none sm:text-sm"
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
              1,
            );
            toast.success(produto.nome);
            setOpen(true);
          }}
        >
          <ShoppingCart className="size-4 shrink-0" />
          <span className="truncate">{t("add_cart")}</span>
        </Button>
      </div>
    </article>
  );
}
