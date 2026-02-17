# Contributing to StackLift

Thanks for your interest. StackLift is by [Statix](https://statsly.org/).

## Local Setup

1. Clone the repo
2. Run `./scripts/setup.sh` (creates `.env`, `config/pgadmin/pgpass`)
3. Run `docker compose up`

On Windows, `setup.sh` requires Bash. See the [Windows section](README.md#windows) in the README for manual setup.

## Reporting Bugs

Open an issue with:

- Steps to reproduce
- Expected vs actual behavior
- OS and Docker version

## Pull Requests

1. Fork and create a branch (`feat/...`, `fix/...`, `chore/...`, `docs/...`)
2. Make your changes
3. Run `npm run lint` in `frontend/` and `backend/`
4. Run `npm run build` in both
5. Open a PR against `main` with a clear description

CI runs lint and build automatically. Lint fixes may be auto-committed to your PR branch.

## Code Style

- TypeScript for backend and frontend
- ESLint (Next.js config in frontend)
- Prefer concise, readable code over clever tricks
