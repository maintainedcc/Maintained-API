import { Collection, Database, MongoClient } from "../../deps.ts";
import { Project, Team, User } from "../schema/mod.ts";

export class DataConnection {
  // Assert non-null. Possible race condition, but unlikely because
  // function calls are event-driven (non-issue after initialization).
  private db!: Database;
  public dUsers!: Collection<User>;
  public dProjects!: Collection<Project>;

  constructor() {
    console.log("Connecting to database...");
    const client = new MongoClient();

    // Generate connection string
    const mongoUser = `${Deno.env.get("DATABASE_USER")}:${
      Deno.env.get("DATABASE_PWD")
    }`;
    const mongoHost = `${Deno.env.get("DATABASE_HOST")}:${
      Deno.env.get("DATABASE_PORT")
    }`;
    const mongoStringBase = `mongodb://${mongoUser}@${mongoHost}`;

    // Connect to DB and load collections
    client.connect(
      `${mongoStringBase}/?authSource=admin&readPreference=primary&ssl=false`,
    )
      .then(() => {
        this.db = client.database(Deno.env.get("DATABASE_NAME"));
        this.dUsers = this.db.collection("users");
        this.dProjects = this.db.collection("projects");

        this.dUsers.countDocuments()
          .then((num) => console.log(`Loaded ${num} users.`));
        this.dProjects.countDocuments()
          .then((num) => console.log(`Loaded ${num} projects.`));
      });
  }
}
