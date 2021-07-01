
import { Project } from "./project.ts";

export interface User {
	name: string // UUID
	firstTime: boolean
	projects: Project[]
	teams?: string[]
}