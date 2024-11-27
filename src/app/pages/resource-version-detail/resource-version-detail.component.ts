import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomainResource } from 'fhir/r4';
import { PdmsService } from '../../services/pdms.service';
import { combineLatest } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { FhirJsonViewerComponent } from "../../components/fhir-json-viewer/fhir-json-viewer.component";

@Component({
	selector: 'app-resource-version-detail',
	standalone: true,
	imports: [MatIconModule, FhirJsonViewerComponent],
	templateUrl: './resource-version-detail.component.html',
	styleUrl: './resource-version-detail.component.scss',
})
export class ResourceVersionDetailComponent {
	resourceType: string = '';
	resourceId: string = '';
	resource: DomainResource | undefined = undefined;
	version: string = '';

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private pdmsService: PdmsService,
	) {}

	ngOnInit(): void {
		combineLatest([this.route.parent!.url, this.route.params]).subscribe(([url, params]) => {
			this.resourceType = url[0].path;
			this.resourceId = params['id'];
			this.version = params['version'];
			this.loadPatient();
		});
	}

	loadPatient(): void {
		this.pdmsService.getByIdWithVersion(this.resourceType, this.resourceId, this.version).subscribe((resource) => {
			this.resource = resource;
		});
	}
}
