import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  logFirestoreError,
  OperationType,
  clampString,
  normalizeTimestampToIso,
} from '../lib/firebase';

export const SUPER_ADMIN_EMAIL = 'moohamedalsroore@gmail.com';
const PROFILE_CACHE_PREFIX = 'alghafari_auth_profile_';

export interface TenantUserProfile {
  uid: string;
  tenantCode: string;
  displayName: string;
  email: string;
  photoURL?: string;
  companyName?: string;
  role: 'USER' | 'ADMIN';
  status: 'ACTIVE' | 'SUSPENDED';
  accountingAccessGranted: boolean;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string;
}

interface AuthContextType {
  authUser: User | null;
  userProfile: TenantUserProfile | null;
  isAuthReady: boolean;
  isLoadingProfile: boolean;
  authError: string | null;
  isSuperAdmin: boolean;
  tenantCode: string;
  signInWithGoogle: () => Promise<void>;
  signOutAccount: () => Promise<void>;
  toggleAccountingAccessGrant: (granted: boolean) => Promise<void>;
  updateProfileCompanyName: (companyName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function buildTenantCode(uid: string): string {
  const clean = uid.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase();
  return `AG-${clean || 'USER01'}`;
}

function readCachedProfile(uid: string): TenantUserProfile | null {
  try {
    const raw = localStorage.getItem(`${PROFILE_CACHE_PREFIX}${uid}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TenantUserProfile;
    if (parsed && parsed.uid === uid && parsed.status) {
      return parsed;
    }
  } catch {
    // ignore corrupt cache
  }
  return null;
}

function writeCachedProfile(profile: TenantUserProfile): void {
  try {
    localStorage.setItem(`${PROFILE_CACHE_PREFIX}${profile.uid}`, JSON.stringify(profile));
  } catch {
    // ignore quota errors
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<TenantUserProfile | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const lastLoginSyncedUidRef = useRef<string | null>(null);

  const isSuperAdmin = Boolean(
    authUser &&
      authUser.emailVerified &&
      (authUser.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() || userProfile?.role === 'ADMIN')
  );

  const tenantCode = userProfile?.tenantCode || (authUser ? buildTenantCode(authUser.uid) : '');

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;
    let creatingProfile = false;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      setAuthUser(user);
      setAuthError(null);

      if (!user) {
        lastLoginSyncedUidRef.current = null;
        setUserProfile(null);
        setIsLoadingProfile(false);
        setIsAuthReady(true);
        return;
      }

      // Instant 0ms hydration from UID-scoped profile cache so returning users enter immediately
      const cached = readCachedProfile(user.uid);
      if (cached && cached.status === 'ACTIVE') {
        setUserProfile(cached);
        setIsLoadingProfile(false);
        setIsAuthReady(true);
      } else {
        setIsLoadingProfile(true);
        setIsAuthReady(true);
      }

      const userRef = doc(db, 'users', user.uid);
      unsubscribeProfile = onSnapshot(
        userRef,
        async (snap) => {
          if (!snap.exists()) {
            if (creatingProfile) return;
            creatingProfile = true;
            try {
              const code = buildTenantCode(user.uid);
              const newProfilePayload = {
                uid: user.uid,
                tenantCode: code,
                displayName: clampString(user.displayName || user.email?.split('@')[0] || 'مستخدم جديد', 150),
                email: clampString(user.email || '', 200),
                photoURL: clampString(user.photoURL || '', 500),
                companyName: 'الغفاري سوفت برو',
                role: 'USER' as const,
                status: 'ACTIVE' as const,
                accountingAccessGranted: false,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                lastLoginAt: serverTimestamp(),
              };
              await setDoc(userRef, newProfilePayload);
            } catch (err) {
              logFirestoreError(err, OperationType.CREATE, `users/${user.uid}`);
              setAuthError('تعذر إنشاء ملف الحساب المستقل. يرجى التحقق من الاتصال والمحاولة مجدداً.');
              setIsLoadingProfile(false);
            } finally {
              creatingProfile = false;
            }
            return;
          }

          const d = snap.data();
          const hydrated: TenantUserProfile = {
            uid: d.uid,
            tenantCode: d.tenantCode,
            displayName: d.displayName,
            email: d.email,
            photoURL: d.photoURL,
            companyName: d.companyName,
            role: d.role,
            status: d.status,
            accountingAccessGranted: Boolean(d.accountingAccessGranted),
            createdAt: normalizeTimestampToIso(d.createdAt),
            updatedAt: normalizeTimestampToIso(d.updatedAt),
            lastLoginAt: normalizeTimestampToIso(d.lastLoginAt),
          };

          writeCachedProfile(hydrated);
          setUserProfile(hydrated);
          setIsLoadingProfile(false);
          setIsAuthReady(true);

          // Non-blocking background update of lastLoginAt once per session
          if (d.status === 'ACTIVE' && lastLoginSyncedUidRef.current !== user.uid) {
            lastLoginSyncedUidRef.current = user.uid;
            void updateDoc(userRef, {
              displayName: clampString(user.displayName || d.displayName || 'مستخدم', 150),
              photoURL: clampString(user.photoURL || d.photoURL || '', 500),
              lastLoginAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            }).catch((err) => {
              logFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
            });
          }
        },
        (error) => {
          logFirestoreError(error, OperationType.GET, `users/${user.uid}`);
          setIsLoadingProfile(false);
          setIsAuthReady(true);
          if (!cached) {
            setAuthError('تعذر الاتصال بملف الحساب مؤقتاً. تأكد من اتصالك بالإنترنت ثم أعد المحاولة.');
          }
        }
      );
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code || '';
      if (code === 'auth/popup-closed-by-user') {
        setAuthError('تم إغلاق نافذة تسجيل الدخول قبل إتمام المصادقة. يرجى المحاولة مرة أخرى.');
      } else if (code === 'auth/popup-blocked') {
        setAuthError('قام المتصفح بحظر نافذة تسجيل الدخول. يرجى السماح بالنوافذ المنبثقة ثم المحاولة مجدداً.');
      } else {
        setAuthError('تعذر تسجيل الدخول عبر Google. يرجى التحقق من اتصال الإنترنت والمحاولة مجدداً.');
      }
    }
  }, []);

  const signOutAccount = useCallback(async () => {
    setAuthError(null);
    lastLoginSyncedUidRef.current = null;
    await signOut(auth);
  }, []);

  const toggleAccountingAccessGrant = useCallback(
    async (granted: boolean) => {
      if (!authUser) return;
      const uid = authUser.uid;
      try {
        await updateDoc(doc(db, 'users', uid), {
          accountingAccessGranted: granted,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${uid}`);
      }
      try {
        await updateDoc(doc(db, 'workspaces', uid), {
          adminAuditAuthorized: granted,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `workspaces/${uid}`);
      }
    },
    [authUser]
  );

  const updateProfileCompanyName = useCallback(
    async (companyName: string) => {
      if (!authUser) return;
      const uid = authUser.uid;
      try {
        await updateDoc(doc(db, 'users', uid), {
          companyName: clampString(companyName || 'الغفاري سوفت برو', 200),
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${uid}`);
      }
    },
    [authUser]
  );

  return (
    <AuthContext.Provider
      value={{
        authUser,
        userProfile,
        isAuthReady,
        isLoadingProfile,
        authError,
        isSuperAdmin,
        tenantCode,
        signInWithGoogle,
        signOutAccount,
        toggleAccountingAccessGrant,
        updateProfileCompanyName,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};
