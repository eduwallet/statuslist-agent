import { vi, expect, test } from 'vitest';
import { StatusListType } from '../StatusListType';
import { StatusList } from '../../database/entities/StatusList';
import  {Bitstring} from '@digitalcredentials/bitstring';
vi.mock('../../database/index', () => import('../../database/__mocks__/index'));

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

test("Setting bits", async () => {
    const lst = await createBasicStatusList(1);
    // reserve a bit
    var dataList = new Bitstring({buffer: await Bitstring.decodeBits({encoded:lst.content})});
    dataList.set(1, true);
    // update the list content
    lst.content = await dataList.encodeBits();

    const Stype = new StatusListType({});
    let value = await Stype.getState(lst, 1);
    expect(value).toBe(0);

    let action = await Stype.setState(lst, 1, 1);
    expect(action).toBe('CHANGED');
    value = await Stype.getState(lst, 1);
    expect(value).toBe(1);

    action = await Stype.setState(lst, 1, 1);
    expect(action).toBe('UNCHANGED');
    value = await Stype.getState(lst, 1);
    expect(value).toBe(1);

    action = await Stype.setState(lst, 1, 0);
    expect(action).toBe('CHANGED');
    value = await Stype.getState(lst, 1);
    expect(value).toBe(0);

    action = await Stype.setState(lst, 1, 0);
    expect(action).toBe('UNCHANGED');
    value = await Stype.getState(lst, 1);
    expect(value).toBe(0);
});

test("Using revoke", async () => {
    const lst = await createBasicStatusList(1);

    // reserve a bit
    var dataList = new Bitstring({buffer: await Bitstring.decodeBits({encoded:lst.content})});
    dataList.set(1, true);
    // update the list content
    lst.content = await dataList.encodeBits();

    const Stype = new StatusListType({});
    let value = await Stype.getState(lst, 1);
    expect(value).toBe(0);

    let action = await Stype.revoke(lst, 1, true);
    expect(action).toBe('REVOKED');
    value = await Stype.getState(lst, 1);
    expect(value).toBe(1);

    action = await Stype.revoke(lst, 1, true);
    expect(action).toBe('UNCHANGED');
    value = await Stype.getState(lst, 1);
    expect(value).toBe(1);

    action = await Stype.revoke(lst, 1, false);
    expect(action).toBe('UNREVOKED');
    value = await Stype.getState(lst, 1);
    expect(value).toBe(0);

    action = await Stype.revoke(lst, 1, false);
    expect(action).toBe('UNCHANGED');
    value = await Stype.getState(lst, 1);
    expect(value).toBe(0);
});

test("Bitsize 2", async () => {
    const lst = await createBasicStatusList(2);

    // reserve a bit
    var dataList = new Bitstring({buffer: await Bitstring.decodeBits({encoded:lst.content})});
    dataList.set(1, true);
    // update the list content
    lst.content = await dataList.encodeBits();

    const Stype = new StatusListType({});
    let value = await Stype.getState(lst, 1);
    expect(value).toBe(0);

    let action = await Stype.setState(lst, 1, 1);
    expect(action).toBe('CHANGED');
    value = await Stype.getState(lst, 1);
    expect(value).toBe(1);

    action = await Stype.setState(lst, 1, 2);
    expect(action).toBe('CHANGED');
    value = await Stype.getState(lst, 1);
    expect(value).toBe(2);

    action = await Stype.setState(lst, 1, 1, 1);
    expect(action).toBe('CHANGED');
    value = await Stype.getState(lst, 1);
    expect(value).toBe(3);

    action = await Stype.setState(lst, 1, 1, -1);
    expect(action).toBe('CHANGED');
    value = await Stype.getState(lst, 1);
    expect(value).toBe(1);

    action = await Stype.setState(lst, 1, 0, -1);
    expect(action).toBe('CHANGED');
    value = await Stype.getState(lst, 1);
    expect(value).toBe(0);

    action = await Stype.setState(lst, 1, 3, 3);
    expect(action).toBe('CHANGED');
    value = await Stype.getState(lst, 1);
    expect(value).toBe(3);

    action = await Stype.setState(lst, 1, 3, 3);
    expect(action).toBe('UNCHANGED');
    value = await Stype.getState(lst, 1);
    expect(value).toBe(3);

    action = await Stype.setState(lst, 1, 1, 1);
    expect(action).toBe('UNCHANGED');
    value = await Stype.getState(lst, 1);
    expect(value).toBe(3);

    action = await Stype.setState(lst, 1, 2, 2);
    expect(action).toBe('UNCHANGED');
    value = await Stype.getState(lst, 1);
    expect(value).toBe(3);

    action = await Stype.setState(lst, 1, 2, 3);
    expect(action).toBe('CHANGED');
    value = await Stype.getState(lst, 1);
    expect(value).toBe(2);
});

test("Bitsize 3", async () => {
    const lst = await createBasicStatusList(3);

    // reserve a bit
    var dataList = new Bitstring({buffer: await Bitstring.decodeBits({encoded:lst.content})});
    dataList.set(1, true);
    // update the list content
    lst.content = await dataList.encodeBits();

    const Stype = new StatusListType({});
    let value = await Stype.getState(lst, 1);
    expect(value).toBe(0);

    let action = await Stype.setState(lst, 1, 1);
    expect(action).toBe('CHANGED');
    value = await Stype.getState(lst, 1);
    expect(value).toBe(1);

    action = await Stype.setState(lst, 1, 2);
    expect(action).toBe('CHANGED');
    value = await Stype.getState(lst, 1);
    expect(value).toBe(2);

    action = await Stype.setState(lst, 1, 7);
    expect(action).toBe('CHANGED');
    value = await Stype.getState(lst, 1);
    expect(value).toBe(7);

    action = await Stype.setState(lst, 1, 1, 1);
    expect(action).toBe('UNCHANGED');
    value = await Stype.getState(lst, 1);
    expect(value).toBe(7);

    action = await Stype.setState(lst, 1, 2, 2);
    expect(action).toBe('UNCHANGED');
    value = await Stype.getState(lst, 1);
    expect(value).toBe(7);

    action = await Stype.setState(lst, 1, 4, 4);
    expect(action).toBe('UNCHANGED');
    value = await Stype.getState(lst, 1);
    expect(value).toBe(7);

    action = await Stype.setState(lst, 1, 0, 4);
    expect(action).toBe('CHANGED');
    value = await Stype.getState(lst, 1);
    expect(value).toBe(3);

    action = await Stype.setState(lst, 1, 0, 2);
    expect(action).toBe('CHANGED');
    value = await Stype.getState(lst, 1);
    expect(value).toBe(1);

    action = await Stype.setState(lst, 1, 0, 2);
    expect(action).toBe('UNCHANGED');
    value = await Stype.getState(lst, 1);
    expect(value).toBe(1);

    action = await Stype.setState(lst, 1, 0, 4);
    expect(action).toBe('UNCHANGED');
    value = await Stype.getState(lst, 1);
    expect(value).toBe(1);
});

test("Bitsize 4", async () => {
    const lst = await createBasicStatusList(4);

    // reserve a bit
    var dataList = new Bitstring({buffer: await Bitstring.decodeBits({encoded:lst.content})});
    dataList.set(1, true);
    dataList.set(5, true);
    dataList.set(17, true);
    dataList.set(427, true);
    dataList.set(920, true);
    dataList.set(999, true);
    // update the list content
    lst.content = await dataList.encodeBits();

    const Stype = new StatusListType({});
    let value = await Stype.getState(lst, 1);
    expect(value).toBe(0);
    value = await Stype.getState(lst, 5);
    expect(value).toBe(0);
    value = await Stype.getState(lst, 17);
    expect(value).toBe(0);
    value = await Stype.getState(lst, 427);
    expect(value).toBe(0);
    value = await Stype.getState(lst, 920);
    expect(value).toBe(0);
    value = await Stype.getState(lst, 999);
    expect(value).toBe(0);

    let action = await Stype.setState(lst, 1, 1);
    action = await Stype.setState(lst, 5, 4);
    action = await Stype.setState(lst, 17, 3);
    action = await Stype.setState(lst, 427, 7);
    action = await Stype.setState(lst, 920, 5);
    action = await Stype.setState(lst, 999, 2);
    expect(action).toBe('CHANGED');

    value = await Stype.getState(lst, 1);
    expect(value).toBe(1);
    value = await Stype.getState(lst, 5);
    expect(value).toBe(4);
    value = await Stype.getState(lst, 17);
    expect(value).toBe(3);
    value = await Stype.getState(lst, 427);
    expect(value).toBe(7);
    value = await Stype.getState(lst, 920);
    expect(value).toBe(5);
    value = await Stype.getState(lst, 999);
    expect(value).toBe(2);

    action = await Stype.setState(lst, 1, 3, 7);
    action = await Stype.setState(lst, 5, 3, 3);
    action = await Stype.setState(lst, 17, 3, 1);
    action = await Stype.setState(lst, 427, 8, 8);
    action = await Stype.setState(lst, 920, 11, 7);
    action = await Stype.setState(lst, 999, 3, 15);

    value = await Stype.getState(lst, 1);
    expect(value).toBe(3); // was 1, + 3^7
    value = await Stype.getState(lst, 5);
    expect(value).toBe(7); // was 4, + 3^3
    value = await Stype.getState(lst, 17);
    expect(value).toBe(3); // was 3 + 3^1
    value = await Stype.getState(lst, 427);
    expect(value).toBe(15); // was 7 + 8^8
    value = await Stype.getState(lst, 920);
    expect(value).toBe(3); // was 5 + 11^7 (== 3^7)
    value = await Stype.getState(lst, 999);
    expect(value).toBe(3); // was 2, + 3^15
});
