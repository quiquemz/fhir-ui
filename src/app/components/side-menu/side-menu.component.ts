import { Component } from '@angular/core';
import { CxNavigationDrawerModule } from '@quiquemz/cortex/navigation-drawer';
import { resources } from '../../../config/resource-config';

@Component({
	selector: 'app-side-menu',
	standalone: true,
	imports: [CxNavigationDrawerModule],
	templateUrl: './side-menu.component.html',
	styleUrl: './side-menu.component.scss',
})
export class SideMenuComponent {
	resources = resources;
}
