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
│ ├── architecture/               # System architecture artifacts
│ │ ├── architecture.md           # System design & trade-offs
│ │ ├── diagrams/                 # Architecture diagrams
│ │ │ ├── scratch-executive.mmd
│ │ │ ├── scratch-executive.png
│ │ │ ├── scratch-technical-mvp.mmd
│ │ │ ├── scratch-technical-mvp.png
│ │ │ ├── scratch-technical-future.mmd
│ │ │ └── scratch-technical-future.png
│ │ └── adr/                      # Architectural Decision Records
│ │   └── *.md
│ ├── roadmap/                    # Product evolution & milestones
│ │ └── roadmap.md
│ ├── requests/                   # HTTP request examples
│ └── scripts.md                  # pnpm scripts reference
├── scripts/                      # Executable helper scripts (DB seed, etc.)
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
- docs/roadmap/roadmap.md — phased product evolution plan
- docs/architecture/architecture.md — core system design and trade-offs
- docs/architecture/diagrams/*.png — visual architecture diagrams
- docs/architecture/diagrams/*.mmd — architecture diagrams code
- docs/architecture/adr/*.md — architectural decision records
- docs/requests/*.http — example API calls
- docs/scripts.md — complete pnpm scripts reference
