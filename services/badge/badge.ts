
import { IconService } from "./icon/icon.ts";
import { 
	Flat,
	FTB,
	Plastic,
	Template
} from './style/mod.ts';
import { 
	Badge, 
	BadgeStyle, 
	BadgeColor, 
	BadgeField
} from "../schema/mod.ts";

interface BadgePartial {
	content: string // SVG or HTML string
	title: string // Accessible title string
	width: number // Width calculation (SVG)
}

export class BadgeService {
	private iconService: IconService;
	constructor() {
		this.iconService = new IconService();
	}

	async generate(badge: Badge): Promise<string> {
		let totalWidth = 0;
		let innerContent = "";
		let accessibleTitle: string[] = [];
		
		// Compile badge partials
		if (badge.fields)
			badge.fields.forEach(async field => {
				const part = await this.generatePartial(field, badge.style, totalWidth);
				totalWidth += part.width;
				innerContent += part.content;
				accessibleTitle.push(part.title);
			});

		const aTitle = accessibleTitle.join(" ");
		return this.generateWrapper(badge.style, innerContent, aTitle, totalWidth);
	}

	private async generatePartial(field: BadgeField, style: BadgeStyle, offset = 0): Promise<BadgePartial> {
		// Parse potential icon (:iconqualifier:)
		let iconMatch = field.content.toLowerCase().match(/^:([A-z]+):/);
		if (iconMatch) {
			field.content = field.content.replace(iconMatch[0], "").trim();
			field.iconURI = await this.iconService.getIconDataURL(iconMatch[1], true);
		}

		// If Dynamic, get the DVS content
		if (field.source) {
			await fetch(field.source)
				.then(res => res.text())
				.then(res => { 
					// Update content and content width
					field.content = res;
					field.width = field.content.length * 5.7;
				})
				.catch(ex => console.warn(ex));
		}

		// Hex color string of partial
		const colorString = this.colorMap(field.color);

		let generator = this.getGenerator(style);
		return {
			content: generator.field(field, colorString, offset, field.source ? true:false),
			title: field.content,
			width: field.width
		}
	}

	private generateWrapper(style: BadgeStyle, innerContent: string, title: string, totalWidth: number): string {
		return this.getGenerator(style).wrapper(innerContent, title, totalWidth);
	}

	private getGenerator(style: BadgeStyle): Template {
		switch (style) {
			case BadgeStyle.Plastic: return new Plastic();
			case BadgeStyle.Flat: return new Flat();
			case BadgeStyle.ForTheBadge: return new FTB();
			default: throw EvalError(`Invalid badge style: ${style}`);
		}
	}

	private colorMap(color: BadgeColor): string {
		switch(color) {
			case BadgeColor.Simple:
				return "#555";
			case BadgeColor.Slate:
				return "#556";
			case BadgeColor.Seabed:
				return "#013";
			case BadgeColor.Subterranean:
				return "#111";
			case BadgeColor.Savannah:
				return "#AB2";
			case BadgeColor.Sahara:
				return "#F80";
			case BadgeColor.Sunset:
				return "#F20";
			default: return "";
		}
	}
}