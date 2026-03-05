import { Component, OnInit } from '@angular/core';
import { FhirEntryListComponent } from '../../components/fhir-entry-list/fhir-entry-list.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ColumnConfig } from '../../../config/column-config.model';
import { MatSortable } from '@angular/material/sort';
import { FhirService } from '../../services/fhir.service';
import { ServiceMethod } from '../../models/ServiceMethodTypes';
import { BundleEntry } from 'fhir/r4';
@Component({
  selector: 'app-all-resources',
  standalone: true,
  imports: [FhirEntryListComponent],
  templateUrl: './all-resources.component.html',
  styleUrl: './all-resources.component.scss',
})
export class AllResourcesComponent implements OnInit {
  columns: ColumnConfig[] = [];
  initialTableColumnsOrder: string[] = [];
  sorting: Omit<MatSortable, 'disableClear'> = { id: '', start: 'desc' };
  patientIdentifierSearchPrefix: string = '';
  resourceType: string = '';
  searchParams: { [key: string]: string[] } = {};

  constructor(
    private fhirService: FhirService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.columns = this.route.snapshot.data['columns'];
    this.initialTableColumnsOrder = this.columns.map((column) => column.columnDef);
    const sortByCol =
      this.columns.find((column) => column.sortBy === '_lastUpdated') ||
      this.columns.find((column) => column.sortBy !== '');

    if (sortByCol) {
      this.sorting = { id: sortByCol.columnDef, start: 'desc' };
      this.searchParams['_sort'] = [`-${sortByCol.sortBy}`];
    }

    this.patientIdentifierSearchPrefix = this.route.snapshot.data['patientIdentifierSearchPrefix'];

    this.route.parent!.url.subscribe((url) => {
      this.resourceType = url[0].path;
    });
  }

  getAllResources: ServiceMethod = (
    resourceType: string,
    pageToken: string,
    pageSize: number,
    searchParams: { [key: string]: string[] } = {},
  ) => this.fhirService.getAll(resourceType, pageToken, pageSize, searchParams);

  goToDetail = (entry: BundleEntry) => this.router.navigate([entry.resource?.id], { relativeTo: this.route });
}
