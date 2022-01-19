
import { Router } from "../../deps.ts";
import type { DataService } from "../../services/data/data.ts";

export const projectV1 = (prefix: string, data: DataService) => {
  return new Router({ prefix: prefix })
    .post("/create", async ctx => {
      const project = await data.createProject(ctx.state.userId, ctx.state.project);
      if (!project) ctx.throw(400);
      ctx.response.body = JSON.stringify(project);
    })
    .post("/delete", async ctx => {
      if (!ctx.state.project) ctx.throw(400);
      await data.deleteProject(ctx.state.userId, ctx.state.project);
      ctx.response.status = 204;
    });
};