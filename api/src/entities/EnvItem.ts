import { BaseEntity } from "./BaseEntity";

/**
 * 环境变量项实体，代表单个环境变量文件
 */
export class EnvItem extends BaseEntity {
    /** 所属组 ID */
    groupId!: string;
    /** 文件名 */
    fileName!: string;
    /** URL 路径 */
    urlPath?: string;
    /** 本地目录路径 */
    dirPath?: string;
    /** 版本 */
    version?: string;
    /** 版本 */
    sort?: number;
    /** 是否启用 */
    enable: boolean = false;

    override createTable(): string {
        return `CREATE TABLE IF NOT EXISTS env_items (
            id TEXT PRIMARY KEY,
            groupId TEXT NOT NULL,
            fileName TEXT NOT NULL,
            urlPath TEXT,
            dirPath TEXT,
            version TEXT,
            enable INTEGER NOT NULL,
            sort INTEGER NOT NULL,
            createdAt INTEGER NOT NULL
        )`;
    }
}