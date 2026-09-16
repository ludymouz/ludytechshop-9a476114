import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const schema = z.object({
  itens: z
    .array(z.object({ produto_id: z.string(), quantidade: z.number().int().positive() }))
    .min(1),
  metodo_pag: z.string().min(1),
  tipo_entrega: z.enum(["entrega", "levantamento"]),
  nome_cliente: z.string().min(1),
  telefone: z.string().optional().nullable(),
  morada: z.string().optional().nullable(),
});

const TAXA_ENTREGA = 600;

export const criarPedido = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => schema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const db = supabaseAdmin;

    const ids = data.itens.map((i) => i.produto_id);
    const { data: produtos, error: prodErr } = await db
      .from("produtos")
      .select("id, nome, preco, preco_promo, em_promocao, stock")
      .in("id", ids);
    if (prodErr) throw new Error(prodErr.message);
    if (!produtos || produtos.length !== ids.length) throw new Error("Produto indisponível.");

    let subtotal = 0;
    const itens = data.itens.map((item) => {
      const p = produtos.find((x) => x.id === item.produto_id)!;
      if (p.stock < item.quantidade) throw new Error(`Stock insuficiente para ${p.nome}.`);
      const preco =
        p.em_promocao && p.preco_promo != null && Number(p.preco_promo) > 0
          ? Number(p.preco_promo)
          : Number(p.preco);
      subtotal += preco * item.quantidade;
      return { produto_id: p.id, nome: p.nome, preco, quantidade: item.quantidade, stock: p.stock };
    });

    const taxa = data.tipo_entrega === "entrega" ? TAXA_ENTREGA : 0;
    const total = subtotal + taxa;

    const { data: pedido, error } = await db
      .from("pedidos")
      .insert({
        user_id: context.userId,
        nome_cliente: data.nome_cliente,
        telefone: data.telefone ?? null,
        morada: data.morada ?? null,
        subtotal,
        taxa_entrega: taxa,
        total,
        metodo_pag: data.metodo_pag,
        tipo_entrega: data.tipo_entrega,
      })
      .select("id, numero")
      .single();
    if (error) throw new Error(error.message);

    await db.from("pedido_itens").insert(
      itens.map((i) => ({
        pedido_id: pedido.id,
        produto_id: i.produto_id,
        nome: i.nome,
        preco: i.preco,
        quantidade: i.quantidade,
      })),
    );

    for (const i of itens) {
      await db
        .from("produtos")
        .update({ stock: Math.max(i.stock - i.quantidade, 0) })
        .eq("id", i.produto_id);
    }

    await db.from("notificacoes").insert({
      user_id: context.userId,
      mensagem: `Encomenda #${pedido.numero} recebida. Estado: Pendente.`,
      tipo: "pedido",
      link: "/perfil",
    });

    return { id: pedido.id, numero: pedido.numero, subtotal, taxa, total };
  });
