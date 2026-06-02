import { Hono } from "hono";
import type { EnvItem } from "../entities";
import { changeStatus, getItemsByGroup, deleteItemById } from "../services/envItemService";

const app = new Hono();

/**
 * 根据组 ID 获取环境变量项列表
 */
app.get("/group/:groupId", async (c) => {
    const groupId = c.req.param("groupId");
    const items = await getItemsByGroup(groupId);
    return c.json(items);
});

/**
 * 新增或更新环境变量项
 */
app.post("/changeStatus", async (c) => {
    const body = await c.req.json<{ id: string; enable: boolean }>();
    changeStatus(body.id, body.enable);
    return c.json({ success: true });
});

/**
 * 根据 ID 删除环境变量项
 */
app.delete("/:id", async (c) => {
    const id = c.req.param("id");
    await deleteItemById(id);
    return c.json({ success: true });
});

export default app;
