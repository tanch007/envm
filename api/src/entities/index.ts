import type { BaseEntity } from "./BaseEntity";
import { EnvGroup } from "./EnvGroup";
import { EnvItem } from "./EnvItem";
import { SQL } from "bun";

const db = new SQL("sqlite://envm.db");

async function initEntity<T extends BaseEntity>(ctor: new () => T): Promise<void> {
    let sql = new ctor().createTable();
    try {
        await db.unsafe(sql)
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