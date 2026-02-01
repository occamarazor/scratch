# 🧩 Scratch — Task Management API

Scratch is a clean, modular, production-ready NestJS + TypeScript backend service that provides a
robust Task Management API. It uses PostgreSQL, TypeORM, strong DTO validation, and modern
development tooling. This project is designed for clarity, maintainability, and future expansion
(authentication, observability, CI/CD, deployments, SAAS, etc.).

---

## ✨ Features

### ✅ Implemented in Phase 1

- NestJS modular architecture
- Tasks module
  - Get task list
  - Create task
  - Bulk tasks update
  - Delete all tasks
  - Get specific task
  - Update task
  - Patch task
  - Delete task
- DTO validation
  - Title (required, max length)
  - Description (optional, max length)
  - Status strict enum (`TODO`, `IN_PROGRESS`, `DONE`)
  - Priority range validation (0–4)
  - ISO date strings with proper parsing
- Robust TypeORM entity with constraints
  - CHECK constraint on priority range
  - INDEX on (ownerId, status, priority)
- Migrations
  - Full DataSource setup
  - First migration: tasks table
- Docker-based PostgreSQL development environment
- TSConfig path aliases
- ESLint + Prettier
- Error handling through Nest pipes

---

## 📂 Structure

```
├── src/
│   ├── common/                   # Reusables (decorators, pipes, types)
│   ├── config/                   # App configs, schema validation (joi)
│   ├── migrations/               # TypeORM migrations (source)
│   ├── tasks/                    # Tasks feature module
│   │   ├── dto/                  # Request/response DTOs
│   │   ├── entities/             # TypeORM entity definitions
│   │   ├── tests/                # Unit tests (jest) for this module
│   │   ├── tasks.controller.ts
│   │   ├── tasks.service.ts
│   │   ├── tasks.module.ts
│   │   └── tasks.types.ts
│   ├── app.module.ts             # Root module
│   ├── data-source.ts            # TypeORM CLI datasource
│   └── main.ts                   # Application entrypoint
├── test/                         # Tests (E2E, integration, utility)
├── docs/
│   └── requests/                 # HTTP request examples (REST client)
├── scripts/                      # DB seeding or helper scripts
├── .vscode/                      # VSCode config (launch, tasks)
├── .env.dev                      # Development environment variables
├── docker-compose.yml            # Local Docker services (Postgres)
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🧱 Requirements

- Node.js >= 22
- pnpm >= 10
- Docker & Docker Compose
- PostgreSQL 16 (via Docker)

---

## ⚙️ Environment

- .env.dev – development environment (committed, has priority)
- .env – optional local override

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

---

## ▶️ Running the Project

### Install dependencies

```
pnpm install
```

### Start Docker Compose Services

```
pnpm docker:up
```

### Run DB migration

```
pnpm migrate:run
```

Starts local Postgres container on port 5432

### Seed database (optional)

```
pnpm seed:tasks
```

### Run BE (development)

```
pnpm start:dev
```

API runs at http://localhost:3000

---

## 🗃️ Database & Migrations

### Generate a new migration

```
pnpm migrate:generate
```

### Run migrations

```
pnpm migrate:run
```

### Revert last migration

```
pnpm migrate:revert
```

### Reset database (CAUTION: dev only!)

```
pnpm docker:restart
pnpm migrate:run
```

---

## 📡 Endpoints

| **Method** | **Endpoint**     | **Description**                     |
| ---------- | ---------------- | ----------------------------------- |
| GET        | `/api/tasks`     | Get all tasks (optionally filtered) |
| POST       | `/api/tasks`     | Create a new task                   |
| PATCH      | `/api/tasks`     | Bulk patch update                   |
| DELETE     | `/api/tasks`     | Delete all tasks                    |
| GET        | `/api/tasks/:id` | Get a specific task                 |
| PATCH      | `/api/tasks/:id` | Partial task update                 |
| DELETE     | `/api/tasks/:id` | Delete a task                       |

---

## 📜 Scripts

| **Script**              | **Description**                                          |
| ----------------------- | -------------------------------------------------------- |
| `pnpm install`          | Install project dependencies                             |
| `pnpm build`            | Compile TypeScript to `dist/` directory                  |
| `pnpm start`            | Start app in production mode                             |
| `pnpm start:dev`        | Start dev server with hot reload                         |
| `pnpm start:debug`      | Start app in debug mode with file watching               |
| `pnpm start:prod`       | Run compiled app from `dist/main.js`                     |
| `pnpm format`           | Format entire codebase using Prettier                    |
| `pnpm lint`             | Run ESLint to check for code issues                      |
| `pnpm test`             | Execute all Jest unit tests                              |
| `pnpm test:watch`       | Continuously run tests whenever files change             |
| `pnpm test:cov`         | Run tests and generate coverage reports                  |
| `pnpm test:debug`       | Run tests in Node inspector debug mode                   |
| `pnpm test:e2e`         | Run end-to-end tests using Jest E2E configuration        |
| `pnpm docker:up`        | Start local infrastructure (Postgres) via Docker Compose |
| `pnpm docker:down`      | Stop and remove all Docker containers and resources      |
| `pnpm docker:restart`   | Restart Docker Compose services from scratch             |
| `pnpm db:create`        | Create local development database (`scratch_db`)         |
| `pnpm db:drop`          | Drop local development database if it exists             |
| `pnpm migrate:generate` | Generate new TypeORM migration based on entity changes   |
| `pnpm migrate:run`      | Apply all pending database migrations                    |
| `pnpm migrate:revert`   | Roll back the most recent migration                      |
| `pnpm seed:run`         | Run the database seeding scripts                         |

---

## 🚀 Roadmap

These will be added gradually:

- Authentication (JWT)
- Users module
- RBAC
- OpenAPI / Swagger documentation
- Observability (metrics, logs, tracing)
- Health checks & readiness endpoints
- Git hooks
- CI/CD
- Production Dockerfile
- Helm charts / Kubernetes deployment
- Rate limiting
- Caching (Redis)
- Background workers (BullMQ)
- Integration tests

---

## 📄 License

MIT
