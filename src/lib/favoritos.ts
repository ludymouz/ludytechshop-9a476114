import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./auth";
import { useI18n } from "./i18n";

export function useFavoritos() {
  const { user } = useAuth();
  const { t } = useI18n();
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ["favoritos", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("favoritos").select("produto_id");
      return (data ?? []).map((f) => f.produto_id);
    },
  });

  const ids = data ?? [];

  const toggle = useMutation({
    mutationFn: async (produtoId: string) => {
      if (!user) throw new Error(t("need_login"));
      if (ids.includes(produtoId)) {
        await supabase.from("favoritos").delete().eq("produto_id", produtoId).eq("user_id", user.id);
      } else {
        await supabase.from("favoritos").insert({ produto_id: produtoId, user_id: user.id });
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["favoritos"] }),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro"),
  });

  return { ids, isFavorito: (id: string) => ids.includes(id), toggle: (id: string) => toggle.mutate(id) };
}
