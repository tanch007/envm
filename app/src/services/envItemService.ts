import { eq, ne } from 'drizzle-orm';
import { nanoid } from "nanoid";
import { envGroups, envItems, db, type EnvGroup, type EnvItem } from "../entities";
import * as comm from "../comm";
import { DownloadManager }  from "node-downloader-manager";
import path from "node:path";
import fs from "fs-extra";
import { wsService } from "./wsService";

export async function changeStatus(id: string, status: boolean): Promise<void> {
    const [entity] = await db.select().from(envItems).where(eq(envItems.id, id)).limit(1);
    if (!entity) throw new Error("Item not found");
    const [group] = await db.select().from(envGroups).where(eq(envGroups.id, entity.groupId)).limit(1);
    const dir = `data/${group?.name}/${entity?.version}`;
    const fullDir = path.join(process.cwd(), dir);
    const envDir = path.join(process.cwd(), `/env/${group?.name}`);

    if (status && !await comm.folderExists(dir)) {
        // 下载文件
        if (!entity.urlPath) {
            throw new Error("URL path is empty");
        }
        if(!await comm.folderExists(`./downloads/${entity.fileName}`)){
            const downloadManager = new DownloadManager({
                consoleLog: true,
                overWriteFile: true,
                method: "simple"
            });

            // 监听下载进度并通过 WebSocket 推送
            downloadManager.on('progress', (data) => {
                const progressStr = data?.progress?.replace('%', '') || '0';
                const percentage = parseFloat(progressStr);
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
                wsService.broadcast({
                    type: 'download-error',
                    itemId: id,
                    error: typeof data?.error === 'string' ? data.error : (data?.error as Error)?.message || '下载失败'
                });
            });

            await downloadManager.download(entity.urlPath);

            // 下载完成推送
            wsService.broadcast({
                type: 'download-complete',
                itemId: id
            });
        }
        
        //创建文件夹
        await fs.mkdir(dir, { recursive: true });
        // 解压文件
        await comm.extractTo(`./downloads/${entity.fileName}`, dir);
        await db.update(envItems).set({ dirPath: fullDir }).where(eq(envItems.id, id));
    }

    if (status) {
        // 设置软连接
        await comm.createSymlink(fullDir, envDir);
        // 检查全局变量是否存在
        comm.setEnv(envDir);
    } else {
        comm.rmEnv(envDir);
    }

    // 先将同组其他项设为禁用，再将当前项设为指定状态
    await db.update(envItems).set({ enable: false }).where(ne(envItems.id, id));
    await db.update(envItems).set({ enable: status }).where(eq(envItems.id, id));
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
