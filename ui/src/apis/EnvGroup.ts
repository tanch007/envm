import { alovaInstance } from "@/comm/alova";


/**
 * 环境变量组实体，代表一组环境变量的集合
 */
export type EnvGroup = Partial<{
    id: string;
    /** 组名称 */
    name: string;
    /** 路由地址 */
    routeUrl: string;
    /** 列出环境变量的脚本 */
    getListScript: string;
    /** 解压后执行的脚本 */
    unzipAfterScript: string;
    /** 排序 */
    sort: number;
}>


export default {
    getAll:()=>alovaInstance.Get<EnvGroup[]>('/groups'),
    save: (envGroup: EnvGroup) => alovaInstance.Post<EnvGroup>('/groups', envGroup),
    remove: (id: string) => alovaInstance.Delete(`/groups/${id}`),
    refreshList:(id:string)=>alovaInstance.Get(`/groups/refresh/${id}`),
}