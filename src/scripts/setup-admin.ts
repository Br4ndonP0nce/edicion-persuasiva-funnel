import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { initializeDefaultAdmin } from '@/lib/firebase/rbac';

// This should be run manually when setting up the system
const setupFirstAdmin = async () => {
    const email = 'decodenextconsultancy@gmail.com'; // Replace with your email
    const password = 'P0nc3@Admin'; // Replace with temporary password
  
  try {
    const auth = getAuth();
    
    // Sign in with the admin account (create this first in Firebase Console)
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Initialize as super admin
    await initializeDefaultAdmin(userCredential.user);
    
    console.log('✅ Admin user initialized successfully!');
    console.log('User:', userCredential.user.email);
    console.log('Role: super_admin');
    
  } catch (error) {
    console.error('❌ Error setting up admin:', error);
  }
};

// To use this script:
// 1. Create the user in Firebase Console first
// 2. Update the email/password above
// 3. Uncomment the line below and run this file
// setupFirstAdmin();