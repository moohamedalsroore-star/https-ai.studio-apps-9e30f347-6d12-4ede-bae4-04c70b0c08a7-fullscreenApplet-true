import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  CheckCircle,
  AlertCircle,
  Filter,
  Trash2,
  PlusCircle,
  Calendar,
  Layers,
  Printer,
  X,
} from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import { JournalEntry, JournalSourceType } from '../types/accounting';
import { tafqeet } from '../utils/tafqeet';

export const JournalView: React.FC = () => {
  const {
    journalEntries,
    accounts,
    settings,
    createManualJournalEntry,
    deleteJournalEntry,
    openDeleteConfirm,
    showToast,
  } = useAccounting();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterSource, setFilterSource] = useState<string>('ALL');
  const [showManualModal, setShowManualModal] = useState(false);
  const [previewEntry, setPreviewEntry] = useState<JournalEntry | null>(null);

  // Manual entry modal state
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [entryDescription, setEntryDescription] = useState('');
  const [lines, setLines] = useState<
    { accountId: string; debit: number; credit: number; memo: string }[]
  >([
    { accountId: accounts[0]?.id || '', debit: 0, credit: 0, memo: '' },
    { accountId: accounts[1]?.id || '', debit: 0, credit: 0, memo: '' },
  ]);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Filter journal entries
  const filteredEntries = journalEntries.filter((e) => {
    const matchesSearch =
      e.entryNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.lines.some((l) => l.accountName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSource = filterSource === 'ALL' || e.sourceType === filterSource;

    return matchesSearch && matchesSource;
  });

  const totalDebits = lines.reduce((s, l) => s + (Number(l.debit) || 0), 0);
  const totalCredits = lines.reduce((s, l) => s + (Number(l.credit) || 0), 0);
  const difference = Math.abs(totalDebits - totalCredits);
  const isFormBalanced = difference < 0.01 && totalDebits > 0;

  const handleAddLine = () => {
    setLines([
      ...lines,
      {
        accountId: accounts[0]?.id || '',
        debit: 0,
        credit: 0,
        memo: '',
      },
    ]);
  };

  const handleRemoveLine = (index: number) => {
    if (lines.length <= 2) return;
    setLines(lines.filter((_, i) => i !== index));
  };

  const handleSaveManualEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormBalanced) {
      setValidationError('القيد غير متوازن! يجب أن يتساوى إجمالي المدين مع إجمالي الدائن.');
      return;
    }

    const res = createManualJournalEntry({
      date: entryDate,
      description: entryDescription || 'قيد تسوية يدوي عام',
      lines,
    });

    if (res.success) {
      setShowManualModal(false);
      setEntryDescription('');
      setLines([
        { accountId: accounts[0]?.id || '', debit: 0, credit: 0, memo: '' },
        { accountId: accounts[1]?.id || '', debit: 0, credit: 0, memo: '' },
      ]);
      setValidationError(null);
    } else {
      setValidationError(res.message);
    }
  };

  const getSourceBadge = (type: JournalSourceType) => {
    switch (type) {
      case 'SALES_INVOICE':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            مبيعات آلية
          </span>
        );
      case 'PURCHASE_INVOICE':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            مشتريات آلية
          </span>
        );
      case 'RECEIPT_VOUCHER':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            سند قبض
          </span>
        );
      case 'PAYMENT_VOUCHER':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            سند صرف
          </span>
        );
      case 'PERIOD_CLOSING':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-teal-500/10 text-teal-400 border border-teal-500/20">
            إقفال سنوي
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-700/60 text-slate-300">
            قيد يدوي
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-emerald-400" />
            دفتر قيود اليومية العامة (General Journal)
          </h2>
          <p className="text-sm text-slate-400">
            سجل القيود المحاسبية المزدوجة المتوازنة، الترحيل الفوري للأستاذ العام، مع إمكانية إضافة قيود تسوية يدوية
          </p>
        </div>

        <div className="flex items-center gap-3 no-print">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 shadow cursor-pointer transition-all"
            title="طباعة أو تصدير دفتر القيود اليومية كملف PDF"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            طباعة / تصدير دفتر القيود PDF
          </button>
          <button
            onClick={() => {
              setValidationError(null);
              setShowManualModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            إضافة قيد تسوية يدوي
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700">
        <div className="flex items-center gap-3 flex-1 min-w-[260px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ابحث برقم القيد، البيان، أو اسم الحساب..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-3 pr-9 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <select
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">جميع المصادر</option>
            <option value="SALES_INVOICE">فواتير مبيعات</option>
            <option value="PURCHASE_INVOICE">فواتير مشتريات</option>
            <option value="RECEIPT_VOUCHER">سندات قبض</option>
            <option value="PAYMENT_VOUCHER">سندات صرف</option>
            <option value="MANUAL">قيود يدوية وتسويات</option>
          </select>
        </div>

        <div className="text-xs text-slate-400">
          إجمالي القيود بالدفتر: <span className="font-bold text-white">{filteredEntries.length}</span>
        </div>
      </div>

      {/* Journal Entries Cards/Table */}
      <div className="space-y-4">
        {filteredEntries.map((entry) => (
          <div
            key={entry.id}
            className="rounded-2xl border border-slate-800 bg-slate-900 shadow-xl overflow-hidden hover:border-slate-700 transition-all"
          >
            {/* Entry Header */}
            <div className="p-3.5 bg-slate-800/80 border-b border-slate-700/80 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <span className="font-mono-num font-bold text-emerald-400 text-sm bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-700">
                  {entry.entryNumber}
                </span>
                <span className="text-slate-400 font-mono-num">{entry.date}</span>
                {getSourceBadge(entry.sourceType)}
              </div>

              <div className="flex items-center gap-3">
                <div className="font-semibold text-slate-200">{entry.description}</div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-400 font-bold">
                  <CheckCircle className="w-3.5 h-3.5" />
                  مرحل ومتوازن (مدين = دائن)
                </div>
                <button
                  onClick={() => setPreviewEntry(entry)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                  title="معاينة وطباعة سند القيد كملف PDF"
                >
                  <Printer className="w-3.5 h-3.5 text-emerald-400" />
                </button>
                <button
                  onClick={() => {
                    openDeleteConfirm({
                      title: 'تأكيد حذف القيد المحاسبي',
                      itemName: `القيد اليومي: ${entry.entryNumber}`,
                      message: `البيان: ${entry.description}. سيتم حذف هذا القيد وإعادة احتساب أرصدة ميزان المراجعة والحسابات فوراً.`,
                      onConfirm: () => deleteJournalEntry(entry.id),
                    });
                  }}
                  className="p-1.5 rounded-lg bg-red-950/40 text-red-400 hover:text-red-300 hover:bg-red-900/60 transition-colors cursor-pointer"
                  title="حذف القيد اليومي"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Entry Lines Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800/80">
                  <tr>
                    <th className="py-2.5 px-4">كود الحساب</th>
                    <th className="py-2.5 px-4">اسم الحساب</th>
                    <th className="py-2.5 px-4">البيان / الشرح التفصيلي</th>
                    <th className="py-2.5 px-4 text-center font-bold text-emerald-400">مدين (Debit)</th>
                    <th className="py-2.5 px-4 text-center font-bold text-cyan-400">دائن (Credit)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono-num">
                  {entry.lines.map((line) => (
                    <tr key={line.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-2.5 px-4 text-emerald-400/90 font-bold">{line.accountCode}</td>
                      <td className="py-2.5 px-4 font-sans font-semibold text-white">
                        {line.accountName}
                      </td>
                      <td className="py-2.5 px-4 font-sans text-slate-400">{line.memo || '-'}</td>
                      <td className="py-2.5 px-4 text-center font-bold text-white">
                        {line.debit > 0 ? line.debit.toFixed(2) : '-'}
                      </td>
                      <td className="py-2.5 px-4 text-center font-bold text-white">
                        {line.credit > 0 ? line.credit.toFixed(2) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-950/90 font-mono-num font-extrabold text-xs border-t border-slate-800">
                  <tr>
                    <td colSpan={3} className="py-2 px-4 text-left font-sans text-slate-400">
                      إجمالي القيد المتوازن ({settings.baseCurrency}):
                    </td>
                    <td className="py-2 px-4 text-center text-emerald-400">
                      {entry.totalDebit.toFixed(2)}
                    </td>
                    <td className="py-2 px-4 text-center text-cyan-400">
                      {entry.totalCredit.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: Add Manual Adjusting Journal Entry */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-6">
            <div className="p-4 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-400" />
                إضافة قيد يومية يدوي / قيد تسوية
              </h3>
              <button
                onClick={() => setShowManualModal(false)}
                className="text-slate-400 hover:text-white text-xl font-bold p-1 cursor-pointer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveManualEntry} className="p-6 space-y-6">
              {validationError && (
                <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/50 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">تاريخ القيد</label>
                  <input
                    type="date"
                    required
                    value={entryDate}
                    onChange={(e) => setEntryDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-mono-num"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">شرح القيد العام</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: إثبات مصاريف عمومية ونثريات نقدية..."
                    value={entryDescription}
                    onChange={(e) => setEntryDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white"
                  />
                </div>
              </div>

              {/* Lines Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm">أطراف القيد (المدين والدائن)</h4>
                  <button
                    type="button"
                    onClick={handleAddLine}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs cursor-pointer border border-emerald-500/30"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    إضافة طرف قيد آخر
                  </button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-800 text-slate-300">
                      <tr>
                        <th className="py-2.5 px-3">الحساب</th>
                        <th className="py-2.5 px-3 text-center">مدين (Debit)</th>
                        <th className="py-2.5 px-3 text-center">دائن (Credit)</th>
                        <th className="py-2.5 px-3">البيان الفرعي</th>
                        <th className="py-2.5 px-3 text-center">حذف</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {lines.map((l, idx) => (
                        <tr key={idx} className="bg-slate-900/50">
                          <td className="py-2 px-3">
                            <select
                              value={l.accountId}
                              onChange={(e) => {
                                const updated = [...lines];
                                updated[idx].accountId = e.target.value;
                                setLines(updated);
                              }}
                              className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs text-white"
                            >
                              {accounts
                                .filter((a) => a.level >= 2)
                                .map((a) => (
                                  <option key={a.id} value={a.id}>
                                    {a.code} - {a.nameAr}
                                  </option>
                                ))}
                            </select>
                          </td>
                          <td className="py-2 px-3 text-center">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={l.debit || ''}
                              onChange={(e) => {
                                const updated = [...lines];
                                updated[idx].debit = parseFloat(e.target.value) || 0;
                                if (updated[idx].debit > 0) updated[idx].credit = 0;
                                setLines(updated);
                              }}
                              className="w-28 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-center text-white font-mono-num font-bold"
                            />
                          </td>
                          <td className="py-2 px-3 text-center">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={l.credit || ''}
                              onChange={(e) => {
                                const updated = [...lines];
                                updated[idx].credit = parseFloat(e.target.value) || 0;
                                if (updated[idx].credit > 0) updated[idx].debit = 0;
                                setLines(updated);
                              }}
                              className="w-28 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-center text-white font-mono-num font-bold"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              placeholder="بيان اختياري لهذا الطرف..."
                              value={l.memo}
                              onChange={(e) => {
                                const updated = [...lines];
                                updated[idx].memo = e.target.value;
                                setLines(updated);
                              }}
                              className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-white"
                            />
                          </td>
                          <td className="py-2 px-3 text-center">
                            <button
                              type="button"
                              disabled={lines.length <= 2}
                              onClick={() => handleRemoveLine(idx)}
                              className="p-1 rounded text-red-400 hover:bg-red-950/40 disabled:opacity-30 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Balance Validation Summary Bar */}
              <div
                className={`p-4 rounded-xl border flex flex-wrap items-center justify-between gap-4 font-mono-num text-xs ${
                  isFormBalanced
                    ? 'bg-emerald-950/30 border-emerald-500/40'
                    : 'bg-red-950/30 border-red-500/40'
                }`}
              >
                <div className="flex items-center gap-6">
                  <div>
                    <span className="text-slate-400 font-sans">إجمالي المدين: </span>
                    <span className="font-bold text-emerald-400 text-sm">
                      {totalDebits.toFixed(2)} {settings.baseCurrency}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-sans">إجمالي الدائن: </span>
                    <span className="font-bold text-cyan-400 text-sm">
                      {totalCredits.toFixed(2)} {settings.baseCurrency}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 font-sans font-bold text-xs">
                  {isFormBalanced ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      القيد متوازن تماماً، جاهز للترحيل
                    </span>
                  ) : (
                    <span className="text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      الفارق غير متوازن: {difference.toFixed(2)} {settings.baseCurrency}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={!isFormBalanced}
                  className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all cursor-pointer shadow-lg ${
                    isFormBalanced
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  ترحيل القيد لدفتر الأستاذ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* JOURNAL ENTRY VOUCHER PREVIEW MODAL */}
      {previewEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden">
            <div className="p-4 bg-slate-800 text-white flex items-center justify-between no-print">
              <span className="font-bold text-sm">سند قيد اليومية: {previewEntry.entryNumber}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-600/30"
                  title="طباعة سند القيد أو حفظه كملف PDF"
                >
                  <Printer className="w-4 h-4" />
                  طباعة / حفظ PDF
                </button>
                <button
                  onClick={() => setPreviewEntry(null)}
                  className="p-1 rounded-xl text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-8 text-right printable-card text-xs space-y-4">
              <div className="text-center border-b-2 border-slate-900 pb-3">
                <h3 className="text-lg font-black">{settings.companyName}</h3>
                <div className="text-slate-600 font-mono-num">الرقم الضريبي: {settings.taxNumber}</div>
                <div className="font-bold text-base text-slate-900 mt-2">
                  سند قيد يومية عام (Journal Voucher)
                </div>
                <div className="text-xs text-slate-600 font-mono-num mt-1">
                  رقم القيد: {previewEntry.entryNumber} | التاريخ: {previewEntry.date}
                </div>
              </div>

              <div className="bg-slate-100 p-3 rounded-xl">
                <div><span className="font-bold">البيان العام:</span> {previewEntry.description}</div>
              </div>

              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="border-b-2 border-slate-900 bg-slate-200">
                    <th className="py-2 px-2">كود الحساب</th>
                    <th className="py-2 px-2">اسم الحساب</th>
                    <th className="py-2 px-2">البيان / الشرح</th>
                    <th className="py-2 px-2 text-center">مدين ({settings.baseCurrency})</th>
                    <th className="py-2 px-2 text-center">دائن ({settings.baseCurrency})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  {previewEntry.lines.map((l) => (
                    <tr key={l.id}>
                      <td className="py-2 px-2 font-mono-num font-bold">{l.accountCode}</td>
                      <td className="py-2 px-2 font-bold">{l.accountName}</td>
                      <td className="py-2 px-2 text-slate-600">{l.memo || '-'}</td>
                      <td className="py-2 px-2 text-center font-mono-num font-bold">
                        {l.debit > 0 ? l.debit.toFixed(2) : '-'}
                      </td>
                      <td className="py-2 px-2 text-center font-mono-num font-bold">
                        {l.credit > 0 ? l.credit.toFixed(2) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-900 font-mono-num font-extrabold bg-slate-100">
                    <td colSpan={3} className="py-2 px-2 font-sans font-bold text-slate-800">
                      الإجمالي المتوازن:
                    </td>
                    <td className="py-2 px-2 text-center text-emerald-700">
                      {previewEntry.totalDebit.toFixed(2)}
                    </td>
                    <td className="py-2 px-2 text-center text-cyan-700">
                      {previewEntry.totalCredit.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>

              <div className="p-2 bg-slate-100 rounded text-slate-800 text-[11px]">
                <span className="font-bold">المبلغ كتابة:</span>{' '}
                {tafqeet(previewEntry.totalDebit, settings.baseCurrency, 'هللة')}
              </div>

              <div className="grid grid-cols-3 gap-4 pt-6 text-center text-[11px] text-slate-700">
                <div className="border-t border-slate-300 pt-2 font-bold">المحاسب المعد</div>
                <div className="border-t border-slate-300 pt-2 font-bold">المراجع المالي</div>
                <div className="border-t border-slate-300 pt-2 font-bold">المدير العام / الاعتماد</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
