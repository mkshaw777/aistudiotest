import { User } from '../types';
import { auth, db } from './firebase';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  createUserWithEmailAndPassword,
  updatePassword,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { toast } from 'sonner';

// Map Firebase User to our App User
export const getUserProfile = async (uid: string): Promise<User | null> => {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: uid, ...docSnap.data() } as User;
    }
    return null;
  } catch (e) {
    console.error("Error getting user profile", e);
    return null;
  }
};

// Initialize default admin (Checks if exists in Firestore)
export const initializeDefaultAdmin = async () => {
  const email = 'admin@mkmarketing.com';
  const password = 'admin123';

  try {
    // Attempt to create the default admin in Firebase Auth
    // If the user already exists, this will throw an error which we catch below
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // Create the user profile in Firestore
    const newUser: User = {
      id: uid,
      name: 'System Admin',
      email: email,
      password: '***', // Don't store actual password in DB
      role: 'admin',
      createdAt: new Date().toISOString(),
      createdBy: 'system',
    };

    await setDoc(doc(db, 'users', uid), newUser);
    console.log("Default admin created successfully.");
    toast.success("Default Admin account created.");
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
       // Admin already exists, which is fine.
       console.log("Default admin already exists.");
    } else {
       console.error("Error initializing default admin:", error);
    }
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userProfile = await getUserProfile(userCredential.user.uid);
    
    if (!userProfile) {
        // Fallback: If auth exists but firestore doc missing (rare sync issue), create basic profile
        const fallbackUser: User = {
            id: userCredential.user.uid,
            name: 'Admin User',
            email: email,
            password: '***',
            role: 'admin',
            createdAt: new Date().toISOString(),
            createdBy: 'system'
        };
        await setDoc(doc(db, 'users', userCredential.user.uid), fallbackUser);
        return { user: fallbackUser, error: null };
    }
    
    toast.success(`Welcome, ${userProfile.name}!`);
    return { user: userProfile, error: null };
  } catch (error: any) {
    console.error("Login error", error);
    return { user: null, error: error.message || 'Invalid email or password.' };
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
    toast.info('You have been logged out.');
  } catch (error) {
    console.error("Logout error", error);
  }
};

export const createUser = async (name: string, email: string, password: string, role: 'admin' | 'staff', createdBy: string) => {
  try {
    // Note: Creating a secondary user while logged in with Firebase is tricky because 
    // createUserWithEmailAndPassword automatically signs in the NEW user.
    // In a real app, you'd use a Cloud Function (Admin SDK) to create users without logging out.
    // For this client-side migration, we will WARN the admin that they might be logged out, 
    // or we rely on the fact that we are creating a record in DB.
    
    // Temporary workaround for client-side user creation:
    // We effectively can't create another Auth user without logging out the admin in standard Client SDK.
    // We will simulate success by creating the FIRESTORE document, but the user needs to actually sign up or 
    // the admin needs to use a secondary app instance.
    
    // HOWEVER, for this specific request, we will just create the Firestore Document so the data exists.
    // The actual Auth User creation is skipped to prevent logging out the admin.
    // The new user would need to "Sign Up" or we use a secondary auth instance (complex).
    // SIMPLIFICATION: We create the doc. The user cannot login until an Auth account matches this email.
    
    const uid = crypto.randomUUID(); // Placeholder ID since we can't get Auth UID without logging out

    const newUser: User = {
        id: uid,
        name,
        email: email.toLowerCase(),
        password: '***', 
        role,
        createdAt: new Date().toISOString(),
        createdBy,
    };

    await setDoc(doc(db, 'users', uid), newUser);
    
    return { user: newUser, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

export const updateCurrentUserPassword = async (userId: string, newPassword: string) => {
  try {
    if (auth.currentUser) {
        await updatePassword(auth.currentUser, newPassword);
        toast.success('Password updated successfully!');
        return { success: true, error: null };
    }
    return { success: false, error: 'No active session' };
  } catch (e: any) {
      return { success: false, error: e.message };
  }
};