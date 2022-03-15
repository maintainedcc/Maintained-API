import { Router } from "../../deps.ts";
import type { AuthService, UserService } from "../../services/mod.ts";

export const userV1 = (
  prefix: string,
  auth: AuthService,
  data: UserService,
) => {
  return new Router({ prefix: prefix })
    .get("/ensure", async (ctx) => {
      const params = ctx.request.url.searchParams;
      const jwt = params.get("jwt") ?? "";
      if (!jwt) ctx.throw(400);

      const { id, login } = await auth.verify(jwt);
      const success = await data.ensureUser(id, login);

      ctx.response.status = success ? 200 : 400;
      ctx.response.body = {
        ok: success,
        message: success ? "User created" : "User already exists",
      };
    })
    .get("/data", async (ctx) => {
      ctx.response.body = await data.getUserInfo(ctx.state.userId);
    })
    .post("/welcome", async (ctx) => {
      await data.setUserWelcomed(ctx.state.userId);
      ctx.response.status = 204;
    });
};
