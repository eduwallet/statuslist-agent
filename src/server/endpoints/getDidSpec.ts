import { Factory } from '@muisit/cryptokey';
import { getKey, getDID } from '../../utils/keymanager';
import { Request, Router } from 'express'

export function getDidSpec(router:Router) {
    var path = '/.well-known/did.json';
    router!.get(path, async (req: Request, res) => {
        const key = getKey();
        return res.json(await Factory.toDIDDocument(key!, getDID()));
    });
}
