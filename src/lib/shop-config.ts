export const SHOP = {
  name: "Ludy Tech Shop",
  phone: "244949148512",
  phoneDisplay: "+244 949 148 512",
  addressPt: "Uíge, Bairro Dunga, Rua B",
  addressEn: "Uíge, Dunga District, Street B",
  deliveryFee: 600,
  payOpen: "08:00",
  payCloseWeekday: "16:00",
  payCloseWeekend: "14:00",
  social: {
    facebook: "https://facebook.com",
    instagram: "https://instagram.com",
    tiktok: "https://tiktok.com",
    youtube: "https://youtube.com",
  },
} as const;

export const PAYMENT_METHODS = [
  { value: "Dinheiro vivo", labelPt: "Dinheiro vivo", labelEn: "Cash", icon: "💵" },
  { value: "Multicaixa Express", labelPt: "Multicaixa Express", labelEn: "Multicaixa Express", icon: "📱" },
  { value: "Transferência BAI", labelPt: "Transferência BAI", labelEn: "BAI transfer", icon: "🏦" },
  { value: "Transferência BFA", labelPt: "Transferência BFA", labelEn: "BFA transfer", icon: "🏦" },
  { value: "Transferência Atlântico", labelPt: "Transferência Atlântico", labelEn: "Atlântico transfer", icon: "🏦" },
] as const;

export const ORDER_STATES = [
  "Pendente",
  "Confirmado",
  "Em entrega",
  "Entregue",
  "Cancelado",
] as const;

export type OrderState = (typeof ORDER_STATES)[number];

export function formatKz(value: number): string {
  return `${new Intl.NumberFormat("pt-PT", { maximumFractionDigits: 0 }).format(Math.round(value))} Kz`;
}

/** Janela de pagamentos: 08:00–16:00 (14:00 aos fins de semana), hora de Angola (UTC+1). */
export function paymentWindow(now: Date = new Date()) {
  const luanda = new Date(now.getTime() + 60 * 60 * 1000);
  const day = luanda.getUTCDay();
  const weekend = day === 0 || day === 6;
  const minutes = luanda.getUTCHours() * 60 + luanda.getUTCMinutes();
  const openM = 8 * 60;
  const closeM = weekend ? 14 * 60 : 16 * 60;
  return {
    open: minutes >= openM && minutes < closeM,
    opensAt: SHOP.payOpen,
    closesAt: weekend ? SHOP.payCloseWeekend : SHOP.payCloseWeekday,
    minutesUntilOpen: minutes < openM ? openM - minutes : 24 * 60 - minutes + openM,
  };
}

export function effectivePrice(p: { preco: number; preco_promo: number | null; em_promocao: boolean }) {
  return p.em_promocao && p.preco_promo != null && p.preco_promo > 0 ? p.preco_promo : p.preco;
}
