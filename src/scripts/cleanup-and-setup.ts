// src/scripts/cleanup-and-setup.ts
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, deleteUser, User } from 'firebase/auth';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { initializeDefaultAdmin } from '@/lib/firebase/rbac';

// Your Firebase config (use the same from your config.ts)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// STEP 1: Clean up everything
const cleanupEverything = async () => {
  console.log('🧹 Starting cleanup...');
  
  try {
    // Clean up Firestore app_users collection
    const usersCollection = collection(db, 'app_users');
    const userDocs = await getDocs(usersCollection);
    
    console.log(`Found ${userDocs.size} user profiles in Firestore`);
    
    for (const userDoc of userDocs.docs) {
      await deleteDoc(doc(db, 'app_users', userDoc.id));
      console.log(`Deleted profile: ${userDoc.data().email}`);
    }
    
    console.log('✅ Firestore cleanup complete');
    
    // Note: You'll need to manually delete Firebase Auth users from the Firebase Console
    // Go to Authentication > Users and delete all users
    console.log('⚠️  MANUAL STEP REQUIRED:');
    console.log('   Go to Firebase Console > Authentication > Users');
    console.log('   Delete ALL existing users manually');
    console.log('   Then come back and run setupFreshAdmin()');
    
  } catch (error) {
    console.error('❌ Cleanup error:', error);
  }
};

// STEP 2: Setup fresh admin (run this AFTER manually deleting auth users)
const setupFreshAdmin = async () => {
  const adminEmail = 'contacto@edicionpersuasiva.com'; // Your admin email
  const adminPassword = 'AdminPassword123!'; // Change this to your desired password
  
  console.log('🚀 Setting up fresh admin...');
  
  try {
    // You'll need to create this user in Firebase Console first
    console.log('⚠️  MANUAL STEP REQUIRED:');
    console.log('   1. Go to Firebase Console > Authentication > Users');
    console.log('   2. Click "Add User"');
    console.log(`   3. Email: ${adminEmail}`);
    console.log(`   4. Password: ${adminPassword}`);
    console.log('   5. Come back and run signInAndSetupAdmin()');
    
  } catch (error) {
    console.error('❌ Setup error:', error);
  }
};

// STEP 3: Sign in and setup admin profile (run AFTER creating user in console)
const signInAndSetupAdmin = async () => {
  const adminEmail = 'contacto@edicionpersuasiva.com';
  const adminPassword = 'AdminPassword123!';
  
  try {
    console.log('🔐 Signing in as admin...');
    
    // Sign in with the admin account
    const userCredential = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
    
    console.log('✅ Successfully signed in');
    
    // Initialize as super admin
    await initializeDefaultAdmin(userCredential.user);
    
    console.log('✅ Admin user initialized successfully!');
    console.log('User:', userCredential.user.email);
    console.log('UID:', userCredential.user.uid);
    console.log('Role: super_admin');
    console.log('');
    console.log('🎉 Setup complete! You can now:');
    console.log('   1. Delete the setup-admin folder');
    console.log('   2. Access /admin with your credentials');
    
  } catch (error: unknown) {
    console.error('❌ Sign in/setup error:', error);
    
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'auth/user-not-found') {
        console.log('⚠️  User not found. Please create the user in Firebase Console first.');
      } else if (error.code === 'auth/wrong-password') {
        console.log('⚠️  Wrong password. Check your password.');
      } else if (error.code === 'auth/invalid-email') {
        console.log('⚠️  Invalid email format.');
      }
    }
  }
};

// Alternative: One-step setup if you want to use the existing auth user
const setupExistingAuthUser = async () => {
  // If you want to keep one of the existing auth users
  const existingEmail = 'brandoncompany876@gmail.com'; // Use one from your auth list
  const existingPassword = 'YourCurrentPassword'; // You'll need to know this
  
  try {
    console.log('🔐 Setting up existing auth user...');
    
    const userCredential = await signInWithEmailAndPassword(auth, existingEmail, existingPassword);
    
    // Create admin profile for existing user
    await initializeDefaultAdmin(userCredential.user);
    
    console.log('✅ Existing user promoted to admin!');
    console.log('User:', userCredential.user.email);
    console.log('UID:', userCredential.user.uid);
    console.log('Role: super_admin');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

// Export functions for manual execution
export {
  cleanupEverything,
  setupFreshAdmin,
  signInAndSetupAdmin,
  setupExistingAuthUser
};

// Usage instructions:
console.log(`
🔧 FIREBASE CLEANUP & SETUP INSTRUCTIONS:

OPTION A - Fresh Start (Recommended):
1. Run cleanupEverything()
2. Manually delete ALL users from Firebase Console > Authentication
3. Run setupFreshAdmin() and follow instructions
4. Run signInAndSetupAdmin()

OPTION B - Use Existing Auth User:
1. Run cleanupEverything() 
2. Run setupExistingAuthUser() with correct credentials

Choose your option and run the appropriate function.
`);

// Uncomment ONE of these to run:
// cleanupEverything();
// setupFreshAdmin();
// signInAndSetupAdmin();
// setupExistingAuthUser();