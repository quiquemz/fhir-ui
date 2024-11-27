import { Component, OnInit } from '@angular/core';

declare const SwaggerUIBundle: any;

@Component({
	selector: 'app-api',
	standalone: true,
	imports: [],
	templateUrl: './api.component.html',
	styleUrl: './api.component.scss',
})
export class ApiComponent implements OnInit {
	constructor() {}

	ngOnInit(): void {
		const ui = SwaggerUIBundle({
			dom_id: '#swagger-ui',
			layout: 'BaseLayout',
			presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
			url: 'assets/pdms.openapi.json',
			operationsSorter: 'alpha',
		});
	}
}
