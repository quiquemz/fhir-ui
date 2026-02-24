import { Component, computed, signal } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { resources, ResourceConfig, ResourceCategory } from '../../../config/resource-configs';

@Component({
  selector: 'app-side-menu',
  standalone: true,
  imports: [MatListModule, MatIconModule, MatExpansionModule, RouterLink, RouterLinkActive],
  templateUrl: './side-menu.component.html',
  styleUrl: './side-menu.component.scss',
})
export class SideMenuComponent {
  resources = resources;

  groupedResources = computed(() => {
    const groups = new Map<ResourceCategory, ResourceConfig[]>();
    this.resources.forEach((resource) => {
      const category = resource.category || ResourceCategory.Base;
      if (!groups.has(category)) {
        groups.set(category, []);
      }
      groups.get(category)!.push(resource);
    });
    return groups;
  });

  categories = computed(() => Array.from(this.groupedResources().keys()));
}
