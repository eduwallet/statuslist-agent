import passport from 'passport';
import { Strategy } from 'passport-http-bearer';
import { StatusListType } from '../statusLists/StatusListType';

type PassportCallback = (err:any, res:any) => void;

export function bearerAdmin(statusList:StatusListType) {
    passport.use(statusList.name + '-admin', new Strategy(
        function (token:string, done:PassportCallback) {
            if (statusList.adminTokens.includes(token)) {
                return done(null, statusList);
            }
            return done(null, false);
        }
    ));
}
