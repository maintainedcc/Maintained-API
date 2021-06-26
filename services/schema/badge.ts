
import { BadgeField, BadgeFieldDynamic, BadgeStyle } from "./mod.ts";

export interface Badge {
	id: number
	title: BadgeField
	values?: BadgeFieldDynamic[]
	redirect?: string
	style: BadgeStyle
}