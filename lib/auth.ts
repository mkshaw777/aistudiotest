import { User } from '../types';
import { mockStore } from './mockDataStore';
import { toast } from 'sonner';

// Map Firebase User to our App User (Mocked)
export const getUserProfile = async (uid: string): Promise<User | null> => {
  return await mockStore.getUserById(uid);
};

// Initialize default admin (No-op for mock)
export const initializeDefaultAdmin = async () => {
  // Mock store already has default admin
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const user = await mockStore.getUserByEmail(email);

    if (!user) {
      return { user: null, error: 'User not found.' };
    }

    if (user.password !== password) {
      return { user: null, error: 'Invalid password.' };
    }

    toast.success(`Welcome, ${user.name}!`);
    // Simulate session storage
    localStorage.setItem('mock_session_user', user.id);
    return { user: user, error: null };
  } catch (error: any) {
    console.error("Login error", error);
    return { user: null, error: error.message || 'Invalid email or password.' };
  }
};

export const logout = async () => {
  try {
    localStorage.removeItem('mock_session_user');
    toast.info('You have been logged out.');
  } catch (error) {
    console.error("Logout error", error);
  }
};

export const createUser = async (name: string, email: string, password: string, role: 'admin' | 'staff', createdBy: string) => {
  try {
    const existingUser = await mockStore.getUserByEmail(email);
    if (existingUser) {
      return { user: null, error: 'User already exists.' };
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email: email.toLowerCase(),
      password: password,
      role,
      createdAt: new Date().toISOString(),
      createdBy,
    };

    await mockStore.createUser(newUser);

    return { user: newUser, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

export const updateCurrentUserPassword = async (userId: string, newPassword: string) => {
  try {
    const user = await mockStore.getUserById(userId);
    if (user) {
      user.password = newPassword; // In-memory update
      toast.success('Password updated successfully!');
      return { success: true, error: null };
    }
    return { success: false, error: 'User not found' };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
};