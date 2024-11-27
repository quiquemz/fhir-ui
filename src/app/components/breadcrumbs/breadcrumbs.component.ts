import { Component, OnInit } from '@angular/core';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';

interface Breadcrumb {
	label: string;
	url: string;
}

@Component({
	selector: 'app-breadcrumbs',
	templateUrl: './breadcrumbs.component.html',
	styleUrls: ['./breadcrumbs.component.scss'],
	standalone: true,
	imports: [RouterModule],
})
export class BreadcrumbsComponent implements OnInit {
	breadcrumbs: Breadcrumb[] = [];

	constructor(
		private router: Router,
		private route: ActivatedRoute,
	) {}

	ngOnInit(): void {}
}
