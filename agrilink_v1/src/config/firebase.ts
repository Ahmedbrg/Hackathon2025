import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { 
  getFirestore, 
  connectFirestoreEmulator,
  enableIndexedDbPersistence,
  enableNetwork,
  disableNetwork
} from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "AIzaSyDYLKkHGxZQUqbDUMtFRgqxwPGXJtqPxWE",
    authDomain: "agrilink-v1.firebaseapp.com",
    projectId: "agrilink-v1",
    storageBucket: "agrilink-v1.appspot.com",
    messagingSenderId: "1098060161322",
    appId: "1:1098060161322:web:c0e3d2e2c2e2e2e2e2e2e2",
    measurementId: "G-MEASUREMENT_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Enable offline persistence for Firestore
const enableOfflinePersistence = async () => {
    try {
        await enableIndexedDbPersistence(db);
        console.log('Offline persistence enabled');
    } catch (err: any) {
        if (err.code === 'failed-precondition') {
            console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
        } else if (err.code === 'unimplemented') {
            console.warn('The current browser does not support offline persistence.');
        }
    }
};

// Function to toggle network access (useful for testing offline mode)
const toggleNetworkAccess = async (online: boolean) => {
    if (online) {
        await enableNetwork(db);
        console.log('Network enabled');
    } else {
        await disableNetwork(db);
        console.log('Network disabled');
    }
};

// Initialize offline persistence
enableOfflinePersistence();

// Add some basic error handlers and persistence
auth.onAuthStateChanged((user) => {
    if (user) {
        console.log('User is signed in:', user.uid);
        // Store user data in AsyncStorage for offline access
        AsyncStorage.setItem('user', JSON.stringify({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            lastLoginAt: new Date().toISOString()
        })).catch(error => {
            console.error('Error storing user data:', error);
        });
    } else {
        console.log('User is signed out');
        // Clear stored user data
        AsyncStorage.removeItem('user').catch(error => {
            console.error('Error removing user data:', error);
        });
    }
}, (error) => {
    console.error('Auth state change error:', error);
});

export { app, auth, db, storage, toggleNetworkAccess }; 