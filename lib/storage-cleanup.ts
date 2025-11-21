import { LOCAL_STORAGE_KEYS } from './constants';
import { Expense, Advance, Collection, Return, TransportPayment } from '../types';
import { toast } from 'sonner';

const MAX_EXPENSES = 500;
const MAX_ADVANCES = 200;
const MAX_COLLECTIONS = 500;
const MAX_RETURNS = 200;
const MAX_TRANSPORT_PAYMENTS = 500;

export function cleanupLocalStorage() {
  toast.info('Running storage cleanup...');
  let cleanedCount = 0;

  cleanedCount += cleanupEntity<Expense>(LOCAL_STORAGE_KEYS.EXPENSES, MAX_EXPENSES, (e) => e.status === 'pending');
  cleanedCount += cleanupEntity<Advance>(LOCAL_STORAGE_KEYS.ADVANCES, MAX_ADVANCES, (a) => a.status === 'active');
  cleanedCount += cleanupEntity<Collection>(LOCAL_STORAGE_KEYS.COLLECTIONS, MAX_COLLECTIONS);
  cleanedCount += cleanupEntity<Return>(LOCAL_STORAGE_KEYS.RETURNS, MAX_RETURNS, (r) => r.status === 'pending');
  cleanedCount += cleanupEntity<TransportPayment>(LOCAL_STORAGE_KEYS.TRANSPORT_PAYMENTS, MAX_TRANSPORT_PAYMENTS);

  if (cleanedCount > 0) {
    toast.success(`Storage cleanup complete. Removed ${cleanedCount} old records.`);
  } else {
    toast.info('No old records found for cleanup.');
  }
}

function cleanupEntity<T extends { date: string; id: string }>(
  key: string,
  maxRecords: number,
  preserveCondition?: (item: T) => boolean,
): number {
  const data: T[] = JSON.parse(localStorage.getItem(key) || '[]');
  if (data.length <= maxRecords) {
    return 0; // No cleanup needed
  }

  // Separate records to preserve (e.g., active/pending)
  const toPreserve = preserveCondition ? data.filter(preserveCondition) : [];
  const others = preserveCondition ? data.filter(item => !preserveCondition(item)) : data;

  // Sort 'others' by date, newest first
  others.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Keep only the most recent 'maxRecords - toPreserve.length' from 'others'
  const newOthers = others.slice(0, Math.max(0, maxRecords - toPreserve.length));

  const newData = [...toPreserve, ...newOthers];
  localStorage.setItem(key, JSON.stringify(newData));

  const removedCount = data.length - newData.length;
  if (removedCount > 0) {
    console.log(`Cleaned up ${removedCount} records from ${key}.`);
  }
  return removedCount;
}
