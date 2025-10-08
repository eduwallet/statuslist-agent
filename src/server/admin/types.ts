import { Configuration } from "database/entities/Configuration";
import moment from "moment";

export interface DataList {
    offset: number;
    count: number;
    pagesize: number;
    data: any[];
}

export interface ConfigurationScheme
{
    id: number;
    name: string;
    purpose: string;
    type: string;
    size: number;
    bitsize: number;
    tokens: string;
    messages?:string;
}

export async function configurationToScheme(id:Configuration) {
    const retval:ConfigurationScheme = {
        id: id.id,
        name: id.name,
        purpose: id.purpose,
        type: id.type,
        size: id.size,
        bitsize: id.bitsize || 1,
        tokens: id.tokens,
        ...(id.messages && {messages: id.messages}),
        saved: moment(id.saveDate).format('YYYY-MM-DD HH:mm:ss'),
        updated: moment(id.updateDate).format('YYYY-MM-DD HH:mm:ss'),
    };
    return retval;
}
