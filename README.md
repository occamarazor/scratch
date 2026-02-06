# Scratch

Scratch is a backend-first task management API built to demonstrate production-grade backend architecture, data modeling, and developer experience rather than feature breadth.

This repository is intentionally architecture-centric. Decisions are explicit, documented, and optimized for long-term SaaS evolution.

## Purpose

- Showcase a clean NestJS + TypeScript backend
- Enforce strong typing and validation at system boundaries
- Evolve the database exclusively via migrations
- Maintain a realistic, production-oriented project layout

## Scope (Phase 1)

### In scope
- Tasks CRUD API
- DTO validation and error handling
- PostgreSQL + TypeORM
- Dockerized local development
- Test foundations

### Out of scope (for now)
- UI and client apps
- Microservices or distributed systems
- Heavy infrastructure (queues, observability stacks)

## Project Structure

```
├── src/
│ ├── common/                     # Shared utilities, pipes, decorators
│ ├── config/                     # Typed configuration + validation
│ ├── migrations/                 # TypeORM migrations
│ ├── tasks/                      # Tasks feature module
│ ├── app.module.ts               # Root module
│ ├── data-source.ts              # TypeORM CLI datasource
│ └── main.ts                     # Application entrypoint
├── docs/
│ ├── architecture.md             # System design & trade-offs
│ ├── roadmap.md                  # Phased evolution plan
│ ├── scripts.md                  # pnpm scripts reference
│ ├── adr/                        # Architectural Decision Records
│ └── requests/                   # HTTP request examples (REST client)
├── scripts/                      # DB seeding or helper scripts
├── test/                         # E2E / integration tests
├── docker-compose.yml            # Local Docker services (Postgres)
├── .env.dev                      # Development environment variables
└── README.md
```

## Requirements
- Node.js >= 22
- pnpm >= 10
- Docker & Docker Compose
- PostgreSQL 16 (via Docker)

## Environment
Environment variables are defined in .env.dev (committed, used by default). Local overrides can be placed in .env.

```
APP_NAME=Scratch
NODE_ENV=development
PORT=3000
FRONTEND_URL=

DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=scratch_db
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres

JWT_SECRET=
JWT_EXPIRES_IN=1h
```

## Running Locally

```
pnpm install
pnpm docker:up
pnpm migrate:run
pnpm start:dev
```

API will be available at http://localhost:3000.

## Endpoints

| **Method** | **Endpoint**     | **Description**                     |
| ---------- | ---------------- | ----------------------------------- |
| GET        | `/api/tasks`     | List tasks                          |
| POST       | `/api/tasks`     | Create task                         |
| PATCH      | `/api/tasks`     | Bulk update tasks                   |
| DELETE     | `/api/tasks`     | Delete all tasks                    |
| GET        | `/api/tasks/:id` | Get task by id                      |
| PATCH      | `/api/tasks/:id` | Update task                         |
| DELETE     | `/api/tasks/:id` | Delete task                         |

## Documentation
- docs/architecture.md — system design and trade-offs
- docs/roadmap.md — phased evolution plan
- docs/adr/ — architectural decision records
- docs/scripts.md — pnpm scripts reference
- docs/requests/*.http — example API calls
