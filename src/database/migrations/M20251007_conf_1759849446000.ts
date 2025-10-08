
import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm'

export class M20251007_conf_1759849446000 implements MigrationInterface {

  getTableName(queryRunner: QueryRunner, givenName: string): string {
    return (
        queryRunner.connection.entityMetadatas.find((meta) => meta.givenTableName === givenName)?.tableName ||
        givenName
    )
  }

  async up(queryRunner: QueryRunner): Promise<void> {
    const dateTimeType: string = queryRunner.connection.driver.mappedDataTypes.createDate as string
      
    await queryRunner.createTable(
        new Table({
          name: this.getTableName(queryRunner, 'statuslistconf'),
          columns: [
            { name: 'id', type: "int", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
            { name: 'name', type: 'varchar', isNullable: false},
            { name: 'tokens', type: 'text', isNullable: false},
            { name: 'messages', type: 'text', isNullable: true},
            { name: 'size', type: 'int', isNullable: false},
            { name: 'bitsize', type: 'int', isNullable: false},
            { name: 'purpose', type: 'varchar', isNullable: false},
            { name: 'type', type: 'varchar', isNullable: false },
            { name: 'saveDate', type: dateTimeType },
            { name: 'updateDate', type: dateTimeType }
          ],
        }),
        true,
      )
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('statuslistconf')) {
        await queryRunner.dropTable('statuslistconf', true, true, true);
    }
  }
}
