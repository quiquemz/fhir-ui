import {
  AllergyIntolerance,
  BundleEntry,
  CarePlan,
  ClinicalImpression,
  Condition,
  Device,
  DeviceRequest,
  Encounter,
  EpisodeOfCare,
  Location,
  Observation,
  Organization,
  Patient,
  Practitioner,
  Procedure,
  Provenance,
  QuestionnaireResponse,
  ServiceRequest,
  Task,
} from 'fhir/r4';
import { ResourceConfig, ResourceCategory } from './resource-config.model';

export { ResourceConfig, ResourceCategory } from './resource-config.model';

export const resources = [
  new ResourceConfig('Patient')
    .addColumn(
      'First Name',
      ({ resource }: BundleEntry<Patient>) => resource?.name?.[0]?.given,
      undefined,
      undefined,
      'given',
    )
    .addColumn(
      'Last Name',
      ({ resource }: BundleEntry<Patient>) => resource?.name?.[0]?.family,
      undefined,
      undefined,
      'family',
    )
    .addColumn('Gender', ({ resource }: BundleEntry<Patient>) => resource?.gender, 'gender', [
      'male',
      'female',
      'unknown',
      'other',
    ])
    .addColumn('Birth Date', ({ resource }: BundleEntry<Patient>) => resource?.birthDate)
    .addColumn('External ID', ({ resource }: BundleEntry<Patient>) => resource?.identifier?.at(0)?.value)
    .addLastUpdatedColumn()
    .withPatientIdentifierSearchPrefix('identifier')
    .withIcon('person')
    .withCategory(ResourceCategory.Base),

  new ResourceConfig('Practitioner')
    .addColumn('ID', ({ resource }: BundleEntry<Practitioner>) => resource?.id)
    .addColumn(
      'First Name',
      ({ resource }: BundleEntry<Practitioner>) => resource?.name?.[0]?.given,
      undefined,
      undefined,
      'given',
    )
    .addColumn(
      'Last Name',
      ({ resource }: BundleEntry<Practitioner>) => resource?.name?.[0]?.family,
      undefined,
      undefined,
      'family',
    )
    .addColumn('Gender', ({ resource }: BundleEntry<Practitioner>) => resource?.gender, 'gender', [
      'male',
      'female',
      'unknown',
      'other',
    ])
    .addColumn('External ID', ({ resource }: BundleEntry<Practitioner>) => resource?.identifier?.at(0)?.value)
    .addLastUpdatedColumn()
    .withIcon('badge')
    .withCategory(ResourceCategory.Base),

  new ResourceConfig('Organization')
    .addColumn('Name', ({ resource }: BundleEntry<Organization>) => resource?.name)
    .addColumn('Type', ({ resource }: BundleEntry<Organization>) => resource?.type?.[0]?.coding?.[0]?.display)
    .addColumn(
      'Phone',
      ({ resource }: BundleEntry<Organization>) => resource?.telecom?.find((t) => t.system === 'phone')?.value,
    )
    .addColumn('Address', ({ resource }: BundleEntry<Organization>) => {
      const address = resource?.address?.[0];
      return address ? `${address.line?.join(' ')}, ${address.city}, ${address.state}, ${address.postalCode}` : '';
    })
    .addLastUpdatedColumn()
    .withIcon('apartment')
    .withCategory(ResourceCategory.Base),

  new ResourceConfig('Observation')
    .addColumn('ID', ({ resource }: BundleEntry<Observation>) => resource?.id)
    .addColumn('Code', ({ resource }: BundleEntry<Observation>) => {
      const coding = resource?.code?.coding?.at(0);
      return coding?.display ? `${coding.display} (${coding?.code})` : coding?.code;
    })
    .addColumn('Value', ({ resource }: BundleEntry<Observation>) => resource?.valueQuantity?.value)
    .addColumn('Unit', ({ resource }: BundleEntry<Observation>) => resource?.valueQuantity?.unit)
    .addColumn('Subject', ({ resource }: BundleEntry<Observation>) => resource?.subject?.reference)
    .addLastUpdatedColumn()
    .withPatientIdentifierSearchPrefix('subject:Patient.identifier')
    .withIcon('visibility')
    .withCategory(ResourceCategory.Clinical),

  new ResourceConfig('Device')
    .addColumn('ID', ({ resource }: BundleEntry<Device>) => resource?.id)
    .addColumn('Name', ({ resource }: BundleEntry<Device>) => resource?.deviceName?.at(0)?.name)
    .addColumn('External ID', ({ resource }: BundleEntry<Device>) => resource?.identifier?.at(0)?.value)
    .addColumn('External System', ({ resource }: BundleEntry<Device>) => resource?.identifier?.at(0)?.system)
    .addLastUpdatedColumn()
    .withIcon('devices')
    .withCategory(ResourceCategory.Base),

  new ResourceConfig('DeviceRequest')
    .addColumn('Reference', ({ resource }: BundleEntry<DeviceRequest>) => resource?.codeReference?.reference)
    .addColumn('Status', ({ resource }: BundleEntry<DeviceRequest>) => resource?.status)
    .addColumn('Intent', ({ resource }: BundleEntry<DeviceRequest>) => resource?.intent)
    .addLastUpdatedColumn()
    .withPatientIdentifierSearchPrefix('subject:Patient.identifier')
    .withIcon('devices')
    .withCategory(ResourceCategory.Clinical),

  new ResourceConfig('EpisodeOfCare')
    .addColumn('ID', ({ resource }: BundleEntry<EpisodeOfCare>) => resource?.id)
    .addColumn('Status', ({ resource }: BundleEntry<EpisodeOfCare>) => resource?.status)
    .addColumn('Start Date', ({ resource }: BundleEntry<EpisodeOfCare>) => resource?.period?.start?.substring(0, 19))
    .addColumn('End Date', ({ resource }: BundleEntry<EpisodeOfCare>) => resource?.period?.end?.substring(0, 19))
    .addLastUpdatedColumn()
    .withPatientIdentifierSearchPrefix('patient:Patient.identifier')
    .withIcon('calendar_today')
    .withCategory(ResourceCategory.Base),

  new ResourceConfig('Encounter')
    .addColumn('ID', ({ resource }: BundleEntry<Encounter>) => resource?.id)
    .addColumn('Status', ({ resource }: BundleEntry<Encounter>) => resource?.status, 'status', [
      'arrived',
      'in-progress',
      'finished',
    ])
    .addColumn('Type', ({ resource }: BundleEntry<Encounter>) => resource?.type?.at(0)?.coding?.at(0)?.display)
    .addColumn('Class', ({ resource }: BundleEntry<Encounter>) => resource?.class?.display)
    .addColumn('Priority', ({ resource }: BundleEntry<Encounter>) => resource?.priority?.coding?.at(0)?.display)
    .addColumn('Start Date', ({ resource }: BundleEntry<Encounter>) => resource?.period?.start?.substring(0, 19))
    .addColumn('End Date', ({ resource }: BundleEntry<Encounter>) => resource?.period?.end?.substring(0, 19))
    .addLastUpdatedColumn()
    .withPatientIdentifierSearchPrefix('subject:Patient.identifier')
    .withIcon('airline_seat_flat')
    .withCategory(ResourceCategory.Base),

  new ResourceConfig('Procedure')
    .addColumn('ID', ({ resource }: BundleEntry<Procedure>) => resource?.id)
    .addColumn('Status', ({ resource }: BundleEntry<Procedure>) => resource?.status, 'status', [
      'in-progress',
      'completed',
    ])
    .addColumn('Category', ({ resource }: BundleEntry<Procedure>) => resource?.category?.coding?.at(0)?.display)
    .addColumn('Start Date', ({ resource }: BundleEntry<Procedure>) =>
      resource?.performedPeriod?.start?.substring(0, 19),
    )
    .addColumn('End Date', ({ resource }: BundleEntry<Procedure>) => resource?.performedPeriod?.end?.substring(0, 19))
    .addLastUpdatedColumn()
    .withPatientIdentifierSearchPrefix('subject:Patient.identifier')
    .withIcon('medical_services')
    .withCategory(ResourceCategory.Clinical),

  new ResourceConfig('CarePlan')
    .addColumn('ID', ({ resource }: BundleEntry<CarePlan>) => resource?.id)
    .addColumn('Title', ({ resource }: BundleEntry<CarePlan>) => resource?.title)
    .addColumn(
      'Activity',
      ({ resource }: BundleEntry<CarePlan>) => resource?.activity?.at(0)?.detail?.code?.coding?.at(0)?.display,
    )
    .addColumn('Intent', ({ resource }: BundleEntry<CarePlan>) => resource?.intent)
    .addLastUpdatedColumn()
    .withPatientIdentifierSearchPrefix('subject:Patient.identifier')
    .withIcon('assignment')
    .withCategory(ResourceCategory.Clinical),

  new ResourceConfig('Task')
    .addColumn('ID', ({ resource }: BundleEntry<Task>) => resource?.id)
    .addColumn('Status', ({ resource }: BundleEntry<Task>) => resource?.status)
    .addLastUpdatedColumn()
    .withIcon('checklist')
    .withCategory(ResourceCategory.Base),

  new ResourceConfig('Location')
    .addColumn('ID', ({ resource }: BundleEntry<Location>) => resource?.id)
    .addColumn('Name', ({ resource }: BundleEntry<Location>) => resource?.name)
    .addLastUpdatedColumn()
    .withIcon('location_on')
    .withCategory(ResourceCategory.Base),

  new ResourceConfig('ClinicalImpression')
    .addColumn('ID', ({ resource }: BundleEntry<ClinicalImpression>) => resource?.id)
    .addColumn('Status', ({ resource }: BundleEntry<ClinicalImpression>) => resource?.status)
    .addColumn('Description', ({ resource }: BundleEntry<ClinicalImpression>) => resource?.description)
    .addLastUpdatedColumn()
    .withIcon('preview')
    .withCategory(ResourceCategory.Clinical),

  new ResourceConfig('AllergyIntolerance')
    .addColumn('ID', ({ resource }: BundleEntry<AllergyIntolerance>) => resource?.id)
    .addColumn('Type', ({ resource }: BundleEntry<AllergyIntolerance>) => resource?.type)
    .addColumn('Category', ({ resource }: BundleEntry<AllergyIntolerance>) => resource?.category)
    .addLastUpdatedColumn()
    .withIcon('healing')
    .withCategory(ResourceCategory.Clinical),

  new ResourceConfig('Condition')
    .addColumn('ID', ({ resource }: BundleEntry<Condition>) => resource?.id)
    .addColumn('Code', ({ resource }: BundleEntry<Condition>) => resource?.code?.coding?.at(0)?.display)
    .addColumn('Category', ({ resource }: BundleEntry<Condition>) => resource?.category?.at(0)?.coding?.at(0)?.display)
    .addColumn(
      'Clinical Status',
      ({ resource }: BundleEntry<Condition>) => resource?.clinicalStatus?.coding?.at(0)?.display,
    )
    .addColumn(
      'Verification Status',
      ({ resource }: BundleEntry<Condition>) => resource?.verificationStatus?.coding?.at(0)?.display,
    )
    .addLastUpdatedColumn()
    .withPatientIdentifierSearchPrefix('subject:Patient.identifier')
    .withIcon('health_and_safety')
    .withCategory(ResourceCategory.Clinical),

  new ResourceConfig('ServiceRequest')
    .addColumn('ID', ({ resource }: BundleEntry<ServiceRequest>) => resource?.id)
    .addColumn('Status', ({ resource }: BundleEntry<ServiceRequest>) => resource?.status)
    .addColumn('Intent', ({ resource }: BundleEntry<ServiceRequest>) => resource?.intent)
    .addColumn('Priority', ({ resource }: BundleEntry<ServiceRequest>) => resource?.priority)
    .withIcon('description')
    .addLastUpdatedColumn()
    .withCategory(ResourceCategory.Clinical),
];
