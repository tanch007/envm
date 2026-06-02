
import  { NewEnvGroup } from "./EnvGroup"
import { nanoid } from "nanoid";

export const initGroups:NewEnvGroup[] = [{
    id:nanoid(),
    createdAt: Date.now(),
    name: "nodejs",
    getListScript:`/**
 * 获取环境仓库列表数据
 * @param { ConfigType } config 环境配置
 * @param { UtilsType } utils 工具函数集合
 * @param { ResultType[] } 列表数据
 */
async (config,utils)=>{
    const list = await utils.fetch(config.routeUrl).then(res=>res.json())
    const verTexts = "18,22,24,25".split(',').map(a=>'v'+a)
    let versions = list.filter(a=>a.type=='dir' && a.category=='node' && verTexts.includes(a.name.split('.')[0]))
    //移除v,/
    versions.forEach(item=>item.name=item.name.replace(/[v/]/g, ''))
    //版本排序
    const verList = versions.map(a=>a.name).sort(utils.versionCompare).reverse()

    let result = []
    verList.forEach((ver,index)=>{
        let verItem = versions.find(a=>a.name==ver)
        let name = verItem.name
        let url = verItem.url
        result.push({ version:name, sort:index ,url:\`\${url}node-v\${name}-win-x64.zip\` })
    })
    return result
}
`,
sort: 1,
routeUrl:'https://registry.npmmirror.com/-/binary/node/'
},{
    id:nanoid(),
    createdAt: Date.now(),
    name: "java",
    getListScript:`/**
 * 获取环境仓库列表数据
 * @param { ConfigType } config 环境配置
 * @param { UtilsType } utils 工具函数集合
 * @param { ResultType[] } 列表数据
 */
async (config,utils)=>{

    function parseDirectoryListing(htmlString) {
        const results = [];
        // 正则表达式匹配 href 和时间
        const regex = /<a href="([^"]+)"[^>]*>.*?<\/a>\s+(\d{2}-[A-Z][a-z]{2}-\d{4} \d{2}:\d{2})/g;
        
        let match;
        while ((match = regex.exec(htmlString)) !== null) {
            results.push({
                name: match[1].replace(/\/$/, ''),
                time: match[2]
            });
        }
        
        return results;
    }

    const htmlText = await utils.fetch(config.routeUrl).then(res=>res.text())
    const list = parseDirectoryListing(htmlText)
    const verTexts = "10,11,16,18,24".split(',')
    let versions = list.filter(a=>verTexts.includes(a.name.split('.')[0]))
    //版本排序
    const verList = versions.map(a=>a.name).sort(utils.versionCompare).reverse()

    let result = []
    verList.forEach((ver,index)=>{
        let verItem = versions.find(a=>a.name==ver)
        let name = verItem.name
        let url = \`\${config.routeUrl}/\${verItem.name}/openjdk-\${verItem.name}_windows-x64_bin.zip\`
        result.push({ version:name, sort:index ,url })
    })
    return result
}

`,
sort: 2,
routeUrl:'https://mirrors.huaweicloud.com/openjdk/'
}]
