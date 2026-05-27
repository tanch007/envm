import { Hono } from "hono";
import type { EnvItem } from "../entities";
import { changeStatus, getItemsByGroup, deleteItemById } from "../services/envItemService";

const app = new Hono();

/**
 * 推出程序
 */
app.get("/exit", async (c) => {
    setTimeout(()=>{
        process.exit();
    },300)
    return c.text('已退出')
});


export default app;
