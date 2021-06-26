
import { BadgeColor } from "./mod.ts";

export interface BadgeField {
	content: string
	color: BadgeColor
	width: number
}

export interface BadgeFieldDynamic extends BadgeField {
	source?: string // Dynamic Value Sources URI
}