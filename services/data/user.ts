import { DataConnection } from "./db-connection.ts";
import { generateNewUser } from "./defaults.ts";
import { Project, Team, User } from "../schema/mod.ts";

export class UserService {
  constructor(private db: DataConnection) {}

  // Ensure a user exists, creates one if not
  // Return false if user exists, true if created
  async ensureUser(uId: string): Promise<boolean> {
    if (await this.db.dUsers.findOne({ name: uId })) {
      return false;
    } else {
      this.db.dUsers.insertOne(generateNewUser(uId));
      return true;
    }
  }

  // Returns all of a user's data
  async getUserInfo(uId: string): Promise<User | undefined> {
    const info = await this.db.dUsers.findOne({ name: uId });
    if (!info) return undefined;

    // Inject referenced data
    info.projects = await this.db.dProjects.find({ owner: uId }).toArray();
    info.projects.sort((a, b) => (a.title).localeCompare(b.title));

    return info;
  }

  // Hide the new user experience for a user
  async setUserWelcomed(uId: string): Promise<void> {
    await this.db.dUsers.updateOne(
      { name: uId },
      { $set: { firstTime: false } },
    );
  }
}
