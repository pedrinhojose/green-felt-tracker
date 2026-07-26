## Problema

A credencial ApaHub criada no painel grava apenas uma linha na tabela `apahub_access_keys` (com a senha criptografada). Ela **não cria um usuário de autenticação** no Supabase. Como o app ApaHub faz login pelo método padrão de autenticação, ele nunca encontra esse usuário e retorna "Invalid login credentials".

## Solução

Passar a criar/atualizar um usuário de autenticação real (e-mail já confirmado) sempre que o admin criar a chave ou trocar a senha — mesmo padrão já usado na credencial de visitante.

### 1. Banco
- Adicionar coluna `apahub_user_id` (uuid) em `apahub_access_keys` para guardar o usuário de autenticação vinculado.

### 2. Nova função de servidor `create-apahub-account`
Espelhada em `create-viewer-account`:
- Valida que quem chama é admin/owner da organização.
- Se já existe `apahub_user_id`: atualiza e-mail e senha desse usuário.
- Se não existe: cria o usuário com e-mail confirmado; se o e-mail já existir no sistema, reaproveita e apenas atualiza a senha.
- Garante que esse usuário seja membro da organização com papel de leitura (`viewer`), para que as regras de acesso já existentes entreguem só os dados do clube dele.
- Grava a chave via a função existente `create_apahub_access_key` e salva o `apahub_user_id`.

### 3. Frontend
- `src/hooks/useApahubAccessKey.ts`: `createAccessKey` e `updatePassword` passam a chamar a nova função de servidor em vez das RPCs diretas (a RPC de senha continua sendo atualizada em conjunto, para manter a tabela coerente).
- Mensagens de erro repassadas ao admin (ex.: senha curta, e-mail inválido, e-mail já em uso por outro clube).
- Nenhuma mudança visual nos cards/modais.

### 4. Credenciais já existentes
A chave atual do clube não tem usuário de autenticação. Depois do ajuste, basta o admin clicar em **Alterar senha** (ou regenerar) uma vez — isso cria o usuário e a credencial passa a funcionar. Vou avisar isso na resposta final.

## Observação técnica
A função `verify_apahub_login` continua existindo, então, se o app ApaHub usar essa validação alternativa em vez do login padrão, ele segue funcionando. Nenhuma mudança é obrigatória do lado do app ApaHub.
