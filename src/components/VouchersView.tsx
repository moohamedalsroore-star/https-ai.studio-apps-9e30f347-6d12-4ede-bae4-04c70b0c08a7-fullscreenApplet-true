import React, { useState } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  Printer,
  ArrowDownLeft,
  ArrowUpRight,
  DollarSign,
  X,
  FileCheck,
  Trash2,
} from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import { PaymentMethod, Voucher, VoucherType } from '../types/accounting';
import { tafqeet } from '../utils/tafqeet';

export const VouchersView: React.FC = () => {
  const {
    vouchers,
    accounts,
    settings,
    createVoucher,
    deleteVoucher,
    openDeleteConfirm,
    showToast,
  } = useAccounting();

  const [activeTab, setActiveTab] = useState<'ALL' | 'RECEIPT' | 'PAYMENT'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [previewVoucher, setPreviewVoucher] = useState<Voucher | null>(null);

  // Form state
  const [voucherType, setVoucherType] = useState<VoucherType>('RECEIPT');
  const [amount, setAmount] = useState<number>(0);
  const [cashAccountId, setCashAccountId] = useState<string>('acc-1101');
  const [partyAccountId, setPartyAccountId] = useState<string>('acc-1105');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [description, setDescription] = useState('');

  const filteredVouchers = vouchers.filter((v) => {
    const matchesTab = activeTab === 'ALL' || v.type === activeTab;
    const matchesSearch =
      v.voucherNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.partyAccountName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const totalReceipts = vouchers
    .filter((v) => v.type === 'RECEIPT')
    .reduce((sum, v) => sum + v.amount, 0);

  const totalPayments = vouchers
    .filter((v) => v.type === 'PAYMENT')
    .reduce((sum, v) => sum + v.amount, 0);

  const handleOpenCreate = (type: VoucherType) => {
    setVoucherType(type);
    setAmount(0);
    setCashAccountId('acc-1101');
    setPartyAccountId(type === 'RECEIPT' ? 'acc-1105' : 'acc-2101');
    setDescription(type === 'RECEIPT' ? 'تحصيل دفعة نقدية' : 'سداد دفعة نقدية');
    setShowCreateModal(true);
  };

  const handleSaveVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;

    createVoucher({
      type: voucherType,
      accountId: cashAccountId,
      partyAccountId,
      amount: Number(amount),
      paymentMethod,
      referenceNumber,
      description,
    });

    showToast('تم حفظ وترحيل السند المالي بنجاح ✓', 'success');
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <CreditCard className="w-7 h-7 text-emerald-400" />
            سندات القبض وسندات الصرف (الخزينة والبنوك)
          </h2>
          <p className="text-sm text-slate-400">
            إدارة المقبوضات والمدفوعات النقدية والبنكية مع إنشاء قيود يومية متوازنة تلقائياً وتفقيط المبالغ
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleOpenCreate('RECEIPT')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 cursor-pointer transition-all"
          >
            <ArrowDownLeft className="w-4 h-4" />
            سند قبض جديد
          </button>
          <button
            onClick={() => handleOpenCreate('PAYMENT')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-lg shadow-amber-600/20 cursor-pointer transition-all"
          >
            <ArrowUpRight className="w-4 h-4" />
            سند صرف جديد
          </button>
        </div>
      </div>

      {/* 2 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400">إجمالي سندات القبض (مقبوضات نقدية)</span>
            <div className="font-mono-num text-2xl font-black text-emerald-400 mt-2">
              {totalReceipts.toLocaleString('en-US', { minimumFractionDigits: 2 })}{' '}
              <span className="text-xs font-normal text-slate-400">{settings.baseCurrency}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <ArrowDownLeft className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400">إجمالي سندات الصرف (مدفوعات ومصاريف)</span>
            <div className="font-mono-num text-2xl font-black text-amber-400 mt-2">
              {totalPayments.toLocaleString('en-US', { minimumFractionDigits: 2 })}{' '}
              <span className="text-xs font-normal text-slate-400">{settings.baseCurrency}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
            <ArrowUpRight className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'ALL' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            جميع السندات
          </button>
          <button
            onClick={() => setActiveTab('RECEIPT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'RECEIPT' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            سندات القبض
          </button>
          <button
            onClick={() => setActiveTab('PAYMENT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'PAYMENT' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            سندات الصرف
          </button>
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ابحث برقم السند، الحساب، أو البيان..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-3 pr-9 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Vouchers Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900 shadow-xl">
        <table className="w-full text-right text-sm">
          <thead className="bg-slate-800/90 text-slate-300 font-bold text-xs uppercase tracking-wider border-b border-slate-700">
            <tr>
              <th className="py-3 px-4">رقم السند</th>
              <th className="py-3 px-4">التاريخ</th>
              <th className="py-3 px-4">نوع السند</th>
              <th className="py-3 px-4">الصندوق / البنك</th>
              <th className="py-3 px-4">الطرف الآخر (العميل / المورد / المصروف)</th>
              <th className="py-3 px-4 text-center">المبلغ</th>
              <th className="py-3 px-4">البيان</th>
              <th className="py-3 px-4 text-center">القيد المرتبط</th>
              <th className="py-3 px-4 text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {filteredVouchers.map((v) => (
              <tr key={v.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3 px-4 font-mono-num font-bold text-white text-xs">
                  {v.voucherNumber}
                </td>
                <td className="py-3 px-4 font-mono-num text-xs text-slate-400">{v.date}</td>
                <td className="py-3 px-4">
                  {v.type === 'RECEIPT' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <ArrowDownLeft className="w-3 h-3" />
                      سند قبض
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <ArrowUpRight className="w-3 h-3" />
                      سند صرف
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-xs font-semibold text-slate-200">{v.accountName}</td>
                <td className="py-3 px-4 text-xs font-bold text-white">{v.partyAccountName}</td>
                <td className="py-3 px-4 text-center font-mono-num font-extrabold text-sm">
                  <span className={v.type === 'RECEIPT' ? 'text-emerald-400' : 'text-amber-400'}>
                    {v.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}{' '}
                    <span className="text-[10px] font-normal text-slate-400">{settings.baseCurrency}</span>
                  </span>
                </td>
                <td className="py-3 px-4 text-xs text-slate-400">{v.description}</td>
                <td className="py-3 px-4 text-center font-mono-num text-xs text-emerald-400">
                  {v.journalEntryId ? 'مرحل آلياً' : '-'}
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      onClick={() => setPreviewVoucher(v)}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                      title="طباعة / تصدير PDF"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        openDeleteConfirm({
                          title: 'تأكيد حذف السند المالي',
                          itemName: `السند رقم: ${v.voucherNumber} (${v.type === 'RECEIPT' ? 'قبض' : 'صرف'})`,
                          message: `المبلغ: ${v.amount.toFixed(2)} ${settings.baseCurrency}. سيتم التراجع عن أثر الحسابات المالية المرتبطة وإلغاء القيد.`,
                          onConfirm: () => deleteVoucher(v.id),
                        });
                      }}
                      className="p-1.5 rounded-lg bg-red-950/40 text-red-400 hover:text-red-300 hover:bg-red-900/60 transition-colors cursor-pointer"
                      title="حذف السند"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CREATE VOUCHER MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className={`p-4 border-b flex items-center justify-between ${
              voucherType === 'RECEIPT' ? 'bg-emerald-950/40 border-emerald-500/30' : 'bg-amber-950/40 border-amber-500/30'
            }`}>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                {voucherType === 'RECEIPT' ? 'إنشاء سند قبض نقدية / بنك' : 'إنشاء سند صرف نقدية / بنك'}
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white text-xl font-bold p-1 cursor-pointer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveVoucher} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">نوع السند</label>
                  <select
                    value={voucherType}
                    onChange={(e) => setVoucherType(e.target.value as VoucherType)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                  >
                    <option value="RECEIPT">سند قبض (إيداع)</option>
                    <option value="PAYMENT">سند صرف (سحب)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">طريقة الدفع</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                  >
                    <option value="CASH">نقداً</option>
                    <option value="BANK">شيك / حوالة بنكية</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-400 mb-1">
                  المبلغ المالي ({settings.baseCurrency})
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={amount || ''}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-lg font-bold text-white font-mono-num"
                />
                {amount > 0 && (
                  <div className="text-[11px] text-slate-400 mt-1 italic">
                    {tafqeet(amount, settings.baseCurrency, 'هللة')}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {voucherType === 'RECEIPT' ? 'إلى حساب (الصندوق/البنك)' : 'من حساب (الصندوق/البنك)'}
                  </label>
                  <select
                    value={cashAccountId}
                    onChange={(e) => setCashAccountId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                  >
                    {accounts
                      .filter((a) => a.parentCode === '11' && a.code !== '1105' && a.code !== '1106')
                      .map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.nameAr}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {voucherType === 'RECEIPT' ? 'من حساب (العميل/الإيراد)' : 'لصالح حساب (المورد/المصروف)'}
                  </label>
                  <select
                    value={partyAccountId}
                    onChange={(e) => setPartyAccountId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                  >
                    {accounts
                      .filter((a) => a.level >= 2 && !a.code.startsWith('1101') && !a.code.startsWith('1102'))
                      .map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.code} - {a.nameAr}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">البيان والشرح</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm cursor-pointer shadow-lg shadow-emerald-600/30"
                >
                  حفظ وترحيل السند
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VOUCHER PREVIEW MODAL */}
      {previewVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto no-print-bg">
          <div className="bg-white text-slate-900 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden print-only-wrapper">
            <div className="p-4 bg-slate-800 text-white flex items-center justify-between no-print">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">معاينة السند: {previewVoucher.voucherNumber}</span>
                <span className="text-[10px] text-emerald-300 hidden sm:inline">💡 اختر "حفظ بتنسيق PDF"</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-600/30"
                >
                  <Printer className="w-4 h-4" />
                  طباعة / حفظ PDF
                </button>
                <button
                  onClick={() => setPreviewVoucher(null)}
                  className="p-1 rounded-xl text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-8 text-right printable-card text-xs space-y-4">
              <div className="text-center border-b-2 border-slate-900 pb-3">
                <h3 className="text-lg font-black">{settings.companyName}</h3>
                <div className="font-bold text-base text-slate-900 mt-2">
                  {previewVoucher.type === 'RECEIPT' ? 'سند قبض مالي (Receipt Voucher)' : 'سند صرف مالي (Payment Voucher)'}
                </div>
                <div className="text-xs text-slate-600 font-mono-num mt-1">
                  رقم السند: {previewVoucher.voucherNumber} | التاريخ: {previewVoucher.date}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-100 border border-slate-300 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-700">المبلغ بالأرقام:</span>
                  <span className="font-mono-num font-extrabold text-base text-slate-900">
                    {previewVoucher.amount.toFixed(2)} {settings.baseCurrency}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-slate-700">المبلغ كتابة:</span>{' '}
                  <span className="font-semibold text-slate-900">
                    {tafqeet(previewVoucher.amount, settings.baseCurrency, 'هللة')}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-slate-700">
                    {previewVoucher.type === 'RECEIPT' ? 'استلمنا من:' : 'يصرف للمكرم:'}
                  </span>{' '}
                  <span className="font-bold text-slate-900">{previewVoucher.partyAccountName}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-700">الحساب المالي:</span>{' '}
                  <span className="text-slate-800">{previewVoucher.accountName}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-700">وذلك عن (البيان):</span>{' '}
                  <span className="text-slate-800">{previewVoucher.description}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-8 text-center text-[11px] text-slate-700">
                <div className="border-t border-slate-300 pt-2 font-bold">المستلم</div>
                <div className="border-t border-slate-300 pt-2 font-bold">المحاسب المسؤول</div>
                <div className="border-t border-slate-300 pt-2 font-bold">المدير المالي</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
