-- Caruano - hardening inicial de RLS para producao
-- Execute no SQL Editor do Supabase.
-- Objetivo: permitir captacao publica quando necessario, mas bloquear leitura anonima de dados sensiveis.

-- LEADS
ALTER TABLE leads_atendimento ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads_interesses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Acesso Total Leads" ON leads_atendimento;
DROP POLICY IF EXISTS "Acesso Total Interesses" ON leads_interesses;
DROP POLICY IF EXISTS "Permitir inserção pública de leads" ON leads_atendimento;
DROP POLICY IF EXISTS "Permitir inserção pública de interesses" ON leads_interesses;
DROP POLICY IF EXISTS "Leitura restrita a usuários autenticados" ON leads_atendimento;
DROP POLICY IF EXISTS "Leitura autenticada de leads" ON leads_atendimento;
DROP POLICY IF EXISTS "Leitura autenticada de interesses" ON leads_interesses;

CREATE POLICY "Insercao publica de leads"
ON leads_atendimento
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Insercao publica de interesses"
ON leads_interesses
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Leitura autenticada de leads"
ON leads_atendimento
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Leitura autenticada de interesses"
ON leads_interesses
FOR SELECT
TO authenticated
USING (true);

-- TRANSACOES E PEDIDOS
ALTER TABLE transacoes_mestre ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_pedidos_loja ENABLE ROW LEVEL SECURITY;
ALTER TABLE itens_pedido ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Leitura autenticada de transacoes" ON transacoes_mestre;
DROP POLICY IF EXISTS "Leitura autenticada de sub pedidos" ON sub_pedidos_loja;
DROP POLICY IF EXISTS "Leitura autenticada de itens pedido" ON itens_pedido;

CREATE POLICY "Leitura autenticada de transacoes"
ON transacoes_mestre
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Leitura autenticada de sub pedidos"
ON sub_pedidos_loja
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Leitura autenticada de itens pedido"
ON itens_pedido
FOR SELECT
TO authenticated
USING (true);

-- COMISSOES DE AFILIADOS
ALTER TABLE comissoes_afiliados ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Leitura autenticada de comissoes afiliados" ON comissoes_afiliados;

CREATE POLICY "Leitura autenticada de comissoes afiliados"
ON comissoes_afiliados
FOR SELECT
TO authenticated
USING (true);

-- IMPORTANTE:
-- Este hardening nao cria INSERT publico para transacoes_mestre/sub_pedidos_loja/itens_pedido.
-- Para gravar pedidos sem login, defina uma politica especifica depois de validarmos o fluxo final do checkout.
