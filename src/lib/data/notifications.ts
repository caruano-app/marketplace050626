export type AppNotification = {
  id: string;
  usuario_id: string;
  titulo: string;
  mensagem: string;
  tipo: string | null;
  lida: boolean | null;
  link_acao: string | null;
  criado_em: string | null;
};
