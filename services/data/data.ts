import { DataConnection } from "./db-connection.ts";
import { newBadge } from "./defaults.ts";
import { Badge, Project, Team } from "../schema/mod.ts";

export class DataService {
  constructor(private db: DataConnection) {}

  // Create a new default badge in a user's project and return it
  async createBadge(uId: string, project: string): Promise<Badge | undefined> {
    const userData = (await this.db.dUsers.findOne({ name: uId }))?.projects;
    const userProj = userData?.find((p: Project) => p.title === project);
    if (!userProj) return undefined;

    const lastId = userProj.badges[userProj.badges.length - 1]?.id;
    const nBadge = {
      ...userProj.defaultBadge,
      id: (lastId ?? 0) + 1,
    };

    userProj.badges.push(nBadge);
    await this.db.dUsers.updateOne(
      { name: uId },
      { $set: { projects: userData } },
    );
    return nBadge;
  }

  // Delete a badge in a user's project from badge ID
  async deleteBadge(uId: string, project: string, bId: number): Promise<void> {
    const userData = (await this.db.dUsers.findOne({ name: uId }))?.projects;
    const userProj = userData?.find((p: Project) => p.title === project);
    if (!userProj) return;

    const badgeIndex = userProj.badges.findIndex((b: Badge) => b.id === bId);
    userProj.badges.splice(badgeIndex, 1);
    await this.db.dUsers.updateOne(
      { name: uId },
      { $set: { projects: userData } },
    );
  }

  // Get a badge based on username, project, and badge ID
  async getBadge(
    uId: string,
    project: string,
    bId: number,
  ): Promise<Badge | undefined> {
    const userData = (await this.db.dUsers.findOne({ name: uId }))?.projects;
    const userProj = userData?.find((p: Project) => p.title === project);
    if (!userProj) return undefined;

    const userBadge = userProj.badges.find((b: Badge) => b.id === bId);
    if (!userBadge) return undefined;
    else return userBadge;
  }

  // Updates all properties of a badge given username, project, and badge
  async updateBadge(
    uId: string,
    project: string,
    badge: Badge,
  ): Promise<Badge | undefined> {
    const userData = (await this.db.dUsers.findOne({ name: uId }))?.projects;
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
    await this.db.dUsers.updateOne(
      { name: uId },
      { $set: { projects: userData } },
    );
    return userBadge;
  }

  // Create a new project with title and return it
  async createProject(
    uId: string,
    project: string,
  ): Promise<Project | undefined> {
    const user = await this.db.dUsers.findOne({ name: uId });
    if (!user || !project) return undefined;

    project = project.replaceAll(" ", "-").replaceAll("/", "-");
    if (user.projects.find((p: Project) => p.title === project)) {
      return undefined;
    }

    const newProject: Project = {
      owner: uId,
      associates: [],
      title: project,
      badges: [newBadge],
      defaultBadge: newBadge,
    };

    user.projects.push(newProject);
    user.projects.sort((a: Project, b: Project) =>
      ("" + a.title).localeCompare(b.title)
    );
    await this.db.dUsers.updateOne(
      { name: uId },
      { $set: { projects: user.projects } },
    );
    return newProject;
  }

  // Delete a project based on username and project name
  async deleteProject(uId: string, project: string): Promise<void> {
    const user = await this.db.dUsers.findOne({ name: uId });
    if (!user || !project) return;

    const projectIndex = user.projects.findIndex((p: Project) =>
      p.title === project
    );
    user.projects.splice(projectIndex, 1);
    await this.db.dUsers.updateOne(
      { name: uId },
      { $set: { projects: user.projects } },
    );
  }
}
