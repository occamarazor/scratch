import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitTasksTable1699425600 implements MigrationInterface {
  name = 'InitTasksTable1699425600';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create status enum-like check (Postgres doesn't require enum, we can use check or actual enum)
    await queryRunner.query(`
      CREATE TABLE "tasks" (
        "id" SERIAL PRIMARY KEY,
        "title" varchar(255) NOT NULL,
        "description" text,
        "status" varchar(20) NOT NULL DEFAULT 'TODO',
        "priority" int NOT NULL DEFAULT 0,
        "dueAt" timestamptz,
        "ownerId" int,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now()
      );
    `);

    // index
    await queryRunner.query(
      `CREATE INDEX "IDX_tasks_owner_status_priority" ON "tasks" ("ownerId", "status", "priority");`,
    );

    // priority check
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD CONSTRAINT "CHK_tasks_priority_range" CHECK ("priority" >= 0 AND "priority" <= 4);`,
    );

    // status allowed values check (alternative to enum)
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD CONSTRAINT "CHK_tasks_status_values" CHECK ("status" IN ('TODO','IN_PROGRESS','DONE'));`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "CHK_tasks_status_values"`);
    await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "CHK_tasks_priority_range"`);
    await queryRunner.query(`DROP INDEX "IDX_tasks_owner_status_priority"`);
    await queryRunner.query(`DROP TABLE "tasks"`);
  }
}
