import { nanoid } from "nanoid";
import { EnvGroup, EnvItem, db } from "../entities";
import moment from "moment";
import * as radashi from "radashi";
import { versionCompare } from "../comm";

/**
 * 保存环境变量组，根据是否存在 id 判断是新增还是更新
 * @param input 环境变量组数据，可部分赋值
 * @returns 保存后的完整环境变量组实体
 */
export async function saveGroup(input: Partial<EnvGroup>): Promise<EnvGroup> {
    let entity = input;
    if (input.id) {
        // 若存在 id，先从数据库查询已有记录
        const [item] = await db`SELECT * FROM env_groups WHERE id = ${input.id}`;
        if (item) entity = item;
    }
    if (!entity.id) {
        // 新增：生成 id 和创建时间
        entity.id = nanoid();
        entity.createdAt = new Date().valueOf();
        return (await db`INSERT INTO env_groups ${db(entity)}`) as EnvGroup;
    } else {
        // 更新：根据 id 更新已有记录
        delete input.id
        await db`UPDATE env_groups SET ${db(input)} WHERE id = ${entity.id}`;
        return entity as EnvGroup;
    }
}

/**
 * 获取所有环境变量组，按排序字段升序排列
 * @returns 环境变量组列表
 */
export async function getAllGroups(): Promise<EnvGroup[]> {
    const rows = await db<EnvGroup[]>`SELECT * FROM env_groups ORDER BY sort`;
    return rows;
}

/**
 * 根据 ID 删除环境变量组
 * @param id 环境变量组 ID
 */
export async function deleteGroupById(id: string): Promise<void> {
    await db`DELETE FROM env_groups WHERE id = ${id}`;
}


export async function getGroupEnvList(id:string){
    const [config] = await db<EnvGroup[]>`SELECT * FROM env_groups WHERE id = ${id}`;
    let fun = new Function(`return (
  ${config?.getListScript || '()=>{}'}
  )`)

    let result = await fun()(config,{ fetch:Bun.fetch,log:console.log,moment:moment,radashi:radashi,versionCompare })  as { url:string,version:string }[]; 
    await db`delete FROM env_items WHERE groupId = ${id}`;
    const items = result.map(item=>{
        let fileName = item.url.split('/').pop() || '';
        return {
            id:nanoid(),
            groupId:id,
            fileName,
            enable:false,
            version:item.version,
            urlPath:item.url,
            createdAt:new Date().valueOf()
        }
    })
    await db`INSERT INTO env_items ${db(items)}`;
}