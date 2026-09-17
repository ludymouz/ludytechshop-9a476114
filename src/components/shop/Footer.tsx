import { Banknote, Clock3, Instagram, Mail, MessageCircle, Smartphone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { SHOP } from "@/lib/shop-config";

export function Footer() {
  const { t, lang } = useI18n();
  const whatsappUrl = `https://wa.me/${SHOP.phone}`;

  const contacts = [
    {
      icon: MessageCircle,
      title: "WhatsApp",
      value: SHOP.phoneDisplay,
      description:
        lang === "pt" ? "A forma mais rápida de falar connosco." : "The fastest way to reach us.",
    },
    {
      icon: Smartphone,
      title: "Multicaixa Express",
      value: lang === "pt" ? "Pagamento instantâneo" : "Instant payment",
      description:
        lang === "pt" ? "Paga de forma simples pelo telemóvel." : "Pay easily from your mobile phone.",
    },
    {
      icon: Banknote,
      title: lang === "pt" ? "Transferência Bancária" : "Bank transfer",
      value: "BAI · BFA · Atlântico",
      description:
        lang === "pt" ? "Escolhe o banco mais conveniente." : "Choose the most convenient bank.",
    },
    {
      icon: Clock3,
      title: lang === "pt" ? "Horário de Atendimento" : "Opening hours",
      value: lang === "pt" ? "Seg–Sex · 08h–16h" : "Mon–Fri · 8am–4pm",
      description:
        lang === "pt" ? "Fins de semana: 08h–14h." : "Weekends: 8am–2pm.",
    },
  ];

  return (
    <footer className="mt-20 border-t bg-ink text-ink-foreground">
      <section className="mx-auto max-w-7xl px-4 py-14 sm:py-16">
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase text-primary">{t("contacts")}</p>
          <h2 className="mt-2 font-display text-3xl font-black sm:text-4xl">
            {lang === "pt" ? "Estamos aqui para ajudar" : "We are here to help"}
          </h2>
          <p className="mt-3 text-sm leading-6 text-ink-foreground/65 sm:text-base">
            {lang === "pt"
              ? "Tira dúvidas, confirma pagamentos ou acompanha a tua encomenda com atendimento direto e humano."
              : "Ask questions, confirm payments or track your order with direct, human support."}
          </p>
        </div>

        <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {contacts.map(({ icon: Icon, title, value, description }) => (
            <article key={title} className="rounded-lg border border-ink-foreground/10 bg-ink-foreground/5 p-5">
              <span className="grid size-10 place-items-center rounded-lg bg-primary/15 text-primary">
                <Icon className="size-5" />
              </span>
              <h3 className="mt-5 text-sm font-bold">{title}</h3>
              <p className="mt-1 text-sm font-semibold text-primary">{value}</p>
              <p className="mt-2 text-xs leading-5 text-ink-foreground/55">{description}</p>
            </article>
          ))}
        </div>

        <div className="mt-8 grid gap-6 rounded-lg border border-primary/35 bg-primary/10 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <h3 className="font-display text-2xl font-black">
              {lang === "pt" ? "Pronto para falar connosco?" : "Ready to talk to us?"}
            </h3>
            <p className="mt-2 text-sm text-ink-foreground/65">
              {lang === "pt"
                ? "Abre o WhatsApp e recebe ajuda para comprar ou acompanhar a tua encomenda."
                : "Open WhatsApp for help buying or tracking your order."}
            </p>
          </div>
          <Button asChild size="lg" className="w-full font-bold sm:w-auto">
            <a href={whatsappUrl} target="_blank" rel="noreferrer">
              <MessageCircle className="size-5" /> {lang === "pt" ? "Abrir WhatsApp" : "Open WhatsApp"}
            </a>
          </Button>
        </div>

        <div className="mt-10 hidden items-center justify-between border-t border-ink-foreground/10 pt-6 lg:flex">
          <a href={`mailto:${SHOP.email}`} className="flex items-center gap-2 text-sm text-ink-foreground/65 hover:text-primary">
            <Mail className="size-4" /> {SHOP.email}
          </a>
          <div className="flex items-center gap-4">
            <a href={SHOP.social.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="hover:text-primary">
              <Instagram className="size-5" />
            </a>
            <a href={SHOP.social.tiktok} target="_blank" rel="noreferrer" aria-label="TikTok" className="text-sm font-black hover:text-primary">
              TikTok
            </a>
          </div>
        </div>
      </section>
      <div className="border-t border-ink-foreground/10 px-4 py-5 text-center text-xs text-ink-foreground/50">
        © {new Date().getFullYear()} {SHOP.name}. {t("rights")}
      </div>
    </footer>
  );
}
