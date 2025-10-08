import passport from 'passport';
import { Strategy } from 'passport-http-bearer';
import express, { Express } from 'express'
import { createConfiguration, deleteConfiguration, listConfigurations, storeConfiguration } from './lists';

function bearerAdminForAPI() {
    passport.use('admin-api', new Strategy(
        function (token:string, done:Function) {
            if (token == process.env.BEARER_TOKEN) {
                return done(null, true);
            }
            return done(null, false);
        }
    ));
}

export async function createRoutesForAdmin(app:Express) {
    console.log('creating routes for api');
    const router = express.Router();
    app.use('/api', router);
    bearerAdminForAPI();

    router.get('/exit',
        passport.authenticate('admin-api', { session: false }),
        () => {
            setTimeout(() => { process.exit(0)}, 2000);
        }
    )

    router.get('/lists', 
        passport.authenticate('admin-api', { session: false }),
        listConfigurations
    );
    router.post('/lists', 
        passport.authenticate('admin-api', { session: false }),
        storeConfiguration
    );
    router.delete('/lists', 
        passport.authenticate('admin-api', { session: false }),
        deleteConfiguration
    );
    router.put('/lists', 
        passport.authenticate('admin-api', { session: false }),
        createConfiguration
    );

}

