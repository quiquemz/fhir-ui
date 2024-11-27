import { Component, OnInit } from '@angular/core';
import { UserProfile } from '../../models/UserProfile';
import { AuthService } from '../../auth/auth.service';
import { CxHeaderModule } from '@quiquemz/cortex/header';
import { CxProfileDropdownComponent } from '@quiquemz/cortex/profile-dropdown';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { CxLogoModule } from '@quiquemz/cortex/logo';
import { UserService } from '../../auth/user-profile.service';
import { finalize } from 'rxjs';

@Component({
	selector: 'app-header',
	templateUrl: './header.component.html',
	styleUrls: ['./header.component.scss'],
	standalone: true,
	imports: [
		CxHeaderModule,
		CxLogoModule,
		CxProfileDropdownComponent,
		MatButton,
		MatButtonModule,
		MatIconModule,
		RouterLink,
	],
})
export class HeaderComponent implements OnInit {
	loading = false;
	userProfile: UserProfile | null = null;

	constructor(
		private authService: AuthService,
		private router: Router,
		private userServices: UserService,
	) {}

	ngOnInit(): void {
		this.loading = true;
		this.userServices
			.getUser()
			.pipe(finalize(() => (this.loading = false)))
			.subscribe((userProfile) => (this.userProfile = userProfile));
	}

	login(): void {
		this.authService.login();
	}

	logout() {
		this.authService.logout();
	}

	goHome(): void {
		this.router.navigate(['/home']);
	}
}
