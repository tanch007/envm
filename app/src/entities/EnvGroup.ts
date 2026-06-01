import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

/**
 * 环境变量组表结构（drizzle-orm schema）
 */
export const envGroups = sqliteTable('env_groups', {
    /** 唯一标识符 */
    id: text('id').primaryKey(),
    /** 组名称 */
    name: text('name').notNull(),
    /** 路由地址 */
    routeUrl: text('routeUrl').notNull(),
    /** 列出环境变量的脚本 */
    getListScript: text('getListScript'),
    /** 解压后执行的脚本 */
    unzipAfterScript: text('unzipAfterScript'),
    /** 排序 */
    sort: integer('sort').notNull(),
    /** 创建时间戳（Unix 毫秒） */
    createdAt: integer('createdAt').notNull(),
});

/** 查询返回的类型 */
export type EnvGroup = typeof envGroups.$inferSelect;
/** 插入时的类型 */
export type NewEnvGroup = typeof envGroups.$inferInsert;
