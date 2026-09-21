export const SHOP = {
  name: "Ludy Tech Shop",
  email: "ludytechshop@gmail.com",
  phone: "244949148512",
  phoneDisplay: "+244 949 148 512",
  addressPt: "Uíge, Bairro Dunga, Rua B",
  addressEn: "Uíge, Dunga District, Street B",
  deliveryFee: 600,
  payOpen: "08:00",
  payCloseWeekday: "16:00",
  payCloseWeekend: "14:00",
  social: {
    instagram: "https://www.instagram.com/ludytechshop/",
    tiktok: "https://www.tiktok.com/@ludytechshop",
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

/** Nomes que o cliente vê para cada estado da encomenda. */
export const ORDER_STATE_LABELS: Record<string, { pt: string; en: string }> = {
  Pendente: { pt: "Pendente", en: "Pending" },
  Confirmado: { pt: "A preparar", en: "Preparing" },
  "Em entrega": { pt: "A caminho com estafeta", en: "On the way with courier" },
  Entregue: { pt: "Entregue", en: "Delivered" },
  Cancelado: { pt: "Cancelado", en: "Cancelled" },
};

export function orderStateLabel(estado: string, lang: "pt" | "en" = "pt") {
  return ORDER_STATE_LABELS[estado]?.[lang] ?? estado;
}

/** Mensagem pronta a enviar ao cliente pelo WhatsApp quando o estado muda. */
export function whatsappStatusMessage(estado: string, numero: number | string, cliente: string) {
  const saudacao = `Olá ${cliente || "cliente"}, aqui é a ${SHOP.name}.`;
  const corpo: Record<string, string> = {
    Pendente: `Recebemos a tua encomenda #${numero}. Vamos confirmar já de seguida.`,
    Confirmado: `A tua encomenda #${numero} foi confirmada e já está a ser preparada. 📦`,
    "Em entrega": `A tua encomenda #${numero} já vai a caminho com o nosso estafeta. 🛵`,
    Entregue: `A tua encomenda #${numero} foi entregue. Obrigado pela preferência! 🧡`,
    Cancelado: `A tua encomenda #${numero} foi cancelada. Fala connosco se precisares de ajuda.`,
  };
  return `${saudacao}\n\n${corpo[estado] ?? `Estado da encomenda #${numero}: ${estado}.`}`;
}

/** Métodos que exigem comprovativo de pagamento. */
export function requiresProof(metodo: string) {
  return metodo !== "Dinheiro vivo";
}

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
