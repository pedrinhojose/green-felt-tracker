

## Plano: Backup Automático ao Encerrar Partida

### Melhor abordagem: Perguntar ao usuário

Fazer automático sem perguntar tem desvantagens — gera downloads inesperados e pode incomodar. A melhor abordagem é **perguntar após encerrar a partida**, aproveitando o Sheet que já aparece com as opções de relatório.

### Como funciona

Após encerrar uma partida, o Sheet já aparece com opções "Exportar PDF" e "Exportar Imagem". Vamos **adicionar um botão "Backup Excel Completo"** nesse mesmo Sheet, tornando o fluxo natural:

1. Usuário encerra a partida
2. Sheet aparece com: PDF | Imagem | **Backup Excel** | Voltar à lista
3. Um clique e o backup é gerado

### Extras: Lembrete de backup

Adicionar um controle em `localStorage` que salva a data do último backup. Se passaram mais de 7 dias sem backup, mostrar um **alerta visual no Dashboard** lembrando o usuário de fazer o backup.

### Arquivos a modificar

| Arquivo | Mudança |
|---------|---------|
| `src/components/game/GameHeader.tsx` | Adicionar botão "Backup Excel" no Sheet pós-encerramento + extrair lógica de export do ExcelBackupButton para função reutilizável |
| `src/components/ExcelBackupButton.tsx` | Extrair a lógica de exportação para uma função exportável `exportExcelBackup()` separada do componente |
| `src/pages/Dashboard.tsx` | Adicionar alerta visual quando último backup > 7 dias |

### Fluxo no Sheet pós-encerramento

```text
┌─────────────────────────────┐
│  Partida Encerrada!         │
│                             │
│  [Exportar como PDF]        │
│  [Exportar como Imagem]     │
│  [📊 Backup Excel Completo] │  ← NOVO
│  [Voltar à Lista]           │
│                             │
│  Último backup: 3 dias atrás│  ← Info contextual
└─────────────────────────────┘
```

### Alerta no Dashboard

Se último backup > 7 dias, exibir um banner amarelo na seção de Gerenciamento de Dados:
> "⚠️ Seu último backup foi há X dias. Recomendamos fazer backup regularmente."

