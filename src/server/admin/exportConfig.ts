import { getDbConnection } from 'database/index';
import { Configuration } from 'database/entities/Configuration';
import { ArchiveFile, exportConfigAsZip } from 'utils/exportConfigAsZip';
import { Request, Response } from 'express'

export async function exportConfig(request: Request, response: Response) {
    try {
        response.set({
            'Content-Type': 'application/zip',
            'Content-Disposition': 'attachment; filename="configuration.zip"',
        });
        await exportConfigAsZip(response, await createFiles());
        return response;
    } 
    catch (e) {
        response.header('Content-Type', 'application/json')
        return response.status(500).json({"error": JSON.stringify(e)});
    }
}

async function createFiles()
{
    return [
        ...await addConfigurations()
    ];
}

async function addConfigurations(): Promise<ArchiveFile[]>
{
    const dbConnection = await getDbConnection();
    const repo = dbConnection.getRepository(Configuration);
    const objs =  await repo.createQueryBuilder('statuslistconf').orderBy("statuslistconf.name").getMany();
    const retval:ArchiveFile[] = [];
    for (const obj of objs) {
        retval.push({content: configurationToJson(obj), path: '/lists', name: obj.name + '.json'});
    }
    return retval;
}
function configurationToJson(obj:Configuration):string
{
    return JSON.stringify({
        name: obj.name,
        purpose: obj.purpose,
        type: obj.type,
        size: obj.size,
        bitSize: obj.bitsize ?? 1,
        tokens: JSON.parse(obj.tokens ?? '[]')
    }, null, 4);
}