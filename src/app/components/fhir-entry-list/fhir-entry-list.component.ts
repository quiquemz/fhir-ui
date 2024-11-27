import { Component, Input } from '@angular/core';
import { CxTableLabelTypeEnum, CxTableUtilitiesModule } from '@quiquemz/cortex/table-utilities';
import { CxTableWithPaginationModule } from '@quiquemz/cortex/table-with-pagination';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, MatSortable } from '@angular/material/sort';
import { BundleEntry } from 'fhir/r4';
import { PageEvent } from '@angular/material/paginator';
import { catchError } from 'rxjs';
import { CxSearchBarModule } from '@quiquemz/cortex/search-bar';
import { ColumnConfig } from '../../../config/ColumnConfig';
import { ServiceMethod as GetListServiceMethod } from '../../models/ServiceMethodTypes';

@Component({
	selector: 'app-fhir-entry-list',
	standalone: true,
	imports: [
		MatIconModule,
		MatButtonModule,
		MatTableModule,
		MatSortModule,
		CxTableUtilitiesModule,
		CxTableWithPaginationModule,
		CxSearchBarModule,
	],
	templateUrl: './fhir-entry-list.component.html',
	styleUrl: './fhir-entry-list.component.scss',
})
export class FhirEntryListComponent {
	@Input({ required: true }) columns!: ColumnConfig[];
	@Input({ required: true }) initialTableColumnsOrder!: string[];
	@Input({ required: true }) patientIdentifierSearchPrefix!: string;
	@Input({ required: true }) resourceType!: string;
	@Input({ required: true }) searchParams!: { [key: string]: string[] };
	@Input({ required: true }) getAllResources!: GetListServiceMethod;
	@Input({ required: true }) goToDetail!: (entry: BundleEntry) => void;
	@Input() sorting: Omit<MatSortable, 'disableClear'> = { id: '', start: '' };
	@Input() resourceId?: string;

	loading: boolean = false;
	entries: BundleEntry[] = [];
	totalRecords: number = 0;
	pageSize: number = 10;
	pageIndex: number = 0;
	pageTokens: string[] = [''];
	tableLabelTypeEnum = CxTableLabelTypeEnum;

	ngOnInit() {
		if (this.resourceType !== '') {
			this.loadResources();
		}
	}

	loadResources(): void {
		this.loading = true;
		this.getAllResources(
			this.resourceType,
			this.pageTokens[this.pageIndex],
			this.pageSize,
			this.searchParams,
			this.resourceId,
		)
			.pipe(
				catchError(() => {
					this.loading = false;
					return [];
				}),
			)
			.subscribe((response) => {
				const { total, entry, link } = response;
				const nextUrl = link?.find((link: { relation: string }) => link.relation === 'next')?.url;

				if (nextUrl) {
					const url = new URL(nextUrl);
					const nextToken = url.searchParams.get('ct');

					if (nextToken) {
						this.pageTokens[this.pageIndex + 1] = nextToken;
					}
				}

				if (total) {
					this.totalRecords = total;
				} else if (nextUrl) {
					// we can assume there is at least one more record (required for pagination)
					this.totalRecords = (this.pageIndex + 1) * this.pageSize + 1;
				} else if (entry && entry.length) {
					// calculate total records based on current page
					this.totalRecords = this.pageIndex * this.pageSize + entry.length;
				} else {
					this.totalRecords = 0;
				}

				this.entries = entry ? entry : [];
				this.loading = false;
			});
	}

	updatePagination(changeData: PageEvent): void {
		const isNewPageSize = changeData.pageSize !== this.pageSize;

		if (isNewPageSize) {
			// Must set pageIndex to 0, as the API returns same page for smaller pageSize.
			this.pageIndex = 0;
			this.pageSize = changeData.pageSize;
			this.pageTokens = [''];
		} else {
			this.pageIndex = changeData.pageIndex;
		}

		this.loadResources();
	}

	updateFilters(selectedFilters: string[], rowIndex: number) {
		const filterName = this.columns[rowIndex].filterName;
		this.searchParams[filterName] = selectedFilters;
		this.loadResources();
	}

	searchByPatientIdentifier(identifier: string) {
		if (!this.patientIdentifierSearchPrefix) return;

		if (identifier === '') {
			delete this.searchParams[this.patientIdentifierSearchPrefix];
			this.loadResources();
			return;
		} else {
			this.searchParams[this.patientIdentifierSearchPrefix] = [identifier];
			this.loadResources();
		}
	}

	sort(event: any) {
		const column = this.columns.find((column) => column.columnDef === event.id);
		if (column) {
			this.sorting = event;
			this.searchParams['_sort'] = [event.start === 'asc' ? column.sortBy : `-${column.sortBy}`];
			this.loadResources();
		}
	}

	internalGoToDetail(event: { rowIndex: number }): void {
		this.goToDetail(this.entries[event.rowIndex]);
	}
}
