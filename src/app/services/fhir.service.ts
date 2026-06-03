import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Bundle, DomainResource, Resource } from 'fhir/r4';
import { Observable } from 'rxjs';
import { ServerConfigService } from './server-config.service';

@Injectable({ providedIn: 'root' })
export class FhirService {
  private readonly serverConfig = inject(ServerConfigService);

  private get baseUrl(): string {
    return this.serverConfig.baseUrl();
  }

  private headers = new HttpHeaders({
    'Content-Type': 'application/fhir+json',
  });

  constructor(private http: HttpClient) {}

  getByReference(reference: string): Observable<Resource> {
    const url = `${this.baseUrl}/${reference}`;
    return this.http.get<Resource>(url, { headers: this.headers });
  }

  getById(resourceType: string, id: string): Observable<Resource> {
    const url = `${this.baseUrl}/${resourceType}/${id}`;
    return this.http.get<Resource>(url, { headers: this.headers });
  }

  getByIdWithVersion(resourceType: string, id: string, version: string): Observable<Resource> {
    const url = `${this.baseUrl}/${resourceType}/${id}/_history/${version}`;
    return this.http.get<Resource>(url, { headers: this.headers });
  }

  getEverythingById(resourceType: string, id: string, pageToken: string): Observable<Bundle<DomainResource>> {
    const url = `${this.baseUrl}/${resourceType}/${id}/$everything`;
    let params = new HttpParams();
    if (pageToken) {
      params = params.set('ct', pageToken);
    }

    return this.http.get<Bundle<DomainResource>>(url, { params, headers: this.headers });
  }

  getHistoryById(
    resourceType: string,
    id: string,
    pageUrl: string,
    pageSize: number = 10,
    searchParams: { [key: string]: string[] } = {},
  ): Observable<Bundle> {
    if (pageUrl) {
      const nextUrl = new URL(pageUrl);
      const proxyUrl = `${this.baseUrl}${nextUrl.pathname.replace(/^\/hapi-fhir-jpaserver\/fhir/, '')}${nextUrl.search}`;
      return this.http.get<Bundle>(proxyUrl, { headers: this.headers });
    }

    const url = `${this.baseUrl}/${resourceType}/${id}/_history`;
    let params = new HttpParams().set('_total', 'accurate').set('_count', pageSize);

    for (const [key, value] of Object.entries(searchParams)) {
      if (value.length > 0) {
        params = params.set(key, searchParams[key].join(','));
      }
    }

    return this.http.get<Bundle>(url, { params, headers: this.headers });
  }

  getAll(
    resourceType: string,
    pageUrl: string,
    pageSize: number = 10,
    searchParams: { [key: string]: string[] } = {},
  ): Observable<Bundle<DomainResource>> {
    if (pageUrl) {
      const nextUrl = new URL(pageUrl);
      const proxyUrl = `${this.baseUrl}${nextUrl.pathname.replace(/^\/hapi-fhir-jpaserver\/fhir/, '')}${nextUrl.search}`;
      return this.http.get<Bundle>(proxyUrl, { headers: this.headers });
    }

    const url = `${this.baseUrl}/${resourceType}`;
    let params = new HttpParams().set('_total', 'accurate').set('_count', pageSize);

    for (const [key, value] of Object.entries(searchParams)) {
      if (value.length > 0) {
        params = params.set(key, searchParams[key].join(','));
      }
    }

    return this.http.get<Bundle>(url, { params, headers: this.headers });
  }

  create(resourceType: string, resource: DomainResource): Observable<Resource> {
    const url = `${this.baseUrl}/${resourceType}`;
    return this.http.post<Resource>(url, resource, {
      headers: this.headers,
    });
  }

  update(resourceType: string, id: string, resource: DomainResource): Observable<Resource> {
    const url = `${this.baseUrl}/${resourceType}/${id}`;
    return this.http.put<Resource>(url, resource, {
      headers: this.headers,
    });
  }

  delete(resourceType: string, id: string): Observable<void> {
    const url = `${this.baseUrl}/${resourceType}/${id}`;
    return this.http.delete<void>(url, { headers: this.headers });
  }
}
