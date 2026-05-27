import { BaseEntity } from "./BaseEntity";

/**
 * 环境变量组实体，代表一组环境变量的集合
 */
export class EnvGroup extends BaseEntity {
    /** 组名称 */
    name!: string;
    /** 路由地址 */
    routeUrl!: string;
    /** 列出环境变量的脚本 */
    getListScript?: string;
    /** 解压后执行的脚本 */
    unzipAfterScript?: string;
    /** 排序 */
    sort!: number;

    override createTable(): string {
        return `CREATE TABLE IF NOT EXISTS env_groups (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            routeUrl TEXT NOT NULL,
            getListScript TEXT,
            unzipAfterScript TEXT,
            sort INTEGER NOT NULL,
            createdAt INTEGER NOT NULL
        )`;
    }
}
