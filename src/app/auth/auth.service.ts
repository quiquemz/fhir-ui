import { Inject, Injectable, OnDestroy } from '@angular/core';
import { MSAL_GUARD_CONFIG, MsalBroadcastService, MsalGuardConfiguration, MsalService } from '@azure/msal-angular';
import { EventMessage, InteractionStatus, RedirectRequest } from '@azure/msal-browser';
import { Subject, takeUntil, filter } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class AuthService implements OnDestroy {
	private _unsuscribe = new Subject<void>();

	constructor(
		@Inject(MSAL_GUARD_CONFIG)
		private msalGuardConfig: MsalGuardConfiguration,
		private msalService: MsalService,
		private msalBroadcastService: MsalBroadcastService,
	) {}

	ngOnDestroy(): void {
		this._unsuscribe.next(undefined);
		this._unsuscribe.complete();
	}

	configureAuth() {
		this.msalService.handleRedirectObservable().subscribe();
		this.listenToInteractionStatus();
	}

	login() {
		if (this.msalGuardConfig.authRequest) {
			this.msalService.loginRedirect({
				...this.msalGuardConfig.authRequest,
				state: window.location.pathname,
			} as RedirectRequest);
		} else {
			this.msalService.loginRedirect();
		}
	}

	logout() {
		// As of 2023-11-14:
		// UIP requires an ID Token to be passed as idTokenHint when logging out.
		// The ID Token is only present when acquiring a new token or logging in.
		// When opening a new tab, for instsance, idToken is not available and
		// therefore we must request a new token explicitly before logging out.

		const account = this.msalService.instance.getActiveAccount();
		const idTokenHint = account?.idToken;

		if (account && idTokenHint) {
			this.msalService.instance.logoutRedirect({ idTokenHint });
		} else if (account) {
			this.msalService.acquireTokenSilent({ account: account, scopes: [] }).subscribe({
				next: (response) => {
					this.msalService.instance.logoutRedirect({
						idTokenHint: response.idToken,
					});
				},
				error: (err) => {
					console.error(err);
				},
			});
		} else {
			console.error('No active account found');
		}
	}

	private setActiveAccount(): void {
		let activeAccount = this.msalService.instance.getActiveAccount();

		if (!activeAccount && this.msalService.instance.getAllAccounts().length > 0) {
			let accounts = this.msalService.instance.getAllAccounts();
			this.msalService.instance.setActiveAccount(accounts[0]);
		}
	}

	private listenToInteractionStatus() {
		this.msalBroadcastService.inProgress$
			.pipe(
				filter((status) => status === InteractionStatus.None),
				takeUntil(this._unsuscribe),
			)
			.subscribe((status) => {
				this.setActiveAccount();
			});
	}
}
