/**
 * 实体基类（已迁移至 drizzle-orm schema 定义）
 * 
 * 公共字段现由 drizzle 的 sqliteTable 自动推断类型。
 * 保留此文件仅为兼容历史导入，新代码请直接使用 drizzle schema 类型。
 */
export interface BaseEntity {
    /** 唯一标识符 */
    id: string;
    /** 创建时间戳（Unix 毫秒） */
    createdAt: number;
}
