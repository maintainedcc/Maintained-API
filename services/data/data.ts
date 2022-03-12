import { DataConnection } from "./db-connection.ts";
import { Badge } from "../schema/mod.ts";

export class DataService {
  constructor(private db: DataConnection) {}

  // Create a new default badge in a user's project and return it
  async createBadge(uId: string, project: string): Promise<Badge | undefined> {
    const p = await this.db.dProjects.findOne({ owner: uId, title: project });
    if (!p) return undefined;

    const lastId = p.badges[p.badges.length - 1]?.id;
    const nBadge = {
      ...p.defaultBadge,
      id: (lastId ?? 0) + 1,
    };
    p.badges.push(nBadge);

    await this.db.dProjects.updateOne(
      { owner: uId, title: project },
      { $set: { badges: p.badges } },
    );
    return nBadge;
  }

  // Delete a badge in a user's project from badge ID
  async deleteBadge(uId: string, project: string, bId: number): Promise<void> {
    const p = await this.db.dProjects.findOne({ owner: uId, title: project });
    if (!p) return undefined;

    const badgeIndex = p.badges.findIndex((b: Badge) => b.id === bId);
    p.badges.splice(badgeIndex, 1);
    await this.db.dProjects.updateOne(
      { owner: uId, title: project },
      { $set: { badges: p.badges } },
    );
  }

  // Get a badge based on username, project, and badge ID
  async getBadge(
    uId: string,
    project: string,
    bId: number,
  ): Promise<Badge | undefined> {
    const p = await this.db.dProjects.findOne({ owner: uId, title: project });
    if (!p) return undefined;

    const userBadge = p.badges.find((b: Badge) => b.id === bId);
    if (!userBadge) return undefined;
    else return userBadge;
  }

  // Updates all properties of a badge given username, project, and badge
  async updateBadge(
    uId: string,
    project: string,
    badge: Badge,
  ): Promise<Badge | undefined> {
    const p = await this.db.dProjects.findOne({ owner: uId, title: project });
    if (!p) return undefined;

    const userBadge = p.badges.find((b: Badge) => b.id === badge.id);
    if (!userBadge) return undefined;

    // Explicitly set values to make sure vital info like
    // badge ID, etc. does not get changed
    userBadge.fields = badge.fields;
    userBadge.style = badge.style;
    userBadge.redirect = badge.redirect;

    // Save changes
    await this.db.dProjects.updateOne(
      { owner: uId, title: project },
      { $set: { badges: p.badges } },
    );
    return userBadge;
  }
}
