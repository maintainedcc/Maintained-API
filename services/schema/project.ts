
import { Badge } from "./mod.ts";

export interface Project {
	title: string
	badges: Badge[],
	defaultBadge: Badge
}