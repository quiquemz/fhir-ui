import {
	BrowserCacheLocation,
	InteractionType,
	IPublicClientApplication,
	LogLevel,
	PublicClientApplication,
} from '@azure/msal-browser';
import { MsalGuardConfiguration, MsalInterceptorConfiguration } from '@azure/msal-angular';
import { inject } from '@angular/core';
import { ENVIRONMENT } from '../environment-token';

export function MSALInstanceFactory(): IPublicClientApplication {
	const environment = inject(ENVIRONMENT);

	return new PublicClientApplication({
		auth: {
			clientId: environment.auth.clientId,
			authority: `${environment.auth.domain}/${environment.auth.ADDTenantId}/${environment.auth.signinSignoutPolicy}`,
			knownAuthorities: [environment.auth.domain],
			redirectUri: '/',
			postLogoutRedirectUri: '/',
			navigateToLoginRequestUrl: false,
		},
		cache: {
			cacheLocation: BrowserCacheLocation.LocalStorage,
		},
		system: {
			allowNativeBroker: false, // Disables WAM Broker
			loggerOptions: {
				loggerCallback,
				logLevel: LogLevel.Info,
				piiLoggingEnabled: false,
			},
		},
	});
}

export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
	const environment = inject(ENVIRONMENT);
	const protectedResourceMap = new Map<string, Array<string>>();

	for (let api of Object.values(environment.apiConfig) as any) {
		protectedResourceMap.set(api.uri, api.scopes);
	}

	return {
		interactionType: InteractionType.Redirect,
		protectedResourceMap,
	};
}

export function MSALGuardConfigFactory(): MsalGuardConfiguration {
	return {
		interactionType: InteractionType.Redirect,
		loginFailedRoute: '/login-failed',
	};
}

export function loggerCallback(logLevel: LogLevel, message: string) {
	// console.log(message);
}
