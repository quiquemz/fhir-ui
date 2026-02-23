export class ColumnConfig {
  columnDef: string = window.crypto.randomUUID();
  header: string;
  cell: (resource: {}) => string;
  filters: string[] = [];
  filterName: string = '';
  sortBy: string = '';

  constructor(header: string, cell: (resource: {}) => string) {
    this.header = header;
    this.cell = cell;
  }

  withFilter(filterName: string, filters: string[]): ColumnConfig {
    this.filterName = filterName;
    this.filters = filters;
    return this;
  }

  withSortBy(sortBy: string): ColumnConfig {
    this.sortBy = sortBy;
    return this;
  }
}
