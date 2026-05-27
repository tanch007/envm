import { nanoid } from "nanoid";
import { EnvGroup, EnvItem, db } from "../entities";
import * as comm from "../comm";
import fs from "node:fs/promises";
import DownloadManager from "bun-downloader-manager";
import path from "node:path";

export async function changeStatus(id:string,status:boolean): Promise<void> {
    const [entity] = await db<EnvItem[]>`SELECT * FROM env_items WHERE id = ${id}`;
    if(!entity) throw new Error("Item not found");
    const [group] = await db<EnvGroup[]>`SELECT * FROM env_groups WHERE id = ${entity.groupId}`;
    const dir = `${group?.name}/${entity?.version}`
    const fullDir = path.join(process.cwd(),dir)
    const envDir = path.join(process.cwd(),`/env/${group?.name}`)
    if(status && !await comm.folderExists(dir)){
        await fs.mkdir(dir,{ recursive: true })
        //下载文件
        if(!entity.urlPath){
            throw new Error("URL path is empty");
        }
        const downloadManager = new DownloadManager({
            consoleLog: true,
            overWriteFile:true,
            method: "simple"
        });

        await downloadManager.download(entity.urlPath);

        //解压文件
        await comm.extractTo(`./downloads/${entity.fileName}`,dir)
        await db`UPDATE env_items SET dirPath=${fullDir} WHERE id = ${id}`;
    } 
    if (status) {
        //设置软连接
        await comm.createSymlink(fullDir, envDir)
        //检查全局变量是否存在
        comm.setEnv(envDir)
    } else {
        comm.rmEnv(envDir)
    }
    
    await db`UPDATE env_items SET enable=0 WHERE id <> ${id}`;
    await db`UPDATE env_items SET enable=${status} WHERE id = ${id}`;
}

/**
 * 按组 ID 获取环境变量项列表
 * @param groupId 所属组 ID
 * @returns 环境变量项列表
 */
export async function getItemsByGroup(groupId: string): Promise<EnvItem[]> {
    const rows = await db<EnvItem[]>`SELECT * FROM env_items WHERE groupId = ${groupId} ORDER BY enable desc,createdAt`;
    return rows;
}

/**
 * 根据 ID 删除环境变量项
 * @param id 环境变量项 ID
 */
export async function deleteItemById(id: string): Promise<void> {
    await db`DELETE FROM env_items WHERE id = ${id}`;
}
