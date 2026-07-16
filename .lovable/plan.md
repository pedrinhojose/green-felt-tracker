## Objetivo

Separar claramente as duas responsabilidades hoje misturadas na tela `/users`:

- **Super admin do sistema** (Pedro) — continua vendo a tabela de usuários com botão "Tornar admin".
- **Admin de clube** (Joaquim e futuros) — passa a ver apenas as credenciais do próprio clube (ApaHub + Visitante). Nunca poderá promover ninguém a admin do sistema.

## O que muda na tela "Gerenciamento de Usuários" (`/users`)

- Se o usuário logado **é super admin** (tem role `admin` na `user_roles`): mostra tudo como hoje — tabela de usuários do sistema, coluna Papéis, botão "Tornar admin", e os cartões ApaHub/Visitante do clube atual.
- Se o usuário logado **é apenas admin de clube** (só via `organization_members.role = 'admin'`): esconde totalmente a tabela de usuários e o botão. Mostra apenas:
  - Título mais adequado, ex.: "Credenciais do Clube".
  - Cartão de Credencial de Visitante do clube.
  - Cartão de Chave de Acesso ApaHub do clube.
- Se não é nem um nem outro: mensagem "acesso negado" (comportamento já existente).

## Como diferenciar os dois no código

Criar um helper `isSystemAdmin()` que consulta apenas `user_roles` (ignora a role da organização), e usar:

- `isSystemAdmin()` para decidir se renderiza a tabela de usuários e o botão de promover.
- `isAdmin()` atual (que já inclui admin de clube) para decidir se libera o acesso à tela.

Assim o Joaquim continua entrando na página (precisa, para gerenciar as credenciais do clube), mas não vê nada relativo a papéis globais.

## Arquivos afetados

- `src/hooks/useUserRole.ts` — expor novo `isSystemAdmin()` que retorna `userRoles.includes('admin')` (sem considerar `isOrgAdmin`).
- `src/pages/UserManagement.tsx` — renderização condicional: bloco "Gerenciamento de Usuários" só se `isSystemAdmin()`; cartões de credencial permanecem para qualquer admin (sistema ou clube). Ajustar título/subtítulo quando for só admin de clube.

## O que NÃO muda

- Regras do banco (RLS, `user_roles`, `organization_members`) — já estão corretas.
- Fluxo de criação de novo clube — o criador continua virando admin da organização automaticamente, sem receber role global.
- Botão "Tornar admin" continua existindo, só que visível/utilizável apenas pelo super admin.

## Verificação após implementar

- Logado como Pedro (super admin): a tela mostra tudo como hoje.
- Logado como Joaquim (admin de clube): a tela mostra só os dois cartões de credencial, sem tabela de usuários nem botão de papéis.
