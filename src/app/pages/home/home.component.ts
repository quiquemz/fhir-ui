import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { resources } from '../../../config/resource-config';

@Component({
	selector: 'app-home',
	standalone: true,
	imports: [RouterLink],
	templateUrl: './home.component.html',
	styleUrl: './home.component.scss',
})
export class HomeComponent {
	resources = resources;
}
