import React, { useState } from 'react';
import {
  FolderTree,
  Plus,
  Search,
  ChevronDown,
  ChevronLeft,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Layers,
  CheckCircle,
  Trash2,
  X,
  ShieldCheck,
} from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import { Account, AccountCategory } from '../types/accounting';

export const ChartOfAccountsView: React.FC = () => {
  const {
    accounts,
    settings,
    addAccount,
    deleteAccount,
    openDeleteConfirm,
    showToast,
  } = useAccounting();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AccountCategory | 'ALL'>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAccForm, setNewAccForm] = useState({
    code: '',
    nameAr: '',
    nameEn: '',
    category: 'EXPENSE' as AccountCategory,
    level: 3,
    parentCode: '52',
    currency: settings.baseCurrency,
    isDebitNormal: true,
  });
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    '1': true,
    '11': true,
    '2': true,
    '3': true,
    '4': true,
    '5': true,
  });

  const toggleNode = (code: string) => {
    setExpandedNodes((prev) => ({ ...prev, [code]: !prev[code] }));
  };

  const categories: { key: AccountCategory | 'ALL'; label: string }[] = [
    { key: 'ALL', label: 'جميع الحسابات' },
    { key: 'ASSET', label: '1 - الأصول' },
    { key: 'LIABILITY', label: '2 - الخصوم' },
    { key: 'EQUITY', label: '3 - حقوق الملكية' },
    { key: 'REVENUE', label: '4 - الإيرادات' },
    { key: 'EXPENSE', label: '5 - المصروفات' },
  ];

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccForm.code || !newAccForm.nameAr) return;
    addAccount({
      code: newAccForm.code,
      nameAr: newAccForm.nameAr,
      nameEn: newAccForm.nameEn || newAccForm.nameAr,
      category: newAccForm.category,
      level: newAccForm.level,
      parentCode: newAccForm.parentCode,
      currency: newAccForm.currency || settings.baseCurrency,
      isDebitNormal: newAccForm.isDebitNormal,
    });
    showToast('تمت إضافة الحساب بالدليل بنجاح ✓', 'success');
    setShowAddModal(false);
    setNewAccForm({
      code: '',
      nameAr: '',
      nameEn: '',
      category: 'EXPENSE',
      level: 3,
      parentCode: '52',
      currency: settings.baseCurrency,
      isDebitNormal: true,
    });
  };

  const getCategoryBadge = (cat: AccountCategory) => {
    switch (cat) {
      case 'ASSET':
        return <span className="text-emerald-400 font-bold text-[11px]">أصول (مدين)</span>;
      case 'LIABILITY':
        return <span className="text-amber-400 font-bold text-[11px]">خصوم (دائن)</span>;
      case 'EQUITY':
        return <span className="text-cyan-400 font-bold text-[11px]">حقوق ملكية (دائن)</span>;
      case 'REVENUE':
        return <span className="text-purple-400 font-bold text-[11px]">إيرادات (دائن)</span>;
      case 'EXPENSE':
        return <span className="text-red-400 font-bold text-[11px]">مصروفات (مدين)</span>;
    }
  };

  const filteredAccounts = accounts
    .filter((a) => {
      const matchesSearch =
        a.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.code.includes(searchQuery);
      const matchesCategory = selectedCategory === 'ALL' || a.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => a.code.localeCompare(b.code));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <FolderTree className="w-7 h-7 text-emerald-400" />
            دليل وشجرة الحسابات العامة (Chart of Accounts)
          </h2>
          <p className="text-sm text-slate-400">
            الهيكل المحاسبي الشامل للمؤسسة، تصنيف الأصول والخصوم وحقوق الملكية والإيرادات والمصروفات مع الأرصدة اللحظية
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4" />
          إضافة حساب فرعي جديد
        </button>
      </div>

      {/* Categories Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((c) => (
          <button
            key={c.key}
            onClick={() => setSelectedCategory(c.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedCategory === c.key
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="p-3 bg-slate-800/60 border border-slate-700 rounded-xl flex items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ابحث بكود الحساب أو الاسم..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-3 pr-9 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div className="text-xs text-slate-400 font-mono-num">
          إجمالي الحسابات: <span className="font-bold text-white">{filteredAccounts.length}</span>
        </div>
      </div>

      {/* Interactive Hierarchical Accounts Tree / Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
        <table className="w-full text-right text-sm">
          <thead className="bg-slate-800/90 text-slate-300 font-bold text-xs uppercase tracking-wider border-b border-slate-700">
            <tr>
              <th className="py-3 px-4">كود الحساب</th>
              <th className="py-3 px-4">اسم الحساب</th>
              <th className="py-3 px-4">التصنيف المحاسبي</th>
              <th className="py-3 px-4 text-center">المستوى</th>
              <th className="py-3 px-4 text-center">طبيعة الحساب</th>
              <th className="py-3 px-4 text-center">الرصيد الفعلي الحالي</th>
              <th className="py-3 px-4 text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {filteredAccounts.map((acc) => {
              const paddingLevel = (acc.level - 1) * 24; // Visual indentation for tree hierarchy
              const isMain = acc.level === 1;
              const isSubMain = acc.level === 2;

              return (
                <tr
                  key={acc.id}
                  className={`hover:bg-slate-800/40 transition-colors ${
                    isMain
                      ? 'bg-slate-800/60 font-black text-white'
                      : isSubMain
                      ? 'bg-slate-800/20 font-bold text-slate-100'
                      : 'text-slate-300'
                  }`}
                >
                  <td className="py-3 px-4 font-mono-num font-bold text-emerald-400">
                    {acc.code}
                  </td>
                  <td className="py-3 px-4">
                    <div
                      className="flex items-center gap-2"
                      style={{ paddingRight: `${paddingLevel}px` }}
                    >
                      {acc.level < 3 ? (
                        <div className="w-4 h-4 rounded bg-slate-700 flex items-center justify-center text-[10px] text-white">
                          📁
                        </div>
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      )}
                      <span className={isMain ? 'text-base font-black' : ''}>{acc.nameAr}</span>
                      <span className="text-slate-500 text-xs font-normal">({acc.nameEn})</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">{getCategoryBadge(acc.category)}</td>
                  <td className="py-3 px-4 text-center font-mono-num text-xs text-slate-400">
                    مستوى {acc.level}
                  </td>
                  <td className="py-3 px-4 text-center text-xs">
                    {acc.isDebitNormal ? (
                      <span className="text-emerald-400 font-semibold">طبيعة مدينة</span>
                    ) : (
                      <span className="text-cyan-400 font-semibold">طبيعة دائنة</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center font-mono-num font-extrabold text-base">
                    <span className={acc.balance < 0 ? 'text-red-400' : 'text-white'}>
                      {acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}{' '}
                      <span className="text-xs font-normal text-slate-400">{settings.baseCurrency}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {!acc.isSystemAccount ? (
                      <button
                        onClick={() => {
                          openDeleteConfirm({
                            title: 'تأكيد حذف حساب من الدليل',
                            itemName: `الحساب: ${acc.nameAr} (${acc.code})`,
                            message: `الرصيد الفعلي الحالي: ${acc.balance.toFixed(2)} ${settings.baseCurrency}. هل أنت متأكد من حذف هذا الحساب؟`,
                            onConfirm: () => deleteAccount(acc.id),
                          });
                        }}
                        className="p-1.5 rounded-lg bg-red-950/40 text-red-400 hover:text-red-300 hover:bg-red-900/60 transition-colors cursor-pointer"
                        title="حذف الحساب"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-medium px-2 py-0.5 rounded bg-slate-800/80">
                        نظامي
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Sub-Account Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                إضافة حساب فرعي جديد بالدليل
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAccount} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">كود الحساب الجديد *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: 5208"
                    value={newAccForm.code}
                    onChange={(e) => setNewAccForm({ ...newAccForm, code: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono-num"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">كود الحساب الأب</label>
                  <input
                    type="text"
                    placeholder="مثال: 52"
                    value={newAccForm.parentCode}
                    onChange={(e) => setNewAccForm({ ...newAccForm, parentCode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono-num"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">اسم الحساب بالعربية *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: مصروفات تدريب وتطوير الكوادر"
                  value={newAccForm.nameAr}
                  onChange={(e) => setNewAccForm({ ...newAccForm, nameAr: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">اسم الحساب بالإنجليزية (اختياري)</label>
                <input
                  type="text"
                  placeholder="Training & Development Expenses"
                  value={newAccForm.nameEn}
                  onChange={(e) => setNewAccForm({ ...newAccForm, nameEn: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">التصنيف المحاسبي</label>
                  <select
                    value={newAccForm.category}
                    onChange={(e) => setNewAccForm({ ...newAccForm, category: e.target.value as AccountCategory })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="ASSET">1 - الأصول</option>
                    <option value="LIABILITY">2 - الخصوم</option>
                    <option value="EQUITY">3 - حقوق الملكية</option>
                    <option value="REVENUE">4 - الإيرادات</option>
                    <option value="EXPENSE">5 - المصروفات</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">طبيعة الحساب</label>
                  <select
                    value={newAccForm.isDebitNormal ? 'DEBIT' : 'CREDIT'}
                    onChange={(e) => setNewAccForm({ ...newAccForm, isDebitNormal: e.target.value === 'DEBIT' })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="DEBIT">مدين طبيعي (Debit)</option>
                    <option value="CREDIT">دائن طبيعي (Credit)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer shadow-lg shadow-emerald-600/30"
                >
                  حفظ الحساب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
