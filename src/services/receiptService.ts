import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    query,
    serverTimestamp,
    where
} from 'firebase/firestore';
import { auth, db, FullReceiptAnalysis, Receipt } from './firebaseSetup';

/**
 * Upload receipt image - Currently disabled in Expo Go due to Firebase Storage limitations
 * In a production build, this would upload to Firebase Storage
 */
export async function uploadReceiptImage(
  imageUri: string,
  userId: string
): Promise<string> {
  // Firebase Storage blob upload doesn't work in Expo Go
  // Just return the local URI - images won't persist across sessions
  // but receipt data will be saved to Firestore
  return imageUri;
}

/**
 * Save receipt to Firestore
 */
export async function saveReceipt(
  analysis: FullReceiptAnalysis,
  imageUri: string,
  uploadImage: boolean = true
): Promise<string> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User must be logged in to save receipts');
  }

  try {
    let imageUrl = imageUri;

    // Upload image to Storage if requested
    if (uploadImage && imageUri.startsWith('file://')) {
      imageUrl = await uploadReceiptImage(imageUri, user.uid);
    }

    // Create receipt document
    const receiptData: Omit<Receipt, 'id'> = {
      userId: user.uid,
      imageUrl,
      analysis,
      createdAt: new Date(),
      storeName: analysis.basic?.storeName || 'Unknown Store',
      total: analysis.basic?.total || 0,
    };

    // Add to Firestore
    const receiptsRef = collection(db, 'receipts');
    const docRef = await addDoc(receiptsRef, {
      ...receiptData,
      createdAt: serverTimestamp(),
    });

    console.log('Receipt saved with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error saving receipt:', error);
    throw new Error('Failed to save receipt');
  }
}

/**
 * Get all receipts for the current user
 */
export async function getUserReceipts(): Promise<Receipt[]> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User must be logged in to fetch receipts');
  }

  try {
    const receiptsRef = collection(db, 'receipts');
    // Simple query without orderBy to avoid needing a composite index
    const q = query(
      receiptsRef,
      where('userId', '==', user.uid)
    );

    const snapshot = await getDocs(q);
    const receipts: Receipt[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      receipts.push({
        id: doc.id,
        userId: data.userId,
        imageUrl: data.imageUrl,
        analysis: data.analysis,
        createdAt: data.createdAt?.toDate() || new Date(),
        storeName: data.storeName,
        total: data.total,
      });
    });

    // Sort client-side by createdAt descending (newest first)
    receipts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return receipts;
  } catch (error) {
    console.error('Error fetching receipts:', error);
    throw new Error('Failed to fetch receipts');
  }
}

/**
 * Delete a receipt
 */
export async function deleteReceipt(receiptId: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User must be logged in to delete receipts');
  }

  try {
    const receiptRef = doc(db, 'receipts', receiptId);
    await deleteDoc(receiptRef);
    console.log('Receipt deleted:', receiptId);
  } catch (error) {
    console.error('Error deleting receipt:', error);
    throw new Error('Failed to delete receipt');
  }
}

/**
 * Delete all receipts for the current user
 */
export async function deleteAllReceipts(): Promise<number> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User must be logged in to delete receipts');
  }

  try {
    const receipts = await getUserReceipts();
    let deletedCount = 0;

    for (const receipt of receipts) {
      if (receipt.id) {
        const receiptRef = doc(db, 'receipts', receipt.id);
        await deleteDoc(receiptRef);
        deletedCount++;
      }
    }

    console.log(`Deleted ${deletedCount} receipts`);
    return deletedCount;
  } catch (error) {
    console.error('Error deleting all receipts:', error);
    throw new Error('Failed to delete all receipts');
  }
}

/**
 * Get receipt statistics for the user
 */
export async function getReceiptStats(): Promise<{
  totalReceipts: number;
  totalSpent: number;
  totalJunkFees: number;
  averageRipOffScore: number;
}> {
  const receipts = await getUserReceipts();

  let totalSpent = 0;
  let totalJunkFees = 0;
  let ripOffScoreSum = 0;
  let ripOffScoreCount = 0;

  receipts.forEach((receipt) => {
    if (receipt.analysis) {
      totalSpent += receipt.analysis.basic?.total || 0;

      // Sum up junk fees
      receipt.analysis.junkFees?.fees?.forEach((fee) => {
        totalJunkFees += fee.amount;
      });

      // Average rip-off score
      if (receipt.analysis.basic?.ripOffScore !== undefined) {
        ripOffScoreSum += receipt.analysis.basic.ripOffScore;
        ripOffScoreCount++;
      }
    }
  });

  return {
    totalReceipts: receipts.length,
    totalSpent,
    totalJunkFees,
    averageRipOffScore: ripOffScoreCount > 0 ? ripOffScoreSum / ripOffScoreCount : 0,
  };
}
