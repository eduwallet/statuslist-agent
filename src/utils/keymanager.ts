import fs from "fs";
import { Factory, CryptoKey } from '@muisit/cryptokey';

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
    _key = await Factory.createFromType(elements[0], elements[1]);
    _did = process.env.APP_DID ?? await Factory.toDIDJWK(_key);
    return;
  }

  console.log('Loading key from local file');
  const object = JSON.parse(fs.readFileSync('local.key', 'utf8').toString()) as KeyData;
  _key = await Factory.createFromType(object.type, object.privateKeyHex);
  _did = object.name;
}

export function getKey() { return _key; }
export function getDID() { return _did; }
