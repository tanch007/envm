import { BetterSQLite3Database, drizzle } from 'drizzle-orm/better-sqlite3';
import { sql,count } from 'drizzle-orm';
import { envGroups, type EnvGroup, type NewEnvGroup } from "./EnvGroup";
import { envItems, type EnvItem, type NewEnvItem } from "./EnvItem";
import path from "path";
import { initGroups } from "./init";
import { app } from 'electron';
import fs from "fs-extra";
import Database from 'better-sqlite3';

let db: BetterSQLite3Database<Record<string, never>> & {
    $client: Database.Database;
}
/**
 * 根据 drizzle 表定义创建表（基于 sqliteTable 元数据生成 CREATE TABLE）
 */
async function initTable(tableName: string, columns: Record<string, { name: string; type: string; notNull?: boolean; primaryKey?: boolean; default?: unknown }>): Promise<void> {
    const cols = Object.values(columns)
        .map(col => {
            const parts = [`"${col.name}"`, col.type];
            if (col.primaryKey) parts.push('PRIMARY KEY');
            if (col.notNull) parts.push('NOT NULL');
            if (col.default !== undefined) parts.push(`DEFAULT ${typeof col.default === 'string' ? `'${col.default}'` : col.default}`);
            return parts.join(' ');
        })
        .join(',\n            ');
    const sqlStr = `CREATE TABLE IF NOT EXISTS ${tableName} (\n            ${cols}\n        )`;
    try {
        await db.run(sql.raw(sqlStr));
    } catch (error) {
        console.error(`Error creating table ${tableName}:`, error);
    }
}

async function initDb(): Promise<void> {
    const appDataDir = app.getPath('appData')
    const envmDataDir = fs.readFileSync(path.join(appDataDir,'envm', 'envmDataDir.txt')).toString()
    const dbPath = path.join(envmDataDir, "envm.db");
    db = drizzle({
        connection: {
            source: dbPath,
            // nativeBinding:filePath 
        }
    })
    // 使用 drizzle schema 元数据创建表
    // 注：生产环境建议使用 drizzle-kit push 或 migrations 管理表结构
    await initTable('env_groups', {
        id: { name: 'id', type: 'TEXT', primaryKey: true, notNull: true },
        name: { name: 'name', type: 'TEXT', notNull: true },
        routeUrl: { name: 'routeUrl', type: 'TEXT', notNull: true },
        getListScript: { name: 'getListScript', type: 'TEXT', notNull: false },
        unzipAfterScript: { name: 'unzipAfterScript', type: 'TEXT', notNull: false },
        sort: { name: 'sort', type: 'INTEGER', notNull: true },
        createdAt: { name: 'createdAt', type: 'INTEGER', notNull: true },
    });
    await initTable('env_items', {
        id: { name: 'id', type: 'TEXT', primaryKey: true, notNull: true },
        groupId: { name: 'groupId', type: 'TEXT', notNull: true },
        fileName: { name: 'fileName', type: 'TEXT', notNull: true },
        urlPath: { name: 'urlPath', type: 'TEXT', notNull: false },
        dirPath: { name: 'dirPath', type: 'TEXT', notNull: false },
        version: { name: 'version', type: 'TEXT', notNull: false },
        enable: { name: 'enable', type: 'INTEGER', notNull: true, default: false },
        sort: { name: 'sort', type: 'INTEGER', notNull: true },
        createdAt: { name: 'createdAt', type: 'INTEGER', notNull: true },
    });

    const result = await db.select({ count: count() }).from(envGroups);
    const total = result[0].count;
    if (total === 0) {
        // 初始化默认环境组数据
        const data = initGroups.map(group => ({ ...group, ...{ getListScript: Buffer.from(group.getListScript as string, 'base64').toString('utf8') } }));
        await db.insert(envGroups).values(data)
        console.log("Default groups initialized");
    }

    console.log("Entities initialized");
}
export {
    envGroups,
    envItems,
    db,
    initDb,
};

export type { EnvGroup, NewEnvGroup, EnvItem, NewEnvItem };