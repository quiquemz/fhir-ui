import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, MatSortable } from '@angular/material/sort';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { BundleEntry } from 'fhir/r4';
import { catchError, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
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
    MatPaginatorModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatDividerModule,
    ScrollingModule,
  ],
  templateUrl: './fhir-entry-list.component.html',
  styleUrl: './fhir-entry-list.component.scss',
})
export class FhirEntryListComponent implements OnInit, OnDestroy {
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
  pageUrls: Map<number, string> = new Map();
  displayedColumns: string[] = [];
  searchValue: string = '';
  activeFilters: Map<string, Set<string>> = new Map();

  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;

  ngOnInit() {
    this.displayedColumns = [...this.initialTableColumnsOrder];

    this.searchSubscription = this.searchSubject.pipe(debounceTime(2000), distinctUntilChanged()).subscribe((value) => {
      this.searchByPatientIdentifier(value);
    });

    if (this.resourceType !== '') {
      this.loadResources();
    }
  }

  ngOnDestroy() {
    this.searchSubscription?.unsubscribe();
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchValue = value;
    this.searchSubject.next(value);
  }

  loadResources(): void {
    this.loading = true;

    const pageUrl = this.pageUrls.get(this.pageIndex);

    const request$ = pageUrl
      ? this.getAllResources(this.resourceType, pageUrl, this.pageSize, {}, this.resourceId)
      : this.getAllResources(this.resourceType, '', this.pageSize, this.searchParams, this.resourceId);

    request$
      .pipe(
        catchError(() => {
          this.loading = false;
          return [];
        }),
      )
      .subscribe((response) => {
        const { total, entry, link } = response;
        const nextUrl = link?.find((l: { relation: string }) => l.relation === 'next')?.url;

        if (nextUrl) {
          this.pageUrls.set(this.pageIndex + 1, nextUrl);
        }

        if (total !== undefined) {
          this.totalRecords = total;
        } else if (nextUrl) {
          this.totalRecords = (this.pageIndex + 1) * this.pageSize + 1;
        } else if (entry && entry.length) {
          this.totalRecords = this.pageIndex * this.pageSize + entry.length;
        } else {
          this.totalRecords = 0;
        }

        this.entries = entry ? entry : [];
        this.loading = false;
      });
  }

  updatePagination(changeData: PageEvent): void {
    if (changeData.pageSize !== this.pageSize) {
      this.pageSize = changeData.pageSize;
      this.resetPagination();
    } else {
      this.pageIndex = changeData.pageIndex;
    }

    this.loadResources();
  }

  toggleFilter(filterName: string, filterValue: string): void {
    if (!this.activeFilters.has(filterName)) {
      this.activeFilters.set(filterName, new Set());
    }
    const filterSet = this.activeFilters.get(filterName)!;
    if (filterSet.has(filterValue)) {
      filterSet.delete(filterValue);
    } else {
      filterSet.add(filterValue);
    }
    this.searchParams[filterName] = Array.from(filterSet);
    this.resetPagination();
    this.loadResources();
  }

  isFilterSelected(filterName: string, filterValue: string): boolean {
    return this.activeFilters.get(filterName)?.has(filterValue) ?? false;
  }

  hasActiveFilter(filterName: string): boolean {
    const filterSet = this.activeFilters.get(filterName);
    return !!filterSet && filterSet.size > 0;
  }

  toggleColumn(columnDef: string): void {
    const index = this.displayedColumns.indexOf(columnDef);
    if (index >= 0) {
      this.displayedColumns.splice(index, 1);
    } else {
      this.displayedColumns.push(columnDef);
    }
  }

  isColumnVisible(columnDef: string): boolean {
    return this.displayedColumns.includes(columnDef);
  }

  resetColumns(): void {
    this.displayedColumns = [...this.initialTableColumnsOrder];
  }

  searchByPatientIdentifier(identifier: string) {
    if (!this.patientIdentifierSearchPrefix) return;

    this.resetPagination();
    if (identifier === '') {
      delete this.searchParams[this.patientIdentifierSearchPrefix];
    } else {
      this.searchParams[this.patientIdentifierSearchPrefix] = [identifier];
    }
    this.loadResources();
  }

  sort(event: any) {
    const column = this.columns.find((column) => column.columnDef === event.active);
    if (column && event.direction) {
      this.sorting = { id: event.active, start: event.direction };
      this.searchParams['_sort'] = [event.direction === 'asc' ? column.sortBy : `-${column.sortBy}`];
    } else {
      this.sorting = { id: '', start: '' };
      delete this.searchParams['_sort'];
    }
    this.resetPagination();
    this.loadResources();
  }

  private resetPagination(): void {
    this.pageIndex = 0;
    this.pageUrls.clear();
  }

  internalGoToDetail(rowIndex: number): void {
    this.goToDetail(this.entries[rowIndex]);
  }
}
