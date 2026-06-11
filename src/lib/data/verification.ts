type VerificationUser =
  | {
      status_verificacao_identidade: string | null;
    }
  | Array<{
      status_verificacao_identidade: string | null;
    }>
  | null
  | undefined;

export function isIdentityVerified(users: VerificationUser) {
  const user = Array.isArray(users) ? users[0] : users;
  return user?.status_verificacao_identidade === "aprovado";
}
