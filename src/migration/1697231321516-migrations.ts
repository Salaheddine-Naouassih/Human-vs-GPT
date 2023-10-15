import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1697231321516 implements MigrationInterface {
    name = 'Migrations1697231321516'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "tokenVersion"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "tokenVersion" integer NOT NULL`);
    }

}
