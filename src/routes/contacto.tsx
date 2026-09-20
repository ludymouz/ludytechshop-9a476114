import { createFileRoute } from "@tanstack/react-router";
import {
  Banknote,
  Clock3,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Smartphone,
  Truck,
} from "lucide-react";

import { ShopLayout } from "@/components/shop/ShopLayout";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { SHOP } from "@/lib/shop-config";

export const Route = createFileRoute("/contacto")({
  head: () => ({
    meta: [
      { title: "Contactos & Atendimento — Ludy Tech Shop" },
      {
        name: "description",
        content:
          "Fala com a Ludy Tech Shop pelo WhatsApp +244 949 148 512 ou email ludytechshop@gmail.com. Pagamentos em Kwanzas, Multicaixa Express, transferência bancária, entrega e levantamento.",
      },
      { property: "og:title", content: "Contactos & Atendimento — Ludy Tech Shop" },
      {
        property: "og:description",
        content: "WhatsApp, email, redes sociais, pagamentos e horário de atendimento da Ludy Tech Shop.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactoPage,
});

function ContactoPage() {
  const { lang } = useI18n();
  const pt = lang === "pt";
  const whatsappUrl = `https://wa.me/${SHOP.phone}`;

  const cards = [
    {
      icon: MessageCircle,
      title: "WhatsApp",
      value: SHOP.phoneDisplay,
      description: pt ? "A forma mais rápida de falar connosco." : "The fastest way to reach us.",
      href: whatsappUrl,
      action: pt ? "Abrir conversa" : "Open chat",
    },
    {
      icon: Mail,
      title: "Email",
      value: SHOP.email,
      description: pt ? "Para pedidos, parcerias e apoio." : "For orders, partnerships and support.",
      href: `mailto:${SHOP.email}`,
      action: pt ? "Enviar email" : "Send email",
    },
    {
      icon: Instagram,
      title: pt ? "Redes sociais" : "Social media",
      value: "@ludytechshop",
      description: pt ? "Novidades e promoções em primeira mão." : "News and deals first hand.",
      href: SHOP.social.instagram,
      action: "Instagram",
      secondary: { href: SHOP.social.tiktok, label: "TikTok" },
    },
    {
      icon: Smartphone,
      title: "Multicaixa Express",
      value: pt ? "Pagamento instantâneo" : "Instant payment",
      description: pt
        ? "Paga em Kwanzas (Kz) diretamente pelo telemóvel."
        : "Pay in Kwanzas (Kz) straight from your phone.",
    },
    {
      icon: Banknote,
      title: pt ? "Transferência bancária" : "Bank transfer",
      value: "BAI · BFA · Atlântico",
      description: pt
        ? "Envia o comprovativo pelo WhatsApp para confirmarmos."
        : "Send the receipt on WhatsApp so we can confirm.",
    },
    {
      icon: Truck,
      title: pt ? "Entrega e levantamento" : "Delivery and pickup",
      value: pt ? "Luanda e todo o Angola" : "Luanda and all Angola",
      description: pt
        ? `Entrega ao domicílio com taxa a partir de ${SHOP.deliveryFee} Kz ou levantamento gratuito.`
        : `Home delivery from ${SHOP.deliveryFee} Kz or free pickup.`,
    },
  ];

  return (
    <ShopLayout>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:py-16">
        <p className="text-sm font-bold uppercase tracking-wide text-primary">
          {pt ? "Contactos" : "Contacts"}
        </p>
        <h1 className="mt-2 max-w-2xl font-display text-3xl font-black sm:text-5xl">
          {pt ? "Estamos aqui para ajudar" : "We are here to help"}
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
          {pt
            ? "Tira dúvidas, confirma pagamentos ou acompanha a tua encomenda com atendimento direto e humano."
            : "Ask questions, confirm payments or track your order with direct, human support."}
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map(({ icon: Icon, title, value, description, href, action, secondary }) => (
            <article key={title} className="flex flex-col rounded-xl border bg-card p-6 shadow-sm">
              <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                <Icon className="size-5" />
              </span>
              <h2 className="mt-5 text-base font-bold">{title}</h2>
              <p className="mt-1 text-sm font-semibold text-primary">{value}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
              {href && (
                <div className="mt-5 flex flex-wrap gap-2">
                  <Button asChild size="sm" variant="outline" className="font-semibold">
                    <a href={href} target="_blank" rel="noreferrer">
                      {action}
                    </a>
                  </Button>
                  {secondary && (
                    <Button asChild size="sm" variant="ghost" className="font-semibold">
                      <a href={secondary.href} target="_blank" rel="noreferrer">
                        {secondary.label}
                      </a>
                    </Button>
                  )}
                </div>
              )}
            </article>
          ))}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <article className="rounded-xl border bg-card p-6">
            <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
              <Clock3 className="size-5" />
            </span>
            <h2 className="mt-5 text-base font-bold">
              {pt ? "Horário de atendimento" : "Opening hours"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {pt ? "Segunda a sexta" : "Monday to Friday"}:{" "}
              <span className="font-semibold text-foreground">
                {SHOP.payOpen} – {SHOP.payCloseWeekday}
              </span>
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {pt ? "Fins de semana" : "Weekends"}:{" "}
              <span className="font-semibold text-foreground">
                {SHOP.payOpen} – {SHOP.payCloseWeekend}
              </span>
            </p>
          </article>

          <article className="rounded-xl border bg-card p-6">
            <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
              <MapPin className="size-5" />
            </span>
            <h2 className="mt-5 text-base font-bold">{pt ? "Onde estamos" : "Where we are"}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{pt ? SHOP.addressPt : SHOP.addressEn}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {pt ? "Preços sempre em Kwanzas (Kz)." : "Prices always in Kwanzas (Kz)."}
            </p>
          </article>
        </div>

        <div className="mt-8 grid gap-6 rounded-xl border border-primary/30 bg-primary/10 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <h2 className="font-display text-2xl font-black">
              {pt ? "Pronto para falar connosco?" : "Ready to talk to us?"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {pt
                ? "Abre o WhatsApp e recebe ajuda para comprar ou acompanhar a tua encomenda."
                : "Open WhatsApp for help buying or tracking your order."}
            </p>
          </div>
          <Button asChild size="lg" className="w-full font-bold sm:w-auto">
            <a href={whatsappUrl} target="_blank" rel="noreferrer">
              <MessageCircle className="size-5" /> {pt ? "Abrir WhatsApp" : "Open WhatsApp"}
            </a>
          </Button>
        </div>
      </div>
    </ShopLayout>
  );
}
