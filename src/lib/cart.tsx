import * as React from "react";

export type CartItem = {
  id: string;
  nome: string;
  preco: number;
  imagem_url: string | null;
  stock: number;
  quantidade: number;
};

type Ctx = {
  items: CartItem[];
  count: number;
  subtotal: number;
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (item: Omit<CartItem, "quantidade">, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const CartContext = React.createContext<Ctx | null>(null);

const KEY = "ludy-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<CartItem[]>([]);
  const [open, setOpen] = React.useState(false);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (hydrated) window.localStorage.setItem(KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const add: Ctx["add"] = React.useCallback((item, qty = 1) => {
    setItems((prev) => {
      const found = prev.find((i) => i.id === item.id);
      if (found) {
        return prev.map((i) =>
          i.id === item.id
            ? { ...i, ...item, quantidade: Math.min(i.quantidade + qty, Math.max(item.stock, 1)) }
            : i,
        );
      }
      return [...prev, { ...item, quantidade: Math.min(qty, Math.max(item.stock, 1)) }];
    });
  }, []);

  const setQty = React.useCallback((id: string, qty: number) => {
    setItems((prev) =>
      prev.flatMap((i) =>
        i.id === id
          ? qty <= 0
            ? []
            : [{ ...i, quantidade: Math.min(qty, Math.max(i.stock, 1)) }]
          : [i],
      ),
    );
  }, []);

  const remove = React.useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clear = React.useCallback(() => setItems([]), []);

  const subtotal = items.reduce((s, i) => s + i.preco * i.quantidade, 0);
  const count = items.reduce((s, i) => s + i.quantidade, 0);

  const value = React.useMemo<Ctx>(
    () => ({ items, count, subtotal, open, setOpen, add, setQty, remove, clear }),
    [items, count, subtotal, open, add, setQty, remove, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = React.useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
