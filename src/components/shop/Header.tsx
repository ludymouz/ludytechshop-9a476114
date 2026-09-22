import * as React from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Heart, LogOut, Menu, Search, ShoppingCart, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";
import { SHOP } from "@/lib/shop-config";
import logoAsset from "@/assets/ludy-tech-logo.png.asset.json";
import { NotificationBell } from "./NotificationBell";

export function Header() {
  const { t, lang, setLang } = useI18n();
  const { count, setOpen } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [q, setQ] = React.useState("");

  const { data: categorias } = useQuery({
    queryKey: ["categorias"],
    queryFn: async () => {
      const { data } = await supabase.from("categorias").select("*").order("ordem");
      return data ?? [];
    },
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    navigate({ to: "/produtos", search: { q: q || undefined, cat: undefined } });
  }

  const nav = (
    <>
      <Link to="/" className="text-sm font-semibold hover:text-primary">
        {t("home")}
      </Link>
      <Link to="/produtos" search={{ q: undefined, cat: undefined }} className="text-sm font-semibold hover:text-primary">
        {t("products")}
      </Link>
      <Link to="/contacto" className="text-sm font-semibold hover:text-primary">
        {t("contacts")}
      </Link>
      {(categorias ?? []).map((c) => (
        <Link
          key={c.id}
          to="/produtos"
          search={{ cat: c.slug, q: undefined }}
          className="text-sm font-medium text-muted-foreground hover:text-primary"
        >
          {c.nome}
        </Link>
      ))}
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Menu">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <nav className="mt-10 flex flex-col gap-4 px-5">{nav}</nav>
          </SheetContent>
        </Sheet>

        <Link to="/" className="flex shrink-0 items-center gap-2" aria-label="Ludy Tech Shop — página inicial">
          <img
            src={logoAsset.url}
            alt=""
            width={40}
            height={40}
            className="size-10 shrink-0 object-contain"
          />
          <span className="hidden font-display text-lg font-black sm:block">
            Ludy <span className="text-primary">Tech</span> Shop
          </span>
        </Link>

        <SearchBox className="mx-auto hidden w-full max-w-md md:block" />

        <div className="ml-auto flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            className="font-bold"
            onClick={() => setLang(lang === "pt" ? "en" : "pt")}
          >
            {lang === "pt" ? "EN" : "PT"}
          </Button>

          <NotificationBell />

          <Button variant="ghost" size="icon" asChild aria-label={t("favorites")}>
            <Link to="/favoritos">
              <Heart className="size-5" />
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => setOpen(true)}
            aria-label={t("cart")}
          >
            <ShoppingCart className="size-5" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {count}
              </span>
            )}
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label={t("account")}>
                  <User className="size-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/perfil">{t("profile")}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/favoritos">{t("favorites")}</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={async () => {
                    await supabase.auth.signOut();
                    navigate({ to: "/" });
                  }}
                >
                  <LogOut className="size-4" /> {t("logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button size="sm" className="ml-1 font-semibold" asChild>
              <Link to="/auth">{t("login")}</Link>
            </Button>
          )}
        </div>
      </div>

      <div className="hidden border-t lg:block">
        <nav className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-2.5">
          {nav}
          <a
            href={`https://wa.me/${SHOP.phone}`}
            target="_blank"
            rel="noreferrer"
            className="ml-auto text-sm font-semibold text-primary hover:underline"
          >
            {SHOP.phoneDisplay}
          </a>
        </nav>
      </div>

      <div className="px-4 pb-3 md:hidden">
        <SearchBox />
      </div>
    </header>
  );
}
