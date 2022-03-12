import { Badge, BadgeColor, BadgeStyle, Project, User } from "../schema/mod.ts";

// Default data objects
export const newBadge: Badge = {
  id: 1,
  fields: [
    {
      content: "New",
      color: BadgeColor.Simple,
      width: 35,
    },
    {
      content: "Badge",
      color: BadgeColor.Savannah,
      width: 50,
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
