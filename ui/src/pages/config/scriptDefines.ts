const getListScriptType=`type ConfigType = {
    /** 组名称 */
    name: string;
    /** 路由地址 */
    routeUrl: string;
}
type UtilsType = {
    fetch: (input: RequestInfo | URL, init?: RequestInit)=>Promise<Response>;
    log:(...data: any[])=>void
    radashi:any
    moment:any
    /**版本比对方法*/
    versionCompare:(current:  string|number, other: string|number)=>number
}
type ResultType = {
    version:string;
    url:string;
}`

export default {
    getListScript:`
/**
 * 获取环境仓库列表数据
 * @param { ConfigType } config 环境配置
 * @param { UtilsType } utils 工具函数集合
 * @param { ResultType[] } 列表数据
 */
async (config,utils)=>{
    return []
}
`,
getListScriptType,
    propsFun:`
`,
}
