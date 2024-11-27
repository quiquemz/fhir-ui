import { Observable } from 'rxjs';

export type ServiceMethod = (
	resourceType: string,
	pageToken: string,
	pageSize: number,
	searchParams: { [key: string]: string[] },
	resourceId?: string,
) => Observable<any>;
