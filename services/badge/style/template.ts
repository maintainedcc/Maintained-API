
import { BadgeField } from "../../schema/mod.ts";

export abstract class Template {
	abstract field(field: BadgeField, color: string, iconURI: string|null, offset: number, ... opts: any): string;
	abstract fieldHTML(field: BadgeField, color: string, iconURI: string|null): string;
	abstract wrapper(internalContent: string, title: string, totalWidth: number): string;
}