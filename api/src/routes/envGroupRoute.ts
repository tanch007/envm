import { Hono } from "hono";
import type { EnvGroup } from "../entities";
import { saveGroup, getAllGroups, deleteGroupById,getGroupEnvList } from "../services/envGroupService";

const app = new Hono();

/**
 * 获取所有环境变量组
 */
app.get("/", async (c) => {
    const groups = await getAllGroups();
    return c.json(groups);
});

/**
 * 重新获取环境列表
 */
app.get("/refresh/:id", async (c) => {
    const id = c.req.param("id");
    await getGroupEnvList(id);
    return c.text("Environment list refreshed successfully");
});


/**
 * 新增或更新环境变量组
 */
app.post("/", async (c) => {
    const body = await c.req.json<Partial<EnvGroup>>();
    const group = await saveGroup(body);
    return c.json(group, 201);
});

/**
 * 根据 ID 删除环境变量组
 */
app.delete("/:id", async (c) => {
    const id = c.req.param("id");
    await deleteGroupById(id);
    return c.json({ success: true });
});

export default app;
