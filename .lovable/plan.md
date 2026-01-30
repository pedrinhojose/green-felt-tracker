

## Plano: Implementar Recuperacao de Senha

### Resumo

Adicionar funcionalidade de "Esqueci minha senha" na tela de login, permitindo que usuarios redefinam suas senhas de forma segura atraves de um link enviado por email.

---

### Arquivos a Criar/Modificar

| Arquivo | Acao | Descricao |
|---------|------|-----------|
| `src/pages/Auth.tsx` | Modificar | Adicionar link "Esqueci minha senha" e dialog para solicitar reset |
| `src/pages/ResetPassword.tsx` | Criar | Nova pagina para definir nova senha |
| `src/App.tsx` | Modificar | Adicionar rota `/reset-password` |

---

### Implementacao

#### 1. Modificar Auth.tsx

Adicionar:
- Estado para controlar o dialog de recuperacao
- Estado para o email de recuperacao
- Funcao `handleForgotPassword` que chama `supabase.auth.resetPasswordForEmail()`
- Link "Esqueci minha senha" abaixo do campo de senha
- Dialog com campo de email e botao "Enviar Link"

#### 2. Criar ResetPassword.tsx

Nova pagina contendo:
- Campos para nova senha e confirmacao
- Validacao de senhas (minimo 6 caracteres, senhas devem coincidir)
- Funcao que chama `supabase.auth.updateUser({ password })`
- Redirecionamento para dashboard apos sucesso
- Design consistente com a pagina de login

#### 3. Atualizar App.tsx

Adicionar rota publica:
```
<Route path="/reset-password" element={<ResetPassword />} />
```

---

### Fluxo do Usuario

```text
Tela de Login
     |
     v
Clica "Esqueci minha senha"
     |
     v
Dialog pede email --> Envia link por email
     |
     v
Usuario recebe email e clica no link
     |
     v
Pagina /reset-password --> Define nova senha
     |
     v
Redirecionado para /dashboard (logado)
```

---

### Configuracao Necessaria (apos implementacao)

Voce precisara adicionar as URLs de redirecionamento no Supabase Dashboard:

**Authentication > URL Configuration > Redirect URLs:**
- `https://id-preview--6620f293-76d2-446a-85dd-423dd27537ec.lovable.app/reset-password`
- `https://apapoker.lovable.app/reset-password`

---

### Validacoes de Seguranca

- Email valido antes de enviar
- Senha minima de 6 caracteres
- Confirmacao de senha deve coincidir
- Supabase gerencia limite de tentativas automaticamente

