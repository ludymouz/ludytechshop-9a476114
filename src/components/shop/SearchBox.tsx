import * as React from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";
import { categoriasQuery, produtosQuery } from "@/lib/shop-queries";
import { effectivePrice, formatKz } from "@/lib/shop-config";

export function SearchBox({ className = "" }: { className?: string }) {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const [q, setQ] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const boxRef = React.useRef<HTMLDivElement>(null);

  const { data: produtos } = useQuery({ ...produtosQuery, enabled: q.trim().length > 0 });
  const { data: categorias } = useQuery(categoriasQuery);

  React.useEffect(() => {
    function onDown(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const needle = q.trim().toLowerCase();
  const results = React.useMemo(() => {
    if (!needle) return [];
    return (produtos ?? [])
      .filter(
        (p) =>
          p.nome.toLowerCase().includes(needle) ||
          (p.descricao ?? "").toLowerCase().includes(needle),
      )
      .slice(0, 6);
  }, [produtos, needle]);

  function catName(id: string | null) {
    return (categorias ?? []).find((c) => c.id === id)?.nome ?? "";
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setOpen(false);
    navigate({ to: "/produtos", search: { q: q.trim() || undefined, cat: undefined } });
  }

  return (
    <div ref={boxRef} className={`relative ${className}`}>
      <form onSubmit={submit} className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={t("search_ph")}
          className="rounded-full pl-9 pr-9"
          aria-label={t("search")}
          autoComplete="off"
        />
        {q && (
          <button
            type="button"
            aria-label={lang === "pt" ? "Limpar pesquisa" : "Clear search"}
            onClick={() => {
              setQ("");
              setOpen(false);
            }}
            className="absolute right-2 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </form>

      {open && needle.length > 0 && (
        <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-2xl border bg-popover shadow-glow">
          {results.length === 0 ? (
            <p className="p-4 text-center text-sm text-muted-foreground">{t("no_products")}</p>
          ) : (
            <ul className="max-h-[22rem] overflow-y-auto">
              {results.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      setQ("");
                      navigate({ to: "/produto/$id", params: { id: p.id } });
                    }}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition hover:bg-muted"
                  >
                    <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-lg bg-muted">
                      {p.imagem_url ? (
                        <img
                          src={p.imagem_url}
                          alt=""
                          loading="lazy"
                          className="size-full object-cover"
                        />
                      ) : (
                        <span className="text-lg">📦</span>
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{p.nome}</span>
                      <span className="block truncate text-[11px] text-muted-foreground">
                        {catName(p.categoria_id)}
                      </span>
                    </span>
                    <span className="shrink-0 font-display text-sm font-bold text-primary">
                      {formatKz(effectivePrice(p))}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <button
            type="button"
            onClick={submit}
            className="block w-full border-t bg-muted/40 px-3 py-2.5 text-center text-xs font-semibold text-primary hover:underline"
          >
            {lang === "pt" ? "Ver todos os resultados" : "See all results"}
          </button>
        </div>
      )}
    </div>
  );
}
