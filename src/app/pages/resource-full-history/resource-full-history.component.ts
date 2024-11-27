import { Component } from '@angular/core';
import { ServiceMethod } from '../../models/ServiceMethodTypes';
import { ColumnConfig } from '../../../config/ColumnConfig';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PdmsService } from '../../services/pdms.service';
import { BundleEntry } from 'fhir/r4';
import { FhirEntryListComponent } from '../../components/fhir-entry-list/fhir-entry-list.component';

@Component({
	selector: 'app-resource-full-history',
	standalone: true,
	imports: [FhirEntryListComponent, RouterLink],
	templateUrl: './resource-full-history.component.html',
	styleUrl: './resource-full-history.component.scss',
})
export class ResourceFullHistoryComponent {
	columns: ColumnConfig[] = [];
	initialTableColumnsOrder: string[] = [];
	patientIdentifierSearchPrefix: string = '';
	resourceType: string = '';
	searchParams: { [key: string]: string[] } = {};
	resourceId: string = '';

	constructor(
		private route: ActivatedRoute,
		private pdmsService: PdmsService,
		private router: Router,
	) {}

	ngOnInit() {
		this.columns = [
			new ColumnConfig('Request', (entry: BundleEntry) => entry.request?.method || ''),
			new ColumnConfig('Response', (entry: BundleEntry) => entry.response?.status || ''),
			new ColumnConfig('Version', (entry: BundleEntry) => entry.resource?.meta?.versionId || ''),
		].concat(
			this.route.snapshot.data['columns'].map((column: ColumnConfig) => new ColumnConfig(column.header, column.cell)),
		);

		this.initialTableColumnsOrder = this.columns.map((column) => column.columnDef);

		this.route.parent!.url.subscribe((url) => {
			this.resourceType = url[0].path;
		});

		this.route.url.subscribe((url) => {
			this.resourceId = url[0].path;
		});
	}

	getAllResources: ServiceMethod = (
		resourceType: string,
		pageToken: string,
		pageSize: number,
		searchParams: { [key: string]: string[] } = {},
		resourceId?: string,
	) => this.pdmsService.getHistoryById(resourceType, resourceId ? resourceId : '', pageToken, pageSize, searchParams);

	goToDetail = (entry: BundleEntry) =>
		this.router.navigate([entry.resource?.meta?.versionId], { relativeTo: this.route });
}
