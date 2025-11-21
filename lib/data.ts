import { Advance, Collection, Expense, Return, TransportPayment, User, ExpenseCategory, TransportCompany } from '../types';
import { db } from './firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  where,
  writeBatch,
  orderBy
} from 'firebase/firestore';
import { toast } from 'sonner';

// Collection References
const COLLECTION_NAMES = {
  USERS: 'users',
  ADVANCES: 'advances',
  EXPENSES: 'expenses',
  RETURNS: 'returns',
  TRANSPORT: 'transport_payments',
  COLLECTIONS: 'collections'
};

// --- Generic Helper ---
// Helper to map Firestore docs to our types
const mapDoc = <T>(doc: any): T => {
  return { id: doc.id, ...doc.data() } as T;
};

// --- User Operations ---
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAMES.USERS));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => mapDoc<User>(doc));
  } catch (e) {
    console.error("Error fetching users", e);
    return [];
  }
};

// --- Advance Operations ---
export const getAdvances = async (): Promise<Advance[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAMES.ADVANCES));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => mapDoc<Advance>(doc));
  } catch (e) {
    console.error("Error fetching advances", e);
    return [];
  }
};

export const createAdvance = async (data: {
  staffId: string;
  staffName: string;
  amount: number;
  purpose: string;
  issuedBy: string;
}): Promise<Advance | null> => {
  try {
    const newAdvance: Omit<Advance, 'id'> = {
      staffId: data.staffId,
      staffName: data.staffName,
      amount: data.amount,
      purpose: data.purpose,
      date: new Date().toISOString(),
      status: 'active',
      issuedBy: data.issuedBy,
      totalExpenses: 0,
      totalReturned: 0,
      balanceToSettle: data.amount,
    };
    const docRef = await addDoc(collection(db, COLLECTION_NAMES.ADVANCES), newAdvance);
    return { id: docRef.id, ...newAdvance };
  } catch (e) {
    console.error("Error creating advance", e);
    throw e;
  }
};

export const updateAdvance = async (updatedAdvance: Advance) => {
  try {
    const docRef = doc(db, COLLECTION_NAMES.ADVANCES, updatedAdvance.id);
    const { id, ...data } = updatedAdvance; // Remove ID from data payload
    await updateDoc(docRef, data);
  } catch (e) {
    console.error("Error updating advance", e);
    throw e;
  }
};

// --- Expense Operations ---
export const getExpenses = async (): Promise<Expense[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAMES.EXPENSES));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => mapDoc<Expense>(doc));
  } catch (e) {
    console.error("Error fetching expenses", e);
    return [];
  }
};

export const createExpense = async (expense: Omit<Expense, 'id'>): Promise<Expense> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAMES.EXPENSES), expense);
    return { id: docRef.id, ...expense };
  } catch (e) {
    console.error("Error creating expense", e);
    throw e;
  }
};

export const updateExpense = async (updatedExpense: Expense) => {
  try {
    const docRef = doc(db, COLLECTION_NAMES.EXPENSES, updatedExpense.id);
    const { id, ...data } = updatedExpense;
    await updateDoc(docRef, data);
  } catch (e) {
    console.error("Error updating expense", e);
    throw e;
  }
};

export const approveExpense = async (expenseId: string, adminId: string) => {
  try {
    // 1. Fetch Expense
    const expenseRef = doc(db, COLLECTION_NAMES.EXPENSES, expenseId);
    const expensesSnap = await getDocs(query(collection(db, COLLECTION_NAMES.EXPENSES), where('__name__', '==', expenseId)));
    
    if (expensesSnap.empty) {
      toast.error('Expense not found.');
      return;
    }
    const expense = mapDoc<Expense>(expensesSnap.docs[0]);

    if (expense.status !== 'pending') {
      toast.error(`Expense already ${expense.status}.`);
      return;
    }

    // 2. Fetch Advance
    const advanceRef = doc(db, COLLECTION_NAMES.ADVANCES, expense.advanceId);
    const advanceSnap = await getDocs(query(collection(db, COLLECTION_NAMES.ADVANCES), where('__name__', '==', expense.advanceId)));
    
    if (advanceSnap.empty) {
      toast.error('Linked Advance not found');
      return;
    }
    const advance = mapDoc<Advance>(advanceSnap.docs[0]);

    // 3. Updates
    const updatedExpenseData = {
      status: 'approved',
      reviewedBy: adminId,
      reviewedAt: new Date().toISOString(),
      settlementStatus: 'settled'
    };

    const newTotalExpenses = (advance.totalExpenses || 0) + expense.totalAmount;
    const newBalance = advance.amount - newTotalExpenses - (advance.totalReturned || 0);
    
    const updatedAdvanceData: any = {
      totalExpenses: newTotalExpenses,
      balanceToSettle: newBalance
    };

    if (newBalance <= 0) {
      updatedAdvanceData.status = 'settled';
      updatedAdvanceData.settlementDate = new Date().toISOString();
      updatedAdvanceData.settledBy = adminId;
    }

    // Batch write for consistency
    const batch = writeBatch(db);
    batch.update(expenseRef, updatedExpenseData);
    batch.update(advanceRef, updatedAdvanceData);
    await batch.commit();

    toast.success('Expense approved successfully!');
  } catch (e) {
    console.error(e);
    toast.error("Failed to approve expense");
  }
};

export const rejectExpense = async (expenseId: string, adminId: string, rejectionNote: string) => {
  try {
    const expenseRef = doc(db, COLLECTION_NAMES.EXPENSES, expenseId);
    await updateDoc(expenseRef, {
      status: 'rejected',
      reviewedBy: adminId,
      reviewedAt: new Date().toISOString(),
      rejectionNote: rejectionNote
    });
    toast.warning('Expense rejected.');
  } catch (e) {
    console.error(e);
    toast.error("Failed to reject expense");
  }
};

// --- Return Operations ---
export const getReturns = async (): Promise<Return[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAMES.RETURNS));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => mapDoc<Return>(doc));
  } catch (e) {
    console.error(e);
    return [];
  }
};

export const createReturn = async (data: Omit<Return, 'id'>): Promise<Return> => {
  const docRef = await addDoc(collection(db, COLLECTION_NAMES.RETURNS), data);
  return { id: docRef.id, ...data };
};

export const approveReturn = async (returnId: string, adminId: string) => {
  try {
    const returnRef = doc(db, COLLECTION_NAMES.RETURNS, returnId);
    const retSnap = await getDocs(query(collection(db, COLLECTION_NAMES.RETURNS), where('__name__', '==', returnId)));
    if(retSnap.empty) return;
    const returnRequest = mapDoc<Return>(retSnap.docs[0]);

    const advanceRef = doc(db, COLLECTION_NAMES.ADVANCES, returnRequest.advanceId);
    const advSnap = await getDocs(query(collection(db, COLLECTION_NAMES.ADVANCES), where('__name__', '==', returnRequest.advanceId)));
    if(advSnap.empty) return;
    const advance = mapDoc<Advance>(advSnap.docs[0]);

    const newTotalReturned = (advance.totalReturned || 0) + returnRequest.amount;
    const newBalance = advance.amount - (advance.totalExpenses || 0) - newTotalReturned;

    const batch = writeBatch(db);
    batch.update(returnRef, {
        status: 'approved',
        approvedBy: adminId,
        approvedAt: new Date().toISOString()
    });
    
    const advUpdates: any = {
        totalReturned: newTotalReturned,
        balanceToSettle: newBalance
    };
    if (newBalance <= 0) {
        advUpdates.status = 'settled';
        advUpdates.settlementDate = new Date().toISOString();
        advUpdates.settledBy = adminId;
    }
    batch.update(advanceRef, advUpdates);

    await batch.commit();
    toast.success('Advance return approved!');
  } catch (e) {
    console.error(e);
    toast.error("Failed to approve return");
  }
};


// --- Transport Payment Operations ---
export const getTransportPayments = async (): Promise<TransportPayment[]> => {
  const snapshot = await getDocs(collection(db, COLLECTION_NAMES.TRANSPORT));
  return snapshot.docs.map(d => mapDoc<TransportPayment>(d));
};

export const createTransportPayment = async (data: Omit<TransportPayment, 'id' | 'enteredBy'>): Promise<TransportPayment> => {
  const payment = { ...data, enteredBy: data.staffId };
  const docRef = await addDoc(collection(db, COLLECTION_NAMES.TRANSPORT), payment);
  return { id: docRef.id, ...payment };
};

// --- Collection Operations ---
export const getCollections = async (): Promise<Collection[]> => {
  const snapshot = await getDocs(collection(db, COLLECTION_NAMES.COLLECTIONS));
  return snapshot.docs.map(d => mapDoc<Collection>(d));
};

export const createCollection = async (data: Omit<Collection, 'id' | 'enteredBy'>): Promise<Collection> => {
  const col = { ...data, enteredBy: data.staffId };
  const docRef = await addDoc(collection(db, COLLECTION_NAMES.COLLECTIONS), col);
  return { id: docRef.id, ...col };
};

// --- Batch Import for Migration ---
export const batchImportData = async (jsonData: any) => {
  let batch = writeBatch(db);
  let count = 0;
  let batchOpCount = 0;

  const commitBatch = async () => {
    if (batchOpCount > 0) {
      await batch.commit();
      batch = writeBatch(db);
      batchOpCount = 0;
    }
  };

  const processCollection = async (key: string, items: any[]) => {
    if (!items || !Array.isArray(items)) return;
    
    for (const item of items) {
       // Use existing ID if present as doc ID, else auto-gen
       const docRef = item.id ? doc(db, key, item.id) : doc(collection(db, key));
       batch.set(docRef, item);
       count++;
       batchOpCount++;

       // Firestore limit is 500 operations per batch. Commit safely at 450.
       if (batchOpCount >= 450) {
          await commitBatch();
       }
    }
  };

  // Map JSON keys to Firestore collection names and process sequentially
  await processCollection(COLLECTION_NAMES.USERS, jsonData.users || jsonData.USERS);
  await processCollection(COLLECTION_NAMES.ADVANCES, jsonData.advances || jsonData.ADVANCES);
  await processCollection(COLLECTION_NAMES.EXPENSES, jsonData.expenses || jsonData.EXPENSES);
  await processCollection(COLLECTION_NAMES.RETURNS, jsonData.returns || jsonData.RETURNS);
  await processCollection(COLLECTION_NAMES.TRANSPORT, jsonData.transport_payments || jsonData.TRANSPORT_PAYMENTS);
  await processCollection(COLLECTION_NAMES.COLLECTIONS, jsonData.collections || jsonData.COLLECTIONS);

  // Commit any remaining operations
  await commitBatch();
  return count;
};
