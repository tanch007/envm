import { eq } from 'drizzle-orm';
import { envGroups, envItems, db, type EnvGroup, type EnvItem } from "../entities";
import * as comm from "../utils/comm";
import { DownloadManager }  from "node-downloader-manager";
import path from "node:path";
import fs from "fs-extra";
import { wsService } from "./wsService";
import { app } from 'electron';

export async function changeStatus(id: string, status: boolean): Promise<void> {
    const [entity] = await db.select().from(envItems).where(eq(envItems.id, id)).limit(1);
    if (!entity) throw new Error("Item not found");
    const [group] = await db.select().from(envGroups).where(eq(envGroups.id, entity.groupId)).limit(1);
    
    const appDataDir = app.getPath('appData')
    const envmDataDir = (await fs.readFile(path.join(appDataDir,'envm','envmDataDir.txt'))).toString()

    const fullDir = path.join(envmDataDir, 'data', group?.name || '', entity?.version || '');
    const envDir = path.join(envmDataDir, `/env/${group?.name}`);
    const donloadDir = path.join(envmDataDir, "downloads");
    const downloadFilePath = path.join(donloadDir, entity.fileName);
    const maxTimeout = 2 ** 31 - 1;

    if (status && !await comm.folderExists(fullDir)) {
        // 下载文件
        if (!entity.urlPath) {
            throw new Error("URL path is empty");
        }
        if(!fs.existsSync(downloadFilePath)){
            const downloadManager = new DownloadManager({
                consoleLog: true,
                overWriteFile: true,
                // method: "simple",
                retries:1,
                stream:true,
                timeout: maxTimeout,
                downloadFolder: donloadDir,
                getFileName: ()=>entity.fileName,
            });

            // 监听下载进度并通过 WebSocket 推送
            downloadManager.on('progress', (data) => {
                const progressStr = data?.progress?.replace('%', '') || '0';
                const percentage = parseFloat(progressStr);
                console.log(`Download progress: ${id} ${data?.fileName} - ${percentage}%`);
                wsService.broadcast({
                    type: 'download-progress',
                    itemId: id,
                    percentage,
                    received: data?.downloaded || 0,
                    total: data?.totalSize || 0,
                    speed: parseFloat(data?.speed || '0')
                });
            });

            downloadManager.on('error', (data) => {
                console.log(`Download error: ${id} ${data?.fileName} - ${data?.error}`);
                wsService.broadcast({
                    type: 'download-error',
                    itemId: id,
                    error: typeof data?.error === 'string' ? data.error : (data?.error as Error)?.message || '下载失败'
                });
            });

            downloadManager.on('complete',async (data)=>{
                console.log(`Download complete: ${id} ${data?.fileName}`);
                //创建文件夹
                await fs.mkdir(fullDir, { recursive: true });
                // 解压文件
                await comm.extractTo(downloadFilePath, fullDir);

                //处理下载完成后的逻辑
                await handleDownloadComplete(id, true, envDir,fullDir);

                // 下载完成推送
                wsService.broadcast({
                    type: 'download-complete',
                    itemId: id
                });
            })

            console.log(`download file:${entity.fileName} url:${entity.urlPath}`)
            await downloadManager.download(entity.urlPath,entity.fileName);
        }
        else
        {
            //创建文件夹
            await fs.mkdir(fullDir, { recursive: true });
            // 解压文件
            await comm.extractTo(downloadFilePath, fullDir);

            //处理下载完成后的逻辑
            await handleDownloadComplete(id, true, envDir,fullDir);

            // 下载完成推送
            wsService.broadcast({
                type: 'download-complete',
                itemId: id
            });
        }
    }
    else
    {
        await handleDownloadComplete(id, group.id,status, envDir,fullDir);
    }


}

async function handleDownloadComplete(id: string,groupId:string, status: boolean, envDir: string,fullDir: string) {
    let binPath = path.join(fullDir, 'bin');
    let sourcePath = fs.pathExistsSync(binPath) ? path.join(envDir, 'bin') : envDir;
    if (status) {
        // 设置软连接
        await comm.createSymlink(fullDir, envDir);
        // 检查全局变量是否存在
        comm.setEnv(sourcePath);
    } else {
        comm.rmEnv(sourcePath);
    }

    // 先将同组其他项设为禁用，再将当前项设为指定状态
    await db.update(envItems).set({ enable: false }).where(eq(envItems.groupId, groupId));
    await db.update(envItems).set({ enable: status,dirPath: fullDir }).where(eq(envItems.id, id));
}

/**
 * 按组 ID 获取环境变量项列表
 * @param groupId 所属组 ID
 * @returns 环境变量项列表
 */
export async function getItemsByGroup(groupId: string): Promise<EnvItem[]> {
    return await db.select().from(envItems)
        .where(eq(envItems.groupId, groupId))
        .orderBy(envItems.createdAt);
}

/**
 * 根据 ID 删除环境变量项
 * @param id 环境变量项 ID
 */
export async function deleteItemById(id: string): Promise<void> {
    await db.delete(envItems).where(eq(envItems.id, id));
}
