# Bucket 2026

Aplicativo de metas e bucket list com Firebase Auth + Realtime Database, publicado no GitHub Pages via Actions.

## Stack
- Vite + React + TypeScript
- Tailwind CSS
- Firebase Auth (Email/Senha)
- Firebase Realtime Database
- HashRouter (compatível com GitHub Pages)

## Setup local
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

## Deploy (GitHub Pages)
- Workflow em .github/workflows/deploy.yml
- Certifique-se de ativar: Settings > Pages > Source = GitHub Actions
- Base path definido no Vite: /bucket2026/

## Firebase Realtime Database Rules
Cole o conteúdo do arquivo firebase-rtdb.rules.json no console do Firebase:
- Realtime Database > Rules

## Estrutura de dados
Todos os dados ficam isolados por uid:
```
users/{uid}/bucket2026
  themes/{themeId}
  goals/{goalId}
  checklists/{goalId}/{itemId}
  entries/{goalId}/{entryId}
```

## Seed inicial (primeiro login)
- Ao autenticar, o app verifica se existem themes.
- Se não existir, cria automaticamente os temas e metas iniciais da Bucket List 2026.

## Observações importantes
- HashRouter evita 404 no refresh do GitHub Pages.
- base: '/bucket2026/' é obrigatório para o deploy.
- Markdown é renderizado com sanitização via rehype-sanitize.
