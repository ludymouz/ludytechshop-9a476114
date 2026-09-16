import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Lock, LogOut, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { ORDER_STATES, formatKz } from "@/lib/shop-config";
import {
  adminCreateCategoria,
  adminDashboard,
  adminDeleteBanner,
  adminDeleteCategoria,
  adminDeleteCliente,
  adminDeletePedido,
  adminDeleteProduto,
  adminListBanners,
  adminListClientes,
  adminListPedidos,
  adminListProdutos,
  adminLogin,
  adminLogout,
  adminSaveBanner,
  adminSaveProduto,
  adminStatus,
  adminUpdatePedido,
  adminUploadImage,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Painel de administração — Ludy Tech Shop" },
      { name: "description", content: "Gestão de produtos, pedidos, clientes e banners da loja." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Painel — Ludy Tech Shop" },
      { property: "og:description", content: "Área reservada à administração da loja." },
    ],
  }),
  component: Admin,
});

function toDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Falha a ler a imagem"));
    reader.readAsDataURL(file);
  });
}

function Admin() {
  const status = useServerFn(adminStatus);
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-status"],
    queryFn: () => status(),
  });

  if (isLoading) return <div className="p-10 text-sm text-muted-foreground">A carregar…</div>;
  if (!data?.unlocked) return <AdminLogin onOk={() => refetch()} />;
  return <AdminPanel onLogout={() => refetch()} />;
}

function AdminLogin({ onOk }: { onOk: () => void }) {
  const login = useServerFn(adminLogin);
  const [loading, setLoading] = React.useState(false);

  return (
    <div className="grid min-h-screen place-items-center bg-ink px-4 text-ink-foreground">
      <form
        className="w-full max-w-sm rounded-3xl bg-background p-8 text-foreground shadow-glow"
        onSubmit={async (e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          setLoading(true);
          try {
            const res = await login({
              data: {
                email: String(fd.get("email") ?? ""),
                password: String(fd.get("password") ?? ""),
              },
            });
            if (!res.ok) throw new Error("Credenciais inválidas.");
            toast.success("Sessão de administração iniciada.");
            onOk();
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Erro");
          } finally {
            setLoading(false);
          }
        }}
      >
        <div className="mb-6 flex items-center gap-2">
          <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Lock className="size-5" />
          </span>
          <div>
            <p className="font-display text-lg font-black">Painel Ludy</p>
            <p className="text-xs text-muted-foreground">Área reservada</p>
          </div>
        </div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required className="mb-4 mt-1.5" />
        <Label htmlFor="password">Palavra-passe</Label>
        <Input id="password" name="password" type="password" required className="mt-1.5" />
        <Button type="submit" className="mt-6 w-full font-semibold" disabled={loading}>
          Entrar
        </Button>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          <Link to="/" className="hover:text-primary">
            Voltar à loja
          </Link>
        </p>
      </form>
    </div>
  );
}

function AdminPanel({ onLogout }: { onLogout: () => void }) {
  const logout = useServerFn(adminLogout);

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="sticky top-0 z-30 border-b bg-background">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4">
          <span className="grid size-9 place-items-center rounded-xl bg-primary font-display font-black text-primary-foreground">
            L
          </span>
          <p className="font-display text-lg font-black">
            Painel <span className="text-primary">Ludy Tech</span>
          </p>
          <div className="ml-auto flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/">Ver loja</Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                await logout();
                onLogout();
              }}
            >
              <LogOut className="size-4" /> Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <Tabs defaultValue="dash">
          <TabsList className="flex-wrap">
            <TabsTrigger value="dash">Dashboard</TabsTrigger>
            <TabsTrigger value="produtos">Produtos</TabsTrigger>
            <TabsTrigger value="categorias">Categorias</TabsTrigger>
            <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
            <TabsTrigger value="clientes">Clientes</TabsTrigger>
            <TabsTrigger value="banners">Banners</TabsTrigger>
          </TabsList>

          <TabsContent value="dash" className="mt-6">
            <Dashboard />
          </TabsContent>
          <TabsContent value="produtos" className="mt-6">
            <Produtos />
          </TabsContent>
          <TabsContent value="categorias" className="mt-6">
            <Categorias />
          </TabsContent>
          <TabsContent value="pedidos" className="mt-6">
            <Pedidos />
          </TabsContent>
          <TabsContent value="clientes" className="mt-6">
            <Clientes />
          </TabsContent>
          <TabsContent value="banners" className="mt-6">
            <Banners />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function Card({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border bg-background p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-2xl font-black">{value}</p>
    </div>
  );
}

function Dashboard() {
  const fn = useServerFn(adminDashboard);
  const { data } = useQuery({ queryKey: ["admin-dash"], queryFn: () => fn() });
  if (!data) return <p className="text-sm text-muted-foreground">A carregar…</p>;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card label="Receita" value={formatKz(data.receita)} />
        <Card label="Pedidos" value={data.totalPedidos} />
        <Card label="Pendentes" value={data.pendentes} />
        <Card label="Clientes" value={data.clientes} />
        <Card label="Produtos" value={data.produtos} />
        <Card label="Sem stock" value={data.semStock} />
      </div>

      <div className="rounded-2xl border bg-background p-5">
        <p className="mb-4 font-display font-bold">Receita dos últimos 30 dias</p>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.grafico}>
              <defs>
                <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="dia" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis fontSize={11} tickLine={false} axisLine={false} width={60} />
              <Tooltip formatter={(v: number) => formatKz(Number(v))} />
              <Area
                type="monotone"
                dataKey="receita"
                stroke="var(--color-primary)"
                strokeWidth={2}
                fill="url(#g)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border bg-background p-5">
        <p className="mb-4 font-display font-bold">Últimos pedidos</p>
        <ul className="divide-y text-sm">
          {data.ultimos.length === 0 && <li className="py-3 text-muted-foreground">Sem pedidos.</li>}
          {data.ultimos.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center gap-3 py-3">
              <span className="font-semibold">#{p.numero}</span>
              <span className="text-muted-foreground">{p.nome_cliente}</span>
              <Badge variant="outline">{p.estado}</Badge>
              <span className="ml-auto font-semibold text-primary">{formatKz(Number(p.total))}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

type ProdutoForm = {
  id?: string;
  nome: string;
  descricao: string;
  preco: string;
  preco_promo: string;
  em_promocao: boolean;
  stock: string;
  imagem_url: string;
  categoria_id: string;
  ativo: boolean;
};

const vazio: ProdutoForm = {
  nome: "",
  descricao: "",
  preco: "",
  preco_promo: "",
  em_promocao: false,
  stock: "0",
  imagem_url: "",
  categoria_id: "",
  ativo: true,
};

function Produtos() {
  const qc = useQueryClient();
  const listar = useServerFn(adminListProdutos);
  const guardar = useServerFn(adminSaveProduto);
  const apagar = useServerFn(adminDeleteProduto);
  const upload = useServerFn(adminUploadImage);

  const { data: produtos } = useQuery({ queryKey: ["admin-produtos"], queryFn: () => listar() });
  const { data: categorias } = useQuery({
    queryKey: ["categorias"],
    queryFn: async () => (await supabase.from("categorias").select("*").order("ordem")).data ?? [],
  });

  const [form, setForm] = React.useState<ProdutoForm>(vazio);
  const [saving, setSaving] = React.useState(false);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin-produtos"] });
    qc.invalidateQueries({ queryKey: ["produtos"] });
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await guardar({
        data: {
          ...(form.id ? { id: form.id } : {}),
          nome: form.nome,
          descricao: form.descricao || null,
          preco: Number(form.preco) || 0,
          preco_promo: form.preco_promo ? Number(form.preco_promo) : null,
          em_promocao: form.em_promocao,
          stock: Number(form.stock) || 0,
          imagem_url: form.imagem_url || null,
          categoria_id: form.categoria_id || null,
          ativo: form.ativo,
        },
      });
      toast.success(form.id ? "Produto actualizado." : "Produto criado.");
      setForm(vazio);
      invalidate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <form onSubmit={submit} className="space-y-4 rounded-2xl border bg-background p-5">
        <p className="font-display font-bold">{form.id ? "Editar produto" : "Novo produto"}</p>

        <div>
          <Label htmlFor="nome">Nome</Label>
          <Input
            id="nome"
            required
            className="mt-1.5"
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="descricao">Descrição</Label>
          <Textarea
            id="descricao"
            rows={3}
            className="mt-1.5"
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="preco">Preço (Kz)</Label>
            <Input
              id="preco"
              type="number"
              min={0}
              required
              className="mt-1.5"
              value={form.preco}
              onChange={(e) => setForm({ ...form, preco: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="stock">Stock</Label>
            <Input
              id="stock"
              type="number"
              min={0}
              className="mt-1.5"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
            />
          </div>
        </div>
        <div className="flex items-center justify-between rounded-xl border p-3">
          <Label htmlFor="promo">Em promoção</Label>
          <Switch
            id="promo"
            checked={form.em_promocao}
            onCheckedChange={(v) => setForm({ ...form, em_promocao: v })}
          />
        </div>
        {form.em_promocao && (
          <div>
            <Label htmlFor="preco_promo">Preço promocional (Kz)</Label>
            <Input
              id="preco_promo"
              type="number"
              min={0}
              className="mt-1.5"
              value={form.preco_promo}
              onChange={(e) => setForm({ ...form, preco_promo: e.target.value })}
            />
          </div>
        )}
        <div>
          <Label>Categoria</Label>
          <Select
            value={form.categoria_id || undefined}
            onValueChange={(v) => setForm({ ...form, categoria_id: v })}
          >
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Escolher categoria" />
            </SelectTrigger>
            <SelectContent>
              {(categorias ?? []).map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="foto">Fotografia</Label>
          <Input
            id="foto"
            type="file"
            accept="image/*"
            className="mt-1.5"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              try {
                const dataUrl = await toDataUrl(file);
                const res = await upload({ data: { dataUrl, filename: file.name } });
                setForm((f) => ({ ...f, imagem_url: res.url }));
                toast.success("Imagem carregada.");
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Erro no upload");
              }
            }}
          />
          {form.imagem_url && (
            <img src={form.imagem_url} alt="" className="mt-3 size-24 rounded-xl object-cover" />
          )}
        </div>
        <div className="flex items-center justify-between rounded-xl border p-3">
          <Label htmlFor="ativo">Visível na loja</Label>
          <Switch
            id="ativo"
            checked={form.ativo}
            onCheckedChange={(v) => setForm({ ...form, ativo: v })}
          />
        </div>

        <div className="flex gap-2">
          <Button type="submit" className="flex-1 font-semibold" disabled={saving}>
            {form.id ? "Guardar" : "Criar produto"}
          </Button>
          {form.id && (
            <Button type="button" variant="outline" onClick={() => setForm(vazio)}>
              Cancelar
            </Button>
          )}
        </div>
      </form>

      <div className="rounded-2xl border bg-background p-5">
        <p className="mb-4 font-display font-bold">Produtos ({(produtos ?? []).length})</p>
        <ul className="divide-y">
          {(produtos ?? []).length === 0 && (
            <li className="py-6 text-sm text-muted-foreground">Ainda não há produtos.</li>
          )}
          {(produtos ?? []).map((p) => (
            <li key={p.id} className="flex items-center gap-3 py-3">
              <div className="size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                {p.imagem_url && <img src={p.imagem_url} alt="" className="size-full object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{p.nome}</p>
                <p className="text-xs text-muted-foreground">
                  {formatKz(Number(p.preco))} · stock {p.stock}
                  {p.em_promocao ? " · promoção" : ""}
                  {p.ativo ? "" : " · oculto"}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setForm({
                    id: p.id,
                    nome: p.nome,
                    descricao: p.descricao ?? "",
                    preco: String(p.preco),
                    preco_promo: p.preco_promo != null ? String(p.preco_promo) : "",
                    em_promocao: p.em_promocao,
                    stock: String(p.stock),
                    imagem_url: p.imagem_url ?? "",
                    categoria_id: p.categoria_id ?? "",
                    ativo: p.ativo,
                  })
                }
              >
                Editar
              </Button>
              <Button
                size="icon"
                variant="ghost"
                aria-label="Apagar"
                onClick={async () => {
                  if (!confirm(`Apagar "${p.nome}"?`)) return;
                  await apagar({ data: { id: p.id } });
                  invalidate();
                }}
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Categorias() {
  const qc = useQueryClient();
  const criar = useServerFn(adminCreateCategoria);
  const apagar = useServerFn(adminDeleteCategoria);
  const [nome, setNome] = React.useState("");

  const { data } = useQuery({
    queryKey: ["categorias"],
    queryFn: async () => (await supabase.from("categorias").select("*").order("ordem")).data ?? [],
  });

  return (
    <div className="max-w-xl rounded-2xl border bg-background p-5">
      <form
        className="flex gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!nome.trim()) return;
          await criar({ data: { nome: nome.trim() } });
          setNome("");
          qc.invalidateQueries({ queryKey: ["categorias"] });
        }}
      >
        <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nova categoria" />
        <Button type="submit">
          <Plus className="size-4" /> Adicionar
        </Button>
      </form>

      <ul className="mt-5 divide-y">
        {(data ?? []).map((c) => (
          <li key={c.id} className="flex items-center gap-3 py-3 text-sm">
            <span className="font-semibold">{c.nome}</span>
            <span className="text-xs text-muted-foreground">/{c.slug}</span>
            <Button
              size="icon"
              variant="ghost"
              className="ml-auto"
              aria-label="Apagar"
              onClick={async () => {
                if (!confirm(`Apagar categoria "${c.nome}"?`)) return;
                await apagar({ data: { id: c.id } });
                qc.invalidateQueries({ queryKey: ["categorias"] });
              }}
            >
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Pedidos() {
  const qc = useQueryClient();
  const listar = useServerFn(adminListPedidos);
  const actualizar = useServerFn(adminUpdatePedido);
  const apagar = useServerFn(adminDeletePedido);
  const { data } = useQuery({ queryKey: ["admin-pedidos"], queryFn: () => listar() });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin-pedidos"] });
    qc.invalidateQueries({ queryKey: ["admin-dash"] });
  };

  return (
    <div className="space-y-4">
      {(data ?? []).length === 0 && (
        <p className="rounded-2xl border border-dashed bg-background p-12 text-center text-sm text-muted-foreground">
          Ainda não há pedidos.
        </p>
      )}
      {(data ?? []).map((p) => (
        <article key={p.id} className="rounded-2xl border bg-background p-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-display font-bold">#{p.numero}</span>
            <span className="text-sm">{p.nome_cliente}</span>
            {p.telefone && <span className="text-xs text-muted-foreground">{p.telefone}</span>}
            <span className="text-xs text-muted-foreground">
              {new Date(p.criado_em).toLocaleString("pt-PT")}
            </span>
            <span className="ml-auto font-display font-bold text-primary">
              {formatKz(Number(p.total))}
            </span>
          </div>

          <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
            {(p.pedido_itens ?? []).map((i) => (
              <li key={i.id}>
                {i.quantidade}× {i.nome} — {formatKz(Number(i.preco) * i.quantidade)}
              </li>
            ))}
          </ul>

          <p className="mt-3 text-xs text-muted-foreground">
            {p.metodo_pag} · {p.tipo_entrega} {p.morada ? `· ${p.morada}` : ""}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <div className="w-48">
              <Select
                value={p.estado}
                onValueChange={async (v) => {
                  await actualizar({ data: { id: p.id, estado: v } });
                  toast.success(`Pedido #${p.numero}: ${v}`);
                  invalidate();
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ORDER_STATES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={async () => {
                if (!confirm(`Apagar pedido #${p.numero}?`)) return;
                await apagar({ data: { id: p.id } });
                invalidate();
              }}
            >
              <Trash2 className="size-4 text-destructive" /> Apagar
            </Button>
          </div>
        </article>
      ))}
    </div>
  );
}

function Clientes() {
  const qc = useQueryClient();
  const listar = useServerFn(adminListClientes);
  const apagar = useServerFn(adminDeleteCliente);
  const { data } = useQuery({ queryKey: ["admin-clientes"], queryFn: () => listar() });

  return (
    <div className="rounded-2xl border bg-background p-5">
      <ul className="divide-y">
        {(data ?? []).length === 0 && (
          <li className="py-6 text-sm text-muted-foreground">Ainda não há clientes registados.</li>
        )}
        {(data ?? []).map((c) => (
          <li key={c.id} className="flex flex-wrap items-center gap-3 py-3 text-sm">
            <span className="font-semibold">{c.nome_completo || c.username || "Cliente"}</span>
            <span className="text-muted-foreground">{c.email}</span>
            {c.telefone && <span className="text-xs text-muted-foreground">{c.telefone}</span>}
            <Button
              size="icon"
              variant="ghost"
              className="ml-auto"
              aria-label="Apagar"
              onClick={async () => {
                if (!confirm("Apagar este cliente?")) return;
                await apagar({ data: { id: c.id } });
                qc.invalidateQueries({ queryKey: ["admin-clientes"] });
              }}
            >
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Banners() {
  const qc = useQueryClient();
  const listar = useServerFn(adminListBanners);
  const guardar = useServerFn(adminSaveBanner);
  const apagar = useServerFn(adminDeleteBanner);
  const upload = useServerFn(adminUploadImage);
  const { data } = useQuery({ queryKey: ["admin-banners"], queryFn: () => listar() });

  const [titulo, setTitulo] = React.useState("");
  const [subtitulo, setSubtitulo] = React.useState("");
  const [imagem, setImagem] = React.useState("");

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin-banners"] });
    qc.invalidateQueries({ queryKey: ["banners"] });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <form
        className="space-y-4 rounded-2xl border bg-background p-5"
        onSubmit={async (e) => {
          e.preventDefault();
          await guardar({
            data: { titulo, subtitulo, imagem_url: imagem || null, ativo: true, ordem: 0 },
          });
          setTitulo("");
          setSubtitulo("");
          setImagem("");
          invalidate();
          toast.success("Banner criado.");
        }}
      >
        <p className="font-display font-bold">Novo banner</p>
        <div>
          <Label htmlFor="btitulo">Título</Label>
          <Input
            id="btitulo"
            required
            className="mt-1.5"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="bsub">Subtítulo</Label>
          <Input
            id="bsub"
            className="mt-1.5"
            value={subtitulo}
            onChange={(e) => setSubtitulo(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="bimg">Imagem</Label>
          <Input
            id="bimg"
            type="file"
            accept="image/*"
            className="mt-1.5"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const dataUrl = await toDataUrl(file);
              const res = await upload({ data: { dataUrl, filename: file.name } });
              setImagem(res.url);
            }}
          />
          {imagem && <img src={imagem} alt="" className="mt-3 h-24 w-full rounded-xl object-cover" />}
        </div>
        <Button type="submit" className="w-full font-semibold">
          Criar banner
        </Button>
      </form>

      <div className="rounded-2xl border bg-background p-5">
        <p className="mb-4 font-display font-bold">Banners</p>
        <ul className="space-y-3">
          {(data ?? []).map((b) => (
            <li key={b.id} className="flex items-center gap-3 rounded-xl border p-3">
              <div className="h-14 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                {b.imagem_url && <img src={b.imagem_url} alt="" className="size-full object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{b.titulo}</p>
                <p className="truncate text-xs text-muted-foreground">{b.subtitulo}</p>
              </div>
              <Switch
                checked={b.ativo}
                onCheckedChange={async (v) => {
                  await guardar({ data: { id: b.id, ativo: v, ordem: b.ordem } });
                  invalidate();
                }}
              />
              <Button
                size="icon"
                variant="ghost"
                aria-label="Apagar"
                onClick={async () => {
                  if (!confirm("Apagar banner?")) return;
                  await apagar({ data: { id: b.id } });
                  invalidate();
                }}
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
