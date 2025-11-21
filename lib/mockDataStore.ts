import { User, Advance, Expense, Return, TransportPayment, Collection, ExpenseCategory, TransportCompany } from '../types';

// Initial Mock Data
const initialUsers: User[] = [
    {
        id: 'admin-1',
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin',
        createdAt: new Date().toISOString(),
        createdBy: 'system',
    },
    {
        id: 'staff-1',
        name: 'Staff User',
        email: 'staff@example.com',
        password: 'password123',
        role: 'staff',
        createdAt: new Date().toISOString(),
        createdBy: 'admin-1',
    },
];

const initialAdvances: Advance[] = [
    {
        id: 'adv-1',
        staffId: 'staff-1',
        staffName: 'Staff User',
        amount: 5000,
        purpose: 'Weekly Expenses',
        date: new Date().toISOString(),
        status: 'active',
        issuedBy: 'admin-1',
        totalExpenses: 0,
        totalReturned: 0,
        balanceToSettle: 5000,
    },
];

// In-memory store
class MockDataStore {
    users: User[] = [...initialUsers];
    advances: Advance[] = [...initialAdvances];
    expenses: Expense[] = [];
    returns: Return[] = [];
    transportPayments: TransportPayment[] = [];
    collections: Collection[] = [];

    // Helper to simulate async delay
    async delay(ms: number = 500) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // --- Users ---
    async getUsers() {
        await this.delay();
        return this.users;
    }

    async getUserById(id: string) {
        await this.delay();
        return this.users.find(u => u.id === id) || null;
    }

    async getUserByEmail(email: string) {
        await this.delay();
        return this.users.find(u => u.email === email) || null;
    }

    async createUser(user: User) {
        await this.delay();
        this.users.push(user);
        return user;
    }

    // --- Advances ---
    async getAdvances() {
        await this.delay();
        return this.advances;
    }

    async createAdvance(advance: Advance) {
        await this.delay();
        this.advances.push(advance);
        return advance;
    }

    async updateAdvance(updatedAdvance: Advance) {
        await this.delay();
        const index = this.advances.findIndex(a => a.id === updatedAdvance.id);
        if (index !== -1) {
            this.advances[index] = updatedAdvance;
        }
    }

    // --- Expenses ---
    async getExpenses() {
        await this.delay();
        return this.expenses;
    }

    async createExpense(expense: Expense) {
        await this.delay();
        this.expenses.push(expense);
        return expense;
    }

    async updateExpense(updatedExpense: Expense) {
        await this.delay();
        const index = this.expenses.findIndex(e => e.id === updatedExpense.id);
        if (index !== -1) {
            this.expenses[index] = updatedExpense;
        }
    }

    // --- Returns ---
    async getReturns() {
        await this.delay();
        return this.returns;
    }

    async createReturn(ret: Return) {
        await this.delay();
        this.returns.push(ret);
        return ret;
    }

    async updateReturn(updatedReturn: Return) {
        await this.delay();
        const index = this.returns.findIndex(r => r.id === updatedReturn.id);
        if (index !== -1) {
            this.returns[index] = updatedReturn;
        }
    }

    // --- Transport Payments ---
    async getTransportPayments() {
        await this.delay();
        return this.transportPayments;
    }

    async createTransportPayment(payment: TransportPayment) {
        await this.delay();
        this.transportPayments.push(payment);
        return payment;
    }

    // --- Collections ---
    async getCollections() {
        await this.delay();
        return this.collections;
    }

    async createCollection(collection: Collection) {
        await this.delay();
        this.collections.push(collection);
        return collection;
    }
}

export const mockStore = new MockDataStore();
