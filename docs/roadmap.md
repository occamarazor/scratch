# 📍 Overview

Scratch is a backend-first task management API built to demonstrate production-grade backend architecture, data modeling, and developer experience — not feature breadth.

This roadmap describes a phased, intentional evolution from a clean NestJS monolith toward a production-ready SaaS backend. Each phase is scoped to preserve architectural clarity and avoid premature complexity.

UI, distributed systems, and heavy infrastructure are explicitly deferred until the backend foundation justifies them.

# 🔁 Cross-Phase Principles

These apply to every phase:
- Architecture-first decisions documented via ADRs
- Strong typing and validation at all system boundaries
- Database evolves only via migrations
- Tests added with every meaningful capability
- README, roadmap, and architecture docs stay in sync
- Prefer incremental refactors over rewrites
- Monolith-first unless scale forces extraction


# 🟧 Phase 1 — Backend Core (MVP Baseline)

## Goal
Establish a clean, production-oriented backend baseline with strong DX, migrations, validation, and test foundations.

This phase intentionally excludes UI, auth, jobs, and infra complexity.

## Deliverables

- Tasks CRUD API (NestJS + TypeORM)
- PostgreSQL with migration-driven schema
- DTO validation and consistent error handling
- Typed configuration with environment validation
- Dockerized local development
- Test foundations (unit + e2e scaffolding)
- Documentation baseline

## Scope

### API

- TaskEntity: id, title, description, status, priority, dueAt, createdAt, updatedAt, ownerId (nullable)
- REST endpoints under /api/tasks
- Bulk operations where justified

### Validation & Contracts

- DTOs with class-validator
- Global ValidationPipe
- Explicit request/response boundaries

### Persistence

- PostgreSQL 16
- TypeORM entities + migrations
- Indexes for common access patterns

### Developer Experience

- pnpm scripts
- Docker Compose (local DB only)
- VSCode tasks
- HTTP request examples

### Documentation

- README.md (authoritative project scope)
- roadmap.md (this file)
- architecture.md (design & trade-offs)
- ADRs (key decisions only)
- scripts.md (complete list of pnpm scripts available)

## Out of Scope (Explicit)

- Frontend or UI
- Authentication / users
- Background jobs
- Queues, caches, observability stacks
- Microservices

## Acceptance Criteria

- App runs via pnpm start:dev
- CRUD operations function correctly
- Migrations run cleanly
- Validation errors are consistent and typed
- Docs accurately reflect implementation

---

# 🟩 Phase 2 — Data Modeling & Querying

## Goal
Expand the domain model and querying capabilities without introducing auth or tenancy yet.

## Deliverables

- Extended task relationships
- Query filtering and pagination
- Performance-aware indexing

## Scope

- Introduce UserEntity (no auth yet)
- Convert ownerId → relation
- Optional TagEntity + join table
- Filtering: status, priority, date ranges
- Pagination and sorting
- Basic search (ILIKE / Postgres FTS)
- Document query plans (EXPLAIN ANALYZE)

## Acceptance Criteria

- Tasks support filters and pagination
- Indexes justified and documented
- Query performance characteristics understood

---

# 🟦 Phase 3 — Authentication & Modular Boundaries

## Goal
Introduce authentication, authorization, and clearer module boundaries inside the monolith.

## Deliverables

- JWT-based authentication
- Role-aware access control
- Clear module separation

## Scope

- Auth module (login, register, refresh)
- Password hashing (Argon2 preferred)
- Protect task routes
- Roles: user / admin (minimal)
- Rate limiting (Nest Throttler)
- Security headers and CORS configuration
- Refined project structure (src/modules/*)

## Acceptance Criteria

- Auth flows functional
- Unauthorized access correctly rejected
- Module boundaries explicit and enforced

---

# 🟨 Phase 4 — Background Jobs & Notifications

## Goal
Introduce asynchronous processing while keeping deployment simple.

## Deliverables

- Job queue
- Background workers
- Notification domain

## Scope

- Redis + BullMQ
- Job producers and processors
- NotificationEntity
- Example jobs: reminders, scheduled updates
- Mock email / notification delivery

## Acceptance Criteria

- Jobs enqueue and process reliably
- Notifications queryable via API

---

# 🟪 Phase 5 — Observability & Operational Readiness

## Goal
Prepare the system for real production usage and troubleshooting.

## Deliverables

- Structured logging
- Metrics and health checks
- Hardened CI pipeline

## Scope

- Logging (Pino or Winston)
- /health endpoint
- Prometheus-compatible metrics
- CI: lint, type-check, test, build
- Production Dockerfile

## Acceptance Criteria

- CI pipeline consistently green
- Metrics and health endpoints exposed
- Production build reproducible

---

# 🟥 Phase 6 — Minimal Client (Optional, Demonstrative)

## Goal
Add a non-essential, minimal client purely to demonstrate end-to-end behavior.
This phase exists for demonstration only. The backend remains the product.

## Scope

- Minimal REST client or lightweight UI
- Task list and editing
- No design polish, no complex state

---

# 🟦 Phase 7 — SaaS Foundations & Scale

## Goal
Evolve toward a real SaaS backend once complexity is justified.

## Scope

- Multi-tenant strategy (ADR-driven)
- Tenant isolation
- Usage limits and billing hooks
- Audit logs
- Data export / deletion flows
- Scalability hardening

## Acceptance Criteria

- Tenant isolation enforced
- Limits and quotas functional
- Compliance flows implemented

---

# 🧭 Final Note

This roadmap is not a checklist. It is a learning-driven evolution plan.
Phases may overlap slightly, but scope creep inside a phase is considered a failure. Each phase should end with a system that is coherent, explainable, and defensible from an architectural standpoint.