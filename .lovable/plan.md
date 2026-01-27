
## Plano: Habilitar Extensao pgcrypto no Banco de Dados

### Objetivo

Criar uma migration SQL para habilitar a extensao `pgcrypto` no schema `extensions` do Supabase, permitindo que as funcoes `gen_salt()` e `crypt()` funcionem corretamente para criptografar senhas das chaves de acesso ApaHub.

### O Que Sera Feito

Criar um novo arquivo de migration que executa:

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;
```

### Detalhes Tecnicos

| Aspecto | Descricao |
|---------|-----------|
| Arquivo | `supabase/migrations/[timestamp]_enable_pgcrypto.sql` |
| Schema | `extensions` (padrao do Supabase para extensoes) |
| Seguranca | `IF NOT EXISTS` evita erro se ja estiver habilitado |
| Impacto | Zero - apenas adiciona funcoes novas |

### Funcoes Disponibilizadas

Apos habilitar o pgcrypto, estas funcoes estarao disponiveis:

- **`gen_salt('bf')`** - Gera um salt aleatorio para bcrypt
- **`crypt(senha, salt)`** - Criptografa a senha usando o salt
- **`crypt(senha, hash)`** - Verifica se a senha corresponde ao hash

### Codigo da Migration

```sql
-- Habilitar extensao pgcrypto para funcoes de criptografia
-- Necessario para: gen_salt(), crypt()
-- Usado em: create_apahub_access_key, verify_apahub_login

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;
```

### Resultado Esperado

Apos aplicar a migration:

1. A funcao `create_apahub_access_key` funcionara corretamente
2. O admin podera criar email/senha para acesso ao ApaHub
3. As senhas serao armazenadas de forma segura (hash bcrypt)
4. A funcao `verify_apahub_login` podera validar as credenciais

### Riscos

| Risco | Nivel | Mitigacao |
|-------|-------|-----------|
| Afetar dados existentes | Nenhum | Extensao apenas adiciona funcoes |
| Conflito com extensao existente | Nenhum | `IF NOT EXISTS` previne erro |
| Downtime | Nenhum | Operacao instantanea |
