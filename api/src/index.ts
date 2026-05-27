
import { Hono } from "hono"
import open from "open";
import envGroupRoute from "./routes/envGroupRoute";
import envItemRoute from "./routes/envItemRoute";
import { serveStatic } from 'hono/bun'

const app = new Hono();
//静态资源
app.get('/*', serveStatic({ root: './public' }))

app.route("/api/envm/groups", envGroupRoute);
app.route("/api/envm/items", envItemRoute);

open("http://localhost:3212")
export default { 
  port: 3212, 
  fetch: app.fetch, 
} 