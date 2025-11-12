# statuslist-agent

The StatusList Agent serves status-lists according to the following specifications:

- IETF Token Status Lists: <https://datatracker.ietf.org/doc/draft-ietf-oauth-status-list/11/>
- W3C BitstringStatus: <https://www.w3.org/TR/vc-bitstring-status-list/>
- W3C StatusList: <https://github.com/w3c/vc-bitstring-status-list> (an older version of the above)

The agent connects to a PostGreSQL database to potentially store the revocation or suspension state of arbitrary credentials (not implemented yet).

## Installation

Install the agent using yarn:

```bash
yarn install
```

Then configure the tool using the supplied `.env.example`. The following options are supported:

- DB_HOST: database host
- DB_USER: database user
- DB_PASSWORD: database user password
- DB_NAME: database name
- DB_SCHEMA: schema name
- KEY_FILE: local file defining the status agent did:web key data
- PORT: port to listen to
- LISTEN_ADDRESS: interface to listen to
- BASEURL: base url for the agent
- APP_KEY: key-type + private key for the agent key, OR a did or alias into the database identifier table
- APP_DID: statuslist agent did name, if APP_KEY represents the key-type + private key
- BEARER_TOKEN: token for access to the generic administrative API
- PASSPHRASE: token to decode the encrypted private keys in the database (needs to match with the same PASSPHRASE of the issuer)

Please note that the StatusList agent does not use a database to store did identifiers or key material. The only key stored is the generic statuslist agent did:web key, which is hosted at the `/.well-known/did.json` endpoint. The key data, including the private key, is stored in a local file, which should be properly protected from prying eyes.

### Key Configuration

The local key file contains key material for the `did:web` implementation:

```json
{
    "name": "did:web:fullname",
    "privateKeyHex": "hex encoded private key material",
    "type": "key type, one of Secp256r1, Secp256k1, Ed25519, RSA"
}
```

Generate the appropiate private key hex material separately. You can use the included `generateKey` script for that:

```bash
npm run key Ed25519
```

which generates a Ed25519 private key in hex encoded format and prints it to the console. Copy this into the `privateKeyHex` attribute.

Please note that the `name` field in the key configuration specifies the `did:web` and as such contains a DNS name that must match the DNS name of the environment. If this does not match, add a reverse proxy configuration for the well-known path on the actual domain of the `did:web` to the statuslist agent well-known path.

Alternatively, a combination of `APP_KEY` and `APP_DID` can be used to directly set the key material from the environment. 

Additionally, if the statuslist agent is combined with the veramo-issuer implementation, the `APP_KEY` environment variable can be set to a did or alias into the `identifier` table of the veramo-issuer application, allowing the statuslist agent to use the same key material.

### StatusList configuration

Statuslists are configured in the `conf/lists` directory using a separate configuration file for each list.

```json
{
    "name": "path name for this statuslist, excluding the initial slash",
    "tokens": ["array of allowed administrative bearer tokens for admin api"],
    "size": <numeric value of the number of bits, in steps of 8, greater or equal to 131072>,
    "bitSize": <optional size of each reserved bit, 1 by default>,
    "purpose": "list purpose, one of revocation, suspension, message or any business case specific value",
    "type": "type of this implementation".
    "messages": [<optional list of status list messages according to the BitstringStatusList definition>]
}
```

The implementation `type` can be one of the following:

- `BitstringStatusList`: generate credentials and output following the W3C BitstringStatusList definition
- `statuslist+jwt`: generate credentials and output following the IETF Status Token List definition
- `StatusList2020`, `RevocationList2020`, `SuspensionList2020`, `StatusList2021`, `RevocationList2021`, `SuspensionList2021`: use the older version of the W3C BitstringStatusList definition

The main difference between the BitstringStatusList definition and its older versions are the multibase-encoded token list. The newer version prefixes it with a 'u' to indicate the string contains a base64-url-non-padded encoded byte array. The older versions also only allow a bitsize of 1 in the definition.

## Endpoints

The statuslist agent the following endpoints:

- `GET /.well-known/did.json`: endpoint to serve the DIDDocument of the `did:web` key implementation (if a did:web is implemented)
- `GET /<statuslist-name>/<index>`: endpoint to retrieve the statuslist VC containing the statuslist encodedList data
- `POST /<statuslist-name>/api/index`: reserve a bit on this status list
- `POST /<statuslist-name>/api/revoke`: revoke or unrevoke a status of a status list element
- `POST /<statuslist-name>/api/status`: set the new status of a status list element
- `GET /<statuslist-name>/api/status/<list index>/<element index>`: get the status value of a status list element

### Reserving an element

`POST /<statuslist-name>/api/index`

Request object:

```json
{
    expirationDate: <string date/time representation YYYY-MM-DD HH:ii:ss>
}
```

Response object:

```json
{
    "index": <element index>,
    "purpose": <configured status list purpose>,
    "size": <total bit size>,
    "id": <unique URI for this bit>,
    "url": <status list JWT URL>
}
```

This call reserves a random element on the status list. If the status list is too full, a new list with a new index is automatically created. The default status of the new element is `0/false/unset/unrevoked`. The total bit size is the number of elements multiplied by the status list bit size, which is `1` by default.

Example response:

```json
{
    "index": 73124,
    "list": 1,
    "type": "BitstringStatusList",
    "credentialStatus": {
        "id": "http://example.com/statlist/1#73124",
        "type": "BitstringStatusListEntry",
        "statusListIndex": 73124,
        "statusListCredential": "http://example.com/statlist/1",
        "statusPurpose": "revocation"
    }
}
```

```json
{
    "index": 73124,
    "list": 1,
    "type": "statuslist+jwt",
    "credentialStatus": {
        "idx": 73124,
        "uri: "http://example.com/statlist/1"
    }
}
```

```json
{
    "index": 73124,
    "list": 1,
    "type": "BitstringStatusList",
    "credentialStatus": {
        "id": "http://example.com/statlist/1#73124",
        "type": "BitstringStatusListEntry",
        "statusListIndex": 73124,
        "statusListCredential": "http://example.com/statlist/1",
        "statusPurpose": "message",
        "statusSize": 2,
        "statusMessage": [
            {"status": "0x0", "message": "undefined"},
            {"status": "0x1", "message": "suspended"},
            {"status": "0x2", "message": "revoked"},
            {"status": "0x3", "message": "temporarily_revoked"},
        ]
    }
}
```

The `statusMessage` field is set using the `messages` option in the list definition. If no messages are supplied, the agent generates a list containing only `undefined` entries to comply with the requirement that messages must be set for any list with a bitsize > 1.

The `credentialStatus` attribute can be inserted directly into the credential that requires this status information. For IETF Status Token List implementations, this would be a `status` claim containing a `status_list` attribute with this information:

```json
{
    "status": {
        "status_list": {
            "idx": 121,
            "uri": "https://example.com/list/2"
        }
    }
}
```

For the W3C types, it would be a `credentialStatus` attribute, of which there can be several:

```json
{
    "credentialStatus": [{
        "id": "http://example.com/statlist/1#73124",
        "type": "BitstringStatusListEntry",
        "statusListIndex": 73124,
        "statusListCredential": "http://example.com/statlist/1",
        "statusPurpose": "revocation"
    },{
        "id": "http://example.com/stat2list/11#3212",
        "type": "BitstringStatusListEntry",
        "statusListIndex": 3212,
        "statusListCredential": "http://example.com/stat2list/11",
        "statusPurpose": "message",
        "statusSize": 2,
        "statusMessage": [
            {"status": "0x0", "message": "undefined"},
            {"status": "0x1", "message": "suspended"},
            {"status": "0x2", "message": "revoked"},
            {"status": "0x3", "message": "temporarily_revoked"},
        ]
    }]
}
```

### Revoking an element

`POST /<statuslist-name>/api/revoke`

Request object:

```json
{
    list: <satus list credential URL>,
    index: <element index>,
    status: <string value: revoked or unrevoked>
}
```

Response object:

```json
{
    "status": <status change indication>
}
```

The `list` value must be the `url` value from the reservation step. This must match the `statuslist-name` as present in the API path.
The `status` field is a text field containing the actual text `revoked`, or anything else (for `unrevoked`).

This sets the value of the element to `1` (`revoked`) or to `0` (`unrevoked`).

The response indicates if the element value has changed. If it changed, the result value is returned as a string value (`REVOKED`, `UNREVOKED`). If it did not change, the `status` value is `UNCHANGED`.

Example Response:

```json
{
    "status": "REVOKED"
}
```

This interface is usable for status lists of bit size 1. The endpoint below can be used for statuslists of any size, including 1.

### Setting element values

`POST /<statuslist-name>/api/status`

Request object:

```json
{
    list: <statuslist credential URL>,
    index: <element index>,
    status: <integer status value>,
    mask: <optional mask value>
}
```

Response object:

```json
{
    "status": <status change indication>
}
```

The `list` value must be the `url` value from the reservation step. This must match the `statuslist-name` as present in the API path.
The `status` field is an integer to which the new status of the list element must be set. An optional `mask` value can be passed to only set specific bits of the list element and keep other bits unchanged. By default the `mask` will cover all bits.

The response indicates if the element value has changed (`CHANGED`) or not (`UNCHANGED`).

Example Response:

```json
{
    "status": "CHANGED"
}
```

### Retrieving a single bit status

`GET /<statuslist-name>/api/status/<list index>/<element index>`

This is a convenience method to determine the state of a specific element index in the bitstring list. This value can also be determined by parsing the bitstring credential.

`<list index>` is the numeric index of the status list. This index is returned in the call to reserve a bit above. It is also the last path element of the `statuslist credential uri` as present in the credential status claim. The `<element index>` is of course the numeric index of the status list element.

Response object:

```json
{
    "status": <numeric or textual status>
}
```

The response status is `REVOKED` or `UNREVOKED` for statuslists with a bit size of 1. `REVOKED` indicates a value of `1` and `UNREVOKED` a value of `0`.

For statuslists with a larger bit size, the `status` response field is an integer value representing the bit element status value.

### Statuslist Credentials

The credential request interface returns a JWT depending on the configured type of the statuslist.

`GET /<statuslist-name>/<index>`

Example:

```shell
curl http://example.com/statuslist/1
```

The IETF Token Status List returns a JWT with a `status_list` claim:

```json
{
    status_list: {
        bits: <bit size of this list>,
        lst: <encoded status>
    }
}
```

The `encoded status` is a base64url encoded, zlib compressed representation of the bit string content.

The W3C implementations return a Virtual Credential JWT with a `credentialSubject` claim:

```json
{
    type: ['VerifiableCredential', <status list credential type>],
    credentialSubject: {
        id: <list URI>,
        type: <relevant type string>,
        statusPurpose: <purpose description>,
        encodedList: <encoded status>
    }
}
```

The 'old' W3C StatusList implementation has credential type 'StatusListCredential'. The `credentialSubject` type can be anything from `StatusList2020`, `SuspensionList2020` to `RevocationList2021`, etc. The `encodedList` is a base64url encoded gzip compressed representation of the bit string content.

The W3C BitstringStatusList implementation has credential type 'BitstringStatusListCredential'. The `credentialSubject` type should be `BitstringStatusList`. The `encodedList` is a multibase base64url encoded gzip compressed representation of the bit string content. It is very similar to the W3C StatusList value, but preceded by the multibase `u` prefix to indicate the base64url encoding. The spec suggests a base58btc encoding can also be used, which would have a `z` prefix. This implementation only uses the base64url encoded version.

# Changelog / Release Notes

| Version | Commit  | Date       | Comment             |
| ------- | ------- | ---------- | ------------------- |
|         |         | 2025-11-12 | Implementation of encoded private keys. When using the functionality to use the same database as the veramo-issuer, make sure to configure the same `PASSPHRASE` as the veramo-issuer |
