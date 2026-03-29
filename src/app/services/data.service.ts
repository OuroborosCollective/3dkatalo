import { Injectable } from '@angular/core';
import { 
  collection, 
  onSnapshot, 
  query, 
  where, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocFromServer,
  Timestamp,
  orderBy,
  DocumentData
} from 'firebase/firestore';
import { auth, db, storage } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { BehaviorSubject } from 'rxjs';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string | null;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  };
}

export interface MarketplaceLink {
  platform: string;
  url: string;
}

export interface Asset {
  id?: string;
  name: string;
  url: string;
  type: string;
  status: string;
  marketplaceLinks?: MarketplaceLink[];
  ownerId?: string;
  createdAt?: Timestamp;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private categoriesSubject = new BehaviorSubject<DocumentData[]>([]);
  private assetsSubject = new BehaviorSubject<Asset[]>([]);

  categories$ = this.categoriesSubject.asObservable();
  assets$ = this.assetsSubject.asObservable();

  get assets() {
    return this.assetsSubject.value;
  }

  constructor() {
    this.testConnection();
  }

  private handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
    const errInfo: FirestoreErrorInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        emailVerified: auth.currentUser?.emailVerified,
        isAnonymous: auth.currentUser?.isAnonymous,
        providerInfo: auth.currentUser?.providerData.map(provider => ({
          providerId: provider.providerId,
          displayName: provider.displayName,
          email: provider.email,
          photoUrl: provider.photoURL
        })) || []
      },
      operationType,
      path
    };
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  }

  private async testConnection() {
    try {
      await getDocFromServer(doc(db, 'test', 'connection'));
    } catch (error) {
      if (error instanceof Error && error.message.includes('the client is offline')) {
        console.error("Please check your Firebase configuration.");
      }
    }
  }

  initRealtime() {
    const user = auth.currentUser;
    if (!user) return;

    // Categories
    const catQuery = query(collection(db, 'categories'), where('ownerId', '==', user.uid));
    onSnapshot(catQuery, (snapshot) => {
      const cats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      this.categoriesSubject.next(cats);
    }, (error) => this.handleFirestoreError(error, OperationType.LIST, 'categories'));

    // Assets
    const assetQuery = query(collection(db, 'assets'), where('ownerId', '==', user.uid), orderBy('createdAt', 'desc'));
    onSnapshot(assetQuery, (snapshot) => {
      const assets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Asset));
      this.assetsSubject.next(assets);
    }, (error) => this.handleFirestoreError(error, OperationType.LIST, 'assets'));
  }

  async addCategory(name: string, parentId: string | null = null) {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    try {
      await addDoc(collection(db, 'categories'), {
        name,
        parentId,
        ownerId: user.uid
      });
    } catch (error) {
      this.handleFirestoreError(error, OperationType.CREATE, 'categories');
    }
  }

  async updateCategory(categoryId: string, name: string) {
    try {
      await updateDoc(doc(db, 'categories', categoryId), { name });
    } catch (error) {
      this.handleFirestoreError(error, OperationType.UPDATE, `categories/${categoryId}`);
    }
  }

  async deleteCategory(categoryId: string) {
    try {
      await deleteDoc(doc(db, 'categories', categoryId));
    } catch (error) {
      this.handleFirestoreError(error, OperationType.DELETE, `categories/${categoryId}`);
    }
  }

  async addAsset(asset: DocumentData) {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    try {
      await addDoc(collection(db, 'assets'), {
        ...asset,
        ownerId: user.uid,
        createdAt: Timestamp.now(),
        status: asset.status || 'draft'
      });
    } catch (error) {
      this.handleFirestoreError(error, OperationType.CREATE, 'assets');
    }
  }

  async updateAsset(assetId: string, data: DocumentData) {
    try {
      await updateDoc(doc(db, 'assets', assetId), data);
    } catch (error) {
      this.handleFirestoreError(error, OperationType.UPDATE, `assets/${assetId}`);
    }
  }

  async updateAssetMarketplaceLinks(assetId: string, links: MarketplaceLink[]) {
    try {
      await updateDoc(doc(db, 'assets', assetId), { marketplaceLinks: links });
    } catch (error) {
      this.handleFirestoreError(error, OperationType.UPDATE, `assets/${assetId}`);
    }
  }

  async deleteAsset(assetId: string) {
    try {
      await deleteDoc(doc(db, 'assets', assetId));
    } catch (error) {
      this.handleFirestoreError(error, OperationType.DELETE, `assets/${assetId}`);
    }
  }

  async uploadFile(file: File, path: string, progressCallback: (progress: number) => void): Promise<string> {
    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed', (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      progressCallback(progress);
    });

    await uploadTask;
    return getDownloadURL(uploadTask.snapshot.ref);
  }
}
