import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitTasksTable1763138264842 implements MigrationInterface {
  name = 'InitTasksTable1763138264842';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "tasks" (
      "id" SERIAL PRIMARY KEY,
      "title" varchar(255) NOT NULL,
      "description" text,
      "status" varchar(11) NOT NULL DEFAULT 'TODO',
      "priority" integer NOT NULL DEFAULT 0,
      "ownerId" varchar(36) NOT NULL,
      "dueAt" timestamptz,
      "createdAt" timestamptz NOT NULL DEFAULT now(),
      "updatedAt" timestamptz NOT NULL DEFAULT now()
      )`,
    );

    // Add index (same columns, readable name)
    await queryRunner.query(`
      CREATE INDEX "IDX_tasks_owner_status_priority" ON "tasks" ("ownerId", "status", "priority");
    `);

    // Add DB-level priority range check
    await queryRunner.query(`
      ALTER TABLE "tasks"
      ADD CONSTRAINT "CHK_tasks_priority_range" CHECK ("priority" >= 0 AND "priority" <= 4);
    `);

    // Add DB-level allowed values check for status
    await queryRunner.query(`
      ALTER TABLE "tasks"
      ADD CONSTRAINT "CHK_tasks_status_values" CHECK ("status" IN ('TODO', 'IN_PROGRESS', 'DONE'));
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop constraints and index and table in reverse order
    await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "CHK_tasks_status_values"`);
    await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "CHK_tasks_priority_range"`);
    await queryRunner.query(`DROP INDEX "IDX_tasks_owner_status_priority"`);
    await queryRunner.query(`DROP TABLE "tasks"`);
  }
}
