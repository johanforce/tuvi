import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocFromServer,
  type Unsubscribe,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Tài khoản Admin duy nhất được phép thêm, sửa, xóa bài viết
export const ADMIN_EMAIL = 'cthang429@gmail.com';

export function isUserAdmin(user: User | null): boolean {
  return Boolean(user && user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase());
}

// Khởi tạo Firebase App & Services
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]!;

/* CRITICAL: firestoreDatabaseId is required by AI Studio Firestore setup */
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Kiểm tra kết nối ban đầu
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client offline, kiểm tra lại kết nối mạng.');
    }
    return false;
  }
}
void testConnection();

// Error Handling chuẩn mực theo quy ước Firebase
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
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid ?? null,
      email: auth.currentUser?.email ?? null,
      emailVerified: auth.currentUser?.emailVerified ?? null,
      isAnonymous: auth.currentUser?.isAnonymous ?? null,
      tenantId: auth.currentUser?.tenantId ?? null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) ?? [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Authentication Helpers
export async function signInWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Lỗi đăng nhập Google:', error);
    throw error;
  }
}

export async function signOutUser(): Promise<void> {
  await firebaseSignOut(auth);
}

export function subscribeAuth(callback: (user: User | null) => void): Unsubscribe {
  return onAuthStateChanged(auth, callback);
}

// Model bài viết Tàng Thư Cổ Học
export interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  authorId?: string;
  readTime: number; // phút
  featured?: boolean;
  viewCount: number;
  createdAt: string; // ISO date string
  updatedAt?: string;
  sourceUrl?: string;
  sourceType?: string;
}

const ARTICLES_PATH = 'articles';

// Lấy danh sách bài viết thực tế từ Firebase Firestore
export async function getArticlesFromFirestore(categoryFilter?: string, tagFilter?: string): Promise<Article[]> {
  try {
    const articlesCol = collection(db, ARTICLES_PATH);
    const snapshot = await getDocs(articlesCol);

    let items: Article[] = snapshot.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        title: data.title || 'Không tiêu đề',
        summary: data.summary || '',
        content: data.content || '',
        category: data.category || 'Cổ Học',
        tags: Array.isArray(data.tags) ? data.tags : [],
        author: data.author || 'Tàng Thư Cổ Học',
        authorId: data.authorId,
        readTime: typeof data.readTime === 'number' ? data.readTime : 5,
        featured: Boolean(data.featured),
        viewCount: typeof data.viewCount === 'number' ? data.viewCount : 0,
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt,
      sourceUrl: data.sourceUrl,
      sourceType: data.sourceType,
        sourceUrl: data.sourceUrl,
        sourceType: data.sourceType,
      };
    });

    // Sắp xếp bài viết mới nhất lên trước
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (categoryFilter && categoryFilter !== 'Tất cả') {
      items = items.filter(a => a.category === categoryFilter);
    }

    if (tagFilter && tagFilter !== 'Tất cả') {
      items = items.filter(a => a.tags?.includes(tagFilter));
    }

    return items;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, ARTICLES_PATH);
  }
}

// Lấy 1 bài viết theo ID
export async function getArticleById(id: string): Promise<Article | null> {
  const docPath = `${ARTICLES_PATH}/${id}`;
  try {
    const docSnap = await getDoc(doc(db, ARTICLES_PATH, id));
    if (!docSnap.exists()) return null;
    const data = docSnap.data();
    return {
      id: docSnap.id,
      title: data.title || '',
      summary: data.summary || '',
      content: data.content || '',
      category: data.category || 'Cổ Học',
      tags: Array.isArray(data.tags) ? data.tags : [],
      author: data.author || '',
      authorId: data.authorId,
      readTime: typeof data.readTime === 'number' ? data.readTime : 5,
      featured: Boolean(data.featured),
      viewCount: typeof data.viewCount === 'number' ? data.viewCount : 0,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, docPath);
  }
}

// Thêm bài viết mới (chỉ Admin)
export async function createArticleInFirestore(data: Omit<Article, 'id'>): Promise<string> {
  const id = `art-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const docPath = `${ARTICLES_PATH}/${id}`;
  try {
    await setDoc(doc(db, ARTICLES_PATH, id), {
      ...data,
      viewCount: data.viewCount ?? 0,
      createdAt: data.createdAt ?? new Date().toISOString(),
    });
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, docPath);
  }
}

// Cập nhật bài viết (chỉ Admin)
export async function updateArticleInFirestore(id: string, updates: Partial<Omit<Article, 'id'>>): Promise<void> {
  const docPath = `${ARTICLES_PATH}/${id}`;
  try {
    await updateDoc(doc(db, ARTICLES_PATH, id), {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}

// Cập nhật lượt xem khi độc giả đọc bài
export async function incrementArticleViews(id: string, currentViews: number): Promise<void> {
  const docPath = `${ARTICLES_PATH}/${id}`;
  try {
    await updateDoc(doc(db, ARTICLES_PATH, id), {
      viewCount: (currentViews || 0) + 1,
    });
  } catch (error) {
    console.warn('Không thể tăng lượt xem:', error);
  }
}

// Xóa bài viết (chỉ Admin)
export async function deleteArticleFromFirestore(id: string): Promise<void> {
  const docPath = `${ARTICLES_PATH}/${id}`;
  try {
    await deleteDoc(doc(db, ARTICLES_PATH, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

/** Nhập/upsert bài viết từ gói JSON đã crawl; URL nguồn là khóa chống trùng. */
export async function importArticlesToFirestore(
  records: Array<Pick<Article, 'title' | 'content' | 'category' | 'tags' | 'author' | 'sourceUrl'> & Partial<Article> & { sourceType?: string }>
): Promise<{ inserted: number; updated: number; skipped: number }> {
  const user = auth.currentUser;
  if (!isUserAdmin(user) || !user?.emailVerified) {
    throw new Error('Cần đăng nhập bằng tài khoản admin đã xác minh email.');
  }

  const snapshot = await getDocs(collection(db, ARTICLES_PATH));
  const existingByUrl = new Map<string, string>();
  snapshot.docs.forEach(item => {
    const sourceUrl = item.data().sourceUrl;
    if (typeof sourceUrl === 'string' && sourceUrl) existingByUrl.set(sourceUrl, item.id);
  });

  const stableId = (url: string) => {
    let hash = 2166136261;
    for (let i = 0; i < url.length; i++) {
      hash ^= url.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return 'src-' + (hash >>> 0).toString(16).padStart(8, '0');
  };

  let inserted = 0, updated = 0, skipped = 0;
  for (const raw of records) {
    const title = typeof raw.title === 'string' ? raw.title.trim() : '';
    const content = typeof raw.content === 'string' ? raw.content.trim() : '';
    const sourceUrl = typeof raw.sourceUrl === 'string' ? raw.sourceUrl.trim() : '';
    if (title.length < 2 || title.length > 200 || content.length < 80 || content.length > 500000 ||
        !/^https?:\/\//i.test(sourceUrl) || !Array.isArray(raw.tags) || raw.tags.length > 20) {
      skipped++;
      continue;
    }
    const id = existingByUrl.get(sourceUrl) || stableId(sourceUrl);
    const wasExisting = existingByUrl.has(sourceUrl);
    const wordCount = content.split(/\s+/).filter(Boolean).length;
    const payload = {
      title,
      summary: (typeof raw.summary === 'string' ? raw.summary : content.slice(0, 220)).slice(0, 1000),
      content,
      category: (typeof raw.category === 'string' && raw.category.trim() ? raw.category.trim() : 'Tử Vi').slice(0, 100),
      tags: raw.tags.map(tag => String(tag).trim()).filter(Boolean).slice(0, 20),
      author: (typeof raw.author === 'string' && raw.author.trim() ? raw.author.trim() : 'Chưa xác định').slice(0, 100),
      readTime: Math.max(1, Math.min(120, Math.ceil(wordCount / 200))),
      featured: false,
      viewCount: wasExisting ? (snapshot.docs.find(item => item.id === id)?.data().viewCount || 0) : 0,
      createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : new Date().toISOString(),
      sourceUrl,
      sourceType: typeof raw.sourceType === 'string' ? raw.sourceType.slice(0, 80) : 'external-import',
    };
    await setDoc(doc(db, ARTICLES_PATH, id), payload, { merge: true });
    if (wasExisting) updated++;
    else {
      inserted++;
      existingByUrl.set(sourceUrl, id);
    }
  }
  return { inserted, updated, skipped };
}
