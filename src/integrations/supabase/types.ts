export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      avaliacoes: {
        Row: {
          autor: string
          comentario: string | null
          criado_em: string
          estrelas: number
          id: string
          produto_id: string
          user_id: string
        }
        Insert: {
          autor?: string
          comentario?: string | null
          criado_em?: string
          estrelas: number
          id?: string
          produto_id: string
          user_id: string
        }
        Update: {
          autor?: string
          comentario?: string | null
          criado_em?: string
          estrelas?: number
          id?: string
          produto_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "avaliacoes_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      banners: {
        Row: {
          ativo: boolean
          criado_em: string
          id: string
          imagem_url: string | null
          link: string | null
          ordem: number
          subtitulo: string | null
          titulo: string | null
        }
        Insert: {
          ativo?: boolean
          criado_em?: string
          id?: string
          imagem_url?: string | null
          link?: string | null
          ordem?: number
          subtitulo?: string | null
          titulo?: string | null
        }
        Update: {
          ativo?: boolean
          criado_em?: string
          id?: string
          imagem_url?: string | null
          link?: string | null
          ordem?: number
          subtitulo?: string | null
          titulo?: string | null
        }
        Relationships: []
      }
      categorias: {
        Row: {
          criado_em: string
          id: string
          nome: string
          ordem: number
          slug: string
        }
        Insert: {
          criado_em?: string
          id?: string
          nome: string
          ordem?: number
          slug: string
        }
        Update: {
          criado_em?: string
          id?: string
          nome?: string
          ordem?: number
          slug?: string
        }
        Relationships: []
      }
      favoritos: {
        Row: {
          criado_em: string
          id: string
          produto_id: string
          user_id: string
        }
        Insert: {
          criado_em?: string
          id?: string
          produto_id: string
          user_id: string
        }
        Update: {
          criado_em?: string
          id?: string
          produto_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favoritos_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      notificacoes: {
        Row: {
          criado_em: string
          id: string
          link: string | null
          mensagem: string
          tipo: string
          user_id: string | null
        }
        Insert: {
          criado_em?: string
          id?: string
          link?: string | null
          mensagem: string
          tipo?: string
          user_id?: string | null
        }
        Update: {
          criado_em?: string
          id?: string
          link?: string | null
          mensagem?: string
          tipo?: string
          user_id?: string | null
        }
        Relationships: []
      }
      notificacoes_lidas: {
        Row: {
          lida_em: string
          notificacao_id: string
          user_id: string
        }
        Insert: {
          lida_em?: string
          notificacao_id: string
          user_id: string
        }
        Update: {
          lida_em?: string
          notificacao_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notificacoes_lidas_notificacao_id_fkey"
            columns: ["notificacao_id"]
            isOneToOne: false
            referencedRelation: "notificacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      pedido_itens: {
        Row: {
          id: string
          nome: string
          pedido_id: string
          preco: number
          produto_id: string | null
          quantidade: number
        }
        Insert: {
          id?: string
          nome: string
          pedido_id: string
          preco: number
          produto_id?: string | null
          quantidade?: number
        }
        Update: {
          id?: string
          nome?: string
          pedido_id?: string
          preco?: number
          produto_id?: string | null
          quantidade?: number
        }
        Relationships: [
          {
            foreignKeyName: "pedido_itens_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedido_itens_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      pedidos: {
        Row: {
          comprovativo_url: string | null
          criado_em: string
          estado: string
          id: string
          localizacao_url: string | null
          metodo_pag: string
          morada: string | null
          nome_cliente: string
          numero: number
          subtotal: number
          taxa_entrega: number
          telefone: string | null
          tipo_entrega: string
          total: number
          user_id: string | null
        }
        Insert: {
          comprovativo_url?: string | null
          criado_em?: string
          estado?: string
          id?: string
          localizacao_url?: string | null
          metodo_pag: string
          morada?: string | null
          nome_cliente?: string
          numero?: never
          subtotal?: number
          taxa_entrega?: number
          telefone?: string | null
          tipo_entrega: string
          total?: number
          user_id?: string | null
        }
        Update: {
          comprovativo_url?: string | null
          criado_em?: string
          estado?: string
          id?: string
          localizacao_url?: string | null
          metodo_pag?: string
          morada?: string | null
          nome_cliente?: string
          numero?: never
          subtotal?: number
          taxa_entrega?: number
          telefone?: string | null
          tipo_entrega?: string
          total?: number
          user_id?: string | null
        }
        Relationships: []
      }
      produtos: {
        Row: {
          ativo: boolean
          categoria_id: string | null
          criado_em: string
          descricao: string | null
          em_promocao: boolean
          id: string
          imagem_url: string | null
          imagens: Json
          nome: string
          preco: number
          preco_promo: number | null
          stock: number
        }
        Insert: {
          ativo?: boolean
          categoria_id?: string | null
          criado_em?: string
          descricao?: string | null
          em_promocao?: boolean
          id?: string
          imagem_url?: string | null
          imagens?: Json
          nome: string
          preco?: number
          preco_promo?: number | null
          stock?: number
        }
        Update: {
          ativo?: boolean
          categoria_id?: string | null
          criado_em?: string
          descricao?: string | null
          em_promocao?: boolean
          id?: string
          imagem_url?: string | null
          imagens?: Json
          nome?: string
          preco?: number
          preco_promo?: number | null
          stock?: number
        }
        Relationships: [
          {
            foreignKeyName: "produtos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          criado_em: string
          email: string | null
          foto_url: string | null
          genero: string | null
          id: string
          idade: number | null
          morada: string | null
          nome_completo: string
          telefone: string | null
          username: string | null
        }
        Insert: {
          criado_em?: string
          email?: string | null
          foto_url?: string | null
          genero?: string | null
          id: string
          idade?: number | null
          morada?: string | null
          nome_completo?: string
          telefone?: string | null
          username?: string | null
        }
        Update: {
          criado_em?: string
          email?: string | null
          foto_url?: string | null
          genero?: string | null
          id?: string
          idade?: number | null
          morada?: string | null
          nome_completo?: string
          telefone?: string | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
