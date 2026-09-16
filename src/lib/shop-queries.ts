import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ProdutoRow = {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number;
  preco_promo: number | null;
  em_promocao: boolean;
  stock: number;
  imagem_url: string | null;
  imagens: unknown;
  categoria_id: string | null;
  criado_em: string;
};

export const categoriasQuery = queryOptions({
  queryKey: ["categorias"],
  queryFn: async () => {
    const { data, error } = await supabase.from("categorias").select("*").order("ordem");
    if (error) throw error;
    return data;
  },
});

export const bannersQuery = queryOptions({
  queryKey: ["banners"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("banners")
      .select("*")
      .eq("ativo", true)
      .order("ordem");
    if (error) throw error;
    return data;
  },
});

export const produtosQuery = queryOptions({
  queryKey: ["produtos"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("produtos")
      .select("*")
      .eq("ativo", true)
      .order("criado_em", { ascending: false });
    if (error) throw error;
    return (data ?? []) as unknown as ProdutoRow[];
  },
});

export function produtoQuery(id: string) {
  return queryOptions({
    queryKey: ["produto", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("produtos")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as ProdutoRow | null;
    },
  });
}

export function avaliacoesQuery(produtoId: string) {
  return queryOptions({
    queryKey: ["avaliacoes", produtoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("avaliacoes")
        .select("*")
        .eq("produto_id", produtoId)
        .order("criado_em", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export const favoritosQuery = queryOptions({
  queryKey: ["favoritos"],
  queryFn: async () => {
    const { data, error } = await supabase.from("favoritos").select("produto_id");
    if (error) return [] as { produto_id: string }[];
    return data ?? [];
  },
});
