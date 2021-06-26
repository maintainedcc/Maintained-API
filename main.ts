
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
} from "./services/mod.defs.ts";

// Oak server + middleware
const app = new Application();
const exposed = new Router();
const identity = new Router();
const user = new Router();

// Maintained services
const auth = new AuthService();
const badger = new BadgeService();
const data = new DataService();

identity
	.get("/oauth/callback", async ctx => {
		const params = ctx.request.url.searchParams;
		const code = params.get("code") ?? "";
		const state = params.get("state") ?? "";

		if (!code || state != "pog") ctx.throw(400);

		const nid = await auth.authorize(code, state);
		const uuid = auth.getAuthorization(nid);
		await data.ensureUser(uuid);

		ctx.cookies.set("token", nid, { maxAge: 864000, sameSite: "strict", path: "/" });
		ctx.response.redirect("/dashboard");
	})
	.get("/oauth/login", ctx => {
		const authed = auth.isAuthorized(ctx.cookies.get("token") ?? "");
		if (ctx.cookies.get("token") && authed)
			ctx.response.redirect("/dashboard");
		else
			ctx.response.redirect(auth.getAuthURL());
	})
	.get("/oauth/logout", ctx => {
		ctx.cookies.set("token", "", { maxAge: 0 });
		ctx.response.redirect("/");
	})
	.get("/oauth/manage", ctx => {
		ctx.response.redirect(auth.getManagementURL());
	});

exposed
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
user.use(async (ctx, next) => {
	const id = auth.getAuthorization(ctx.cookies.get("token") ?? "");
	const project = ctx.request.url.searchParams.get("project") ?? "";
	const badgeId = ctx.request.url.searchParams.get("id") ?? "";
	ctx.state = {
		userId: id,
		project: project,
		badgeId: badgeId
	};
	await next();
});

user
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
	});

app.use(identity.routes());
app.use(exposed.routes());
app.use(user.routes());

app.use(identity.allowedMethods());
app.use(exposed.allowedMethods());
app.use(user.allowedMethods());

app.use(async ctx => {
	await send(ctx, ctx.request.url.pathname, {
		root: `${Deno.cwd()}/app`,
		index: "index.html"
	});
});

app.listen({ port: config.port });
console.log(`Port: ${config.port}`);