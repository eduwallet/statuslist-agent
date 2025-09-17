import Debug from 'debug'
import { DataSource } from 'typeorm'
import { dbConfig } from './config';
import { getEnv } from '../utils/getEnv';

const debug = Debug(`statuslist:db`)
const schema = getEnv('DB_SCHEMA', 'statuslist');

var dataSource:DataSource|null = null;

export const getDbConnection = async (): Promise<DataSource> => {
    if (dbConfig.synchronize) {
        return Promise.reject(`WARNING: Migrations need to be enabled in this app! Adjust the database configuration and set migrationsRun and synchronize to false`);
    }

    if (!dataSource) {
        dataSource = await new DataSource({ ...dbConfig, name: schema }).initialize()

        if (dbConfig.migrationsRun) {
            debug(`Migrations are currently managed from config. Please set migrationsRun and synchronize to false to get consistent behaviour. We run migrations from code explicitly`);
        } 
        else {
            debug(`Running ${dataSource.migrations.length} migration(s) from code if needed...`)
            await dataSource.runMigrations()
            debug(`${dataSource.migrations.length} migration(s) from code were inspected and applied`)
        }
    }
    return dataSource
}
