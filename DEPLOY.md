# Deploy Caruano no Coolify

## Checklist

- `Dockerfile` esta na raiz do projeto.
- `next.config.js` usa `output: "standalone"`.
- `.env.local` nao deve ser enviado ao GitHub.
- Copie as variaveis de `.env.example` para o painel de Environment Variables do Coolify.

## Variaveis do Coolify

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_CHAVE_ANON_PUBLIC
NEXT_PUBLIC_SITE_URL=https://caruano.com
NEXT_PUBLIC_MARKETPLACE_WHATSAPP=5581999999999
NEXT_PUBLIC_CHECKOUT_COMPRADOR_ID=UUID_EXISTENTE_NA_TABELA_USUARIOS
```

## Build

O Coolify pode usar o Dockerfile da raiz.

Porta esperada:

```env
PORT=3000
```

## Fluxo padrao apos cada ajuste

Todo ajuste de codigo deve seguir este fluxo antes de ir para producao:

```bash
npm run build
git add .
git commit -m "Descricao objetiva da mudanca"
git push origin main
```

Com o GitHub App do Coolify conectado ao repositorio, o `git push origin main` deve disparar o auto-deploy.

Use o botao `Redeploy` no Coolify somente como fallback quando:

- o webhook nao disparar automaticamente;
- alguma variavel de ambiente for alterada no painel;
- for necessario repetir o deploy do mesmo commit.

## GitHub

Depois de instalar o Git no Windows, execute:

```bash
git init
git add .
git commit -m "Initial Caruano marketplace"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
git push -u origin main
```
