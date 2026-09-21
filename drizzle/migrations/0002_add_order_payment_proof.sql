ALTER TABLE public.pedidos
ADD COLUMN comprovativo_url text;

COMMENT ON COLUMN public.pedidos.comprovativo_url IS 'Optional payment receipt/screenshot uploaded by the customer at checkout.';