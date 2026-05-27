/**
 * 实体基类，提供所有实体的公共字段
 */
export abstract class BaseEntity {
    /** 唯一标识符 */
    id!: string;
    /** 创建时间戳（Unix 毫秒） */
    createdAt!: number;
    abstract createTable(): string;
}
