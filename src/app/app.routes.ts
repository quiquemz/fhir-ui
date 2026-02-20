import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { resources as resourcesConfig } from '../config/resource-config';
import { FhirResourceEditComponent } from './components/fhir-resource-edit/fhir-resource-edit.component';
import { AllResourcesComponent } from './pages/all-resources/all-resources.component';
import { ResourceFullHistoryComponent } from './pages/resource-full-history/resource-full-history.component';
import { ResourceDetailComponent } from './pages/resource-detail/resource-detail.component';
import { ResourceVersionDetailComponent } from './pages/resource-version-detail/resource-version-detail.component';
import { ApiComponent } from './api/api.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'openapi', component: ApiComponent },
  { path: 'home', component: HomeComponent },
  ...resourcesConfig.map(({ resourceType, columns, patientIdentifierSearchPrefix }) => ({
    path: resourceType,
    children: [
      {
        path: '',
        component: AllResourcesComponent,
        data: { columns, patientIdentifierSearchPrefix },
      },
      { path: ':id', component: ResourceDetailComponent },
      { path: ':id/edit', component: FhirResourceEditComponent },
      {
        path: ':id/_history',
        component: ResourceFullHistoryComponent,
        data: { columns },
      },
      { path: ':id/_history/:version', component: ResourceVersionDetailComponent },
    ],
  })),
];
