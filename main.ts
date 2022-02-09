
import {
	Application,
	Router
} from "./deps.ts";
import {
	badgeV1,
	projectV1,
	userV1
} from "./routes/v1/.mod.ts";
import {
	AuthService,
	BadgeService,
	DataService
} from "./services/mod.ts";

// Oak server + middleware
const app = new Application();
const router = new Router();

// Maintained services
const auth = new AuthService();
const badger = new BadgeService();
const data = new DataService();

router
	.get("/:userId/:project/:badgeId", async ctx => {
		const { userId="", project="", badgeId="" } = ctx.params;
		const badgeData = await data.getBadge(userId, project, parseInt(badgeId));

		if (badgeData) {
			const badge = await badger.generate(badgeData);
			ctx.response.body = badge;
			ctx.response.headers.set("Cache-Control", "no-store");
			ctx.response.type = "image/svg+xml";
		}
		else ctx.throw(404);
	})
	.get("/:userId/:project/:badgeId/redirect", async ctx => {
		ctx.response.redirect("redirect.html");
	})
	.get("/:userId/:project/:badgeId/json", async ctx => {
		const { userId="", project="", badgeId="" } = ctx.params;
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
	ctx.response.headers.set("Access-Control-Allow-Origin", (Deno.env.get("ALLOWED_ORIGIN") ?? "*"));
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
		badgeId: badgeId
	};
	await next();
});

app.use(badgeV1("/v1/badge", data).allowedMethods());
app.use(badgeV1("/v1/badge", data).routes());
app.use(projectV1("/v1/project", data).allowedMethods());
app.use(projectV1("/v1/project", data).routes());
app.use(userV1("/v1/user", auth, data).allowedMethods());
app.use(userV1("/v1/user", auth, data).routes());

app.use(router.allowedMethods());
app.use(router.routes());

const port = parseInt(Deno.env.get("PORT") || "8002");
app.listen({ port: port });
console.log(`Port: ${port}`);