import { Encounter, Organization, Patient } from 'fhir/r4';
import { faker } from '@faker-js/faker';
import '../../extensions/faker-extensions';

const encounterStatus: (
	| 'planned'
	| 'arrived'
	| 'in-progress'
	| 'onleave'
	| 'finished'
	| 'cancelled'
	| 'unknown'
	| 'triaged'
	| 'entered-in-error'
)[] = [
	'planned',
	'arrived',
	'in-progress',
	'onleave',
	'finished',
	'cancelled',
	'unknown',
	'triaged',
	'entered-in-error',
];

export class ResourceGenerator {
	static generate = (resourceType: string): any => {
		switch (resourceType) {
			case 'Patient':
				return ResourceGenerator.patient();
			case 'Organization':
				return ResourceGenerator.organization();
			case 'Encounter':
				return ResourceGenerator.encounter();
			default:
				return;
		}
	};

	static patient = (): Patient => ({
		resourceType: 'Patient',
		name: [
			{
				given: [faker.person.firstName(), faker.person.firstName()],
				family: faker.person.lastName(),
			},
		],
		gender: faker.fhir.gender(),
		birthDate: faker.date.birthdate().toISOString(),
		address: [
			{
				country: faker.location.country(),
				city: faker.location.city(),
				line: [faker.location.street()],
				postalCode: faker.location.zipCode(),
				state: faker.location.state(),
			},
		],
	});

	static organization = (): Organization => {
		return {
			resourceType: 'Organization',
			active: faker.datatype.boolean(),
			name: faker.company.name(),
			identifier: [
				{
					system: faker.internet.url(),
					value: faker.string.uuid(),
				},
			],
			address: [
				{
					country: faker.location.country(),
					line: [faker.location.street()],
					city: faker.location.city(),
					state: faker.location.state(),
					postalCode: faker.location.zipCode(),
				},
			],
		};
	};

	static encounter = (): Encounter => {
		return {
			resourceType: 'Encounter',
			status: faker.helpers.arrayElement(encounterStatus),
			class: {
				code: faker.helpers.arrayElement(['IMP', 'AMB', 'EMER']),
			},
		};
	};
}
