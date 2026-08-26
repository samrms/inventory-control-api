# Deployment

## Render

1. Push to `main` branch
2. Add `RENDER_SERVICE_ID` and `RENDER_API_KEY` as GitHub repo secrets
3. CI runs all test tiers on push/PR
4. Merges to `main` trigger auto-deploy via `render.yaml` (runs migrations, starts server)

**render.yaml** provisions a free PostgreSQL database and links it to the web service.

## CI/CD

GitHub Actions pipeline:

- **Lint**: Prettier format check
- **Unit tests**: No DB required
- **Integration tests**: PostgreSQL service container
- **E2E tests**: Full stack with PostgreSQL
