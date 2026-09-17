# Melhorias de contacto, registo e entregas

## O que será alterado
- Atualizar os contactos oficiais da Ludy Tech Shop: email, WhatsApp, Instagram e TikTok, removendo o YouTube.
- Substituir o rodapé clássico por uma área moderna de atendimento com cartões para WhatsApp, Multicaixa Express, transferência bancária e horário, mais uma chamada destacada para abrir o WhatsApp.
- Manter apenas essa área e uma linha curta de direitos reservados em telemóveis e tablets.
- Reforçar o registo e início de sessão com validação de email, telefone angolano com `+244` fixo e nove dígitos, género por opções e um desafio humano no registo.
- Adicionar a captura opcional da localização atual durante entregas, guardar o link do Google Maps na encomenda, incluí-lo na mensagem do WhatsApp e mostrá-lo no painel administrativo.

## Funcionamento esperado
- O pedido de localização só acontece quando o cliente toca no botão; recusas e indisponibilidade mostram uma mensagem clara e não bloqueiam a compra.
- A localização aplica-se apenas à entrega ao domicílio e fica visível no resumo antes da confirmação.
- O desafio humano será um cálculo simples renovável, sem partilhar dados com serviços externos.
- A validação essencial do pedido e dos dados será repetida no servidor.

## Detalhes técnicos
- Adicionar um campo próprio e opcional para o link de localização nas encomendas, com permissões alinhadas às políticas atuais.
- Atualizar o checkout, a função de criação do pedido, os tipos e a lista administrativa de encomendas.
- Usar os componentes e tokens visuais existentes, mantendo português e inglês onde a loja já oferece tradução.
- Verificar compilação, página inicial, autenticação, carrinho em vista móvel e painel administrativo no preview.
