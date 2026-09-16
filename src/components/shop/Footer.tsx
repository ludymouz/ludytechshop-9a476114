import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, MapPin, Phone, Youtube } from "lucide-react";

import { useI18n } from "@/lib/i18n";
import { SHOP } from "@/lib/shop-config";

export function Footer() {
  const { t, lang } = useI18n();

  return (
    <footer className="mt-20 border-t bg-ink text-ink-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <p className="font-display text-xl font-black">
            Ludy <span className="text-primary">Tech Shop</span>
          </p>
          <p className="mt-3 max-w-xs text-sm opacity-70">
            {lang === "pt"
              ? "A tua loja de tecnologia, acessórios, roupa e calçado no Uíge, Angola."
              : "Your tech, accessories, clothing and footwear store in Uíge, Angola."}
          </p>
        </div>

        <div>
          <p className="mb-3 font-display text-sm font-bold uppercase tracking-wide">{t("links")}</p>
          <ul className="space-y-2 text-sm opacity-80">
            <li>
              <Link to="/" className="hover:text-primary">
                {t("home")}
              </Link>
            </li>
            <li>
              <Link to="/produtos" search={{ q: undefined, cat: undefined }} className="hover:text-primary">
                {t("products")}
              </Link>
            </li>
            <li>
              <Link to="/favoritos" className="hover:text-primary">
                {t("favorites")}
              </Link>
            </li>
            <li>
              <Link to="/perfil" className="hover:text-primary">
                {t("profile")}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="mb-3 font-display text-sm font-bold uppercase tracking-wide">{t("contacts")}</p>
          <ul className="space-y-2 text-sm opacity-80">
            <li className="flex items-center gap-2">
              <Phone className="size-4 text-primary" />
              <a href={`https://wa.me/${SHOP.phone}`} target="_blank" rel="noreferrer">
                {SHOP.phoneDisplay}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="size-4 text-primary" />
              {lang === "pt" ? SHOP.addressPt : SHOP.addressEn}
            </li>
          </ul>
          <div className="mt-4 flex gap-3">
            <a href={SHOP.social.facebook} target="_blank" rel="noreferrer" aria-label="Facebook">
              <Facebook className="size-5 opacity-70 transition hover:text-primary hover:opacity-100" />
            </a>
            <a href={SHOP.social.instagram} target="_blank" rel="noreferrer" aria-label="Instagram">
              <Instagram className="size-5 opacity-70 transition hover:text-primary hover:opacity-100" />
            </a>
            <a href={SHOP.social.youtube} target="_blank" rel="noreferrer" aria-label="YouTube">
              <Youtube className="size-5 opacity-70 transition hover:text-primary hover:opacity-100" />
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs opacity-60">
        © {new Date().getFullYear()} {SHOP.name}. {t("rights")}
      </div>
    </footer>
  );
}
