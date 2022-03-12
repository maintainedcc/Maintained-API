import { DataConnection } from "./db-connection.ts";
import { newBadge } from "./defaults.ts";
import { Project } from "../schema/mod.ts";

export class ProjectService {
  constructor(private db: DataConnection) {}

  // Create a new project with title and return it
  async createProject(
    uId: string,
    project: string,
  ): Promise<Project | undefined> {
    if (!uId || !project) return undefined;

    // Format project title
    project = project.replaceAll(" ", "-").replaceAll("/", "-");

    // Check if project already exists
    if (await this.db.dProjects.findOne({ owner: uId, title: project })) {
      return undefined;
    }

    const newProject: Project = {
      owner: uId,
      associates: [],
      title: project,
      badges: [newBadge],
      defaultBadge: newBadge,
    };
    await this.db.dProjects.insertOne(newProject);

    return newProject;
  }

  // Delete a project based on username and project name
  async deleteProject(uId: string, project: string): Promise<void> {
    if (!uId || !project) return undefined;
    await this.db.dProjects.deleteOne({ owner: uId, title: project });
  }
}
