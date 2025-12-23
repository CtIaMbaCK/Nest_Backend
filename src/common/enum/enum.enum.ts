export enum Role {
  VOLUNTEER = 'VOLUNTEER',
  BENEFICIARY = 'BENEFICIARY',
  ADMIN = 'ADMIN',
  ORGANIZATION = 'ORGANIZATION',
}

export enum UserStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  DENIED = 'DENIED',
  BANNED = 'BANNED',
}

export enum GuardianRelation {
  PARENT = 'PARENT',
  SPOUSE = 'SPOUSE',
  CHILD = 'CHILD',
  SIBLING = 'SIBLING',
  RELATIVE = 'RELATIVE',
  FRIEND = 'FRIEND',
  OTHER = 'OTHER',
}

export enum ActivityType {
  EDUCATION = 'EDUCATION',
  MEDICAL = 'MEDICAL',
  HOUSE_WORK = 'HOUSE_WORK',
  TRANSPORT = 'TRANSPORT',
  OTHER = 'OTHER',
}

export enum RecurrenceType {
  NONE = 'NONE',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  CUSTOM = 'CUSTOM',
}

export enum ActivityStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED',
}

export enum VulnerabilityType {
  POOR = 'POOR',
  DISABLED = 'DISABLED',
  ELDERLY = 'ELDERLY',
  SICKNESS = 'SICKNESS',
  OTHER = 'OTHER',
}
