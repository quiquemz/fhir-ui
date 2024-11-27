import { Faker } from '@faker-js/faker';

class FhirModule {
	gender(): 'male' | 'female' | 'other' | 'unknown' {
		const genders: ('male' | 'female' | 'other' | 'unknown')[] = [
			'male',
			'female',
			'other',
			'unknown',
		];
		return genders[Math.floor(Math.random() * genders.length)];
	}
}

declare module '@faker-js/faker' {
	export interface Faker {
		fhir: FhirModule;
	}
}

Faker.prototype.fhir = new FhirModule();
