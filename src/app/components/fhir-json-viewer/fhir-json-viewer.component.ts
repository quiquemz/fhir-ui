import { Component, Input, QueryList, ViewChildren } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
	selector: 'app-fhir-json-viewer',
	standalone: true,
	imports: [RouterLink],
	templateUrl: './fhir-json-viewer.component.html',
	styleUrl: './fhir-json-viewer.component.scss',
})
export class FhirJsonViewerComponent {
	@Input() resource: any;
	@Input() treeDepth = 0;

	@ViewChildren(FhirJsonViewerComponent) children: QueryList<FhirJsonViewerComponent> | undefined;

	isCollapsed: { [key: string]: boolean } = {};

	getKeys(obj: any): string[] {
		return Object.keys(obj);
	}

	toggleExpand(key: string): void {
		this.isCollapsed[key] = !this.isCollapsed[key];
	}

	isObject(value: any): boolean {
		return value && typeof value === 'object';
	}

	isKeyANumber(key: string): boolean {
		return !isNaN(parseInt(key, 10));
	}

	expandAll(): void {
		if (!this.children) {
			return;
		}

		this.children.forEach((child) => child.expandAll());
		this.isCollapsed = {};
	}

	collapseAll(): void {
		if (!this.children) {
			return;
		}

		this.children.forEach((child) => child.collapseAll());

		const keys = this.getKeys(this.resource);
		keys.forEach((key) => {
			this.isCollapsed[key] = true;
		});
	}
}
