import Debug from 'debug'
import express, {Express} from 'express'
import { StatusListType } from "statusLists/StatusListType";
import { getCredential } from './endpoints/getCredential';
import { getListIndex } from './endpoints/getListIndex';
import { revokeIndex } from './endpoints/revokeIndex';
import { getStatus } from './endpoints/getStatus';
import { setStatus } from './endpoints/setStatus';

const debug = Debug(`statuslists:server`)

export async function createRoutes(statusList:StatusListType, app:Express) {
    debug('creating routes for ', statusList.name);

    const router = express.Router();
    getCredential(statusList, router);
    getListIndex(statusList, router);
    revokeIndex(statusList, router);
    setStatus(statusList, router);
    getStatus(statusList, router);
    app.use('/' + statusList.name, router);
}

