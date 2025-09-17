import { initialiseServer } from './server';
import { getDbConnection } from './database';
import { initialiseStatusListStore } from 'statusLists/StatusListStore';
import { loadKey } from './utils/keymanager';

async function main() {
    await loadKey();
    await getDbConnection();
    await initialiseStatusListStore();
    await initialiseServer();
}

main().catch(console.log)

