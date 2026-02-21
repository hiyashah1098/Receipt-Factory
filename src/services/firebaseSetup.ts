import { FirebaseApp, getApps, initializeApp } from 'firebase/app';
import {
    Auth,
    User,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    getAuth,
    onAuthStateChanged,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    updateProfile,
} from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';
import { FirebaseStorage, getStorage } from 'firebase/storage';

// Re-export auth functions for use in other modules
export {
    User,
    createUserWithEmailAndPassword,
    firebaseSignOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    updateProfile
};
export type { Auth };

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase only once
let app: FirebaseApp;
let db: Firestore;
let storage: FirebaseStorage;
let auth: Auth;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

db = getFirestore(app);
storage = getStorage(app);
auth = getAuth(app);

export { app, auth, db, storage };

// Receipt type for Firestore
export interface Receipt {
  id?: string;
  userId: string;
  imageUrl: string;
  analysis: FullReceiptAnalysis | null;
  createdAt: Date;
  storeName?: string;
  total?: number;
}

// Full analysis result from Gemini
export interface FullReceiptAnalysis {
  basic: ReceiptAnalysis;
  junkFees: JunkFeesAnalysis;
  inflation: InflationAnalysis;
  warranty: WarrantyAnalysis;
}

export interface JunkFeesAnalysis {
  hasJunkFees: boolean;
  gratuityIncluded: boolean;
  gratuityPercentage: number | null;
  fees: Array<{
    name: string;
    amount: number;
    isSuspicious: boolean;
    reason: string;
  }>;
  warnings: string[];
}

export interface InflationAnalysis {
  ripOffScore: number;
  overallAssessment: string;
  priceComparisons: Array<{
    itemName: string;
    receiptPrice: number;
    averagePrice: number;
    percentageDiff: number;
    isOverpriced: boolean;
    verdict: string;
  }>;
  totalOverpayment: number;
  recommendations: string[];
}

export interface WarrantyAnalysis {
  hasDurableItems: boolean;
  durableItems: Array<{
    name: string;
    price: number;
    category: 'electronics' | 'clothing' | 'appliance' | 'other';
    returnDeadline: string | null;
    returnDays: number | null;
    warrantyInfo: string | null;
    warrantyDays: number | null;
  }>;
  storeReturnPolicy: string | null;
  purchaseDate: string | null;
  recommendations: string[];
}

export interface ReceiptAnalysis {
  lineItems: LineItem[];
  subtotal: number;
  tax: number;
  total: number;
  gratuityIncluded: boolean;
  gratuityAmount?: number;
  serviceFees: ServiceFee[];
  storeName: string;
  storeAddress?: string;
  date?: string;
  returnPolicy?: string;
  durableItems: DurableItem[];
  ripOffScore?: number;
  priceComparisons?: PriceComparison[];
}

export interface LineItem {
  name: string;
  price: number;
  quantity: number;
  category?: string;
}

export interface ServiceFee {
  name: string;
  amount: number;
  isHidden: boolean;
  description: string;
}

export interface DurableItem {
  name: string;
  price: number;
  returnDeadline?: string;
  warrantyInfo?: string;
  category: 'electronics' | 'clothing' | 'appliance' | 'other';
}

export interface PriceComparison {
  itemName: string;
  receiptPrice: number;
  averagePrice: number;
  percentageDiff: number;
  isOverpriced: boolean;
}

export interface BillSplit {
  total: number;
  individuals: Individual[];
}

export interface Individual {
  name: string;
  items: LineItem[];
  subtotal: number;
  taxShare: number;
  tipShare: number;
  owed: number;
}
