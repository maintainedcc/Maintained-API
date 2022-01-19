
import { Router } from "../../deps.ts";
import type { DataService } from "../../services/data/data.ts";

export const userV1 = (prefix: string, data: DataService) => {
  return new Router({ prefix: prefix })
    .get("/data", async ctx => {
      ctx.response.body = await data.getUserInfo(ctx.state.userId);
    })
    .post("/welcome", async ctx => {
      await data.setUserWelcomed(ctx.state.userId);
      ctx.response.status = 204;
    });
};