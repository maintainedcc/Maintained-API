import { Badge, BadgeColor, BadgeStyle, Project, User } from "../schema/mod.ts";

// Default data objects
export const newBadge: Badge = {
  id: 1,
  fields: [
    {
      content: ":github:Status",
      color: BadgeColor.Simple,
      width: 36,
      iconURI: "github",
    },
    {
      content: "Maintained",
      color: BadgeColor.Savannah,
      width: 61,
    },
    {
      content: ":check-lg:",
      color: BadgeColor.Subterranean,
      width: 0,
      iconURI: "check-lg",
    },
  ],
  style: BadgeStyle.Plastic,
};

export function generateNewProject(uuid: string, title: string): Project {
  return {
    owner: uuid,
    associates: [],
    title: title,
    badges: [newBadge],
    defaultBadge: newBadge,
  };
}

export function generateNewUser(uuid: string): User {
  return {
    name: uuid,
    firstTime: true,
    projects: [],
  };
}
