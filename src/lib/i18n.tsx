import * as React from "react";

export type Lang = "pt" | "en";

const dict = {
  pt: {
    shop: "Loja",
    home: "Início",
    products: "Produtos",
    categories: "Categorias",
    all: "Todos",
    search_ph: "Pesquisar produtos...",
    search: "Pesquisar",
    cart: "Carrinho",
    empty_cart: "O carrinho está vazio.",
    add_cart: "Adicionar ao carrinho",
    buy_now: "Comprar agora",
    subtotal: "Subtotal",
    total: "Total",
    del_fee: "Taxa de entrega",
    del_warn:
      "As entregas podem não estar disponíveis para todos os bairros do Uíge. Confirmaremos após o pedido.",
    delivery: "Entrega",
    pickup: "Levantamento",
    delivery_type: "Tipo de entrega",
    free: "Grátis",
    pay_method: "Método de pagamento",
    checkout: "Finalizar pedido no WhatsApp",
    pay_closed: "Pagamentos encerrados. Abre às",
    promo: "Promoção",
    out_of_stock: "Esgotado",
    in_stock: "em stock",
    stock: "Stock",
    description: "Descrição",
    reviews: "Avaliações",
    no_reviews: "Ainda não há avaliações.",
    write_review: "Escrever avaliação",
    your_comment: "O teu comentário",
    send: "Enviar",
    login: "Entrar",
    logout: "Sair",
    register: "Criar conta",
    account: "Conta",
    profile: "Perfil",
    favorites: "Favoritos",
    my_orders: "As minhas encomendas",
    notifications: "Notificações",
    no_notifications: "Sem notificações.",
    mark_all_read: "Marcar tudo como lido",
    order: "Encomenda",
    orders: "Encomendas",
    state: "Estado",
    date: "Data",
    no_orders: "Ainda não fizeste encomendas.",
    no_favorites: "Ainda não tens favoritos.",
    save: "Guardar",
    full_name: "Nome completo",
    username: "Nome de utilizador",
    email: "Email",
    phone: "Telefone",
    address: "Morada",
    gender: "Género",
    age: "Idade",
    password: "Palavra-passe",
    need_login: "Inicia sessão para continuar.",
    rights: "Todos os direitos reservados.",
    contacts: "Contactos",
    links: "Links",
    featured: "Em destaque",
    newest: "Mais recentes",
    cheapest: "Preço mais baixo",
    priciest: "Preço mais alto",
    sort: "Ordenar",
    no_products: "Nenhum produto encontrado.",
    back: "Voltar",
    qty: "Qtd",
    remove: "Remover",
    view: "Ver",
    help: "Precisas de ajuda?",
    talk_whatsapp: "Falar no WhatsApp",
  },
  en: {
    shop: "Shop",
    home: "Home",
    products: "Products",
    categories: "Categories",
    all: "All",
    search_ph: "Search products...",
    search: "Search",
    cart: "Cart",
    empty_cart: "Your cart is empty.",
    add_cart: "Add to cart",
    buy_now: "Buy now",
    subtotal: "Subtotal",
    total: "Total",
    del_fee: "Delivery fee",
    del_warn:
      "Deliveries may not be available for all districts of Uíge. We will confirm after the order.",
    delivery: "Delivery",
    pickup: "Pickup",
    delivery_type: "Delivery type",
    free: "Free",
    pay_method: "Payment method",
    checkout: "Place order on WhatsApp",
    pay_closed: "Payments closed. Opens at",
    promo: "Sale",
    out_of_stock: "Out of stock",
    in_stock: "in stock",
    stock: "Stock",
    description: "Description",
    reviews: "Reviews",
    no_reviews: "No reviews yet.",
    write_review: "Write a review",
    your_comment: "Your comment",
    send: "Send",
    login: "Sign in",
    logout: "Sign out",
    register: "Create account",
    account: "Account",
    profile: "Profile",
    favorites: "Wishlist",
    my_orders: "My orders",
    notifications: "Notifications",
    no_notifications: "No notifications.",
    mark_all_read: "Mark all as read",
    order: "Order",
    orders: "Orders",
    state: "Status",
    date: "Date",
    no_orders: "You have no orders yet.",
    no_favorites: "No favorites yet.",
    save: "Save",
    full_name: "Full name",
    username: "Username",
    email: "Email",
    phone: "Phone",
    address: "Address",
    gender: "Gender",
    age: "Age",
    password: "Password",
    need_login: "Sign in to continue.",
    rights: "All rights reserved.",
    contacts: "Contacts",
    links: "Links",
    featured: "Featured",
    newest: "Newest",
    cheapest: "Lowest price",
    priciest: "Highest price",
    sort: "Sort",
    no_products: "No products found.",
    back: "Back",
    qty: "Qty",
    remove: "Remove",
    view: "View",
    help: "Need help?",
    talk_whatsapp: "Chat on WhatsApp",
  },
} as const;

export type TKey = keyof (typeof dict)["pt"];

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: TKey) => string };

const LangContext = React.createContext<Ctx>({ lang: "pt", setLang: () => {}, t: (k) => dict.pt[k] });

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = React.useState<Lang>("pt");

  React.useEffect(() => {
    const stored = window.localStorage.getItem("ludy-lang");
    if (stored === "pt" || stored === "en") setLangState(stored);
  }, []);

  const setLang = React.useCallback((l: Lang) => {
    setLangState(l);
    window.localStorage.setItem("ludy-lang", l);
  }, []);

  const value = React.useMemo<Ctx>(
    () => ({ lang, setLang, t: (k: TKey) => dict[lang][k] }),
    [lang, setLang],
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useI18n() {
  return React.useContext(LangContext);
}
