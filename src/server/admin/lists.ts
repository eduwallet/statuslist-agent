import Debug from 'debug';
const debug = Debug('server:api');

import { Request, Response } from 'express'
import { DataList, configurationToScheme } from './types.js';
import { getDbConnection } from 'database/index.js';
import { Configuration } from 'database/entities/Configuration.js';

export async function listConfigurations(request: Request, response: Response) {
    try {
        const data:DataList = {
            offset: 0,
            count: 0,
            pagesize: 50,
            data: []
        };
        const dbConnection = await getDbConnection();
        const repo = dbConnection.getRepository(Configuration);
        const objs =  await repo.createQueryBuilder('statuslistconf').orderBy("statuslistconf.name").getMany();
        data.count = objs.length;
        for (const obj of objs) {
            data.data.push(await configurationToScheme(obj));
        }

        return response.status(200).json(data);
    }
    catch (e) {
        response.header('Content-Type', 'application/json')
        return response.status(500).json({"error": JSON.stringify(e)});
    }
}

interface StoreRequest {
    id:number;
    name:string;
    purpose:string;
    type:string;
    size:number;
    bitsize:number;
    tokens:string;
    messages:string;
}

async function setData(obj:Configuration, name:string, purpose:string, type:string, size:number, bitsize:number, tokens:string, messages:string)
{
    obj.name = name;
    obj.purpose = purpose;
    obj.type = type;
    obj.size = size;
    obj.bitsize = (bitsize > 0) ? bitsize : 1;
    try {
        obj.tokens = JSON.stringify(JSON.parse(tokens));
    }
    catch(e) {
        obj.tokens = [];
    }
    try {
        obj.messages = JSON.stringify(JSON.parse(messages));
    }
    catch(e) {
        obj.messages = null;
    }
}

export async function storeConfiguration(request: Request<StoreRequest>, response: Response) {
    try {
        const dbConnection = await getDbConnection();
        const repo = dbConnection.getRepository(Configuration);
        const obj =  await repo.createQueryBuilder('statuslistconf')
            .where('id=:id', {id: request.body.id})
            .getOne();
        if (!obj) {
            throw new Error("StatusList Configuration not found for POST");
        }

        await setData(obj, request.body.name, request.body.purpose, request.body.type, request.body.size, request.body.bitsize, request.body.tokens, request.body.messages);
        await repo.save(obj);

        return response.status(200).json(await configurationToScheme(obj));
    }
    catch (e) {
        debug("storeConfiguration: caught", e);
        response.header('Content-Type', 'application/json')
        return response.status(500).json({"error": JSON.stringify(e)});
    }
}

interface CreateRequest {
    name:string;
    purpose:string;
    type:string;
    size:number;
    bitsize:number;
    tokens:string;
    messages:string;
}
export async function createConfiguration(request: Request<CreateRequest>, response: Response) {
    try {
        const dbConnection = await getDbConnection();
        const repo = dbConnection.getRepository(Configuration);
        const other =  await repo.createQueryBuilder('statuslistconf')
            .where('name=:name', {name: request.body.name})
            .getOne();
        if (other) {
            throw new Error("StatusList configuration base name already in use");
        }

        const obj = new Configuration();
        await setData(obj, request.body.name, request.body.purpose, request.body.type, request.body.size, request.body.bitsize, request.body.tokens, request.body.messages);
        await repo.save(obj);

        const json = await configurationToScheme(obj);
        return response.status(200).json(json);
    }
    catch (e) {
        response.header('Content-Type', 'application/json')
        return response.status(500).json({"error": JSON.stringify(e)});
    }
}

interface DeleteRequest {
    id:number;
}

export async function deleteConfiguration(request: Request<DeleteRequest>, response: Response) {
    try {
        const dbConnection = await getDbConnection();
        const repo = dbConnection.getRepository(Configuration);

        const obj =  await repo.createQueryBuilder('statuslistconf')
            .where('id=:id', {id: request.body.id})
            .getOne();
        if (!obj) {
            throw new Error("StatusList Configuration not found for DELETE");
        }
        
        await repo.delete({id: request.body.id});
        return response.status(202).json([]);
    }
    catch (e) {
        debug("Caught error on deleting statuslist configuration ", e);
        response.header('Content-Type', 'application/json')
        return response.status(500).json({"error": JSON.stringify(e)});
    }
}
