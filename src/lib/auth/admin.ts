export type AdminCapableProfile = {
  perfil_principal: string | null;
  is_admin: boolean | null;
};

export function isCaruanoAdmin(profile: AdminCapableProfile | null | undefined) {
  return profile?.is_admin === true || profile?.perfil_principal === "colaborador_interno";
}
