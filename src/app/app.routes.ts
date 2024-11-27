import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { resources as resourcesConfig } from '../config/resource-config';
import { FhirResourceEditComponent } from './components/fhir-resource-edit/fhir-resource-edit.component';
import { MsalGuard } from '@azure/msal-angular';
import { AllResourcesComponent } from './pages/all-resources/all-resources.component';
import { ResourceFullHistoryComponent } from './pages/resource-full-history/resource-full-history.component';
import { ResourceDetailComponent } from './pages/resource-detail/resource-detail.component';
import { ResourceVersionDetailComponent } from './pages/resource-version-detail/resource-version-detail.component';
import { ApiComponent } from './api/api.component';
import { LoginFailedComponent } from './pages/login-failed/login-failed.component';
import { LogoutFailedComponent } from './pages/logout-failed/logout-failed.component';

export const routes: Routes = [
	{ path: '', redirectTo: 'home', pathMatch: 'full' },
	{ path: 'openapi', component: ApiComponent },
	{ path: 'home', component: HomeComponent },
	{ path: 'login-failed', component: LoginFailedComponent },
	{ path: 'logout-failed', component: LogoutFailedComponent },
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
		canActivate: [MsalGuard],
	})),
];
