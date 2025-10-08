import { loadJsonFiles } from "@utils/loadJsonFiles";
import { resolveConfPath } from "@utils/resolveConfPath";
import { StatusListType } from "./StatusListType";
import { StatusListTypeOptions } from "types";
import { getDbConnection } from "database";
import { Configuration } from "database/entities/Configuration";

interface StatusListStore {
    [x:string]: StatusListType;
}

var _store:StatusListStore = {};

export function getStatusListStore(): StatusListStore {
    return _store;
}

export async function initialiseStatusListStore() {
    const dbConnection = await getDbConnection();
    const repo = dbConnection.getRepository(Configuration);
    const objs = await repo.createQueryBuilder('statuslistconf').getMany();
    for (const obj of objs) {
        const cfg:StatusListTypeOptions = {
            name: obj.name,
            purpose: obj.purpose,
            type: obj.type,
            size: obj.size,
            bitSize: obj.bitsize || 1,
            tokens: JSON.parse(obj.tokens),
            ...(obj.messages && {messages: JSON.parse(obj.messages)})
        };
        const data = new StatusListType(cfg);
        _store[obj.name] = data;
    } 

    const options = loadJsonFiles<StatusListTypeOptions>({path: resolveConfPath('lists')});
    for (const opt of options.asArray) {
        if (!_store[opt.name]) {
            const data = new StatusListType(opt);
            _store[data.name] = data;

            const cfg:Configuration = new Configuration();
            cfg.name = opt.name;
            cfg.purpose = opt.purpose;
            cfg.type = opt.type ?? 'BitstringStatusList';
            cfg.size = opt.size;
            cfg.bitsize = opt.bitSize ?? 1;
            cfg.messages = (opt.messages && opt.messages.length) ? JSON.stringify(opt.messages) : null;
            cfg.tokens = JSON.stringify(opt.tokens);
            await repo.save(cfg);
        }
    }    
}