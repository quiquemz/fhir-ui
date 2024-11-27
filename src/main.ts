import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { ENVIRONMENT } from './app/environment-token';
import { loadConfig } from './load-config';

loadConfig().then((loadedEnvironment) => {
	appConfig.providers.push({
		provide: ENVIRONMENT,
		useValue: loadedEnvironment,
	});

	bootstrapApplication(AppComponent, appConfig).catch((err) =>
		console.error(err),
	);
});
