-- Caruano - gerente de teste
-- 1. Crie antes o usuario em Authentication > Users:
--    E-mail: joao.gerente@caruano.com
--    Senha temporaria sugerida: Caruano@2026#Gerente
--    Confirme o e-mail no painel, se necessario.
-- 2. Depois rode este SQL no SQL Editor.
-- O acesso de gerente vem de escopos_gerencia, nao de perfil_principal.

WITH auth_user AS (
  SELECT id, email
  FROM auth.users
  WHERE email = 'joao.gerente@caruano.com'
  LIMIT 1
),
upsert_usuario AS (
  INSERT INTO public.usuarios (
    id,
    nome_completo,
    email,
    perfil_principal,
    is_admin,
    cidade_base
  )
  SELECT
    id,
    'Joao Silva',
    email,
    'cliente',
    false,
    'caruaru'::tipo_cidade
  FROM auth_user
  ON CONFLICT (id) DO UPDATE SET
    nome_completo = EXCLUDED.nome_completo,
    email = EXCLUDED.email,
    cidade_base = EXCLUDED.cidade_base
  RETURNING id
)
INSERT INTO public.escopos_gerencia (
  usuario_id,
  cidade_atuacao,
  segmento_atuacao,
  nivel_permissao,
  ativo
)
SELECT
  id,
  'caruaru'::tipo_cidade,
  'alimentacao'::tipo_segmento_loja,
  2,
  true
FROM upsert_usuario
ON CONFLICT (usuario_id, cidade_atuacao, segmento_atuacao)
DO UPDATE SET
  nivel_permissao = 2,
  ativo = true;

SELECT
  u.nome_completo,
  u.email,
  e.cidade_atuacao,
  e.segmento_atuacao,
  e.nivel_permissao,
  e.ativo
FROM public.usuarios u
JOIN public.escopos_gerencia e ON e.usuario_id = u.id
WHERE u.email = 'joao.gerente@caruano.com';
