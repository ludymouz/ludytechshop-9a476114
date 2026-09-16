-- CATEGORIAS
CREATE TABLE public.categorias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  ordem int NOT NULL DEFAULT 0,
  criado_em timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categorias TO anon, authenticated;
GRANT ALL ON public.categorias TO service_role;
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categorias publicas" ON public.categorias FOR SELECT TO anon, authenticated USING (true);

-- PRODUTOS
CREATE TABLE public.produtos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  descricao text,
  preco numeric(12,2) NOT NULL DEFAULT 0,
  preco_promo numeric(12,2),
  em_promocao boolean NOT NULL DEFAULT false,
  stock int NOT NULL DEFAULT 0,
  imagem_url text,
  imagens jsonb NOT NULL DEFAULT '[]'::jsonb,
  categoria_id uuid REFERENCES public.categorias(id) ON DELETE SET NULL,
  ativo boolean NOT NULL DEFAULT true,
  criado_em timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_produtos_categoria ON public.produtos(categoria_id);
GRANT SELECT ON public.produtos TO anon, authenticated;
GRANT ALL ON public.produtos TO service_role;
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "produtos publicos" ON public.produtos FOR SELECT TO anon, authenticated USING (ativo = true);

-- BANNERS
CREATE TABLE public.banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text,
  subtitulo text,
  imagem_url text,
  link text,
  ativo boolean NOT NULL DEFAULT true,
  ordem int NOT NULL DEFAULT 0,
  criado_em timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.banners TO anon, authenticated;
GRANT ALL ON public.banners TO service_role;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "banners publicos" ON public.banners FOR SELECT TO anon, authenticated USING (ativo = true);

-- PROFILES
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  nome_completo text NOT NULL DEFAULT '',
  username text,
  email text,
  telefone text,
  morada text,
  genero text,
  idade int,
  foto_url text,
  criado_em timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "perfil proprio select" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "perfil proprio insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "perfil proprio update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, nome_completo, username, email, telefone, morada, genero, idade)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome_completo', ''),
    NEW.raw_user_meta_data->>'username',
    NEW.email,
    NEW.raw_user_meta_data->>'telefone',
    NEW.raw_user_meta_data->>'morada',
    NEW.raw_user_meta_data->>'genero',
    NULLIF(NEW.raw_user_meta_data->>'idade','')::int
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- PEDIDOS
CREATE TABLE public.pedidos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero bigint GENERATED ALWAYS AS IDENTITY,
  user_id uuid,
  nome_cliente text NOT NULL DEFAULT '',
  telefone text,
  morada text,
  subtotal numeric(12,2) NOT NULL DEFAULT 0,
  taxa_entrega numeric(12,2) NOT NULL DEFAULT 0,
  total numeric(12,2) NOT NULL DEFAULT 0,
  metodo_pag text NOT NULL,
  tipo_entrega text NOT NULL CHECK (tipo_entrega IN ('entrega','levantamento')),
  estado text NOT NULL DEFAULT 'Pendente' CHECK (estado IN ('Pendente','Confirmado','Em entrega','Entregue','Cancelado')),
  criado_em timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_pedidos_user ON public.pedidos(user_id);
GRANT SELECT ON public.pedidos TO authenticated;
GRANT ALL ON public.pedidos TO service_role;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pedidos proprios" ON public.pedidos FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.pedido_itens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id uuid NOT NULL REFERENCES public.pedidos(id) ON DELETE CASCADE,
  produto_id uuid REFERENCES public.produtos(id) ON DELETE SET NULL,
  nome text NOT NULL,
  preco numeric(12,2) NOT NULL,
  quantidade int NOT NULL DEFAULT 1
);
CREATE INDEX idx_itens_pedido ON public.pedido_itens(pedido_id);
GRANT SELECT ON public.pedido_itens TO authenticated;
GRANT ALL ON public.pedido_itens TO service_role;
ALTER TABLE public.pedido_itens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "itens dos pedidos proprios" ON public.pedido_itens FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.pedidos p WHERE p.id = pedido_id AND p.user_id = auth.uid()));

-- FAVORITOS
CREATE TABLE public.favoritos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  produto_id uuid NOT NULL REFERENCES public.produtos(id) ON DELETE CASCADE,
  criado_em timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, produto_id)
);
GRANT SELECT, INSERT, DELETE ON public.favoritos TO authenticated;
GRANT ALL ON public.favoritos TO service_role;
ALTER TABLE public.favoritos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "favoritos proprios select" ON public.favoritos FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "favoritos proprios insert" ON public.favoritos FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "favoritos proprios delete" ON public.favoritos FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- AVALIACOES
CREATE TABLE public.avaliacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  produto_id uuid NOT NULL REFERENCES public.produtos(id) ON DELETE CASCADE,
  autor text NOT NULL DEFAULT '',
  estrelas int NOT NULL CHECK (estrelas BETWEEN 1 AND 5),
  comentario text,
  criado_em timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, produto_id)
);
CREATE INDEX idx_avaliacoes_produto ON public.avaliacoes(produto_id);
GRANT SELECT ON public.avaliacoes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.avaliacoes TO authenticated;
GRANT ALL ON public.avaliacoes TO service_role;
ALTER TABLE public.avaliacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "avaliacoes publicas" ON public.avaliacoes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "avaliacoes proprias insert" ON public.avaliacoes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "avaliacoes proprias update" ON public.avaliacoes FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "avaliacoes proprias delete" ON public.avaliacoes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- NOTIFICACOES (user_id NULL = aviso global)
CREATE TABLE public.notificacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  mensagem text NOT NULL,
  tipo text NOT NULL DEFAULT 'info',
  link text,
  criado_em timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_notificacoes_user ON public.notificacoes(user_id);
GRANT SELECT ON public.notificacoes TO authenticated;
GRANT ALL ON public.notificacoes TO service_role;
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notificacoes visiveis" ON public.notificacoes FOR SELECT TO authenticated
  USING (user_id IS NULL OR user_id = auth.uid());

CREATE TABLE public.notificacoes_lidas (
  user_id uuid NOT NULL,
  notificacao_id uuid NOT NULL REFERENCES public.notificacoes(id) ON DELETE CASCADE,
  lida_em timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, notificacao_id)
);
GRANT SELECT, INSERT, DELETE ON public.notificacoes_lidas TO authenticated;
GRANT ALL ON public.notificacoes_lidas TO service_role;
ALTER TABLE public.notificacoes_lidas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lidas proprias select" ON public.notificacoes_lidas FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "lidas proprias insert" ON public.notificacoes_lidas FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Dados iniciais
INSERT INTO public.categorias (nome, slug, ordem) VALUES
  ('Acessório', 'acessorio', 1),
  ('Electrónico', 'electronico', 2),
  ('Roupa', 'roupa', 3),
  ('Calçado', 'calcado', 4);

INSERT INTO public.banners (titulo, subtitulo, link, ordem) VALUES
  ('Bem-vindo à Ludy Tech Shop! 🔥', 'Os melhores produtos em Uíge, Angola.', '/produtos', 1),
  ('Novidades a chegar 🎉', 'Fique atento às nossas promoções exclusivas.', '/produtos', 2);