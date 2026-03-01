# Scripts

## 🏗 Build & Run

| **Script**         | **Description**                            |
| ------------------ | ------------------------------------------ |
| `pnpm install`     | Install project dependencies               |
| `pnpm build`       | Compile TypeScript to `dist/`              |
| `pnpm start`       | Start app in production mode               |
| `pnpm start:dev`   | Start app in dev mode with hot reload      |
| `pnpm start:debug` | Start app in debug mode with file watching |
| `pnpm start:prod`  | Run compiled app from `dist/main.js`       |

## 🗄 Database

| **Script**              | **Description**                                          |
| ----------------------- | -------------------------------------------------------- |
| `pnpm docker:up`        | Start local infrastructure (Postgres) via Docker Compose |
| `pnpm docker:down`      | Stop and remove all Docker containers and resources      |
| `pnpm docker:restart`   | CAUTION! Restart Docker Compose services from scratch    |
| `pnpm db:create`        | Create local development database (`scratch_db`)         |
| `pnpm db:drop`          | Drop local development database if it exists             |
| `pnpm migrate:generate` | Generate new TypeORM migration based on entity changes   |
| `pnpm migrate:run`      | Apply all pending database migrations                    |
| `pnpm migrate:revert`   | Roll back the most recent migration                      |
| `pnpm seed:run`         | Run the database seeding scripts                         |

## 🎨 Code Quality

| **Script**    | **Description**                       |
| ------------- | ------------------------------------- |
| `pnpm format` | Format entire codebase using Prettier |
| `pnpm lint`   | Run ESLint to check for code issues   |

## 🧪 Testing & Validation

| **Script**        | **Description**                           |
| ----------------- | ----------------------------------------- |
| `pnpm test`       | Run unit tests                            |
| `pnpm test:watch` | Run tests in watch mode                   |
| `pnpm test:cov`   | Run tests with coverage report            |
| `pnpm test:debug` | Run tests in Node inspector debug mode    |
| `pnpm test:e2e`   | Run end-to-end tests                      |
| `pnpm typecheck`  | TypeScript compile check (`tsc --noEmit`) |

## 🔐 Git Hooks (Local Enforcement)

| **Script**         | **Description**             |
| ------------------ | --------------------------- |
| `pnpm prepare`     | Initialize Husky Git hooks  |
| `pnpm lint-staged` | Run linting on staged files |
