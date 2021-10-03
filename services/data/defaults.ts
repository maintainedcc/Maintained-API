
import {
	Badge,
	BadgeColor,
	BadgeStyle,
	Project,
	User
} from "../schema/mod.ts";

// Default data objects
export const newBadge: Badge = {
	id: 1,
	fields: [
		{
			content: "New",
			color: BadgeColor.Simple,
			width: 35
		},
		{
			content: "Badge",
			color: BadgeColor.Savannah,
			width: 50
		}
	],
	style: BadgeStyle.Plastic
};

export function generateNewUser(uuid: string): User {
	const newProject: Project = {
		title: uuid,
		badges: [ newBadge ]
	};
	return {
		name: uuid,
		firstTime: true,
		projects: [ newProject ]
	};
}