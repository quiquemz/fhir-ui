import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FhirJsonViewerComponent } from './fhir-json-viewer.component';

describe('FhirJsonViewerComponent', () => {
  let component: FhirJsonViewerComponent;
  let fixture: ComponentFixture<FhirJsonViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FhirJsonViewerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FhirJsonViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
