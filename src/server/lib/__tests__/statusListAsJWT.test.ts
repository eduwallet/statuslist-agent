import { vi, expect, test } from 'vitest';
import { Factory } from '@muisit/cryptokey';
import { StatusListType } from '../../../statusLists/StatusListType';
import { StatusList } from '../../../database/entities/StatusList';
import { StatusListStatus } from '../../../types';
import  {Bitstring} from '@digitalcredentials/bitstring';
vi.mock('../../../database/index', () => import('../../../database/__mocks__/index'));
let testkey:any = null;
vi.mock('../../../utils/keymanager.ts', () => ({
    getKey: vi.fn(() => {
        return testkey;
    }),
  }));
import { statusListAsJWT } from '../statusListAsJWT';

async function createBasicStatusList(bitSize:number)
{
    let dataList = new Bitstring({length: 1000});
    let contentList = new Bitstring({length: 1000 * bitSize});
    const lst = new StatusList();
    lst.size = 1000;
    lst.bitsize = bitSize;
    lst.content = await dataList.encodeBits();
    lst.revoked = await contentList.encodeBits();
    return lst;
}

test("Creating JWT", async () => {
    testkey = await Factory.createFromType('Ed25519', "fbe04e71bce89f37e0970de16a97a80c4457250c6fe0b1e9297e6df778ae72a8");
    const lst = await createBasicStatusList(2);
    // reserve a bit
    var dataList = new Bitstring({buffer: await Bitstring.decodeBits({encoded:lst.content})});
    dataList.set(1, true);
    dataList.set(6, true);
    dataList.set(21, true);
    dataList.set(203, true);
    dataList.set(547, true);
    dataList.set(872, true);
    // update the list content
    lst.content = await dataList.encodeBits();

    const Stype = new StatusListType({});
    await Stype.setState(lst, 1, 1);
    await Stype.setState(lst, 6, 2);
    await Stype.setState(lst, 21, 3);
    await Stype.setState(lst, 203, 0);
    await Stype.setState(lst, 547, 2);
    await Stype.setState(lst, 872, 1);

    const status:StatusListStatus = {
        type: Stype,
        statusList: lst,
        basepath: "https://example.com",
        date: '2020-01-01 01:02:03'
    };

    const jwt = await statusListAsJWT(status);
    expect(jwt).toBeDefined();
    expect(jwt).toBe('eyJhbGciOiJFZERTQSIsImtpZCI6IjVjMzE5YjhjMmQ0ODAzMjAyNjczZWQxYWIyNGJkMzQyNWI5MTRkNDI0ODE5NjdhYzRjZDkzY2NmYzdkZWNiMzkiLCJ0eXAiOiJzdGF0dXNsaXN0K2p3dCJ9.eyJleHAiOjE1Nzc4Mzc4MjMsImlhdCI6MTU3NzgzNjkyMywic3ViIjoiaHR0cHM6Ly9leGFtcGxlLmNvbSIsInR0bCI6MzAwLCJzdGF0dXNfbGlzdCI6eyJiaXRzIjoxLCJsc3QiOiJlSndUNEdCZ1lEQmdHSERBUkhVVEhRaklBd0JQTmdDTCJ9fQ.G7gaZyZNc90JL-f1sJVmemy7X-claKtk8R0LgKo4hR0dclN9osgRIP-7690GUcvkNzOrpZ1twwdLE9jSBGNeBg');
});
