import { provideZoneChangeDetection } from "@angular/core";
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

const FHIR_ENVIRONMENT = {
  production: false,
  apiConfig: {
    fhir: {
      uri: '/api',
    },
  },
};

bootstrapApplication(AppComponent, {...appConfig, providers: [provideZoneChangeDetection(), ...appConfig.providers]}).catch((err) => console.error(err));
