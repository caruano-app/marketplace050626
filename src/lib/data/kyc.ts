export const identityDocumentTypes = [
  "rg_frente",
  "rg_verso",
  "cpf",
  "cnh",
  "cnpj_cartao",
  "comprovante_vinculo",
  "selfie_identidade",
  "comprovante_endereco",
  "crlv",
  "foto_veiculo",
] as const;

export type IdentityDocumentType = (typeof identityDocumentTypes)[number];

export type IdentityStatus = "nao_enviado" | "pendente" | "aprovado" | "rejeitado";

export type IdentityDocument = {
  id: string;
  usuario_id: string;
  tipo: IdentityDocumentType;
  url_arquivo: string;
  status: IdentityStatus;
  motivo_rejeicao: string | null;
  criado_em: string | null;
};

export type SignedIdentityDocument = IdentityDocument & {
  signed_url: string | null;
};

export const documentLabels: Record<IdentityDocumentType, string> = {
  rg_frente: "RG frente",
  rg_verso: "RG verso",
  cpf: "CPF",
  cnh: "CNH",
  cnpj_cartao: "Cartao CNPJ",
  comprovante_vinculo: "Comprovante de vinculo",
  selfie_identidade: "Selfie de identidade",
  comprovante_endereco: "Comprovante de endereco",
  crlv: "CRLV do veiculo",
  foto_veiculo: "Foto do veiculo",
};

export function isIdentityDocumentType(value: string): value is IdentityDocumentType {
  return identityDocumentTypes.includes(value as IdentityDocumentType);
}
