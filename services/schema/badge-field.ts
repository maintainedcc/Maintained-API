
import { BadgeColor } from "./mod.ts";

export interface BadgeField {
	content: string
	color: BadgeColor
	source?: string // DVS URL
	width: number
}