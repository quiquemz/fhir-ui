import { Component } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { resources } from '../../../config/resource-configs';

@Component({
  selector: 'app-side-menu',
  standalone: true,
  imports: [MatListModule, MatIconModule, RouterLink, RouterLinkActive],
  templateUrl: './side-menu.component.html',
  styleUrl: './side-menu.component.scss',
})
export class SideMenuComponent {
  resources = resources;
}
