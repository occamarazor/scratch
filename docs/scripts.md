## Scripts

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
| `pnpm docker:restart`   | CAUTION! Restart Docker Compose services from scratch    |
| `pnpm db:create`        | Create local development database (`scratch_db`)         |
| `pnpm db:drop`          | Drop local development database if it exists             |
| `pnpm migrate:generate` | Generate new TypeORM migration based on entity changes   |
| `pnpm migrate:run`      | Apply all pending database migrations                    |
| `pnpm migrate:revert`   | Roll back the most recent migration                      |
| `pnpm seed:run`         | Run the database seeding scripts                         |

---