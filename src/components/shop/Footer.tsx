import { Link } from "@tanstack/react-router";

import { useI18n } from "@/lib/i18n";
import { SHOP } from "@/lib/shop-config";

export function Footer() {
  const { lang } = useI18n();

  return (
    <footer className="mt-16 border-t">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-2 gap-y-1 px-4 py-6 text-center text-xs text-muted-foreground">
        <span>
          © {new Date().getFullYear()} {SHOP.name}
        </span>
        <span aria-hidden>—</span>
        <Link to="/contacto" className="font-semibold text-foreground hover:text-primary">
          {lang === "pt" ? "Contactos & Atendimento" : "Contacts & Support"}
        </Link>
      </div>
    </footer>
  );
}
