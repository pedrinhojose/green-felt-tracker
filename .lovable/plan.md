## Objetivo

Permitir que o Super Admin cadastre **um link único do app ApaHub**, e que qualquer admin de clube compartilhe esse link com os jogadores por um botão **"Enviar app ao jogador"** na tela de credenciais.

## Onde aparece

1. **Card "Chave de Acesso ApaHub"** (tela Gerenciamento de Usuários) — novo botão "Enviar app ao jogador" ao lado de "Alterar Senha" / "Gerar nova senha".
2. **Modal de credenciais** (exibido logo após criar a chave ou gerar nova senha) — mesmo botão, para o admin já enviar tudo junto.
3. **Painel do Super Admin** — novo campo para digitar/editar o link e salvar.

## Modal "Enviar app ao jogador"

- Texto explicativo curto: o jogador precisa baixar o app ApaHub e entrar com o email e a senha fornecidos.
- Mostra o link do app.
- Botões:
  - **Copiar link** (só o link)
  - **Copiar mensagem completa** (link + email + senha, quando aberto a partir do modal de credenciais)
  - **Abrir WhatsApp** — abre o WhatsApp com a mensagem pronta para o admin escolher o contato
- Se o link ainda não foi cadastrado: aviso de que o Super Admin ainda não configurou o link do app.

## Detalhes técnicos

- Nova tabela `public.app_settings` (chave/valor de configuração global), com a chave `apahub_app_url`.
  - Leitura liberada para usuários autenticados (todos os admins de clube precisam ler o link).
  - Escrita restrita a `super_admin` (via `is_super_admin(auth.uid())`).
  - GRANTs para `authenticated` e `service_role`.
- Novo hook `useAppSettings` (ou `useApahubAppLink`) para ler e salvar o link.
- Novo componente `ShareApahubAppDialog.tsx` com o conteúdo do modal e as ações de cópia/WhatsApp.
- Ajustes em `ApahubAccessKeyCard.tsx`, `ApahubCredentialsDialog.tsx` e `SuperAdminDashboard.tsx`.
- Validação simples do link (deve começar com `http://` ou `https://`).
