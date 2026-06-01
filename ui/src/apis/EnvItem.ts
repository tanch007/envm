import { alovaInstance } from "@/comm/alova";


/**
 * 环境变量项实体，代表一个环境变量
 */
export type EnvItem = Partial<{
    id: string;
    /** 所属组 ID */
    groupId: string;
    /** 文件名 */
    fileName: string;
    /** URL 路径 */
    urlPath: string;
    /** 本地目录路径 */
    dirPath: string;
    /** 版本 */
    version: string;
    /** 日期 */
    date: string;
    /** 状态（downloading / installed 等） */
    status?: string;
    /** 下载进度 0-100 */
    progress?: number;
    /** 是否启用 */
    enable: boolean
}>


export default {
    getItems:(groupId: string)=>alovaInstance.Get<EnvItem[]>('/items/group/'+groupId),
    changeStatus: (envItem: EnvItem) => alovaInstance.Post<EnvItem>('/items/changeStatus', envItem),
    remove: (id: string) => alovaInstance.Delete(`/items/${id}`),
}