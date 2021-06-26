
import { BadgeField, BadgeStyle } from "./mod.ts";

export interface Badge {
	id: number
	fields: BadgeField[]
	redirect?: string
	style: BadgeStyle
}