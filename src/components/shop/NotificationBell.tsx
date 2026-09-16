import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Bell } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";

export function NotificationBell() {
  const { user } = useAuth();
  const { t } = useI18n();
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ["notificacoes", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [{ data: notis }, { data: lidas }] = await Promise.all([
        supabase.from("notificacoes").select("*").order("criado_em", { ascending: false }).limit(30),
        supabase.from("notificacoes_lidas").select("notificacao_id"),
      ]);
      const lidasSet = new Set((lidas ?? []).map((l) => l.notificacao_id));
      return (notis ?? []).map((n) => ({ ...n, lida: lidasSet.has(n.id) }));
    },
  });

  const marcar = useMutation({
    mutationFn: async () => {
      if (!user || !data) return;
      const porLer = data.filter((n) => !n.lida);
      if (porLer.length === 0) return;
      await supabase
        .from("notificacoes_lidas")
        .insert(porLer.map((n) => ({ user_id: user.id, notificacao_id: n.id })));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notificacoes"] }),
  });

  if (!user) return null;
  const naoLidas = (data ?? []).filter((n) => !n.lida).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label={t("notifications")}>
          <Bell className="size-5" />
          {naoLidas > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {naoLidas > 9 ? "9+" : naoLidas}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-4 py-2.5">
          <span className="text-sm font-bold">{t("notifications")}</span>
          {naoLidas > 0 && (
            <button
              type="button"
              className="text-xs font-medium text-primary hover:underline"
              onClick={() => marcar.mutate()}
            >
              {t("mark_all_read")}
            </button>
          )}
        </div>
        <ul className="max-h-80 overflow-y-auto">
          {(data ?? []).length === 0 && (
            <li className="px-4 py-6 text-center text-sm text-muted-foreground">
              {t("no_notifications")}
            </li>
          )}
          {(data ?? []).map((n) => (
            <li key={n.id} className={`border-b px-4 py-3 text-sm ${n.lida ? "opacity-60" : ""}`}>
              {n.link ? (
                <Link to={n.link} className="hover:text-primary">
                  {n.mensagem}
                </Link>
              ) : (
                n.mensagem
              )}
              <p className="mt-1 text-[11px] text-muted-foreground">
                {new Date(n.criado_em).toLocaleString("pt-PT")}
              </p>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
