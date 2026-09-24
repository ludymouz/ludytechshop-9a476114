import logoAsset from "@/assets/ludy-tech-logo.png.asset.json";
import { SHOP, formatKz, orderStateLabel } from "@/lib/shop-config";

export type ReceiptOrder = {
  numero: number | string;
  criado_em?: string | null;
  nome_cliente?: string | null;
  telefone?: string | null;
  morada?: string | null;
  localizacao_url?: string | null;
  metodo_pag?: string | null;
  tipo_entrega?: string | null;
  estado?: string | null;
  subtotal: number | string;
  taxa_entrega: number | string;
  total: number | string;
  itens: { nome: string; quantidade: number; preco: number | string }[];
};

const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Abre o recibo numa janela própria, pronto a imprimir ou gravar em PDF. */
export function printReceipt(o: ReceiptOrder) {
  const w = window.open("", "_blank", "width=800,height=900");
  if (!w) return;
  const logo = new URL(logoAsset.url, window.location.origin).href;
  const data = new Date(o.criado_em ?? Date.now()).toLocaleString("pt-PT");
  const linhas = o.itens
    .map(
      (i) =>
        `<tr><td>${esc(i.nome)}</td><td class="c">${i.quantidade}</td><td class="r">${formatKz(Number(i.preco))}</td><td class="r">${formatKz(Number(i.preco) * i.quantidade)}</td></tr>`,
    )
    .join("");
  w.document.write(`<!doctype html><html lang="pt"><head><meta charset="utf-8"><title>Recibo #${esc(o.numero)} — ${SHOP.name}</title>
<style>
*{box-sizing:border-box}body{font-family:system-ui,Arial,sans-serif;color:#111;margin:0;padding:32px;max-width:780px;margin:auto}
header{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #FF5A1F;padding-bottom:16px}
.brand{display:flex;gap:12px;align-items:center}.brand img{width:56px;height:56px}.brand h1{margin:0;font-size:22px}
small,.muted{color:#555;font-size:12px}h2{font-size:14px;text-transform:uppercase;letter-spacing:.05em;color:#FF5A1F;margin:24px 0 8px}
table{width:100%;border-collapse:collapse;font-size:13px}th,td{padding:8px;border-bottom:1px solid #ddd;text-align:left}th{background:#f4f4f4}
.c{text-align:center}.r{text-align:right}.tot td{border:none;padding:4px 8px}.grand td{font-weight:800;font-size:16px;border-top:2px solid #111}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:4px 24px;font-size:13px}a{color:#FF5A1F;word-break:break-all}
.actions{margin-top:28px;text-align:center}.actions button{background:#FF5A1F;color:#fff;border:0;padding:12px 24px;border-radius:8px;font-weight:700;cursor:pointer}
footer{margin-top:32px;text-align:center}@media print{.actions{display:none}body{padding:0}}
</style></head><body>
<header><div class="brand"><img src="${logo}" alt=""><div><h1>${SHOP.name}</h1><small>${SHOP.phoneDisplay} · ${SHOP.email}<br>${SHOP.addressPt}</small></div></div>
<div style="text-align:right"><strong style="font-size:18px">Recibo #${esc(o.numero)}</strong><br><small>${esc(data)}</small></div></header>
<h2>Cliente</h2><div class="grid">
<div><b>Nome:</b> ${esc(o.nome_cliente || "—")}</div><div><b>Telefone:</b> ${o.telefone ? "+244 " + esc(o.telefone) : "—"}</div>
<div><b>Morada:</b> ${esc(o.morada || "—")}</div><div><b>Entrega:</b> ${o.tipo_entrega === "entrega" ? "Entrega ao domicílio" : "Levantamento na loja"}</div>
${o.localizacao_url ? `<div style="grid-column:span 2"><b>Localização GPS:</b> <a href="${esc(o.localizacao_url)}">${esc(o.localizacao_url)}</a></div>` : ""}
</div>
<h2>Artigos</h2><table><thead><tr><th>Produto</th><th class="c">Qtd.</th><th class="r">Preço</th><th class="r">Total</th></tr></thead><tbody>${linhas}</tbody></table>
<table style="margin-top:8px;width:50%;margin-left:auto"><tbody>
<tr class="tot"><td>Subtotal</td><td class="r">${formatKz(Number(o.subtotal))}</td></tr>
<tr class="tot"><td>Taxa de entrega</td><td class="r">${formatKz(Number(o.taxa_entrega))}</td></tr>
<tr class="grand"><td>Total</td><td class="r">${formatKz(Number(o.total))}</td></tr></tbody></table>
<h2>Pagamento</h2><div class="grid"><div><b>Método:</b> ${esc(o.metodo_pag || "—")}</div><div><b>Estado:</b> ${esc(orderStateLabel(o.estado ?? "Pendente"))}</div></div>
<footer class="muted">Obrigado pela preferência! · ${SHOP.name}</footer>
<div class="actions"><button onclick="window.print()">Imprimir / Guardar em PDF</button></div>
<script>window.onload=function(){setTimeout(function(){window.print()},300)}</script>
</body></html>`);
  w.document.close();
}
