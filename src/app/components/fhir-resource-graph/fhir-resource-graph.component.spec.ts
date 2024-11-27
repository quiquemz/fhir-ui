import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { FhirResourceGraphComponent } from './fhir-resource-graph.component';
import { PdmsService } from '../../services/pdms.service';

describe('FhirResourceGraphComponent', () => {
	let component: FhirResourceGraphComponent;
	let fixture: ComponentFixture<FhirResourceGraphComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
    imports: [FhirResourceGraphComponent],
    providers: [PdmsService, provideHttpClient(withInterceptorsFromDi())]
}).compileComponents();

		fixture = TestBed.createComponent(FhirResourceGraphComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
