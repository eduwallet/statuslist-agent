import { StatusListStatus } from "../../types";
import moment from 'moment';
import { Factory } from '@muisit/cryptokey';
import { getKey } from "../../utils/keymanager";
import { JWT } from "../../jwt/JWT";
import { StatusListType } from "../../statusLists/StatusListType";

// The old StatusList2020 implementation:
// https://github.com/w3c/vc-bitstring-status-list/tree/v0.0.1?tab=readme-ov-file
// The latest BitstringStatusList version
// https://www.w3.org/TR/vc-bitstring-status-list/
export async function statusListAsVC(data:StatusListStatus) 
{
    const key = getKey();

    var statusListCredential:any = {
        "@context": ["https://www.w3.org/ns/credentials/v2"],
        "id": data.basepath,
        "type": ["VerifiableCredential", data.type.getCredentialType()],
        "issuer": await Factory.toDIDJWK(key!),
        "validFrom": moment(data.date).format(moment.defaultFormatUtc),
        "validUntil": moment(data.date).add(5,'minutes').format(moment.defaultFormatUtc),
        "issuedAt": moment(data.date).format(moment.defaultFormatUtc),
        "credentialSubject": {
            "id": data.basepath + "#list",
            "type": data.type.type,
            "statusPurpose": data.type.purpose
            // encodedList set below
        }
    }

    if (data.type.type === 'BitstringStatusList') {
        statusListCredential.credentialSubject.encodedList = await StatusListType.toMultibaseEncoding(data.statusList);
    }
    else {
        statusListCredential['@context'].push("https://w3id.org/vc-status-list-2021/v1");
        statusListCredential.credentialSubject.encodedList = await StatusListType.toBase64Encoding(data.statusList);
    }

    const jwt = new JWT();
    jwt.payload = statusListCredential;

    // typ and cty are only defined for JSON-LD. The JOSE definition does not mention
    // these headers, but they are not explicitely disallowed either
    jwt.header = {
        alg: key!.algorithms()[0],
        kid: await Factory.toDIDJWK(key!) + '#0',
        typ: 'jwt_vc_json', // should this be vc+jwt?
    };

    // It is RECOMMENDED to use the IANA JSON Web Token Claims registry and the IANA JSON
    // Web Signature and Encryption Header Parameters registry to identify any claims and
    // header parameters that might be confused with members defined by [VC-DATA-MODEL-2.0].
    // These include but are not limited to: iss, kid, alg, iat, exp, and cnf. 
    jwt.header.iss = await Factory.toDIDJWK(key!);

    // When the iat (Issued At) and/or exp (Expiration Time) JWT claims are present, they 
    // represent the issuance and expiration time of the signature, respectively.
    jwt.payload.iat = moment(data.date).unix();
    jwt.payload.exp = moment(data.date).add(15, 'minutes').unix();
    jwt.payload.jti = statusListCredential.id;

    await jwt.sign(key!);
    return jwt.token;
}
