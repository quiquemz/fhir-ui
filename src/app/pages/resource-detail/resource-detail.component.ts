import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DomainResource } from 'fhir/r4';
import { FhirService } from '../../services/fhir.service';
import { combineLatest } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FhirJsonViewerComponent } from '../../components/fhir-json-viewer/fhir-json-viewer.component';
import { FhirResourceGraphComponent } from '../../components/fhir-resource-graph/fhir-resource-graph.component';
import { MatTabsModule, MatTabChangeEvent } from '@angular/material/tabs';

@Component({
  selector: 'app-resource-detail',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    FhirJsonViewerComponent,
    RouterLink,
    FhirResourceGraphComponent,
    MatTabsModule,
  ],
  templateUrl: './resource-detail.component.html',
  styleUrl: './resource-detail.component.scss',
})
export class ResourceDetailComponent {
  resourceType: string = '';
  resourceId: string = '';
  resource: DomainResource | undefined = undefined;

  @ViewChild('graphComponent') graphComponent!: FhirResourceGraphComponent;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fhirService: FhirService,
  ) {}

  ngOnInit(): void {
    combineLatest([this.route.parent!.url, this.route.params]).subscribe(([url, params]) => {
      this.resourceType = url[0].path;
      this.resourceId = params['id'];
      this.loadPatient();
    });
  }

  loadPatient(): void {
    this.fhirService.getById(this.resourceType, this.resourceId).subscribe((resource) => {
      this.resource = resource;
    });
  }

  goToEditPage(): void {
    this.router.navigate(['edit'], { relativeTo: this.route });
  }

  deleteResource(): void {
    if (!confirm(`Are you sure you want to delete this ${this.resourceType}?`)) return;

    this.fhirService.delete(this.resourceType, this.resourceId).subscribe(() => {
      this.router.navigate(['..'], { relativeTo: this.route });
    });
  }

  onTabChange(event: MatTabChangeEvent): void {
    this.graphComponent.fit();
  }
}
