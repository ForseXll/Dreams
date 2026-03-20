# API Contract Layer

This folder is the migration-safe entry point for backend calls.

## What lives here

- `generated/openapi.d.ts`: generated OpenAPI types from `backend/openapi.json`
- `client.js`: shared fetch wrapper (`credentials: include`, base URL, error normalization)
- `auth.js`: first endpoint group migrated to REST client

## Regenerate types

From repo root:

```bash
pnpm api:sync
```

This will:

1. export the latest OpenAPI schema from the backend
2. generate frontend types from the exported schema

## Environment

- `NEXT_PUBLIC_API_URL` (optional)
  - defaults to `http://localhost:4000`
