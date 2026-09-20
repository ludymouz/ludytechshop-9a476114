import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function guard() {
  const { requireAdmin } = await import("./admin-session.server");
  await requireAdmin();
}

/* ------------------------------------------------------------------ sessão */

export const adminStatus = createServerFn({ method: "GET" }).handler(async () => {
  const { isAdminUnlocked } = await import("./admin-session.server");
  return { unlocked: await isAdminUnlocked() };
});

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ email: z.string(), password: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const { getAdminSession, matches } = await import("./admin-session.server");
    const email = (process.env["ADMIN_EMAIL"] || "ludymouzinho@gmail.com").trim();
    const pass = (process.env["ADMIN_PASSWORD"] || "angola2008**949148512").trim();
    if (
      !matches(data.email.trim().toLowerCase(), email.toLowerCase()) ||
      !matches(data.password.trim(), pass)
    ) {
      return { ok: false as const };
    }
    const session = await getAdminSession();
    await session.update({ unlocked: true });
    return { ok: true as const };
  });

export const adminLogout = createServerFn({ method: "POST" }).handler(async () => {
  const { getAdminSession } = await import("./admin-session.server");
  const session = await getAdminSession();
  await session.clear();
  return { ok: true as const };
});

/* --------------------------------------------------------------- dashboard */

export const adminDashboard = createServerFn({ method: "GET" }).handler(async () => {
  await guard();
  const db = await admin();

  const [pedidosRes, produtosRes, clientesRes] = await Promise.all([
    db.from("pedidos").select("id, numero, nome_cliente, total, estado, criado_em").order("criado_em", { ascending: false }),
    db.from("produtos").select("id, stock"),
    db.from("profiles").select("id"),
  ]);

  const pedidos = pedidosRes.data ?? [];
  const pagos = pedidos.filter((p) => p.estado !== "Cancelado");
  const receita = pagos.reduce((s, p) => s + Number(p.total), 0);

  const byDay = new Map<string, { dia: string; receita: number; pedidos: number }>();
  const hoje = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(hoje.getTime() - i * 86400000);
    const key = d.toISOString().slice(0, 10);
    byDay.set(key, { dia: key.slice(5), receita: 0, pedidos: 0 });
  }
  for (const p of pagos) {
    const key = String(p.criado_em).slice(0, 10);
    const row = byDay.get(key);
    if (row) {
      row.receita += Number(p.total);
      row.pedidos += 1;
    }
  }

  return {
    totalPedidos: pedidos.length,
    pendentes: pedidos.filter((p) => p.estado === "Pendente").length,
    receita,
    clientes: clientesRes.data?.length ?? 0,
    produtos: produtosRes.data?.length ?? 0,
    semStock: (produtosRes.data ?? []).filter((p) => p.stock <= 0).length,
    grafico: [...byDay.values()],
    ultimos: pedidos.slice(0, 8),
  };
});

/* ---------------------------------------------------------------- imagens */

export const adminUploadImage = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ dataUrl: z.string(), filename: z.string() }).parse(d))
  .handler(async ({ data }) => {
    await guard();
    const db = await admin();
    const match = /^data:([^;]+);base64,(.+)$/.exec(data.dataUrl);
    if (!match) throw new Error("Imagem inválida");
    const mime = match[1] ?? "image/jpeg";
    const b64 = match[2];
    const bytes = Buffer.from(b64 ?? "", "base64");
    const ext = (data.filename.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await db.storage.from("loja").upload(path, bytes, { contentType: mime, upsert: false });
    if (error) throw new Error(error.message);
    return { url: `/api/public/img/${path}` };
  });

/* --------------------------------------------------------------- produtos */

export const adminListProdutos = createServerFn({ method: "GET" }).handler(async () => {
  await guard();
  const db = await admin();
  const { data } = await db
    .from("produtos")
    .select("*, categorias(nome)")
    .order("criado_em", { ascending: false });
  return data ?? [];
});

const produtoSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(1),
  descricao: z.string().nullable().default(null),
  preco: z.number().nonnegative(),
  preco_promo: z.number().nullable().default(null),
  em_promocao: z.boolean(),
  stock: z.number().int().nonnegative(),
  imagem_url: z.string().nullable().default(null),
  categoria_id: z.string().nullable().default(null),
  ativo: z.boolean().default(true),
});

export const adminSaveProduto = createServerFn({ method: "POST" })
  .inputValidator((d) => produtoSchema.parse(d))
  .handler(async ({ data }) => {
    await guard();
    const db = await admin();
    const { id, ...fields } = data;
    if (id) {
      const { error } = await db.from("produtos").update(fields).eq("id", id);
      if (error) throw new Error(error.message);
      return { ok: true as const, id };
    }
    const { data: inserted, error } = await db.from("produtos").insert(fields).select("id").single();
    if (error) throw new Error(error.message);
    // Aviso global de novo produto para todos os clientes
    await db.from("notificacoes").insert({
      user_id: null,
      mensagem: `Novo produto disponível: ${fields.nome} 🎉`,
      tipo: "novo_produto",
      link: `/produto/${inserted.id}`,
    });
    return { ok: true as const, id: inserted.id };
  });

export const adminDeleteProduto = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ id: z.string() }).parse(d))
  .handler(async ({ data }) => {
    await guard();
    const db = await admin();
    const { error } = await db.from("produtos").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

/* ------------------------------------------------------------- categorias */

export const adminCreateCategoria = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ nome: z.string().min(1) }).parse(d))
  .handler(async ({ data }) => {
    await guard();
    const db = await admin();
    const slug = data.nome
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const { error } = await db.from("categorias").insert({ nome: data.nome, slug });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const adminDeleteCategoria = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ id: z.string() }).parse(d))
  .handler(async ({ data }) => {
    await guard();
    const db = await admin();
    const { error } = await db.from("categorias").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

/* ----------------------------------------------------------------- pedidos */

export const adminListPedidos = createServerFn({ method: "GET" }).handler(async () => {
  await guard();
  const db = await admin();
  const { data } = await db
    .from("pedidos")
    .select("*, pedido_itens(*)")
    .order("criado_em", { ascending: false });
  return data ?? [];
});

export const adminUpdatePedido = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ id: z.string(), estado: z.string() }).parse(d))
  .handler(async ({ data }) => {
    await guard();
    const db = await admin();
    const { data: pedido, error } = await db
      .from("pedidos")
      .update({ estado: data.estado })
      .eq("id", data.id)
      .select("user_id, numero")
      .single();
    if (error) throw new Error(error.message);
    if (pedido?.user_id) {
      await db.from("notificacoes").insert({
        user_id: pedido.user_id,
        mensagem: `A tua encomenda #${pedido.numero} está agora: ${data.estado}.`,
        tipo: "pedido",
        link: "/perfil",
      });
    }
    return { ok: true as const };
  });

export const adminDeletePedido = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ id: z.string() }).parse(d))
  .handler(async ({ data }) => {
    await guard();
    const db = await admin();
    const { error } = await db.from("pedidos").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

/* ---------------------------------------------------------------- clientes */

export const adminListClientes = createServerFn({ method: "GET" }).handler(async () => {
  await guard();
  const db = await admin();
  const { data } = await db.from("profiles").select("*").order("criado_em", { ascending: false });
  return data ?? [];
});

export const adminDeleteCliente = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ id: z.string() }).parse(d))
  .handler(async ({ data }) => {
    await guard();
    const db = await admin();
    await db.auth.admin.deleteUser(data.id).catch(() => undefined);
    await db.from("profiles").delete().eq("id", data.id);
    return { ok: true as const };
  });

/* ----------------------------------------------------------------- banners */

export const adminListBanners = createServerFn({ method: "GET" }).handler(async () => {
  await guard();
  const db = await admin();
  const { data } = await db.from("banners").select("*").order("ordem");
  return data ?? [];
});

export const adminSaveBanner = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        id: z.string().optional(),
        titulo: z.string().nullable().default(null),
        subtitulo: z.string().nullable().default(null),
        imagem_url: z.string().nullable().default(null),
        link: z.string().nullable().default(null),
        ativo: z.boolean().default(true),
        ordem: z.number().int().default(0),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    await guard();
    const db = await admin();
    const { id, ...fields } = data;
    const { error } = id
      ? await db.from("banners").update(fields).eq("id", id)
      : await db.from("banners").insert(fields);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const adminDeleteBanner = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ id: z.string() }).parse(d))
  .handler(async ({ data }) => {
    await guard();
    const db = await admin();
    const { error } = await db.from("banners").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
