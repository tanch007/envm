import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { envGroups } from './EnvGroup';

/**
 * 环境变量项表结构（drizzle-orm schema）
 */
export const envItems = sqliteTable('env_items', {
    /** 唯一标识符 */
    id: text('id').primaryKey(),
    /** 所属组 ID */
    groupId: text('groupId').notNull().references(() => envGroups.id),
    /** 文件名 */
    fileName: text('fileName').notNull(),
    /** URL 路径 */
    urlPath: text('urlPath'),
    /** 本地目录路径 */
    dirPath: text('dirPath'),
    /** 版本 */
    version: text('version'),
    /** 是否启用（布尔类型） */
    enable: integer('enable', { mode: 'boolean' }).notNull().default(false),
    /** 排序 */
    sort: integer('sort').notNull(),
    /** 创建时间戳（Unix 毫秒） */
    createdAt: integer('createdAt').notNull(),
});

/** 查询返回的类型 */
export type EnvItem = typeof envItems.$inferSelect;
/** 插入时的类型 */
export type NewEnvItem = typeof envItems.$inferInsert;