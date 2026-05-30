import type { BaseEntity } from "./BaseEntity";
import { EnvGroup } from "./EnvGroup";
import { EnvItem } from "./EnvItem";
import { drizzle } from 'drizzle-orm/better-sqlite3';

const db = drizzle({
    connection: {
        source: 'local.db',
        // nativeBinding:filePath 
    }
})

async function initEntity<T extends BaseEntity>(ctor: new () => T): Promise<void> {
    let sql = new ctor().createTable();
    try {
        await db.run(sql)
    }catch (error) {
        console.error(`Error creating table`, error);
        console.error(`Failed SQL: ${sql}`);
    }
}

async function initEntities(): Promise<void> {
    await initEntity(EnvGroup);
    await initEntity(EnvItem);

    console.log("Entities initialized");
}

initEntities();

export {
    EnvGroup,
    EnvItem,
    db
}