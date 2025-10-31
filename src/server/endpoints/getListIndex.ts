import { getEnv } from '@utils/getEnv';
import { Router, Request, Response } from 'express';
import { stat } from 'fs';
import moment from 'moment';
import passport from 'passport';
import { createStatusCredential } from 'server/lib/createStatusCredential';
import { StatusListType } from 'statusLists/StatusListType';

interface ListIndexRequest {
    expirationDate: string
}

interface ListIndexResponse {
    credentialStatus: any;
    index: number;
    list: number;
    type: string;
    purpose:string;
}

/* Request a new index from the indicated statuslist type
 *
 * A new index is determined. If the previous revision of this statuslist type was considered
 * full, a new statuslist is created.
 * This also returns a specific revoke URL, which would actually work as a toggle-url
 * and a status url to retrieve the specific status of this index
 */
export function getListIndex(statusList:StatusListType, router:Router) {
    router!.post('/api/index',
        passport.authenticate(statusList.name + '-admin', { session: false }),
        async (request: Request<ListIndexRequest>, response: Response<ListIndexResponse>) => {
            try {
                const date = moment(request.body.expirationDate).toDate();
                const { list, index } = await statusList.newIndex(date);

                var retval:ListIndexResponse = {
                    credentialStatus: createStatusCredential(statusList, list, index),
                    index: index,
                    list: list.index,
                    type: statusList.type,
                    purpose: statusList.purpose
                }
                response.send(retval);
            } catch (e) {
                response.status(500).end('Internal server error');
            }
        });
}