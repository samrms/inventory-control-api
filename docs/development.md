# Development

## Requirements

- Node.js 24+
- PostgreSQL 17+
- pnpm 10+

## Getting Started

```bash
cp .env.example .env
pnpm install
pnpm migrate
pnpm dev
```

Server runs at `http://localhost:3000`. Health check: `GET /health`.

## Environment Variables

| Variable       | Required | Description                                        |
| -------------- | -------- | -------------------------------------------------- |
| `PORT`         | No       | Server port (default: `3333`, Render sets `10000`) |
| `DATABASE_URL` | Yes      | PostgreSQL connection string                       |
| `JWT_SECRET`   | Yes      | Secret for signing JWT tokens                      |
| `NODE_ENV`     | No       | `development` or `production`                      |

## Testing

```bash
pnpm test:unit          # unit tests (no DB needed)
pnpm test:integration   # integration tests (needs PostgreSQL)
pnpm test:e2e           # end-to-end tests (needs PostgreSQL)
pnpm test               # run all tests
```

## Docker

```bash
docker compose up -d
docker compose down
```
