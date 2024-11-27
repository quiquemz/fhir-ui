import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router } from '@angular/router';
import { DomainResource } from 'fhir/r4';
import { catchError, combineLatest } from 'rxjs';
import { PdmsService } from '../../services/pdms.service';
import { JsonPipe } from '@angular/common';

@Component({
	selector: 'app-fhir-resource-edit',
	standalone: true,
	imports: [FormsModule, MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule, JsonPipe],
	templateUrl: './fhir-resource-edit.component.html',
	styleUrl: './fhir-resource-edit.component.scss',
})
export class FhirResourceEditComponent {
	resourceType: string = '';
	resourceId: string = '';
	resource: DomainResource = {} as DomainResource;
	resourceAsJson: string = '';

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private pdmsService: PdmsService,
	) {}

	ngOnInit(): void {
		combineLatest([this.route.parent!.url, this.route.params]).subscribe(([url, params]) => {
			this.resourceType = url[0].path;
			this.resourceId = params['id'];
			this.loadPatient();
		});
	}

	loadPatient(): void {
		this.pdmsService.getById(this.resourceType, this.resourceId).subscribe((resource) => {
			this.resource = resource;
			this.resourceAsJson = JSON.stringify(resource, null, 2);
		});
	}

	updateResource() {
		try {
			this.resource = JSON.parse(this.resourceAsJson);
		} catch (error) {
			console.error('Invalid JSON', error);
		}
	}

	goToDetail(): void {
		this.router.navigate(['../'], { relativeTo: this.route });
	}

	saveResource(): void {
		this.pdmsService
			.update(this.resourceType, this.resourceId, this.resource)
			.pipe(
				catchError((error) => {
					alert('Error saving resource:\n' + JSON.stringify(error));
					return [];
				}),
			)
			.subscribe(() => {
				this.router.navigate(['../'], { relativeTo: this.route });
			});
	}
}
