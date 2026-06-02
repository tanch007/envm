import { eq } from 'drizzle-orm';
import { nanoid } from "nanoid";
import { envGroups, envItems, db, type EnvGroup, type NewEnvGroup, type NewEnvItem } from "../entities";
import moment from "moment";
import * as radashi from "radashi";
import { versionCompare } from "../utils/comm";

/**
 * 保存环境变量组，根据是否存在 id 判断是新增还是更新
 * @param input 环境变量组数据，可部分赋值
 * @returns 保存后的完整环境变量组实体
 */
export async function saveGroup(input: Partial<EnvGroup>): Promise<EnvGroup> {
    if (input.id) {
        // 若存在 id，先从数据库查询已有记录
        const [existing] = await db.select().from(envGroups).where(eq(envGroups.id, input.id)).limit(1);
        if (existing) {
            // 更新：排除 undefined 字段，只更新提供的值
            const updateData: Partial<NewEnvGroup> = {};
            for (const [key, value] of Object.entries(input)) {
                if (value !== undefined && key !== 'id' && key !== 'createdAt') {
                    (updateData as Record<string, unknown>)[key] = value;
                }
            }
            if (Object.keys(updateData).length > 0) {
                await db.update(envGroups).set(updateData).where(eq(envGroups.id, input.id));
            }
            // 重新查询返回完整记录
            const [updated] = await db.select().from(envGroups).where(eq(envGroups.id, input.id)).limit(1);
            return updated!;
        }
    }

    // 新增：生成 id 和创建时间
    const now = new Date().valueOf();
    const newGroup: NewEnvGroup = {
        id: nanoid(),
        name: input.name ?? '',
        routeUrl: input.routeUrl ?? '',
        getListScript: input.getListScript,
        unzipAfterScript: input.unzipAfterScript,
        sort: input.sort ?? 0,
        createdAt: now,
    };
    await db.insert(envGroups).values(newGroup);
    const [created] = await db.select().from(envGroups).where(eq(envGroups.id, newGroup.id)).limit(1);
    return created!;
}

/**
 * 获取所有环境变量组，按排序字段升序排列
 * @returns 环境变量组列表
 */
export async function getAllGroups(): Promise<EnvGroup[]> {
    return await db.select().from(envGroups).orderBy(envGroups.sort);
}

/**
 * 根据 ID 删除环境变量组
 * @param id 环境变量组 ID
 */
export async function deleteGroupById(id: string): Promise<void> {
    await db.delete(envGroups).where(eq(envGroups.id, id));
}


export async function getGroupEnvList(id: string) {
    const [config] = await db.select().from(envGroups).where(eq(envGroups.id, id)).limit(1);
    if (!config) throw new Error("Group not found");

    const fun = new Function(`return (
  ${config?.getListScript || '()=>{}'}
  )`);
  
    const result = await fun()(config, { fetch, log: console.log, moment, radashi, versionCompare }) as { url: string; version: string,fileName?:string,envPath?:string }[];

    // 删除该组下所有旧的环境变量项
    await db.delete(envItems).where(eq(envItems.groupId, id));

    const items: NewEnvItem[] = result.map(item => {
        const fileName =item.fileName || item.url.split('/').pop() || '';
        return {
            id: nanoid(),
            groupId: id,
            fileName,
            enable: false,
            version: item.version,
            urlPath: item.url,
            sort: 0,
            createdAt: new Date().valueOf(),
        };
    });

    if (items.length > 0) {
        await db.insert(envItems).values(items);
    }
}