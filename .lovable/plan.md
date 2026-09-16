# Ludy Tech Shop — loja virtual completa

Reconstrução do projeto PHP original como aplicação web moderna, rápida e responsiva, com base de dados na Lovable Cloud.

## Identidade visual
Preto, branco e laranja vibrante (#FF5A1F). Tipografia forte, cantos suaves, animações discretas. Interface em Português com botão para Inglês.

## 1. Loja (página inicial)
- Banners promocionais rotativos geridos pelo painel.
- Barra de pesquisa e navegação por categorias: Acessório, Electrónico, Roupa, Calçado.
- Grelha de produtos com foto, preço em Kz, selo "Promoção" e preço antigo riscado, aviso de stock esgotado.
- Página de produto: fotos, descrição, preço, stock, avaliações com estrelas e comentários (só clientes com sessão iniciada avaliam).
- Botões flutuantes de WhatsApp (+244 949 148 512) e chamada.
- Rodapé com morada (Uíge, Bairro Dunga, Rua B) e redes sociais.

## 2. Carrinho e checkout
- Carrinho lateral com quantidades, subtotal e total em Kz.
- Entrega ao domicílio (+600 Kz) ou levantamento (grátis), com o aviso sobre bairros do Uíge.
- Pagamentos: Dinheiro vivo, Multicaixa Express, Transferência BAI, BFA e Atlântico.
- Horário de pagamentos 08h–16h (14h aos fins de semana); fora do horário o checkout fica bloqueado com contagem para a reabertura.
- Ao finalizar: o pedido é gravado na base de dados, o stock é descontado e abre o WhatsApp com o resumo do pedido.

## 3. Painel de administração (/admin)
Entrada por palavra-passe fixa do painel, guardada em segredo no servidor (não fica visível no site). Sessão protegida mantém-se aberta.
- Dashboard: total de vendas, receita em Kz, nº de pedidos e clientes, gráfico de evolução de vendas, últimos pedidos.
- Produtos: criar, editar, apagar, fotos, preço, preço promocional, stock, categoria.
- Categorias: criar e apagar.
- Pedidos: ver detalhes e mudar estado (Pendente, Confirmado, Em entrega, Entregue, Cancelado).
- Clientes: lista e remoção.
- Banners: criar, ativar/desativar, apagar.

## 4. Conta do cliente
- Registo e início de sessão (nome, username, email, telefone, morada, género, idade, foto).
- Perfil editável, histórico de encomendas com estado atual.
- Lista de desejos (favoritos).
- Notificações: quando o estado de uma encomenda muda **e** quando é publicado um produto novo (aviso para todos os clientes), com sino e contador de não lidas.

## Notas técnicas
- Lovable Cloud (base de dados, autenticação, armazenamento de imagens) com políticas de acesso: leitura pública de produtos/categorias/banners, dados pessoais e pedidos restritos ao próprio cliente.
- Tabelas: categorias, produtos, banners, pedidos, itens de pedido, favoritos, avaliações, notificações, perfis.
- Escrita administrativa feita em funções de servidor validadas pela sessão do painel.
- Catálogo começa vazio (só categorias e 2 banners de boas-vindas); os produtos são adicionados pelo painel.
- Cada página com título e descrição próprios para pesquisa no Google.
