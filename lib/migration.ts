import { Advance, Expense, Collection, Return, TransportPayment, User, ExpenseCategory, TransportCompany } from '../types';
import { LOCAL_STORAGE_KEYS } from './constants';
import { toast } from 'sonner';

// Define a version for your localStorage schema
const CURRENT_SCHEMA_VERSION = 1;
const SCHEMA_VERSION_KEY = 'mk_marketing_schema_version';

interface OldExpense extends Omit<Expense, 'advanceId' | 'subCategory' | 'submittedToAdmin' | 'settlementStatus'> {
  // Potentially old fields
  categoryId?: string;
  notes?: string;
}

export function migrateLocalStorage() {
  const currentVersion = parseInt(localStorage.getItem(SCHEMA_VERSION_KEY) || '0', 10);

  if (currentVersion < CURRENT_SCHEMA_VERSION) {
    toast.info('Migrating data to the latest schema...');
    // Perform migrations step-by-step or as a single large migration

    // Migration from version 0 to 1
    // Adds advanceId, subCategory, submittedToAdmin, settlementStatus to expenses
    // Ensures all amounts are numbers, adds default remarks
    // Adds createdAt, createdBy to users
    // Adds date to collections, transport payments, returns if missing
    // Recalculates advance balances if necessary
    if (currentVersion < 1) {
      migrateToVersion1();
    }

    localStorage.setItem(SCHEMA_VERSION_KEY, CURRENT_SCHEMA_VERSION.toString());
    toast.success('Data migration complete!');
  }
}

function migrateToVersion1() {
  console.log('Migrating to schema version 1...');

  // 1. Migrate Users
  const users: User[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.USERS) || '[]');
  const migratedUsers = users.map(user => ({
    ...user,
    id: user.id || crypto.randomUUID(),
    createdAt: user.createdAt || new Date().toISOString(),
    createdBy: user.createdBy || 'system',
    email: user.email.toLowerCase(), // Ensure emails are lowercase
  }));
  localStorage.setItem(LOCAL_STORAGE_KEYS.USERS, JSON.stringify(migratedUsers));

  // 2. Migrate Advances
  const advances: Advance[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.ADVANCES) || '[]');
  const migratedAdvances = advances.map(adv => ({
    ...adv,
    id: adv.id || crypto.randomUUID(),
    date: adv.date || new Date().toISOString(),
    status: adv.status || 'active',
    issuedBy: adv.issuedBy || 'unknown',
    totalExpenses: adv.totalExpenses !== undefined ? adv.totalExpenses : 0,
    totalReturned: adv.totalReturned !== undefined ? adv.totalReturned : 0,
    amount: adv.amount || 0,
    purpose: adv.purpose || 'General Advance',
    balanceToSettle: adv.balanceToSettle !== undefined ? adv.balanceToSettle : (adv.amount - (adv.totalExpenses || 0) - (adv.totalReturned || 0)),
  }));
  localStorage.setItem(LOCAL_STORAGE_KEYS.ADVANCES, JSON.stringify(migratedAdvances));

  // 3. Migrate Expenses
  const expenses: OldExpense[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.EXPENSES) || '[]');
  const migratedExpenses: Expense[] = expenses.map((exp: any) => {
    // Ensure category is a valid enum value
    let category: ExpenseCategory = ExpenseCategory.Others;
    if (Object.values(ExpenseCategory).includes(exp.category as ExpenseCategory)) {
        category = exp.category as ExpenseCategory;
    } else if (Object.values(ExpenseCategory).includes(exp.categoryId as ExpenseCategory)) {
        category = exp.categoryId as ExpenseCategory;
    }

    const newExpense: Expense = {
      id: exp.id || crypto.randomUUID(),
      staffId: exp.staffId,
      staffName: exp.staffName,
      advanceId: exp.advanceId || 'unknown-advance', // Default if missing, user might need to fix
      category: category, 
      subCategory: exp.subCategory || exp.details || exp.notes || 'N/A',
      fare: typeof exp.fare === 'number' ? exp.fare : parseFloat(exp.fare || '0') || 0,
      parking: typeof exp.parking === 'number' ? exp.parking : parseFloat(exp.parking || '0') || 0,
      oil: typeof exp.oil === 'number' ? exp.oil : parseFloat(exp.oil || '0') || 0,
      breakfast: typeof exp.breakfast === 'number' ? exp.breakfast : parseFloat(exp.breakfast || '0') || 0,
      others: typeof exp.others === 'number' ? exp.others : parseFloat(exp.others || '0') || 0,
      remarks: exp.remarks || (exp.others > 0 ? 'Miscellaneous expense' : ''),
      totalAmount: exp.totalAmount !== undefined ? exp.totalAmount : (exp.fare || 0) + (exp.parking || 0) + (exp.oil || 0) + (exp.breakfast || 0) + (exp.others || 0),
      billImage: exp.billImage || undefined,
      date: exp.date || new Date().toISOString(),
      status: exp.status || 'pending',
      reviewedBy: exp.reviewedBy || undefined,
      reviewedAt: exp.reviewedAt || undefined,
      rejectionNote: exp.rejectionNote || undefined,
      submittedToAdmin: exp.submittedToAdmin !== undefined ? exp.submittedToAdmin : true,
      settlementStatus: exp.settlementStatus || (exp.status === 'approved' ? 'settled' : 'pending'),
    };
    return newExpense;
  });
  localStorage.setItem(LOCAL_STORAGE_KEYS.EXPENSES, JSON.stringify(migratedExpenses));

  // 4. Migrate Returns
  const returns: Return[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.RETURNS) || '[]');
  const migratedReturns = returns.map(ret => ({
    ...ret,
    id: ret.id || crypto.randomUUID(),
    date: ret.date || new Date().toISOString(),
    status: ret.status || 'pending',
    amount: ret.amount || 0,
    note: ret.note || 'Advance return',
    advanceId: ret.advanceId || 'unknown-advance',
  }));
  localStorage.setItem(LOCAL_STORAGE_KEYS.RETURNS, JSON.stringify(migratedReturns));

  // 5. Migrate Transport Payments
  const transportPayments: TransportPayment[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.TRANSPORT_PAYMENTS) || '[]');
  const migratedTransportPayments = transportPayments.map(tp => ({
    ...tp,
    id: tp.id || crypto.randomUUID(),
    date: tp.date || new Date().toISOString(),
    amount: tp.amount || 0,
    company: tp.company && Object.values(TransportCompany).includes(tp.company) ? tp.company : TransportCompany.Truck, // Ensure valid company
    details: tp.details || 'Transport payment',
    enteredBy: tp.enteredBy || tp.staffId,
  }));
  localStorage.setItem(LOCAL_STORAGE_KEYS.TRANSPORT_PAYMENTS, JSON.stringify(migratedTransportPayments));

  // 6. Migrate Collections
  const collections: Collection[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.COLLECTIONS) || '[]');
  const migratedCollections = collections.map(col => ({
    ...col,
    id: col.id || crypto.randomUUID(),
    date: col.date || new Date().toISOString(),
    amount: col.amount || 0,
    source: col.source || 'Unknown',
    details: col.details || 'Collection entry',
    enteredBy: col.enteredBy || col.staffId,
  }));
  localStorage.setItem(LOCAL_STORAGE_KEYS.COLLECTIONS, JSON.stringify(migratedCollections));

  console.log('Migration to version 1 complete.');
}