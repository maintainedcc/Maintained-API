
import { BadgeColor } from "./mod.ts";

export interface BadgeField {
	content: string
	color: BadgeColor
	iconURI?: string // Icon Resource
	source?: string // DVS URL
	width: number
}