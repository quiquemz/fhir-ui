import { BundleEntry, Resource } from 'fhir/r4';
import { ColumnConfig } from './ColumnConfig';

export class ResourceConfig {
	resourceType: string;
	columns: ColumnConfig[] = [];
	patientIdentifierSearchPrefix?: string | undefined;
	icon?: string;

	constructor(resourceType: string) {
		this.resourceType = resourceType;
	}

	addColumn(
		header: string,
		cell: (resource: any) => any,
		filterName: string = '',
		filters: string[] = [],
		sortBy: string = '',
	): ResourceConfig {
		this.columns.push(new ColumnConfig(header, cell).withFilter(filterName, filters).withSortBy(sortBy));
		return this;
	}

	addLastUpdatedColumn(): ResourceConfig {
		this.addColumn(
			'Last Updated',
			({ resource }: BundleEntry) => resource?.meta?.lastUpdated?.substring(0, 19),
			undefined,
			undefined,
			'_lastUpdated',
		);
		return this;
	}

	withIcon(icon: string): ResourceConfig {
		this.icon = icon;
		return this;
	}

	withPatientIdentifierSearchPrefix(prefix: string): ResourceConfig {
		this.patientIdentifierSearchPrefix = prefix;
		return this;
	}
}
