
import { Project } from "./mod.ts";

export interface Team {
	owner: string
	members: string[]

	name: string // UUID
	projects: Project[]
}