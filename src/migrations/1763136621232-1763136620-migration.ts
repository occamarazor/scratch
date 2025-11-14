import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1763136621232 implements MigrationInterface {
  name = '1763136620Migration1763136621232';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "tasks" (
      "id" SERIAL NOT NULL,
      "title" character varying(255) NOT NULL,
      "description" text,
      "status" character varying(11) NOT NULL DEFAULT 'TODO',
      "priority" integer NOT NULL DEFAULT '0',
      "dueAt" TIMESTAMP WITH TIME ZONE,
      "ownerId" integer,
      "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      CONSTRAINT "CHK_64955ed00ce4e9e0a5b89b1b4c" CHECK ("priority" >= 0 AND "priority" <= 4),
      CONSTRAINT "PK_8d12ff38fcc62aaba2cab748772" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f0256933c9579cb24620db577f" ON "tasks" ("ownerId", "status", "priority") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_f0256933c9579cb24620db577f"`);
    await queryRunner.query(`DROP TABLE "tasks"`);
  }
}
