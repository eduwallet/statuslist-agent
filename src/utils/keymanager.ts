import fs from "fs";
import { Factory, CryptoKey } from '@muisit/cryptokey';
import { getDbConnection } from "../database";
import { Identifier } from "../database/entities/Identifier";
import { PrivateKey } from "../database/entities/PrivateKey";

interface KeyData {
  privateKeyHex: string;
  type: string;
  name: string;
}

let _key:CryptoKey|null = null;
let _did:string = '';

export async function loadKey()
{
  const keydata = process.env.APP_KEY;
  if (keydata && keydata.length) {
    console.log('setting key based on ENV');
    const elements = keydata.split(':');
    if (elements.length == 2 && ['secp256r1', 'secp256k1', 'ed25519'].includes(elements[0].toLowerCase())) {
      _key = await Factory.createFromType(elements[0], elements[1]);
      _did = process.env.APP_DID ?? await Factory.toDIDJWK(_key);
      return;
    }
    else if (elements.length > 0) {
      // APP_KEY is an identifier from the local database
      try {
        _did = process.env.APP_KEY!;
        const db = await getDbConnection();
        const repo = db.getRepository(Identifier);
        const result = await repo.createQueryBuilder('identifier')
            .innerJoinAndSelect("identifier.keys", "key")
            .where('identifier.did=:did', {did: _did})
            .orWhere('identifier.alias=:alias', {alias: _did})
            .getOne();
        if (result) {
          const dbKey = result.keys[0];
          const pkeys = db.getRepository(PrivateKey);
          const pkey = await pkeys.findOneBy({alias:dbKey.kid});
          _key = await Factory.createFromType(dbKey.type, pkey?.privateKeyHex);
          return;
        }
      }
      catch (e) {
        console.log('Caught error initialising key from local database');
      }
    }
  }

  try {
    console.log('Loading key from local file');
    if (fs.existsSync('local.key')) {
      const object = JSON.parse(fs.readFileSync('local.key', 'utf8').toString()) as KeyData;
      _key = await Factory.createFromType(object.type, object.privateKeyHex);
      _did = object.name;
    }
  }
  catch (e) {
    console.log('Parsing error in local key file', e);
  }

  
}

export function getKey() { return _key; }
export function getDID() { return _did; }
