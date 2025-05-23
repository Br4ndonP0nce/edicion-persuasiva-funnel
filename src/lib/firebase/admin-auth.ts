// src/lib/firebase/admin-auth.ts - BETTER VERSION (No logout required)
import { 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    User as FirebaseUser
  } from 'firebase/auth';
  import { auth,db } from './config';
import { createUserProfile, Role } from './rbac';
import { initializeApp, getApps,deleteApp } from 'firebase/app';
  import { signOut,getAuth } from 'firebase/auth';
  /**
   * Create a new user while maintaining admin session
   * Uses a temporary auth instance to avoid affecting current session
   */
  export const createUserAsAdminNoLogout = async (
    email: string, 
    password: string, 
    role: Role,
    displayName: string
  ): Promise<{ success: boolean; newUserId?: string; error?: string }> => {
    
    let secondaryApp;
    let secondaryAuth;
    
    try {
     
      
      // Create a secondary Firebase app instance
      const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
      };
      
      // Create secondary app with unique name
      const appName = `secondary-${Date.now()}`;
      secondaryApp = initializeApp(firebaseConfig, appName);
      secondaryAuth = getAuth(secondaryApp);
      
     
      
      // Create user using secondary auth (won't affect main session)
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
      const newUser = userCredential.user;
      
     
      
      // Get current admin info for createdBy field
      const currentAdmin = auth.currentUser;
      const createdByUid = currentAdmin?.uid;
      
      
      // Create user profile with EXPLICIT data
      await createUserProfileFixed(newUser.uid, {
        email: email,
        displayName: displayName, // Explicitly pass displayName
        role: role, // Explicitly pass role
        isActive: true
      }, createdByUid);
      
      console.log('✅ User profile created');
      
      // Clean up secondary app
      await deleteApp(secondaryApp);
     
      
      
      
      return { 
        success: true, 
        newUserId: newUser.uid
      };
  
    } catch (error: any) {
      console.error('❌ Error in  user creation:', error);
      
      // Clean up secondary app on error
      if (secondaryApp) {
        try {
          await deleteApp(secondaryApp);
        } catch (cleanupError) {
          console.error('Error cleaning up secondary app:', cleanupError);
        }
      }
      
      let errorMessage = 'Failed to create user';
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already registered';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak (minimum 6 characters)';
          break;
        default:
          errorMessage = error.message || 'Unknown error occurred';
      }
  
      return { success: false, error: errorMessage };
    }
  };
  
  /**
   * FIXED createUserProfile that ensures role and displayName are saved
   */
  export const createUserProfileFixed = async (
    uid: string,
    userData: {
      email: string;
      displayName: string;
      role: Role;
      isActive: boolean;
    },
    createdByUid?: string
  ): Promise<void> => {
    try {
      console.log('🔧 createUserProfileFixed called');
      console.log('📋 Input data:', userData);
      
      // Import what we need
      const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
      
      const userRef = doc(db, 'app_users', uid);
      
      // Create the profile data with EXPLICIT assignment
      const profileData = {
        uid: uid,
        email: userData.email,
        displayName: userData.displayName, // EXPLICIT: Don't let this be undefined
        role: userData.role, // EXPLICIT: Don't let this default to viewer
        isActive: userData.isActive,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ...(createdByUid && { createdBy: createdByUid }) // Only add if exists
      };
      
      console.log('💾 Saving profile data:');
      console.log('   Email:', profileData.email);
      console.log('   DisplayName:', profileData.displayName);
      console.log('   Role:', profileData.role);
      console.log('   IsActive:', profileData.isActive);
      
      // Save to Firestore
      await setDoc(userRef, profileData);
      
      console.log('✅ Profile saved successfully');
      
      // Verify what was saved
      const { getDoc } = await import('firebase/firestore');
      const savedDoc = await getDoc(userRef);
      
      if (savedDoc.exists()) {
        const savedData = savedDoc.data();
        console.log('🔍 Verification - Saved data:');
        console.log('   Email:', savedData.email);
        console.log('   DisplayName:', savedData.displayName);
        console.log('   Role:', savedData.role);
        
        // Check for issues
        if (savedData.role !== userData.role) {
          console.error('🚨 ROLE ISSUE:', savedData.role, '!=', userData.role);
        }
        if (savedData.displayName !== userData.displayName) {
          console.error('🚨 DISPLAYNAME ISSUE:', savedData.displayName, '!=', userData.displayName);
        }
        if (savedData.role === userData.role && savedData.displayName === userData.displayName) {
          console.log('✅ ALL DATA SAVED CORRECTLY!');
        }
      }
      
    } catch (error) {
      console.error('❌ Error in createUserProfileFixed:', error);
      throw error;
    }
  };
  
  /**
   * Simpler approach: Create user and handle re-auth in component
   */
  export const createUserSimple = async (
    email: string,
    password: string,
    role: Role,
    displayName: string,
    createdByUid: string
  ): Promise<{ success: boolean; newUserId?: string; error?: string; needsReAuth?: boolean }> => {
    try {
      console.log('🔧 Creating user with role:', role);
      
      // Create the user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;
      
      // Create profile with correct role
      await createUserProfile(newUser.uid, {
        email: email,
        displayName: displayName,
        role: role, // Use the passed role, not default
        isActive: true
      }, createdByUid);
  
      console.log('✅ User created with role:', role);
  
      return { 
        success: true, 
        newUserId: newUser.uid,
        needsReAuth: true // Signal that re-auth is needed
      };
  
    } catch (error: any) {
      console.error('❌ Error creating user:', error);
      
      let errorMessage = 'Failed to create user';
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already registered';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak';
          break;
        default:
          errorMessage = error.message || 'Unknown error occurred';
      }
  
      return { success: false, error: errorMessage };
    }
  };
  
  /**
   * Re-authenticate admin after user creation
   */
  export const reAuthenticateAdmin = async (adminEmail: string, adminPassword: string) => {
    try {
      
      await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
      console.log('✅ Admin re-authenticated successfully');
      return { success: true };
    } catch (error: any) {
     
      return { success: false, error: error.message };
    }
  };