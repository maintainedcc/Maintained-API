import { Application, Router } from "./deps.ts";
import { badgeV1, projectV1, userV1 } from "./routes/v1/.mod.ts";
import {
  AuthService,
  DataConnection,
  DataService,
  ProjectService,
  UserService,
} from "./services/mod.ts";

// Oak server + middleware
const app = new Application();
const router = new Router();

// Data connection
const db = new DataConnection();

// Maintained services
const auth = new AuthService();
const data = new DataService(db);
const proj = new ProjectService(db);
const user = new UserService(db);

router.get("/:userId/:project/:badgeId/json", async (ctx) => {
  const { userId = "", project = "", badgeId = "" } = ctx.params;
  const badgeData = await data.getBadge(userId, project, parseInt(badgeId));

  if (badgeData) {
    ctx.response.body = badgeData;
    ctx.response.headers.set("Access-Control-Allow-Origin", "*");
    ctx.response.headers.set("Cache-Control", "no-store");
    ctx.response.type = "application/json";
  }
});

// Access control
app.use(async (ctx, next) => {
  ctx.response.headers.set(
    "Access-Control-Allow-Origin",
    Deno.env.get("ALLOWED_ORIGIN") ?? "*",
  );
  ctx.response.headers.set("Access-Control-Allow-Credentials", "true");
  ctx.response.headers.set("Access-Control-Allow-Headers", "Authorization");
  await next();
});

// Authentication middleware for API
app.use(async (ctx, next) => {
  let id = "";
  const authorization = ctx.request.headers.get("Authorization");
  if (authorization) id = await auth.verify(authorization);
  const project = ctx.request.url.searchParams.get("project") ?? "";
  const badgeId = ctx.request.url.searchParams.get("id") ?? "";
  ctx.state = {
    userId: id,
    project: project,
    badgeId: badgeId,
  };
  await next();
});

app.use(badgeV1("/v1/badge", data).allowedMethods());
app.use(badgeV1("/v1/badge", data).routes());
app.use(projectV1("/v1/project", proj).allowedMethods());
app.use(projectV1("/v1/project", proj).routes());
app.use(userV1("/v1/user", auth, user).allowedMethods());
app.use(userV1("/v1/user", auth, user).routes());

app.use(router.allowedMethods());
app.use(router.routes());

const port = parseInt(Deno.env.get("PORT") || "8002");
app.listen({ port: port });
console.log(`Port: ${port}`);
