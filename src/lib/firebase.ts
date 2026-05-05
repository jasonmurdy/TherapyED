/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from "firebase/analytics";
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export const analyticsPromise = isSupported().then(yes => {
  if (yes && firebaseConfig.measurementId) {
    try {
      return getAnalytics(app);
    } catch (e) {
      console.warn("Analytics initialization failed:", e);
      return null;
    }
  }
  return null;
}).catch(() => null);


// Defensive initialization for Storage
let storageInstance: any = null;
try {
  if (firebaseConfig.storageBucket) {
    storageInstance = getStorage(app);
    // Set a shorter retry time (e.g. 30 seconds) so users don't wait 10 minutes for a fail
    storageInstance.maxUploadRetryTime = 30000;
    storageInstance.maxOperationRetryTime = 30000;
  } else {
    console.warn("No storageBucket found in firebase-applet-config.json");
  }
} catch (error) {
  console.error("Failed to initialize Firebase Storage:", error);
}

export const storage = storageInstance;

import { handleFirestoreError as handleFirestoreErrorFull, OperationType } from './firestoreError';

export function handleFirestoreError(error: any, operationType: any, path: string | null = null): never {
  return handleFirestoreErrorFull(error, operationType as any, path) as never;
}
