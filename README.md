# Nibhrito

A local-first private narrative companion and continuity engine for Android.

## Overview

- **Platform**: Android (Capacitor) + Desktop browser
- **Architecture**: Monorepo — Next.js (web) + Express (API) + Prisma (ORM)
- **Deployment**: Local-first (Ollama/GGUF) with optional cloud providers
- **Privacy**: Single-user, offline-capable, no required cloud services

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, TypeScript |
| API | Express, TypeScript, Zod |
| Database | PostgreSQL (dev) / SQLite (mobile fallback) |
| ORM | Prisma |
| Mobile | Capacitor |
| AI | Ollama (local), HuggingFace, OpenRouter |

## Documentation

- `docs/product/MASTER-BUILD-BLUEPRINT-v2.md` — Full feature catalogue
- `docs/product/PARALLEL-BUILD-PLAYBOOK-v1.md` — Development lanes and ownership

## Quick Start

```bash
# Install dependencies
pnpm install

# Setup database
cd apps/api && npx prisma migrate dev && npx prisma generate

# Start development
pnpm dev
```

## Project Structure

```
apps/
  api/          — Express API server
  web/          — Next.js frontend + Capacitor Android shell
packages/
  contracts/    — Shared types and Zod schemas
  context-engine/ — Memory and prompt assembly
  ai-providers/ — AI provider adapters
  domain/       — Business logic types
  media/        — File handling and asset storage
  speech/       — Voice interfaces (STT/TTS)
  bengali-corpus/ — Bengali text processing
docs/
  product/      — Blueprints and playbooks
  architecture/ — ADRs and RFCs
  lanes/        — Lane briefs for AI agents
tests/
  unit/         — Unit tests
  integration/  — API integration tests
  e2e/          — End-to-end tests
```

## License

Private — personal use only.