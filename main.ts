
import {
	config,
	Application,
	Router,
	send
} from "./deps.ts";
import {
	AuthService,
	BadgeService,
	DataService
} from "./services/mod.ts";
import {
	Badge
} from "./services/schema/mod.ts";

// Oak server + middleware
const app = new Application();
const router = new Router();

// Maintained services
const auth = new AuthService();
const badger = new BadgeService();
const data = new DataService();

router
	.get("/auth", async ctx => {
		const params = ctx.request.url.searchParams;
		const jwt = params.get("jwt") ?? "";
		if (!jwt) ctx.throw(400);

		const uuid = await auth.verify(jwt);
		await data.ensureUser(uuid);

		ctx.cookies.set("token", jwt, { maxAge: 864000, sameSite: "strict", path: "/" });
		ctx.response.redirect("/dashboard");
	})
	.post("/api/badges/create", async ctx => {
		const badge = await data.createBadge(ctx.state.userId, ctx.state.project);
		if (!badge) ctx.throw(400);
		else ctx.response.body = badge;
	})
	.post("/api/badges/update", async ctx => {
		const badge = ctx.request.body({ type: "json" }) as unknown as Badge;
		const upBadge = await data.updateBadge(ctx.state.userId, ctx.state.project, badge);
		if (!upBadge) ctx.throw(400);
		else ctx.response.body = upBadge;
	})
	.post("/api/badges/delete", async ctx => {
		if (!ctx.state.project || !ctx.state.badgeId) ctx.throw(400);
		await data.deleteBadge(ctx.state.userId, ctx.state.project, ctx.state.badgeId);
		ctx.response.status = 204;
	})
	.post("/api/projects/create", async ctx => {
		const project = await data.createProject(ctx.state.userId, ctx.state.project);
		if (!project) ctx.throw(400);
		ctx.response.body = JSON.stringify(project);
	})
	.post("/api/projects/delete", async ctx => {
		if (!ctx.state.project) ctx.throw(400);
		await data.deleteProject(ctx.state.userId, ctx.state.project);
		ctx.response.status = 204;
	})
	.get("/api/user/data", async ctx => {
		ctx.response.body = await data.getUserInfo(ctx.state.userId);
	})
	.post("/api/user/welcome", async ctx => {
		await data.setUserWelcomed(ctx.state.userId);
		ctx.response.status = 204;
	})
	.get("/:userId/:project/:badgeId", async ctx => {
		const userId = ctx.params.userId ?? "";
		const project = ctx.params.project ?? "";
		const badgeId = ctx.params.badgeId ?? "";
		const badgeData = await data.getBadge(userId, project, parseInt(badgeId));

		if (badgeData) {
			const badge = await badger.generate(badgeData);
			ctx.response.body = badge;
			ctx.response.headers.set("Cache-Control", "no-store");
			ctx.response.type = "image/svg+xml";
		}
		else
			ctx.throw(404);
	})
	.get("/:userId/:project/:badgeId/redirect", async ctx => {
		ctx.response.redirect("redirect.html");
	})
	.get("/:userId/:project/:badgeId/json", async ctx => {
		const userId = ctx.params.userId ?? "";
		const project = ctx.params.project ?? "";
		const badgeId = ctx.params.badgeId ?? "";
		const badgeData = await data.getBadge(userId, project, parseInt(badgeId));

		if (badgeData) {
			ctx.response.body = badgeData;
			ctx.response.headers.set("Access-Control-Allow-Origin", "*");
			ctx.response.headers.set("Cache-Control", "no-store");
			ctx.response.type = "application/json";
		}
	});

// Authentication middleware for API
app.use(async (ctx, next) => {
	const id = await auth.verify(ctx.cookies.get("token") ?? "");
	const project = ctx.request.url.searchParams.get("project") ?? "";
	const badgeId = ctx.request.url.searchParams.get("id") ?? "";
	ctx.state = {
		userId: id,
		project: project,
		badgeId: badgeId
	};
	await next();
});

app.use(router.allowedMethods());
app.use(router.routes());

app.use(async ctx => {
	await send(ctx, ctx.request.url.pathname, {
		root: `${Deno.cwd()}/app`,
		index: "index.html"
	});
});

app.listen({ port: config.port });
console.log(`Port: ${config.port}`);