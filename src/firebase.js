import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Твой конфиг из Firebase Console
const firebaseConfig = {
    apiKey: "AIzaSyD-eEum7Pq1a92fPocmb14uIY5sTO_SyIo",
    authDomain: "queue-352e8.firebaseapp.com",
    projectId: "queue-352e8",
    storageBucket: "queue-352e8.firebasestorage.app",
    messagingSenderId: "805537262813",
    appId: "1:805537262813:web:97b452341db3e104693f34"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();