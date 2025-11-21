import { ExpenseCategory, TransportCompany } from '../types';

export const EXPENSE_CATEGORIES = [
  ExpenseCategory.Transport,
  ExpenseCategory.Bazar,
  ExpenseCategory.Sealdah,
  ExpenseCategory.OutStation,
  ExpenseCategory.Paglahat,
  ExpenseCategory.Others,
];

export const TRANSPORT_COMPANIES: { name: TransportCompany; color: string }[] = [
  { name: TransportCompany.Truck, color: 'mk-error' }, // Red
  { name: TransportCompany.Canter, color: 'mk-orange-accent' }, // Orange
  { name: TransportCompany.TataAce, color: 'mk-blue-primary' }, // Blue
  { name: TransportCompany.Bolero, color: 'mk-success' }, // Green
];

export const LOCAL_STORAGE_KEYS = {
  USERS: 'mk_marketing_users',
  CURRENT_USER: 'mk_marketing_current_user',
  ADVANCES: 'mk_marketing_advances',
  EXPENSES: 'mk_marketing_expenses',
  RETURNS: 'mk_marketing_returns',
  TRANSPORT_PAYMENTS: 'mk_marketing_transport_payments',
  COLLECTIONS: 'mk_marketing_collections',
};

export const MAX_REPORT_DAYS = 15;
export const IMAGE_MAX_SIZE_MB = 5;
export const IMAGE_MAX_DIMENSION = 800;
export const IMAGE_COMPRESSION_QUALITY = 0.8;
