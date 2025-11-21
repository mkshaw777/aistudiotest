export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'staff';
  createdAt: string;
  createdBy: string; // Admin ID who created, or 'system' for default
}

export interface Advance {
  id: string;
  staffId: string;
  staffName: string;
  amount: number;
  purpose: string;
  date: string; // ISO date when issued
  status: 'active' | 'settled';
  issuedBy: string; // Admin ID
  totalExpenses: number; // Sum of approved expenses
  totalReturned: number; // Sum of returns
  balanceToSettle: number; // Remaining balance
  settlementDate?: string; // When settled
  settledBy?: string; // Admin who settled
}

export interface Expense {
  id: string;
  staffId: string;
  staffName: string;
  advanceId: string; // Linked advance ID
  category: ExpenseCategory; // Main category
  subCategory: string; // Details/subcategory
  fare: number;
  parking: number;
  oil: number;
  breakfast: number;
  others: number;
  remarks: string; // Remarks (if others > 0)
  totalAmount: number;
  billImage?: string; // Base64 image
  date: string; // Submission date
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string; // Admin ID
  reviewedAt?: string; // Review date
  rejectionNote?: string; // If rejected
  submittedToAdmin: boolean; // Submission flag
  settlementStatus: 'pending' | 'settled'; // Settlement status (per expense within advance)
}

export interface Return {
  id: string;
  staffId: string;
  staffName: string;
  advanceId: string; // Linked advance ID
  amount: number; // Return amount
  note: string; // Reason for return
  date: string; // Return date
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string; // Admin ID
  approvedAt?: string; // Approval date
}

export interface TransportPayment {
  id: string;
  staffId: string;
  staffName: string;
  company: TransportCompany;
  amount: number;
  details: string; // Payment details
  date: string; // Payment date
  enteredBy: string; // Staff ID (redundant but kept for consistency)
}

export interface Collection {
  id: string;
  staffId: string;
  staffName: string;
  amount: number;
  source: string; // Customer/source name
  details: string; // Collection details
  date: string; // Collection date
  enteredBy: string; // Staff ID (redundant but kept for consistency)
}

export enum ExpenseCategory {
  Transport = 'Transport',
  Bazar = 'Bazar',
  Sealdah = 'Sealdah',
  OutStation = 'Out Station',
  Paglahat = 'Paglahat',
  Others = 'Others',
}

export enum TransportCompany {
  Truck = 'Truck',
  Canter = 'Canter',
  TataAce = 'Tata Ace',
  Bolero = 'Bolero',
}
