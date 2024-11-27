import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CxHeaderModule } from '@quiquemz/cortex/header';
import { CxNavigationDrawerModule } from '@quiquemz/cortex/navigation-drawer';
import { SideMenuComponent } from './components/side-menu/side-menu.component';
import { HeaderComponent } from './components/header/header.component';
import { AuthService } from './auth/auth.service';

@Component({
	selector: 'app-root',
	standalone: true,
	imports: [
		CommonModule,
		RouterOutlet,
		RouterLink,
		RouterLinkActive,
		CxHeaderModule,
		CxNavigationDrawerModule,
		SideMenuComponent,
		HeaderComponent,
	],
	templateUrl: './app.component.html',
	styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
	title = 'fhir-ui';

	constructor(private readonly authService: AuthService) {}

	ngOnInit(): void {
		this.authService.configureAuth();
	}
}
