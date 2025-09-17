import { Factory } from '@muisit/cryptokey';

const key = await Factory.createFromType(process.argv[2] ?? 'Secp256r1');
await key.createPrivateKey();
console.log(key.exportPrivateKey());
