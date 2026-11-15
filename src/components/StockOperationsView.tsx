import React, { useState } from 'react';
import {
  ArrowLeftRight,
  Plus,
  Search,
  Package,
  Calendar,
  Building,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle,
  FileCheck,
  Layers,
  PlusCircle,
  Trash2,
  Printer,
  X,
  Eye,
} from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import { StockReceiptNote, StockTransfer } from '../types/accounting';
import { DocumentActionsBar } from './DocumentActionsBar';
import { UnifiedDocumentLayout, UnifiedDocumentHeader, UnifiedDocumentFooter } from './UnifiedDocumentLayout';

export const StockOperationsView: React.FC = () => {
  const {
    stockTransfers,
    stockReceiptNotes,
    warehouses,
    branches,
    products,
    settings,
    createStockTransfer,
    createStockReceiptNote,
    deleteStockTransfer,
    deleteStockReceiptNote,
    openDeleteConfirm,
    showToast,
  } = useAccounting();

  const [activeTab, setActiveTab] = useState<'TRANSFERS' | 'RECEIPTS' | 'ISSUES'>('TRANSFERS');
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptType, setReceiptType] = useState<'IN' | 'OUT'>('IN');
  const [previewTransfer, setPreviewTransfer] = useState<StockTransfer | null>(null);
  const [previewReceipt, setPreviewReceipt] = useState<StockReceiptNote | null>(null);

  // Transfer Form State
  const [fromBranchId, setFromBranchId] = useState(branches[0]?.id || '');
  const [toBranchId, setToBranchId] = useState(branches[0]?.id || '');
  const [fromWhId, setFromWhId] = useState(warehouses[0]?.id || '');
  const [toWhId, setToWhId] = useState(warehouses[0]?.id || '');
  const [transferNotes, setTransferNotes] = useState('تحويل بضاعة بين المستودعات لتغذية المخزون');
  const [transferRows, setTransferRows] = useState<{ productId: string; quantity: number }[]>([]);

  // Receipt / Issue Form State
  const [receiptBranchId, setReceiptBranchId] = useState(branches[0]?.id || '');
  const [receiptWhId, setReceiptWhId] = useState(warehouses[0]?.id || '');
  const [receiptReason, setReceiptReason] = useState('استلام بضاعة / إدخال مخزني مباشر');
  const [receiptRows, setReceiptRows] = useState<{ productId: string; quantity: number }[]>([]);

  const handleOpenTransfer = () => {
    if (products.length > 0) {
      setTransferRows([{ productId: products[0].id, quantity: 1 }]);
    } else {
      setTransferRows([]);
    }
    setShowTransferModal(true);
  };

  const handleOpenReceipt = (type: 'IN' | 'OUT') => {
    setReceiptType(type);
    setReceiptReason(type === 'IN' ? 'سند إدخال بضاعة للمستودع' : 'سند صرف وإخراج بضاعة عينات أو تالف');
    if (products.length > 0) {
      setReceiptRows([{ productId: products[0].id, quantity: 1 }]);
    } else {
      setReceiptRows([]);
    }
    setShowReceiptModal(true);
  };

  const handleSaveTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (transferRows.length === 0) {
      showToast('يرجى تحديد الأصناف المراد تحويلها', 'error');
      return;
    }

    createStockTransfer({
      fromBranchId,
      toBranchId,
      fromWarehouseId: fromWhId,
      toWarehouseId: toWhId,
      items: transferRows,
      notes: transferNotes,
    });

    showToast('تم ترحيل أمر التحويل المخزني بنجاح ✓', 'success');
    setShowTransferModal(false);
  };

  const handleSaveReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    if (receiptRows.length === 0) {
      showToast('يرجى تحديد الأصناف', 'error');
      return;
    }

    createStockReceiptNote({
      type: receiptType,
      branchId: receiptBranchId,
      warehouseId: receiptWhId,
      reason: receiptReason,
      items: receiptRows,
    });

    showToast('تم ترحيل السند المخزني بنجاح ✓', 'success');
    setShowReceiptModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <ArrowLeftRight className="w-7 h-7 text-cyan-400" />
            التحويلات والاستلامات المخزنية
          </h2>
          <p className="text-sm text-slate-400">
            مناقلة البضاعة بين الفروع والمستودعات، سندات الإدخال المخزني (GRN)، وسندات الإخراج والصرف
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <DocumentActionsBar
            targetElementId="stock-operations-table-content"
            filename={`سجل_الحركات_المخزنية_${settings.companyName}`}
            documentTitle="سجل التحويلات والإدخالات والإخراجات المخزنية"
            hasData={(stockTransfers?.length || 0) + (stockReceiptNotes?.length || 0) > 0}
          />
          <button
            onClick={handleOpenTransfer}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/20 cursor-pointer transition-all"
          >
            <ArrowLeftRight className="w-4 h-4" />
            تحويل مخزني
          </button>
          <button
            onClick={() => handleOpenReceipt('IN')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 cursor-pointer transition-all"
          >
            <ArrowDownLeft className="w-4 h-4" />
            سند إدخال
          </button>
          <button
            onClick={() => handleOpenReceipt('OUT')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-600/20 cursor-pointer transition-all"
          >
            <ArrowUpRight className="w-4 h-4" />
            سند إخراج
          </button>
        </div>
      </div>

      <div id="stock-operations-table-content" className="space-y-4 printable-card">
        {/* Printable Stock Operations Header */}
        <div className="hidden print:block mb-4">
          <UnifiedDocumentHeader
            documentTitle="سجل التحويلات والاستلامات والإخراجات المخزنية"
            documentSubtitle="Stock Transfers & Goods Movement Register"
            documentNumber={`STK-OPS-${new Date().getFullYear()}`}
            documentDate={new Date().toISOString().split('T')[0]}
            documentTypeBadge="سجل حركات مخزنية"
            currency={settings.baseCurrency}
            customMeta={[
              { label: 'التحويلات', value: `${stockTransfers.length} أمر` },
              { label: 'السندات المخزنية', value: `${stockReceiptNotes.length} سند` },
            ]}
          />
        </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 space-x-reverse space-x-2 no-print">
        <button
          onClick={() => setActiveTab('TRANSFERS')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'TRANSFERS'
              ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ArrowLeftRight className="w-4 h-4" />
          سجل التحويلات بين المستودعات ({stockTransfers.length})
        </button>

        <button
          onClick={() => setActiveTab('RECEIPTS')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'RECEIPTS'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ArrowDownLeft className="w-4 h-4" />
          سندات الإدخال المخزني ({stockReceiptNotes.filter((n) => n.type === 'IN').length})
        </button>

        <button
          onClick={() => setActiveTab('ISSUES')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'ISSUES'
              ? 'border-amber-500 text-amber-400 bg-amber-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ArrowUpRight className="w-4 h-4" />
          سندات الإخراج والصرف ({stockReceiptNotes.filter((n) => n.type === 'OUT').length})
        </button>
      </div>

      {/* TAB 1: Transfers */}
      {activeTab === 'TRANSFERS' && (
        <div className="space-y-4">
          {stockTransfers.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400">
              <ArrowLeftRight className="w-12 h-12 text-slate-700 mx-auto mb-3" />
              <p className="text-base font-bold text-white">لا توجد تحويلات مخزنية مسجلة</p>
              <p className="text-xs text-slate-500 mt-1">
                استخدم زر "تحويل مخزني بين المستودعات" لمناقلة البضائع وتحديث الأرصدة.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900 shadow-xl">
              <table className="w-full text-right text-sm">
                <thead className="bg-slate-800 text-slate-300 text-xs font-bold">
                  <tr>
                    <th className="py-3 px-4">رقم التحويل</th>
                    <th className="py-3 px-4">التاريخ</th>
                    <th className="py-3 px-4">من مستودع</th>
                    <th className="py-3 px-4">إلى مستودع</th>
                    <th className="py-3 px-4 text-center">عدد الأصناف</th>
                    <th className="py-3 px-4">الملاحظات</th>
                    <th className="py-3 px-4 text-center">الحالة</th>
                    <th className="py-3 px-4 text-center no-print">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {stockTransfers.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono-num font-bold text-cyan-400 text-xs">{t.transferNumber}</td>
                      <td className="py-3 px-4 font-mono-num text-xs text-slate-400">{t.date}</td>
                      <td className="py-3 px-4 font-semibold text-white">
                        {warehouses.find((w) => w.id === t.fromWarehouseId)?.nameAr || 'المستودع الرئيسي'}
                      </td>
                      <td className="py-3 px-4 font-semibold text-emerald-400">
                        {warehouses.find((w) => w.id === t.toWarehouseId)?.nameAr || 'المستودع الثانوي'}
                      </td>
                      <td className="py-3 px-4 text-center font-mono-num font-bold text-white">
                        {t.items.reduce((s, i) => s + i.quantity, 0)} قطعة
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-300">{t.notes}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          مكتمل ومرحل
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center no-print">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setPreviewTransfer(t)}
                            className="p-1.5 rounded-lg bg-cyan-950/40 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-900/60 transition-colors cursor-pointer"
                            title="معاينة وطباعة أمر التحويل المخزني"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              openDeleteConfirm({
                                title: 'تأكيد حذف أمر تحويل مخزني',
                                itemName: `حركة التحويل: ${t.transferNumber}`,
                                message: `سيتم حذف أمر التحويل المخزني (${t.items.reduce((s, i) => s + i.quantity, 0)} قطعة) وإلغاء أثره.`,
                                onConfirm: () => deleteStockTransfer(t.id),
                              });
                            }}
                            className="p-1.5 rounded-lg bg-red-950/40 text-red-400 hover:text-red-300 hover:bg-red-900/60 transition-colors cursor-pointer"
                            title="حذف أمر التحويل"
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
          )}
        </div>
      )}

      {/* TAB 2 & 3: Stock Receipts / Issues */}
      {(activeTab === 'RECEIPTS' || activeTab === 'ISSUES') && (() => {
        const targetType = activeTab === 'RECEIPTS' ? 'IN' : 'OUT';
        const notesList = stockReceiptNotes.filter((n) => n.type === targetType);
        return (
          <div className="space-y-4">
            {notesList.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400">
                <FileCheck className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                <p className="text-base font-bold text-white">
                  {targetType === 'IN' ? 'لا توجد سندات إدخال مخزني مسجلة' : 'لا توجد سندات إخراج مخزني مسجلة'}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  استخدم الأزرار بالأعلى لإصدار إذن استلام أو إذن صرف من المستودع.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900 shadow-xl">
                <table className="w-full text-right text-sm">
                  <thead className="bg-slate-800 text-slate-300 text-xs font-bold">
                    <tr>
                      <th className="py-3 px-4">رقم السند</th>
                      <th className="py-3 px-4">التاريخ</th>
                      <th className="py-3 px-4">المستودع</th>
                      <th className="py-3 px-4 text-center">الكمية الإجمالية</th>
                      <th className="py-3 px-4">السبب / البيان</th>
                      <th className="py-3 px-4 text-center">الحالة</th>
                      <th className="py-3 px-4 text-center no-print">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {notesList.map((n) => (
                      <tr key={n.id} className="hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-mono-num font-bold text-white text-xs">{n.receiptNumber}</td>
                        <td className="py-3 px-4 font-mono-num text-xs text-slate-400">{n.date}</td>
                        <td className="py-3 px-4 text-white font-semibold">
                          {warehouses.find((w) => w.id === n.warehouseId)?.nameAr || 'المستودع العام'}
                        </td>
                        <td className="py-3 px-4 text-center font-mono-num font-bold text-white">
                          {n.items.reduce((s, i) => s + i.quantity, 0)} وحدة
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-300">{n.reason}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            n.type === 'IN' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                          }`}>
                            {n.type === 'IN' ? 'إدخال معتمد' : 'صرف معتمد'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center no-print">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setPreviewReceipt(n)}
                              className="p-1.5 rounded-lg bg-emerald-950/40 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-900/60 transition-colors cursor-pointer"
                              title="معاينة وطباعة السند المخزني"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                openDeleteConfirm({
                                  title: 'تأكيد حذف سند مخزني',
                                  itemName: `السند المخزني: ${n.receiptNumber} (${n.type === 'IN' ? 'إدخال' : 'صرف'})`,
                                  message: `سبب السند: ${n.reason || 'عملية مخزنية'}. سيتم التراجع عن كميات المخزون المتأثرة.`,
                                  onConfirm: () => deleteStockReceiptNote(n.id),
                                });
                              }}
                              className="p-1.5 rounded-lg bg-red-950/40 text-red-400 hover:text-red-300 hover:bg-red-900/60 transition-colors cursor-pointer"
                              title="حذف السند المخزني"
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
            )}
          </div>
        );
      })()}

        <div className="hidden print:block mt-6">
          <UnifiedDocumentFooter
            documentNumber={`STK-OPS-${new Date().getFullYear()}`}
            signatureLabels={['أمين المستودع', 'مراقب المخزون', 'اعتماد الإدارة / الختم']}
          />
        </div>
      </div>

      {/* MODAL 1: CREATE TRANSFER */}
      {showTransferModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto overscroll-contain touch-pan-y">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-y-auto max-h-[90dvh] my-auto">
            <div className="p-4 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <ArrowLeftRight className="w-5 h-5 text-cyan-400" />
                تحويل بضاعة بين المستودعات والفروع
              </h3>
              <button
                onClick={() => setShowTransferModal(false)}
                className="text-slate-400 hover:text-white text-xl font-bold p-1 cursor-pointer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveTransfer} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">من مستودع (المصدر)</label>
                  <select
                    value={fromWhId}
                    onChange={(e) => setFromWhId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.nameAr}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-400 mb-1">إلى مستودع (الوجهة)</label>
                  <select
                    value={toWhId}
                    onChange={(e) => setToWhId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.nameAr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">ملاحظات التحويل</label>
                <input
                  type="text"
                  value={transferNotes}
                  onChange={(e) => setTransferNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-white">الأصناف المراد تحويلها</h4>
                {products.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-800/40 text-xs text-slate-400 text-center">
                    لا توجد أصناف في المخزون حالياً.
                  </div>
                ) : (
                  transferRows.map((row, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <select
                        value={row.productId}
                        onChange={(e) => {
                          const updated = [...transferRows];
                          updated[idx].productId = e.target.value;
                          setTransferRows(updated);
                        }}
                        className="flex-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nameAr} (الرصيد: {p.stockQty})
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min="1"
                        value={row.quantity}
                        onChange={(e) => {
                          const updated = [...transferRows];
                          updated[idx].quantity = parseInt(e.target.value) || 1;
                          setTransferRows(updated);
                        }}
                        className="w-20 px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white font-mono-num font-bold text-center"
                      />
                    </div>
                  ))
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={products.length === 0}
                  className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-bold text-xs cursor-pointer shadow"
                >
                  تأكيد التحويل المخزني
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CREATE RECEIPT / ISSUE NOTE */}
      {showReceiptModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto overscroll-contain touch-pan-y">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-y-auto max-h-[90dvh] my-auto">
            <div className={`p-4 border-b flex items-center justify-between ${
              receiptType === 'IN' ? 'bg-emerald-950/40 border-emerald-500/30' : 'bg-amber-950/40 border-amber-500/30'
            }`}>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                {receiptType === 'IN' ? <ArrowDownLeft className="w-5 h-5 text-emerald-400" /> : <ArrowUpRight className="w-5 h-5 text-amber-400" />}
                {receiptType === 'IN' ? 'سند استلام وإدخال بضاعة للمستودع' : 'سند صرف وإخراج بضاعة من المستودع'}
              </h3>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="text-slate-400 hover:text-white text-xl font-bold p-1 cursor-pointer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveReceipt} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">المستودع المستهدف</label>
                <select
                  value={receiptWhId}
                  onChange={(e) => setReceiptWhId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                >
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.nameAr}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">السبب / البيان التفصيلي</label>
                <input
                  type="text"
                  required
                  value={receiptReason}
                  onChange={(e) => setReceiptReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-white">الأصناف والكميات</h4>
                {products.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-800/40 text-xs text-slate-400 text-center">
                    لا توجد أصناف في المخزون حالياً.
                  </div>
                ) : (
                  receiptRows.map((row, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <select
                        value={row.productId}
                        onChange={(e) => {
                          const updated = [...receiptRows];
                          updated[idx].productId = e.target.value;
                          setReceiptRows(updated);
                        }}
                        className="flex-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nameAr} (الرصيد: {p.stockQty})
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min="1"
                        value={row.quantity}
                        onChange={(e) => {
                          const updated = [...receiptRows];
                          updated[idx].quantity = parseInt(e.target.value) || 1;
                          setReceiptRows(updated);
                        }}
                        className="w-20 px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white font-mono-num font-bold text-center"
                      />
                    </div>
                  ))
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowReceiptModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={products.length === 0}
                  className={`px-5 py-2 rounded-lg font-bold text-xs text-white cursor-pointer shadow ${
                    receiptType === 'IN' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-amber-600 hover:bg-amber-500'
                  }`}
                >
                  حفظ وتحديث رصيد المستودع
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PREVIEW STOCK TRANSFER */}
      {previewTransfer && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto overscroll-contain no-print-bg">
          <div className="bg-white text-slate-900 rounded-3xl w-full max-w-2xl shadow-2xl overflow-y-auto max-h-[92dvh] my-auto print-only-wrapper">
            <div className="p-4 bg-slate-800 text-white flex items-center justify-between no-print">
              <span className="font-bold text-sm">أمر تحويل مخزني: {previewTransfer.transferNumber}</span>
              <div className="flex items-center gap-2">
                <DocumentActionsBar
                  targetElementId="stock-transfer-print-content"
                  filename={`تحويل_مخزني_${previewTransfer.transferNumber}`}
                  documentTitle={`أمر تحويل مخزني رقم ${previewTransfer.transferNumber}`}
                />
                <button
                  type="button"
                  onClick={() => setPreviewTransfer(null)}
                  className="p-1 rounded-xl text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div id="stock-transfer-print-content" className="p-2 sm:p-4 text-right printable-card">
              <UnifiedDocumentLayout
                documentTitle="أمر تحويل مخزني بين الفروع والمستودعات"
                documentSubtitle="Inter-Warehouse Stock Transfer Order"
                documentNumber={previewTransfer.transferNumber}
                documentDate={previewTransfer.date}
                documentTypeBadge="تحويل ومناقلة بضاعة"
                branchName={branches.find(b => b.id === previewTransfer.fromBranchId)?.nameAr || 'الفرع الرئيسي'}
                warehouseName={`من: ${warehouses.find(w => w.id === previewTransfer.fromWarehouseId)?.nameAr || 'المستودع الرئيسي'} ← إلى: ${warehouses.find(w => w.id === previewTransfer.toWarehouseId)?.nameAr || 'المستودع الثانوي'}`}
                currency={settings.baseCurrency}
                notes={previewTransfer.notes}
                customMeta={[
                  { label: 'إجمالي الكمية المنقولة', value: <span className="font-bold text-cyan-800 font-mono">{previewTransfer.items.reduce((s, i) => s + i.quantity, 0)} قطعة</span> }
                ]}
              >
                <div className="overflow-x-auto my-3">
                  <table className="w-full text-right border-collapse border border-slate-900 text-xs">
                    <thead>
                      <tr className="bg-slate-200 border-b-2 border-slate-900 text-slate-950 font-black">
                        <th className="py-2 px-2 border border-slate-400 text-center w-10">#</th>
                        <th className="py-2 px-2 border border-slate-400">اسم الصنف المنقول</th>
                        <th className="py-2 px-2 border border-slate-400 text-center w-24">الوحدة</th>
                        <th className="py-2 px-2 border border-slate-400 text-center w-24">الكمية المنقولة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-300">
                      {previewTransfer.items.map((it, idx) => {
                        const prod = products.find(p => p.id === it.productId);
                        return (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-2 px-2 border border-slate-300 text-center font-mono font-bold text-slate-500">{idx + 1}</td>
                            <td className="py-2 px-2 border border-slate-300 font-bold text-slate-900">{prod?.nameAr || 'صنف مخزني'}</td>
                            <td className="py-2 px-2 border border-slate-300 text-center text-slate-600">{prod?.unit || 'حبة'}</td>
                            <td className="py-2 px-2 border border-slate-300 text-center font-mono font-black text-cyan-900">{it.quantity}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </UnifiedDocumentLayout>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PREVIEW STOCK RECEIPT / ISSUE */}
      {previewReceipt && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto overscroll-contain no-print-bg">
          <div className="bg-white text-slate-900 rounded-3xl w-full max-w-2xl shadow-2xl overflow-y-auto max-h-[92dvh] my-auto print-only-wrapper">
            <div className="p-4 bg-slate-800 text-white flex items-center justify-between no-print">
              <span className="font-bold text-sm">
                {previewReceipt.type === 'IN' ? 'إذن إضافة مخزنية' : 'إذن صرف وإخراج مخزني'}: {previewReceipt.receiptNumber}
              </span>
              <div className="flex items-center gap-2">
                <DocumentActionsBar
                  targetElementId="stock-receipt-print-content"
                  filename={`${previewReceipt.type === 'IN' ? 'إذن_إضافة_مخزنية' : 'إذن_صرف_مخزني'}_${previewReceipt.receiptNumber}`}
                  documentTitle={`${previewReceipt.type === 'IN' ? 'إذن إضافة مخزنية' : 'إذن صرف وإخراج مخزني'} رقم ${previewReceipt.receiptNumber}`}
                />
                <button
                  type="button"
                  onClick={() => setPreviewReceipt(null)}
                  className="p-1 rounded-xl text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div id="stock-receipt-print-content" className="p-2 sm:p-4 text-right printable-card">
              <UnifiedDocumentLayout
                documentTitle={previewReceipt.type === 'IN' ? 'إذن إضافة وتوريد مخزني' : 'إذن صرف وإخراج مخزني'}
                documentSubtitle={previewReceipt.type === 'IN' ? 'Goods Received Note (GRN)' : 'Goods Issue Note (GIN)'}
                documentNumber={previewReceipt.receiptNumber}
                documentDate={previewReceipt.date}
                documentTypeBadge={previewReceipt.type === 'IN' ? 'إدخال بضاعة' : 'صرف بضاعة'}
                branchName={branches.find(b => b.id === previewReceipt.branchId)?.nameAr || 'الفرع الرئيسي'}
                warehouseName={warehouses.find(w => w.id === previewReceipt.warehouseId)?.nameAr || 'المستودع الرئيسي'}
                currency={settings.baseCurrency}
                notes={previewReceipt.reason}
                customMeta={[
                  { label: 'إجمالي الكمية', value: <span className="font-bold text-slate-900 font-mono">{previewReceipt.items.reduce((s, i) => s + i.quantity, 0)} قطعة</span> }
                ]}
              >
                <div className="overflow-x-auto my-3">
                  <table className="w-full text-right border-collapse border border-slate-900 text-xs">
                    <thead>
                      <tr className="bg-slate-200 border-b-2 border-slate-900 text-slate-950 font-black">
                        <th className="py-2 px-2 border border-slate-400 text-center w-10">#</th>
                        <th className="py-2 px-2 border border-slate-400">اسم الصنف</th>
                        <th className="py-2 px-2 border border-slate-400 text-center w-24">الوحدة</th>
                        <th className="py-2 px-2 border border-slate-400 text-center w-24">الكمية</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-300">
                      {previewReceipt.items.map((it, idx) => {
                        const prod = products.find(p => p.id === it.productId);
                        return (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-2 px-2 border border-slate-300 text-center font-mono font-bold text-slate-500">{idx + 1}</td>
                            <td className="py-2 px-2 border border-slate-300 font-bold text-slate-900">{prod?.nameAr || 'صنف مخزني'}</td>
                            <td className="py-2 px-2 border border-slate-300 text-center text-slate-600">{prod?.unit || 'حبة'}</td>
                            <td className={`py-2 px-2 border border-slate-300 text-center font-mono font-black ${previewReceipt.type === 'IN' ? 'text-emerald-800' : 'text-amber-800'}`}>
                              {it.quantity}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </UnifiedDocumentLayout>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
