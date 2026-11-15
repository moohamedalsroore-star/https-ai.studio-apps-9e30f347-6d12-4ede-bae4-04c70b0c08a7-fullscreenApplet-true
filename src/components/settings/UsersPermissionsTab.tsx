import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  ShieldCheck,
  UserPlus,
  Lock,
  Unlock,
  Trash2,
  Clock,
  Shield,
  RefreshCw,
  CheckCircle2,
  Ban,
  Eye,
  Building2,
} from 'lucide-react';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { AppUser, UserRole, UserPermission } from '../../types/settings';
import { INITIAL_APP_USERS } from '../../utils/settingsDefaults';
import { useAuth, TenantUserProfile } from '../../context/AuthContext';
import { useAccounting } from '../../context/AccountingContext';
import { db, handleFirestoreError, OperationType, normalizeTimestampToIso } from '../../lib/firebase';

interface UsersPermissionsTabProps {
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

interface AuthorizedAuditSummary {
  companyName: string;
  baseCurrency: string;
  invoicesCount: number;
  vouchersCount: number;
  productsCount: number;
  contactsCount: number;
  journalEntriesCount: number;
  totalSalesBase: number;
}

export const UsersPermissionsTab: React.FC<UsersPermissionsTabProps> = ({ showToast }) => {
  const { authUser, userProfile, tenantCode, isSuperAdmin, toggleAccountingAccessGrant } = useAuth();
  const { auditLogs: contextAuditLogs } = useAccounting();

  const uidPrefix = authUser?.uid ? `alghafari_tenant_${authUser.uid}` : 'alghafari_guest';
  const USERS_STORAGE_KEY = `${uidPrefix}_app_users`;

  const [users, setUsers] = useState<AppUser[]>(() => {
    try {
      const saved = localStorage.getItem(USERS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_APP_USERS;
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(USERS_STORAGE_KEY);
      if (saved) {
        setUsers(JSON.parse(saved));
      } else {
        setUsers(INITIAL_APP_USERS);
      }
    } catch {
      setUsers(INITIAL_APP_USERS);
    }
  }, [USERS_STORAGE_KEY]);

  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Privacy consent toggle state
  const [updatingConsent, setUpdatingConsent] = useState(false);

  // Super Admin Subscriber Directory State
  const [subscribers, setSubscribers] = useState<TenantUserProfile[]>([]);
  const [loadingSubscribers, setLoadingSubscribers] = useState(false);
  const [authorizedPreview, setAuthorizedPreview] = useState<{
    user: TenantUserProfile;
    summary: AuthorizedAuditSummary;
  } | null>(null);

  // New branch operator form
  const [newUsername, setNewUsername] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('CASHIER');
  const [newPin, setNewPin] = useState('0000');

  const fetchSubscribers = useCallback(async () => {
    if (!isSuperAdmin) return;
    setLoadingSubscribers(true);
    try {
      const snap = await getDocs(collection(db, 'users'));
      const list: TenantUserProfile[] = [];
      snap.forEach((d) => {
        const raw = d.data();
        list.push({
          uid: raw.uid,
          tenantCode: raw.tenantCode,
          displayName: raw.displayName,
          email: raw.email,
          photoURL: raw.photoURL,
          companyName: raw.companyName,
          role: raw.role,
          status: raw.status,
          accountingAccessGranted: Boolean(raw.accountingAccessGranted),
          createdAt: normalizeTimestampToIso(raw.createdAt),
          updatedAt: normalizeTimestampToIso(raw.updatedAt),
          lastLoginAt: normalizeTimestampToIso(raw.lastLoginAt),
        });
      });
      list.sort((a, b) => String(b.lastLoginAt || '').localeCompare(String(a.lastLoginAt || '')));
      setSubscribers(list);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'users');
    } finally {
      setLoadingSubscribers(false);
    }
  }, [isSuperAdmin]);

  useEffect(() => {
    if (isSuperAdmin) {
      void fetchSubscribers();
    }
  }, [isSuperAdmin, fetchSubscribers]);

  const handleToggleConsent = async () => {
    if (!userProfile) return;
    setUpdatingConsent(true);
    try {
      const next = !userProfile.accountingAccessGranted;
      await toggleAccountingAccessGrant(next);
      showToast(
        next
          ? 'تم تفعيل الإذن المؤقت للإدارة بمراجعة ملخص الحسابات ✓'
          : 'تم سحب الإذن: حساباتك مغلقة بخصوصية تامة الآن 🔒',
        'info'
      );
    } catch {
      showToast('تعذر تحديث إعداد الخصوصية', 'error');
    } finally {
      setUpdatingConsent(false);
    }
  };

  const handleAdminToggleSubscriberStatus = async (sub: TenantUserProfile) => {
    if (!isSuperAdmin) return;
    if (sub.uid === authUser?.uid) {
      showToast('لا يمكنك تعطيل حساب الإدارة الخاص بك!', 'error');
      return;
    }
    const nextStatus = sub.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await updateDoc(doc(db, 'users', sub.uid), {
        status: nextStatus,
        updatedAt: serverTimestamp(),
      });
      setSubscribers((prev) =>
        prev.map((item) => (item.uid === sub.uid ? { ...item, status: nextStatus } : item))
      );
      showToast(
        nextStatus === 'ACTIVE'
          ? `تم تفعيل حساب «${sub.displayName}» ✓`
          : `تم إيقاف حساب «${sub.displayName}» بنجاح`,
        'info'
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${sub.uid}`);
    }
  };

  const handleAdminInspectAuthorizedSnapshot = async (sub: TenantUserProfile) => {
    if (!sub.accountingAccessGranted) {
      showToast('بيانات هذا المستخدم محمية: لم يمنح إذن المراجعة الإدارية 🔒', 'error');
      return;
    }
    try {
      const snapRef = doc(db, 'workspaces', sub.uid, 'auditSnapshot', 'summary');
      const snap = await getDoc(snapRef);
      if (!snap.exists()) {
        showToast('لا يوجد ملخص محاسبي مسجل لهذا الحساب بعد', 'info');
        return;
      }
      const d = snap.data();
      setAuthorizedPreview({
        user: sub,
        summary: {
          companyName: d.companyName || sub.companyName || '-',
          baseCurrency: d.baseCurrency || 'SAR',
          invoicesCount: Number(d.invoicesCount || 0),
          vouchersCount: Number(d.vouchersCount || 0),
          productsCount: Number(d.productsCount || 0),
          contactsCount: Number(d.contactsCount || 0),
          journalEntriesCount: Number(d.journalEntriesCount || 0),
          totalSalesBase: Number(d.totalSalesBase || 0),
        },
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `workspaces/${sub.uid}/auditSnapshot/summary`);
    }
  };

  const saveUsersList = (updatedUsers: AppUser[]) => {
    setUsers(updatedUsers);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newFullName.trim()) {
      showToast('يرجى إدخال اسم المستخدم والاسم الكامل', 'error');
      return;
    }

    const defaultPerms: UserPermission =
      newRole === 'ADMIN'
        ? { canView: true, canAdd: true, canEdit: true, canDelete: true, canPrint: true, canViewReports: true, canManageSettings: true, canResetDatabase: true }
        : newRole === 'ACCOUNTANT'
        ? { canView: true, canAdd: true, canEdit: true, canDelete: false, canPrint: true, canViewReports: true, canManageSettings: false, canResetDatabase: false }
        : newRole === 'CASHIER'
        ? { canView: true, canAdd: true, canEdit: false, canDelete: false, canPrint: true, canViewReports: false, canManageSettings: false, canResetDatabase: false }
        : { canView: true, canAdd: true, canEdit: true, canDelete: false, canPrint: true, canViewReports: false, canManageSettings: false, canResetDatabase: false };

    const newUser: AppUser = {
      id: `user-${Date.now()}`,
      username: newUsername.trim(),
      fullName: newFullName.trim(),
      role: newRole,
      pinCode: newPin,
      isActive: true,
      permissions: defaultPerms,
      createdAt: new Date().toISOString().split('T')[0],
      lastLogin: 'جاهز للعمل',
    };

    const updated = [...users, newUser];
    saveUsersList(updated);
    setShowAddModal(false);
    setNewUsername('');
    setNewFullName('');
    setNewPin('0000');
    showToast(`تم إنشاء حساب المستخدم «${newUser.fullName}» داخل مساحتك الخاصة ✓`, 'success');
  };

  const handleToggleUserStatus = (userId: string) => {
    const updated = users.map((u) => {
      if (u.id === userId) {
        if (u.role === 'ADMIN' && users.filter((x) => x.role === 'ADMIN' && x.isActive).length <= 1) {
          showToast('لا يمكن تعطيل حساب المدير الرئيسي الوحيد!', 'error');
          return u;
        }
        return { ...u, isActive: !u.isActive };
      }
      return u;
    });
    saveUsersList(updated);
    showToast('تم تحديث حالة تفعيل المستخدم', 'info');
  };

  const handleUpdatePermissions = (userId: string, perms: UserPermission) => {
    const updated = users.map((u) => (u.id === userId ? { ...u, permissions: perms } : u));
    saveUsersList(updated);
    showToast('تم تحديث صلاحيات المستخدم بنجاح ✓', 'success');
  };

  const handleDeleteUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (target?.role === 'ADMIN') {
      showToast('لا يمكن حذف حساب المدير العام!', 'error');
      return;
    }
    const updated = users.filter((u) => u.id !== userId);
    saveUsersList(updated);
    showToast('تم حذف المستخدم بنجاح', 'info');
  };

  return (
    <div className="space-y-6 text-right animate-in fade-in duration-200">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            الأمان والخصوصية المستقلة وصلاحيات الحساب
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            ملفك المستقل: <span className="font-mono text-cyan-300 font-bold">{tenantCode}</span> • جميع البيانات والعمليات معزولة تماماً عن أي مستخدم آخر
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-black text-xs cursor-pointer shadow-md shadow-amber-600/20 active:scale-95 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>إضافة موظف / كاشير فرعي</span>
        </button>
      </div>

      {/* 0. Owner Data Privacy & Administrative Audit Consent Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-[#040C2E] border-2 border-cyan-500/40 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border shrink-0 ${userProfile?.accountingAccessGranted ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'}`}>
              {userProfile?.accountingAccessGranted ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <h4 className="text-sm font-black text-white flex items-center gap-2">
                <span>خصوصية بياناتك المحاسبية واستقلالية الحساب</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                  {tenantCode}
                </span>
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                بشكل افتراضي، حسابك المحاسبي مشفر ومعزول بالكامل: لا يمكن لأي مستخدم أو حتى إدارة المنصة الاطلاع على أرقامك أو عملائك أو فواتيرك إلا إذا قمت بتفعيل الإذن المؤقت للدعم والمراجعة أدناه.
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={updatingConsent}
            onClick={handleToggleConsent}
            className={`px-4 py-2.5 rounded-xl font-black text-xs cursor-pointer transition-all shrink-0 flex items-center gap-2 border ${
              userProfile?.accountingAccessGranted
                ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border-amber-400/50'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400/50 shadow-lg shadow-emerald-700/20'
            }`}
          >
            {userProfile?.accountingAccessGranted ? (
              <>
                <Lock className="w-4 h-4" />
                <span>إلغاء الإذن وقفل البيانات بالكامل</span>
              </>
            ) : (
              <>
                <Unlock className="w-4 h-4" />
                <span>منح إذن مراجعة إدارية مؤقت للدعم</span>
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px] bg-slate-950/60 p-3 rounded-xl border border-slate-800">
          <div>
            <span className="text-slate-400">البريد الموثق للحساب: </span>
            <span className="font-mono text-white font-bold">{userProfile?.email || authUser?.email}</span>
          </div>
          <div>
            <span className="text-slate-400">رقم التعريف الخاص (UID): </span>
            <span className="font-mono text-cyan-300">{authUser?.uid?.slice(0, 12)}...</span>
          </div>
          <div>
            <span className="text-slate-400">حالة الخصوصية: </span>
            <span className={userProfile?.accountingAccessGranted ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
              {userProfile?.accountingAccessGranted ? 'مصرّح بمراجعة الملخص للإدارة فقط' : 'عزل تام ومحمي 100% 🔒'}
            </span>
          </div>
        </div>
      </div>

      {/* Super Admin Control Panel (Visible ONLY to verified Super Admin, ZERO access to accounting records unless user explicitly grants consent) */}
      {isSuperAdmin && (
        <div className="p-5 rounded-2xl bg-slate-900 border-2 border-amber-500/50 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-amber-300">
                  لوحة إدارة حسابات المشتركين (Super Admin Console)
                </h4>
                <p className="text-[11px] text-slate-400">
                  إدارة حالة الحسابات دون الاطلاع على البيانات المحاسبية للمستخدمين إلا بتخويل صريح من صاحب الحساب
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={fetchSubscribers}
              disabled={loadingSubscribers}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold border border-slate-700 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingSubscribers ? 'animate-spin' : ''}`} />
              <span>تحديث القائمة ({subscribers.length})</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-800/70 border-b border-slate-800 text-slate-400">
                  <th className="p-3">المشترك والمنشأة</th>
                  <th className="p-3">رقم التعريف</th>
                  <th className="p-3">البريد الإلكتروني</th>
                  <th className="p-3">حالة الحساب</th>
                  <th className="p-3">خصوصية المحاسبة</th>
                  <th className="p-3 text-center">إدارة الحساب</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {subscribers.map((sub) => (
                  <tr key={sub.uid} className="hover:bg-slate-800/30">
                    <td className="p-3">
                      <div className="font-bold text-white">{sub.displayName}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3 h-3 text-amber-400" />
                        <span>{sub.companyName || 'منشأة مستقلة'}</span>
                      </div>
                    </td>
                    <td className="p-3 font-mono text-cyan-300 font-bold">{sub.tenantCode}</td>
                    <td className="p-3 font-mono text-slate-300 text-[11px]">{sub.email}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          sub.status === 'ACTIVE'
                            ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40'
                            : 'bg-red-950/60 text-red-400 border-red-500/40'
                        }`}
                      >
                        {sub.status === 'ACTIVE' ? 'نشط ✓' : 'موقوف ✕'}
                      </span>
                    </td>
                    <td className="p-3">
                      {sub.accountingAccessGranted ? (
                        <button
                          type="button"
                          onClick={() => handleAdminInspectAuthorizedSnapshot(sub)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-bold cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>معاينة الملخص المصرح به</span>
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 text-[10px] border border-slate-700">
                          <Lock className="w-3 h-3 text-emerald-400" />
                          <span>مقفل بخصوصية المالك</span>
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {sub.uid === authUser?.uid ? (
                        <span className="text-[10px] text-amber-400 font-bold">مدير المنصة</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleAdminToggleSubscriberStatus(sub)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                            sub.status === 'ACTIVE'
                              ? 'bg-red-950/50 hover:bg-red-900/70 text-red-300 border border-red-500/40'
                              : 'bg-emerald-950/50 hover:bg-emerald-900/70 text-emerald-300 border border-emerald-500/40'
                          }`}
                        >
                          {sub.status === 'ACTIVE' ? (
                            <>
                              <Ban className="w-3 h-3" />
                              <span>إيقاف مؤقت</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              <span>إعادة تفعيل</span>
                            </>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {authorizedPreview && (
            <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-black text-amber-300">
                  ملخص إداري مصرح به: {authorizedPreview.user.displayName} ({authorizedPreview.user.tenantCode})
                </h5>
                <button
                  type="button"
                  onClick={() => setAuthorizedPreview(null)}
                  className="text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  إغلاق ✕
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400">المنشأة</div>
                  <div className="font-bold text-white truncate">{authorizedPreview.summary.companyName}</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400">الفواتير</div>
                  <div className="font-mono font-bold text-cyan-300">{authorizedPreview.summary.invoicesCount}</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400">السندات</div>
                  <div className="font-mono font-bold text-emerald-300">{authorizedPreview.summary.vouchersCount}</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400">الأصناف</div>
                  <div className="font-mono font-bold text-white">{authorizedPreview.summary.productsCount}</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400">العملاء/الموردون</div>
                  <div className="font-mono font-bold text-white">{authorizedPreview.summary.contactsCount}</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400">إجمالي المبيعات</div>
                  <div className="font-mono font-bold text-amber-300">
                    {authorizedPreview.summary.totalSalesBase.toLocaleString('en-US', { minimumFractionDigits: 2 })} {authorizedPreview.summary.baseCurrency}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 1. Branch Operators Table within this isolated tenant */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h4 className="text-xs font-black text-amber-300">طاقم العمل الداخلي وصلاحيات التشغيل الخاصة بمنشأتك</h4>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/60 text-slate-400">
                <th className="p-3">المستخدم</th>
                <th className="p-3">اسم الدخول</th>
                <th className="p-3">الدور الوظيفي</th>
                <th className="p-3">رمز PIN</th>
                <th className="p-3">الحالة</th>
                <th className="p-3">آخر نشاط</th>
                <th className="p-3 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-3 font-bold text-white flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-xs">
                      {u.role === 'ADMIN' ? '👑' : u.role === 'ACCOUNTANT' ? '📊' : '🛒'}
                    </div>
                    <span>{u.fullName}</span>
                  </td>
                  <td className="p-3 font-mono text-slate-300">@{u.username}</td>
                  <td className="p-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        u.role === 'ADMIN'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : u.role === 'ACCOUNTANT'
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      }`}
                    >
                      {u.role === 'ADMIN'
                        ? 'مدير عام'
                        : u.role === 'ACCOUNTANT'
                        ? 'محاسب عام'
                        : u.role === 'CASHIER'
                        ? 'كاشير مبيعات'
                        : 'أمين مستودع'}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-amber-400 font-bold">{u.pinCode || '****'}</td>
                  <td className="p-3">
                    <button
                      type="button"
                      onClick={() => handleToggleUserStatus(u.id)}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer transition-colors ${
                        u.isActive
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                          : 'bg-red-950/60 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {u.isActive ? 'نشط ✓' : 'معطل ✕'}
                    </button>
                  </td>
                  <td className="p-3 font-mono text-slate-400 text-[11px]">{u.lastLogin || '-'}</td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedUser(u)}
                        className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold transition-colors cursor-pointer"
                      >
                        الصلاحيات
                      </button>
                      {u.role !== 'ADMIN' && (
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-1 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-500/30 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Isolated Tenant Audit Trail Log */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-black text-white">سجل العمليات والأمان الخاص بحسابك (Audit Trail)</h4>
          </div>
          <span className="text-[10px] text-slate-400">معزول ومربوط بحسابك ({contextAuditLogs.length} عملية)</span>
        </div>

        <div className="space-y-2 max-h-72 overflow-y-auto">
          {contextAuditLogs.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">لا توجد عمليات مسجلة في سجل هذا الحساب بعد.</p>
          ) : (
            contextAuditLogs.slice(0, 30).map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-slate-800 text-amber-400 flex items-center justify-center text-xs">
                    ⚡
                  </div>
                  <div>
                    <div className="font-bold text-white flex items-center gap-2">
                      <span>{log.module} - {log.action}</span>
                      <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                        بواسطة: {log.userName}
                      </span>
                    </div>
                    <div className="text-slate-400 text-[11px] mt-0.5">{log.details}</div>
                  </div>
                </div>
                <div className="font-mono text-slate-500 text-[11px]">{log.timestamp.slice(0, 19).replace('T', ' ')}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <form
            onSubmit={handleCreateUser}
            className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl p-6 text-right space-y-4 my-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-amber-400" />
                إضافة موظف داخل مساحتك الخاصة
              </h4>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">اسم الدخول المختصر *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: cashier1"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">الاسم الكامل *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: أحمد محمد"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">الدور الوظيفي والصلاحيات</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="CASHIER">كاشير نقاط البيع</option>
                  <option value="ACCOUNTANT">محاسب عام</option>
                  <option value="WAREHOUSE_MANAGER">أمين مستودع</option>
                  <option value="ADMIN">مدير فرعي</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">رمز PIN</label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="1234"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-500 text-center tracking-widest"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-xs cursor-pointer shadow-lg shadow-amber-600/20"
              >
                حفظ وإضافة
              </button>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Permissions Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl p-6 text-right space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  مصفوفة صلاحيات: {selectedUser.fullName}
                </h4>
                <span className="text-[10px] text-amber-400">الدور: {selectedUser.role}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 max-h-80 overflow-y-auto p-1">
              {[
                { key: 'canView', label: 'صلاحية استعراض الشاشات والبيانات' },
                { key: 'canAdd', label: 'صلاحية إنشاء وإضافة فواتير وسندات جديدة' },
                { key: 'canEdit', label: 'صلاحية تعديل السجلات والبيانات' },
                { key: 'canDelete', label: 'صلاحية حذف الفواتير والمستندات' },
                { key: 'canPrint', label: 'صلاحية الطباعة وتصدير PDF والمعاينة' },
                { key: 'canViewReports', label: 'صلاحية الاطلاع على القوائم المالية والأرباح' },
                { key: 'canManageSettings', label: 'صلاحية إدارة إعدادات النظام' },
                { key: 'canResetDatabase', label: 'صلاحية التصفير الشامل والنسخ الاحتياطي' },
              ].map((perm) => (
                <label
                  key={perm.key}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-800 cursor-pointer hover:border-slate-700"
                >
                  <span className="text-xs font-bold text-slate-200">{perm.label}</span>
                  <input
                    type="checkbox"
                    checked={Boolean(selectedUser.permissions[perm.key as keyof UserPermission])}
                    onChange={(e) => {
                      const updatedPerms = {
                        ...selectedUser.permissions,
                        [perm.key]: e.target.checked,
                      };
                      setSelectedUser({ ...selectedUser, permissions: updatedPerms });
                    }}
                    className="w-4 h-4 accent-amber-500 rounded"
                  />
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  handleUpdatePermissions(selectedUser.id, selectedUser.permissions);
                  setSelectedUser(null);
                }}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-lg"
              >
                حفظ الصلاحيات
              </button>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
