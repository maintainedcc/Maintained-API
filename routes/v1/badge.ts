
import { Router } from "../../deps.ts";
import type { Badge } from "../../services/schema/mod.ts";
import type { DataService } from "../../services/data/data.ts";

export const badgeV1 = (prefix: string, data: DataService) => {
  return new Router({ prefix: prefix })
    .post("/create", async ctx => {
      const badge = await data.createBadge(ctx.state.userId, ctx.state.project);
      if (!badge) ctx.throw(400);
      else ctx.response.body = badge;
    })
    .post("/update", async ctx => {
      const badge = ctx.request.body({ type: "json" }) as unknown as Badge;
      const upBadge = await data.updateBadge(ctx.state.userId, ctx.state.project, badge);
      if (!upBadge) ctx.throw(400);
      else ctx.response.body = upBadge;
    })
    .post("/delete", async ctx => {
      if (!ctx.state.project || !ctx.state.badgeId) ctx.throw(400);
      await data.deleteBadge(ctx.state.userId, ctx.state.project, ctx.state.badgeId);
      ctx.response.status = 204;
    })
    .get("/test", async ({state, response}) => {
      console.log(state);
      response.body = "hello world";
    });
};