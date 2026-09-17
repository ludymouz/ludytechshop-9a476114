ALTER TABLE public.pedidos
ADD COLUMN localizacao_url text;

COMMENT ON COLUMN public.pedidos.localizacao_url IS 'Optional Google Maps URL captured with customer consent for home delivery.';