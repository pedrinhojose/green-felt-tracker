
## Plano: Corrigir Permissões para Admins de Clubes

### Resumo

Modificar o hook `useUserRole` para verificar também se o usuário é admin do clube atual (via `OrganizationContext`), não apenas a tabela global `user_roles`. Isso fará com que Joaquim e qualquer criador de clube veja a aba "Usuários".

### Impacto nos Dados Existentes

| Aspecto | Impacto |
|---------|---------|
| Banco de dados | Nenhuma alteração |
| Dados existentes | Preservados integralmente |
| Pedro Silva (ApaPoker) | Continua funcionando normalmente |
| Joaquim (Up Life) | Passará a ver aba "Usuários" |
| Novos usuários | Verão aba "Usuários" automaticamente |

### Arquivo a Modificar

**`src/hooks/useUserRole.ts`**

### Mudanças Específicas

1. **Importar contexto de organização** (linha 4)
2. **Obter organização atual** dentro do hook
3. **Verificar se é admin da org** com `currentOrganization?.role === 'admin'`
4. **Atualizar `hasRole`** para considerar admin do clube
5. **Atualizar `isAdmin`** para retornar true se for admin da organização

### Código Resultante (Principais Alterações)

```typescript
// Adicionar import
import { useOrganization } from '@/contexts/OrganizationContext';

export function useUserRole() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { currentOrganization } = useOrganization(); // NOVO
  
  // ... código existente ...

  // NOVO: Verificar se é admin da organização atual
  const isOrgAdmin = currentOrganization?.role === 'admin';

  // MODIFICADO: Considerar admin da organização
  const hasRole = useCallback((role: AppRole): boolean => {
    if (role === 'admin' && isOrgAdmin) {
      return true;
    }
    return userRoles.includes(role);
  }, [userRoles, isOrgAdmin]);

  // MODIFICADO: Considerar admin da organização
  const isAdmin = useCallback((): boolean => {
    return isOrgAdmin || userRoles.includes('admin');
  }, [userRoles, isOrgAdmin]);

  // ... resto do código inalterado ...
}
```

### Comportamento Após a Correção

```text
┌─────────────────────────────────────────────────────┐
│                    Login do Usuário                  │
└───────────────────────┬─────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│  OrganizationContext carrega:                        │
│  - currentOrganization.role = 'admin' (do clube)    │
└───────────────────────┬─────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│  useUserRole verifica hasRole('admin'):              │
│                                                      │
│  1. É admin da organização atual? ────► SIM ✓       │
│     OU                                               │
│  2. Tem role 'admin' em user_roles?                 │
│                                                      │
│  → Retorna TRUE → Mostra aba "Usuários"             │
└─────────────────────────────────────────────────────┘
```

### Resultado Final

| Usuário | Clube | Admin do clube? | Verá aba "Usuários"? |
|---------|-------|-----------------|---------------------|
| Pedro Silva | ApaPoker | Sim | Sim |
| Joaquim Santos | Up Life | Sim | Sim |
| Novo criador | Novo Clube | Sim | Sim |
| Membro convidado | Qualquer | Não | Não |

### Segurança Mantida

- Cada admin só gerencia usuários do **seu próprio clube**
- A verificação usa dados do servidor (`organization_members`), não localStorage
- Sistema de `user_roles` global continua funcionando para super-admins
