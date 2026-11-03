# La Toque Verte – Gestion (frontend)

Interface de gestion de la pâtisserie : ingrédients, stocks fournisseurs, recettes, sous-recettes,
coût de revient et ingrédients manquants.

## Stack

- [Vue 3.5](https://vuejs.org) + [Vite 8](https://vite.dev)
- [vue-router 5](https://router.vuejs.org) avec routing par fichiers (`src/pages`) et layouts (`src/layouts`)
- [Pinia 4](https://pinia.vuejs.org) pour l'état UI, [TanStack Query 5](https://tanstack.com/query) pour les données serveur
- [Naive UI](https://www.naiveui.com) + [UnoCSS](https://unocss.dev) (icônes Carbon / Fluent / Material Symbols embarquées)
- [vue-i18n](https://vue-i18n.intlify.dev) (`locales/fr.yml`, `locales/en.yml`)
- TypeScript 6, Vitest 5, ESLint 10 (`@antfu/eslint-config`)

## Démarrer

```bash
cp .env.example .env      # puis ajuster VITE_API_URL si besoin
pnpm install
pnpm dev                  # http://localhost:3333
```

## Scripts

| Commande                      | Rôle                                |
| ----------------------------- | ----------------------------------- |
| `pnpm dev`                    | serveur de dev                      |
| `pnpm build`                  | build de production dans `dist/`    |
| `pnpm typecheck`              | vérification TypeScript (`vue-tsc`) |
| `pnpm lint` / `pnpm lint:fix` | ESLint                              |
| `pnpm test:run`               | tests unitaires                     |

## API

Tous les appels REST passent par `src/composables/apiService.ts` (client `ofetch`).
L'URL de base vient de `VITE_API_URL`. Pour brancher un autre backend, c'est le seul fichier à adapter.
