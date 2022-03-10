
import { Badge } from "./mod.ts";

export interface Project {
	owner: string // GitHub UUID
	associates: string[] // GitHub UUIDs
	title: string
	badges: Badge[],
	defaultBadge: Badge
}