import type { ReactNode } from "react";
import { MessageCircle } from "lucide-react";

import { SHOP } from "@/lib/shop-config";
import { Header } from "./Header";
import { Footer } from "./Footer";

export function ShopLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <a
        href={`https://wa.me/${SHOP.phone}`}
        target="_blank"
        rel="noreferrer"
        aria-label="WhatsApp"
        className="fixed bottom-5 right-5 z-30 grid size-13 place-items-center rounded-full bg-primary text-primary-foreground shadow-glow transition hover:scale-105"
        style={{ width: "3.25rem", height: "3.25rem" }}
      >
        <MessageCircle className="size-6" />
      </a>
    </div>
  );
}
