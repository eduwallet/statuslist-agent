import { loadJsonFiles } from "@utils/loadJsonFiles";
import { resolveConfPath } from "@utils/resolveConfPath";
import { StatusListType } from "./StatusListType";
import { StatusListTypeOptions } from "types";

interface StatusListStore {
    [x:string]: StatusListType;
}

var _store:StatusListStore = {};

export function getStatusListStore(): StatusListStore {
    return _store;
}

export async function initialiseStatusListStore() {
    const options = loadJsonFiles<StatusListTypeOptions>({path: resolveConfPath('lists')});
    for (const opt of options.asArray) {
        const data = new StatusListType(opt);
        _store[data.name] = data;
    }    
}