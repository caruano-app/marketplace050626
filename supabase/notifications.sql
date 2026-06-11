-- Caruano - Central de notificacoes
-- Execute no SQL Editor do Supabase antes de testar o sininho em producao.

CREATE TABLE IF NOT EXISTS notificacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    titulo VARCHAR(120) NOT NULL,
    mensagem TEXT NOT NULL,
    tipo VARCHAR(40) DEFAULT 'sistema',
    lida BOOLEAN DEFAULT FALSE,
    link_acao TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notificacoes_usuario_lida ON notificacoes(usuario_id, lida);
CREATE INDEX IF NOT EXISTS idx_notificacoes_criado_em ON notificacoes(criado_em DESC);

ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuarios leem suas notificacoes" ON notificacoes;
DROP POLICY IF EXISTS "Usuarios atualizam suas notificacoes" ON notificacoes;
DROP POLICY IF EXISTS "Usuarios inserem suas notificacoes" ON notificacoes;

CREATE POLICY "Usuarios leem suas notificacoes"
ON notificacoes
FOR SELECT
TO authenticated
USING (usuario_id = auth.uid());

CREATE POLICY "Usuarios atualizam suas notificacoes"
ON notificacoes
FOR UPDATE
TO authenticated
USING (usuario_id = auth.uid())
WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "Usuarios inserem suas notificacoes"
ON notificacoes
FOR INSERT
TO authenticated
WITH CHECK (usuario_id = auth.uid());

GRANT SELECT, INSERT, UPDATE ON TABLE notificacoes TO authenticated;
