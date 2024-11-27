import { Observable } from 'rxjs';
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ENVIRONMENT } from '../environment-token';
import { UserProfile } from '../models/UserProfile';

@Injectable({
	providedIn: 'root',
})
export class UserService {
	private readonly baseUrl = undefined;

	constructor(private readonly httpService: HttpClient) {
		const environment = inject(ENVIRONMENT);
		this.baseUrl = environment.apiConfig.gpr.uri;
	}

	getUser(): Observable<UserProfile> {
		return this.httpService.get<UserProfile>(`${this.baseUrl}/me`);
	}
}
