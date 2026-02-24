import { Component, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { resources, ResourceConfig, ResourceCategory } from '../../../config/resource-configs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, MatCardModule, MatIconModule, MatButtonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
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
