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
import { statusListAsVC } from '../statusListAsVC';

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

test("Creating VC", async () => {
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
    Stype.type = 'StatusList2021';
    Stype.bitSize = 2;
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

    const jwt = await statusListAsVC(status);
    expect(jwt).toBeDefined();
    expect(jwt).toBe('eyJhbGciOiJFZERTQSIsImtpZCI6IjVjMzE5YjhjMmQ0ODAzMjAyNjczZWQxYWIyNGJkMzQyNWI5MTRkNDI0ODE5NjdhYzRjZDkzY2NmYzdkZWNiMzkiLCJ0eXAiOiJqd3RfdmNfanNvbiIsImlzcyI6ImRpZDpqd2s6ZXlKcmRIa2lPaUpQUzFBaUxDSmpjbllpT2lKRlpESTFOVEU1SWl3aWRYTmxJam9pYzJsbklpd2lZV3huSWpvaVJXUkVVMEVpTENKNElqb2lXRVJIWW1wRE1VbEJlVUZ0WXkwd1lYTnJkbFJSYkhWU1ZGVktTVWRYWlhOVVRtczRlamhtWlhsNmF5SjkifQ.eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvbnMvY3JlZGVudGlhbHMvdjIiLCJodHRwczovL3czaWQub3JnL3ZjLXN0YXR1cy1saXN0LTIwMjEvdjEiXSwiaWQiOiJodHRwczovL2V4YW1wbGUuY29tIiwidHlwZSI6WyJWZXJpZmlhYmxlQ3JlZGVudGlhbCIsIlN0YXR1c0xpc3RDcmVkZW50aWFsIl0sImlzc3VlciI6ImRpZDpqd2s6ZXlKcmRIa2lPaUpQUzFBaUxDSmpjbllpT2lKRlpESTFOVEU1SWl3aWRYTmxJam9pYzJsbklpd2lZV3huSWpvaVJXUkVVMEVpTENKNElqb2lXRVJIWW1wRE1VbEJlVUZ0WXkwd1lYTnJkbFJSYkhWU1ZGVktTVWRYWlhOVVRtczRlamhtWlhsNmF5SjkiLCJ2YWxpZEZyb20iOiIyMDIwLTAxLTAxVDAxOjAyOjAzWiIsInZhbGlkVW50aWwiOiIyMDIwLTAxLTAxVDAxOjA3OjAzWiIsImlzc3VlZEF0IjoiMjAyMC0wMS0wMVQwMTowMjowM1oiLCJjcmVkZW50aWFsU3ViamVjdCI6eyJpZCI6Imh0dHBzOi8vZXhhbXBsZS5jb20jbGlzdCIsInR5cGUiOiJTdGF0dXNMaXN0MjAyMSIsImVuY29kZWRMaXN0IjoiSDRzSUFBQUFBQUFBQXhQZ1lHQmdNR0FZY01CRWRSTWRDTWdEQUpsOVJmbjZBQUFBIn0sImlhdCI6MTU3NzgzNjkyMywiZXhwIjoxNTc3ODM3ODIzLCJqdGkiOiJodHRwczovL2V4YW1wbGUuY29tIn0.bNPFKlJKUO-iwAWQhIR-TtzUFkoOQnulNk8n3BLg-mIlRSUphADe4q0dkCFRLhyLGSq70_MtRFq3DDoMbvCRBw');
});

test("Creating VC for Bitstring", async () => {
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
    Stype.type = 'BitstringStatusList';
    Stype.bitSize = 2;
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

    const jwt = await statusListAsVC(status);
    expect(jwt).toBeDefined();
    expect(jwt).toBe('eyJhbGciOiJFZERTQSIsImtpZCI6IjVjMzE5YjhjMmQ0ODAzMjAyNjczZWQxYWIyNGJkMzQyNWI5MTRkNDI0ODE5NjdhYzRjZDkzY2NmYzdkZWNiMzkiLCJ0eXAiOiJqd3RfdmNfanNvbiIsImlzcyI6ImRpZDpqd2s6ZXlKcmRIa2lPaUpQUzFBaUxDSmpjbllpT2lKRlpESTFOVEU1SWl3aWRYTmxJam9pYzJsbklpd2lZV3huSWpvaVJXUkVVMEVpTENKNElqb2lXRVJIWW1wRE1VbEJlVUZ0WXkwd1lYTnJkbFJSYkhWU1ZGVktTVWRYWlhOVVRtczRlamhtWlhsNmF5SjkifQ.eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvbnMvY3JlZGVudGlhbHMvdjIiXSwiaWQiOiJodHRwczovL2V4YW1wbGUuY29tIiwidHlwZSI6WyJWZXJpZmlhYmxlQ3JlZGVudGlhbCIsIkJpdHN0cmluZ1N0YXR1c0xpc3RDcmVkZW50aWFsIl0sImlzc3VlciI6ImRpZDpqd2s6ZXlKcmRIa2lPaUpQUzFBaUxDSmpjbllpT2lKRlpESTFOVEU1SWl3aWRYTmxJam9pYzJsbklpd2lZV3huSWpvaVJXUkVVMEVpTENKNElqb2lXRVJIWW1wRE1VbEJlVUZ0WXkwd1lYTnJkbFJSYkhWU1ZGVktTVWRYWlhOVVRtczRlamhtWlhsNmF5SjkiLCJ2YWxpZEZyb20iOiIyMDIwLTAxLTAxVDAxOjAyOjAzWiIsInZhbGlkVW50aWwiOiIyMDIwLTAxLTAxVDAxOjA3OjAzWiIsImlzc3VlZEF0IjoiMjAyMC0wMS0wMVQwMTowMjowM1oiLCJjcmVkZW50aWFsU3ViamVjdCI6eyJpZCI6Imh0dHBzOi8vZXhhbXBsZS5jb20jbGlzdCIsInR5cGUiOiJCaXRzdHJpbmdTdGF0dXNMaXN0IiwiZW5jb2RlZExpc3QiOiJ1SDRzSUFBQUFBQUFBQXhQZ1lHQmdNR0FZY01CRWRSTWRDTWdEQUpsOVJmbjZBQUFBIn0sImlhdCI6MTU3NzgzNjkyMywiZXhwIjoxNTc3ODM3ODIzLCJqdGkiOiJodHRwczovL2V4YW1wbGUuY29tIn0.LN5XMT29YDvZet9p6ElOJQwr0NBPA3l9VfyrU_MTkWrUNyCeC7UnkjYKs_DMAKtH5pUxCdssLVfFFVQ6pRyPCA');
});
