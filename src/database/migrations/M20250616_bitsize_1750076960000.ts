
import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm'

export class M20250616_bitsize_1750076960000 implements MigrationInterface {

  getTableName(queryRunner: QueryRunner, givenName: string): string {
    return (
        queryRunner.connection.entityMetadatas.find((meta) => meta.givenTableName === givenName)?.tableName ||
        givenName
    )
  }

  async up(queryRunner: QueryRunner): Promise<void> {
      
    if (!await queryRunner.hasColumn(this.getTableName(queryRunner, 'statuslist'), 'bitsize')) {
      await queryRunner.addColumn(
          this.getTableName(queryRunner, 'statuslist'),
          new TableColumn({ name: 'bitsize', type: 'int', isNullable: true})
      );
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasColumn(this.getTableName(queryRunner, 'statuslist'), 'bitsize')) {
      await queryRunner.dropColumn(this.getTableName(queryRunner, 'statuslist'), 'bitsize');
    }
  }
}
