import React, { useState } from 'react';
import {
  Users,
  ShieldCheck,
  UserPlus,
  Key,
  Lock,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  Shield,
  Save,
  RotateCcw,
} from 'lucide-react';
import { AppUser, UserRole, UserPermission, AuditLogEntry } from '../../types/settings';
import { INITIAL_APP_USERS } from '../../utils/settingsDefaults';

interface UsersPermissionsTabProps {
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const UsersPermissionsTab: React.FC<UsersPermissionsTabProps> = ({ showToast }) => {
  const [users, setUsers] = useState<AppUser[]>(() => {
    const saved = localStorage.getItem('smart_accountant_pro_users');
    return saved ? JSON.parse(saved) : INITIAL_APP_USERS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    const saved = localStorage.getItem('smart_accountant_pro_audit_logs');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'log-1',
        timestamp: '2026-10-29 15:40:12',
        userId: 'user-admin',
        userName: 'المدير العام',
        action: 'تسجيل دخول ناجح',
        details: 'فتح التطبيق محلياً بدون إنترنت',
      },
      {
        id: 'log-2',
        timestamp: '2026-10-29 15:35:00',
        userId: 'user-admin',
        userName: 'المدير العام',
        action: 'تحديث إعدادات النظام',
        details: 'حفظ إعدادات الهوية والطباعة',
      },
      {
        id: 'log-3',
        timestamp: '2026-10-29 14:15:30',
        userId: 'user-cashier',
        userName: 'كاشير نقطة البيع',
        action: 'إصدار فاتورة نقدية',
        details: 'فاتورة مبيعات #INV-1002',
      },
    ];
  });

  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New user form
  const [newUsername, setNewUsername] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('CASHIER');
  const [newPin, setNewPin] = useState('0000');

  const saveUsersList = (updatedUsers: AppUser[]) => {
    setUsers(updatedUsers);
    localStorage.setItem('smart_accountant_pro_users', JSON.stringify(updatedUsers));
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
      lastLogin: 'لم يسجل دخول بعد',
    };

    const updated = [...users, newUser];
    saveUsersList(updated);
    setShowAddModal(false);
    setNewUsername('');
    setNewFullName('');
    setNewPin('0000');
    showToast(`تم إنشاء حساب المستخدم «${newUser.fullName}» بنجاح ✓`, 'success');
  };

  const handleToggleUserStatus = (userId: string) => {
    const updated = users.map((u) => {
      if (u.id === userId) {
        if (u.role === 'ADMIN' && users.filter((x) => x.role === 'ADMIN' && x.isActive).length <= 1) {
          showToast('لا يمكن تعطيل حساب المدير الرئيسي الوحيد في النظام!', 'error');
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
            إدارة المستخدمين والصلاحيات وسجل الأمان
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            إدارة حسابات الكاشير والمحاسبين، تحديد صلاحيات العمليات، ومتابعة سجل العمليات
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-black text-xs cursor-pointer shadow-md shadow-amber-600/20 active:scale-95 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>إضافة مستخدم جديد</span>
        </button>
      </div>

      {/* 1. Users Table */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h4 className="text-xs font-black text-amber-300">قائمة مستخدمي النظام</h4>

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
                        title="تعديل مصفوفة الصلاحيات"
                      >
                        الصلاحيات
                      </button>
                      {u.role !== 'ADMIN' && (
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-1 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-500/30 transition-colors cursor-pointer"
                          title="حذف المستخدم"
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

      {/* 2. Audit Log (سجل العمليات والأمان) */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-black text-white">سجل العمليات والأمان التلقائي (Audit Trail)</h4>
          </div>
          <span className="text-[10px] text-slate-400">تسجيل محلي دقيق لجميع حركات النظام</span>
        </div>

        <div className="space-y-2">
          {auditLogs.map((log) => (
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
                    <span>{log.action}</span>
                    <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                      بواسطة: {log.userName}
                    </span>
                  </div>
                  <div className="text-slate-400 text-[11px] mt-0.5">{log.details}</div>
                </div>
              </div>
              <div className="font-mono text-slate-500 text-[11px]">{log.timestamp}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <form
            onSubmit={handleCreateUser}
            className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl p-6 text-right space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-amber-400" />
                إنشاء حساب مستخدم جديد
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
                <label className="block text-xs font-bold text-slate-300 mb-1">اسم المستخدم (للدخول) *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: cashier1 أو ahmed"
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
                  placeholder="مثال: أحمد محمد - كاشير فرع العليا"
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
                  <option value="CASHIER">كاشير نقاط البيع (فواتير وإصدار فقط)</option>
                  <option value="ACCOUNTANT">محاسب عام (قيود وسندات وتقارير)</option>
                  <option value="WAREHOUSE_MANAGER">أمين مستودع (سندات المخزن والتحويل)</option>
                  <option value="ADMIN">مدير عام (كافة الصلاحيات والإعدادات)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">رمز الدخول السريع (PIN 4 أرقام)</label>
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
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-xs cursor-pointer shadow-lg shadow-amber-600/20 active:scale-95 transition-all"
              >
                تأكيد وإنشاء الحساب
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
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl p-6 text-right space-y-4">
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
                { key: 'canView', label: 'صلاحية استعراض الشاشات والبيانات (View)' },
                { key: 'canAdd', label: 'صلاحية إنشاء وإضافة فواتير وسندات جديدة (Add)' },
                { key: 'canEdit', label: 'صلاحية تعديل السجلات والبيانات (Edit)' },
                { key: 'canDelete', label: 'صلاحية حذف الفواتير والمستندات (Delete)' },
                { key: 'canPrint', label: 'صلاحية الطباعة وتصدير PDF (Print & Export)' },
                { key: 'canViewReports', label: 'صلاحية الاطلاع على القوائم المالية والأرباح (Financial Reports)' },
                { key: 'canManageSettings', label: 'صلاحية إدارة إعدادات النظام وقواعد البيانات (Settings)' },
                { key: 'canResetDatabase', label: 'صلاحية التصفير الشامل والنسخ الاحتياطي (Danger Zone)' },
              ].map((perm) => (
                <label
                  key={perm.key}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-800 cursor-pointer hover:border-slate-700"
                >
                  <span className="text-xs font-bold text-slate-200">{perm.label}</span>
                  <input
                    type="checkbox"
                    checked={(selectedUser.permissions as any)[perm.key]}
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
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-lg active:scale-95 transition-all"
              >
                حفظ الصلاحيات المحدثة
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
