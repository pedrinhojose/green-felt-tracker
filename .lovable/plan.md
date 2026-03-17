

## Plano: Backup Completo em CSV/Excel

### Sim, é uma ótima ideia!

Ter um backup em formato CSV/Excel é importante porque:
- Se algo acontecer com o Supabase ou IndexedDB, os dados estão salvos localmente
- CSV/Excel pode ser aberto em qualquer computador, sem depender do sistema
- Serve como auditoria e histórico permanente

### O que será exportado

Um arquivo Excel (.xlsx) com múltiplas abas:

| Aba | Dados |
|-----|-------|
| **Jogadores** | Nome, cidade, telefone, data nascimento, status |
| **Temporadas** | Todas (ativas e encerradas), configurações financeiras, blind structure |
| **Partidas** | Todas as partidas com jogadores, posições, prêmios, rebuys, pontos |
| **Rankings** | Rankings de todas as temporadas |
| **Caixinha** | Transações da caixinha |
| **Jackpot Distribuições** | Distribuições de jackpot por temporada |
| **Eliminações** | Histórico de eliminações |

### Importação

O botão de importar lerá o arquivo Excel e inserirá todos os dados de volta no Supabase, funcionando como restauração completa.

### Arquivos a criar/modificar

| Arquivo | Ação |
|---------|------|
| `package.json` | Adicionar dependência `xlsx` (SheetJS) |
| `src/components/ExcelBackupButton.tsx` | Novo - botão de exportar Excel completo |
| `src/components/ExcelRestoreButton.tsx` | Novo - botão de importar Excel |
| `src/pages/Dashboard.tsx` | Adicionar os novos botões na seção "Gerenciamento de Dados" |

### Implementação

#### Exportação
- Busca todos os dados via Supabase (jogadores, temporadas, partidas, rankings, caixinha, eliminações, jackpot distributions)
- Usa a biblioteca `xlsx` (SheetJS) para gerar um arquivo .xlsx com uma aba para cada tabela
- Para a coluna `players` do game (que é JSONB), achata os dados expandindo cada jogador em uma linha separada
- Nome do arquivo: `apapoker-backup-completo-YYYY-MM-DD.xlsx`

#### Importação
- Lê o arquivo .xlsx
- Valida que tem as abas esperadas
- Dialog de confirmação antes de sobrescrever
- Insere os dados via Supabase (upsert para evitar duplicatas)
- Recarrega a página após importação

### Layout no Dashboard

A seção "Gerenciamento de Dados" ficará com 4 botões em grid 2x2:
- Backup JSON (existente)
- Restaurar JSON (existente)  
- **Backup Excel** (novo)
- **Importar Excel** (novo)

