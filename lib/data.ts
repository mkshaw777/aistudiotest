import { Advance, Collection, Expense, Return, TransportPayment, User, ExpenseCategory, TransportCompany } from '../types';
import { mockStore } from './mockDataStore';
import { toast } from 'sonner';

// --- User Operations ---
export const getAllUsers = async (): Promise<User[]> => {
  return await mockStore.getUsers();
};

// --- Advance Operations ---
export const getAdvances = async (): Promise<Advance[]> => {
  return await mockStore.getAdvances();
};

export const createAdvance = async (data: {
  staffId: string;
  staffName: string;
  amount: number;
  purpose: string;
  issuedBy: string;
}): Promise<Advance | null> => {
  try {
    const newAdvance: Advance = {
      id: `adv-${Date.now()}`,
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
    return await mockStore.createAdvance(newAdvance);
  } catch (e) {
    console.error("Error creating advance", e);
    throw e;
  }
};

export const updateAdvance = async (updatedAdvance: Advance) => {
  try {
    await mockStore.updateAdvance(updatedAdvance);
  } catch (e) {
    console.error("Error updating advance", e);
    throw e;
  }
};

// --- Expense Operations ---
export const getExpenses = async (): Promise<Expense[]> => {
  return await mockStore.getExpenses();
};

export const createExpense = async (expense: Omit<Expense, 'id'>): Promise<Expense> => {
  try {
    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      ...expense
    };
    return await mockStore.createExpense(newExpense);
  } catch (e) {
    console.error("Error creating expense", e);
    throw e;
  }
};

export const updateExpense = async (updatedExpense: Expense) => {
  try {
    await mockStore.updateExpense(updatedExpense);
  } catch (e) {
    console.error("Error updating expense", e);
    throw e;
  }
};

export const approveExpense = async (expenseId: string, adminId: string) => {
  try {
    // 1. Fetch Expense
    const expenses = await mockStore.getExpenses();
    const expense = expenses.find(e => e.id === expenseId);

    if (!expense) {
      toast.error('Expense not found.');
      return;
    }

    if (expense.status !== 'pending') {
      toast.error(`Expense already ${expense.status}.`);
      return;
    }

    // 2. Fetch Advance
    const advances = await mockStore.getAdvances();
    const advance = advances.find(a => a.id === expense.advanceId);

    if (!advance) {
      toast.error('Linked Advance not found');
      return;
    }

    // 3. Updates
    expense.status = 'approved';
    expense.reviewedBy = adminId;
    expense.reviewedAt = new Date().toISOString();
    expense.settlementStatus = 'settled';

    const newTotalExpenses = (advance.totalExpenses || 0) + expense.totalAmount;
    const newBalance = advance.amount - newTotalExpenses - (advance.totalReturned || 0);

    advance.totalExpenses = newTotalExpenses;
    advance.balanceToSettle = newBalance;

    if (newBalance <= 0) {
      advance.status = 'settled';
      advance.settlementDate = new Date().toISOString();
      advance.settledBy = adminId;
    }

    // Commit updates
    await mockStore.updateExpense(expense);
    await mockStore.updateAdvance(advance);

    toast.success('Expense approved successfully!');
  } catch (e) {
    console.error(e);
    toast.error("Failed to approve expense");
  }
};

export const rejectExpense = async (expenseId: string, adminId: string, rejectionNote: string) => {
  try {
    const expenses = await mockStore.getExpenses();
    const expense = expenses.find(e => e.id === expenseId);
    if (expense) {
      expense.status = 'rejected';
      expense.reviewedBy = adminId;
      expense.reviewedAt = new Date().toISOString();
      expense.rejectionNote = rejectionNote;
      await mockStore.updateExpense(expense);
      toast.warning('Expense rejected.');
    }
  } catch (e) {
    console.error(e);
    toast.error("Failed to reject expense");
  }
};

// --- Return Operations ---
export const getReturns = async (): Promise<Return[]> => {
  return await mockStore.getReturns();
};

export const createReturn = async (data: Omit<Return, 'id'>): Promise<Return> => {
  const newReturn: Return = {
    id: `ret-${Date.now()}`,
    ...data
  };
  return await mockStore.createReturn(newReturn);
};

export const approveReturn = async (returnId: string, adminId: string) => {
  try {
    const returns = await mockStore.getReturns();
    const returnRequest = returns.find(r => r.id === returnId);
    if (!returnRequest) return;

    const advances = await mockStore.getAdvances();
    const advance = advances.find(a => a.id === returnRequest.advanceId);
    if (!advance) return;

    const newTotalReturned = (advance.totalReturned || 0) + returnRequest.amount;
    const newBalance = advance.amount - (advance.totalExpenses || 0) - newTotalReturned;

    returnRequest.status = 'approved';
    returnRequest.approvedBy = adminId;
    returnRequest.approvedAt = new Date().toISOString();

    advance.totalReturned = newTotalReturned;
    advance.balanceToSettle = newBalance;

    if (newBalance <= 0) {
      advance.status = 'settled';
      advance.settlementDate = new Date().toISOString();
      advance.settledBy = adminId;
    }

    await mockStore.updateReturn(returnRequest);
    await mockStore.updateAdvance(advance);

    toast.success('Advance return approved!');
  } catch (e) {
    console.error(e);
    toast.error("Failed to approve return");
  }
};


// --- Transport Payment Operations ---
export const getTransportPayments = async (): Promise<TransportPayment[]> => {
  return await mockStore.getTransportPayments();
};

export const createTransportPayment = async (data: Omit<TransportPayment, 'id' | 'enteredBy'>): Promise<TransportPayment> => {
  const payment: TransportPayment = {
    id: `tp-${Date.now()}`,
    ...data,
    enteredBy: data.staffId
  };
  return await mockStore.createTransportPayment(payment);
};

// --- Collection Operations ---
export const getCollections = async (): Promise<Collection[]> => {
  return await mockStore.getCollections();
};

export const createCollection = async (data: Omit<Collection, 'id' | 'enteredBy'>): Promise<Collection> => {
  const col: Collection = {
    id: `col-${Date.now()}`,
    ...data,
    enteredBy: data.staffId
  };
  return await mockStore.createCollection(col);
};

// --- Batch Import for Migration (Mock) ---
export const batchImportData = async (jsonData: any) => {
  console.log("Batch import not fully supported in mock mode, but logging data:", jsonData);
  return 0;
};

