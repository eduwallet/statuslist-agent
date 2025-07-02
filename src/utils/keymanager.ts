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
  const object = JSON.parse(fs.readFileSync('local.key', 'utf8').toString()) as KeyData;
  _key = await Factory.createFromType(object.type, object.privateKeyHex);
  _did = object.name;
}

export function getKey() { return _key; }
export function getDID() { return _did; }
