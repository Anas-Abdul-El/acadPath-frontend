# acadPath-frontend

React + Vite + TypeScript frontend for AcadPath, an academic planning platform for university students.

## Local setup

```sh
pnpm install
cp .env.example .env   # points at the backend on http://localhost:3000/api
pnpm dev               # http://localhost:5173
```

## Scripts

- `pnpm build`: type-check and build for production
- `pnpm lint`: ESLint
- `pnpm test:run`: unit tests (Vitest)

## Deployment

Deployed on Vercel. `vercel.json` proxies `/api` to the Render backend, so the refresh-token
cookie stays first-party. Production URLs are in `.env.production`.
