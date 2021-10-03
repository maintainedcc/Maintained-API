
import {
	config,
	MongoClient,
	Database,
	Collection
} from "../../deps.ts";
import {
	Badge,
	User,
	Project,
	Team
} from "../schema/mod.ts";
import {
	newBadge,
	generateNewUser
} from "./defaults.ts";

export class DataService {
	// Assert non-null. Possible race condition, but unlikely because
	// function calls are event-driven (non-issue after initialization).
	private db!: Database;
	private dUsers!: Collection<User>;

	constructor() {
		const client = new MongoClient();
		const mongoUser = `${config.database_user}:${config.database_pwd}`;
		const mongoHost = `mongodb://${mongoUser}@${config.database_host}:27017`;
		client.connect(`${mongoHost}/?authSource=admin&readPreference=primary&ssl=false`)
			.then(() => {
				this.db = client.database(config.database_name);
				this.dUsers = this.db.collection("users");

				this.dUsers.count().then((num: number) => {
					console.log(`Loaded DB with ${num} users.`);
				});
			});
	}

	// Ensure a user exists
	async ensureUser(uId: string): Promise<void> {
		// Make sure the user doesn't exist already
		if (await this.dUsers.findOne({ name: uId })) return;
		else this.dUsers.insertOne(generateNewUser(uId));
	}

	// Returns all of a user's data
	async getUserInfo(uId: string): Promise<User | undefined> {
		const info = await this.dUsers.findOne({ name: uId });
		if (info) return info;
		else return undefined;
	}

	// Hide the new user experience for a user
	async setUserWelcomed(uId: string): Promise<void> {
		await this.dUsers.updateOne(
			{ name: uId }, 
			{ $set: { firstTime: false } });
	}

	// Create a new default badge in a user's project and return it
	async createBadge(uId: string, project: string): Promise<Badge | undefined> {
		const userData = (await this.dUsers.findOne({ name: uId }))?.projects;
		const userProj = userData?.find((p: Project) => p.title === project);
		if (!userProj) return undefined;

		const lastId = userProj.badges[userProj.badges.length - 1]?.id;
		const nBadge = {
			...newBadge,
			id: (lastId ?? 0) + 1
		}

		userProj.badges.push(nBadge);
		await this.dUsers.updateOne(
			{ name: uId }, 
			{ $set: { projects: userData } });
		return nBadge;
	}

	// Delete a badge in a user's project from badge ID
	async deleteBadge(uId: string, project: string, bId: number): Promise<void> {
		const userData = (await this.dUsers.findOne({ name: uId }))?.projects;
		const userProj = userData?.find((p: Project) => p.title === project);
		if (!userProj) return;

		const badgeIndex = userProj.badges.findIndex((b: Badge) => b.id === bId);
		userProj.badges.splice(badgeIndex, 1);
		await this.dUsers.updateOne(
			{ name: uId }, 
			{ $set: { projects: userData } });
	}

	// Get a badge based on username, project, and badge ID
	async getBadge(uId: string, project: string, bId: number): Promise<Badge | undefined> {
		const userData = (await this.dUsers.findOne({ name: uId }))?.projects;
		const userProj = userData?.find((p: Project) => p.title === project);
		if (!userProj) return undefined;

		const userBadge = userProj.badges.find((b: Badge) => b.id === bId);
		if (!userBadge) return undefined;
		else return userBadge;
	}

	// Updates all properties of a badge given username, project, and badge
	async updateBadge(uId: string, project: string, badge: Badge): Promise<Badge | undefined> {
		const userData = (await this.dUsers.findOne({ name: uId }))?.projects;
		const userProj = userData?.find((p: Project) => p.title === project);
		if (!userProj) return undefined;

		const userBadge = userProj.badges.find((b: Badge) => b.id === badge.id);
		if (!userBadge) return undefined;

		// Explicitly set values to make sure vital info like
		// badge ID, etc. does not get changed
		userBadge.fields = badge.fields;
		userBadge.style = badge.style;
		userBadge.redirect = badge.redirect;

		// Save changes
		await this.dUsers.updateOne(
			{ name: uId },
			{ $set: { projects: userData }});
		return userBadge;
	}

	// Create a new project with title and return it
	async createProject(uId: string, project: string): Promise<Project | undefined> {
		const user = await this.dUsers.findOne({ name: uId });
		if (!user || !project) return undefined;

		project = project.replaceAll(" ", "-").replaceAll("/", "-");
		if (user.projects.find((p: Project) => p.title === project)) return undefined;

		const newProject: Project = {
			title: project,
			badges: [ newBadge ]
		}

		user.projects.push(newProject);
		user.projects.sort((a: Project, b: Project) => 
			('' + a.title).localeCompare(b.title));
		await this.dUsers.updateOne(
			{ name: uId }, 
			{ $set: { projects: user.projects } });
		return newProject;
	}

	// Delete a project based on username and project name
	async deleteProject(uId: string, project: string): Promise<void> {
		const user = await this.dUsers.findOne({ name: uId });
		if (!user || !project) return;

		const projectIndex = user.projects.findIndex((p: Project) => p.title === project);
		user.projects.splice(projectIndex, 1);
		await this.dUsers.updateOne(
			{ name: uId }, 
			{ $set: { projects: user.projects } });
	}
}