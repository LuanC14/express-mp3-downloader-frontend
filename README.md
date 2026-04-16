# express-mp3-downloader-frontend

Interface web da aplicação de download do YouTube para MP3. Construída com **React 18**, **Vite 5** e **Material UI v6**.

---

## Arquitetura

```
express-mp3-downloader-frontend/
├── src/
│   ├── main.jsx                     # Entry point — monta o React no DOM
│   ├── App.jsx                      # Orquestrador de telas e transições
│   ├── index.css                    # Reset CSS global
│   └── components/
│       ├── SelectScreen.jsx         # Tela inicial — seleção de modo
│       └── DownloadScreen.jsx       # Tela de download com progresso
├── index.html                       # Template HTML do Vite
└── package.json
```

---

## Fluxo de telas

```
SelectScreen
  ├── [Individual] → DownloadScreen (mode="video")
  └── [Playlist]   → DownloadScreen (mode="playlist")
                          └── [Voltar] → SelectScreen
```

A transição entre telas usa o componente `Fade` do MUI com 300ms, aplicado sobre elementos com `position: absolute` para que a saída e a entrada se sobreponham sem salto de layout.

---

## Componentes

### `App.jsx`

Controla dois estados globais:

| Estado | Tipo | Descrição |
|--------|------|-----------|
| `screen` | `'select' \| 'download'` | Qual tela está visível |
| `mode` | `'video' \| 'playlist' \| null` | Modo selecionado pelo usuário |

Renderiza ambas as telas simultaneamente via `Fade` + `unmountOnExit`, garantindo que apenas uma esteja no DOM por vez após a transição.

---

### `SelectScreen.jsx`

Tela inicial com dois botões centralizados verticalmente. Ao clicar, chama `onSelect(mode)` recebido via prop de `App.jsx`.

**Props:** `onSelect(mode: 'video' | 'playlist')`

---

### `DownloadScreen.jsx`

Tela principal de interação. Gerencia todo o ciclo de vida de um download.

**Props:** `mode: 'video' | 'playlist'`, `onBack()`

**Estados internos:**

| Estado | Descrição |
|--------|-----------|
| `url` | Valor do input controlado |
| `status` | `idle / loading / success / error` |
| `progress` | Percentual de 0 a 100 |
| `progressLabel` | Rótulo de faixas para playlist (`"2 de 10 faixas"`) |
| `errorMsg` | Mensagem de erro vinda do backend |

**Fluxo de um download:**

1. Usuário cola o link e pressiona Enter ou clica na seta
2. `POST /api/video` ou `POST /api/playlist` → recebe `{ jobId }`
3. Abre conexão SSE em `GET /api/progress/:jobId`
4. Eventos recebidos via `EventSource.onmessage`:
   - `{ type: 'progress', percent, label? }` → atualiza a barra
   - `{ type: 'done', jobId }` → fecha SSE, cria `<a>` apontando para `/api/file/:jobId` e dispara o download
   - `{ type: 'error', message }` → exibe alerta de erro
5. A referência do `EventSource` é guardada em `useRef` para ser fechada caso o usuário volte durante o processamento

**Barra de progresso:** usa `variant="determinate"` com valor numérico quando `progress > 0`, e `variant="indeterminate"` enquanto está iniciando.

---

## Dependências

| Pacote | Uso |
|--------|-----|
| `react` / `react-dom` | Base da interface |
| `@mui/material` | Componentes de UI (TextField, LinearProgress, Alert, Fade…) |
| `@mui/icons-material` | Ícones (ArrowForward, ArrowBack, MusicNote, QueueMusic) |
| `@emotion/react` / `@emotion/styled` | Engine de estilos exigida pelo MUI |
| `axios` | Requisições HTTP para o backend |
| `vite` | Bundler e dev server |

---

## Como executar

### Pré-requisito

O backend (`express-mp3-downloader-backend`) deve estar rodando em `http://localhost:3001`.

### Instalar dependências

```bash
npm install
```

### Iniciar em modo desenvolvimento

```bash
npm run dev
```

Disponível em `http://localhost:5173`.

### Build de produção

```bash
npm run build
```

Os arquivos estáticos são gerados em `dist/`.
