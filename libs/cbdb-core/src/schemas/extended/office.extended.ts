/**
 * Extended schema types for Office domain
 * Types for POSTED_TO_OFFICE_DATA with relations
 */

import type { InferSelectModel } from 'drizzle-orm';
import type { POSTED_TO_OFFICE_DATA, OFFICE_CODES, POSTED_TO_ADDR_DATA, ADDRESSES, APPOINTMENT_CODES } from '../schema';

type PostedToOfficeRecord = InferSelectModel<typeof POSTED_TO_OFFICE_DATA>;
type OfficeCodeRecord = InferSelectModel<typeof OFFICE_CODES>;
type PostedToAddrRecord = InferSelectModel<typeof POSTED_TO_ADDR_DATA>;
type AddressRecord = InferSelectModel<typeof ADDRESSES>;
type AppointmentCodeRecord = InferSelectModel<typeof APPOINTMENT_CODES>;

export interface OfficeDataWithRelations extends PostedToOfficeRecord {
  officeInfo?: OfficeCodeRecord;
  postingAddr?: PostedToAddrRecord & {
    address?: AddressRecord;
  };
  appointmentType?: AppointmentCodeRecord;
  office?: OfficeCodeRecord;
  postedToAddresses?: Array<PostedToAddrRecord & {
    address?: AddressRecord;
  }>;
}