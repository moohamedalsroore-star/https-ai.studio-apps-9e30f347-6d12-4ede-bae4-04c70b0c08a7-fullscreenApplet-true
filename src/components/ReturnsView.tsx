import React, { useState } from 'react';
import {
  RotateCcw,
  Plus,
  Search,
  Printer,
  Calendar,
  X,
  PlusCircle,
  Trash2,
  ArrowDownLeft,
  ArrowUpRight,
  AlertCircle,
} from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import { PaymentMethod, ReturnInvoice } from '../types/accounting';
import { tafqeet } from '../utils/tafqeet';

export const ReturnsView: React.FC = () => {
  const {
    returnInvoices,
    contacts,
    products,
    settings,
    createReturnInvoice,
    deleteReturnInvoice,
    openDeleteConfirm,
    showToast,
  } = useAccounting();

  const [activeTab, setActiveTab] = useState<'ALL' | 'SALES_RETURN' | 'PURCHASE_RETURN'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [previewReturn, setPreviewReturn] = useState<ReturnInvoice | null>(null);

  // Form State
  const [returnType, setReturnType] = useState<'SALES_RETURN' | 'PURCHASE_RETURN'>('SALES_RETURN');
  const [selectedPartyId, setSelectedPartyId] = useState<string>('');
  const [originalInvNum, setOriginalInvNum] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [reason, setReason] = useState('إرجاع بضاعة تالفة أو غير مطابقة للمواصفات');
  const [returnRows, setReturnRows] = useState<
    {
      productId: string;
      productName: string;
      quantity: number;
      unitPrice: number;
      costPrice: number;
      discount: number;
      taxRate: number;
    }[]
  >([]);

  const filteredReturns = returnInvoices.filter((r) => {
    const matchesTab = activeTab === 'ALL' || r.type === activeTab;
    const matchesSearch =
      r.returnNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.partyName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleOpenCreate = (type: 'SALES_RETURN' | 'PURCHASE_RETURN') => {
    setReturnType(type);
    const availableParties = contacts.filter((c) =>
      type === 'SALES_RETURN' ? c.type === 'CUSTOMER' : c.type === 'SUPPLIER'
    );
    if (availableParties.length > 0) {
      setSelectedPartyId(availableParties[0].id);
    }
    if (products.length > 0) {
      setReturnRows([
        {
          productId: products[0].id,
          productName: products[0].nameAr,
          quantity: 1,
          unitPrice: type === 'SALES_RETURN' ? products[0].salePrice : products[0].costPrice,
          costPrice: products[0].costPrice,
          discount: 0,
          taxRate: settings.defaultTaxRate,
        },
      ]);
    } else {
      setReturnRows([]);
    }
    setShowCreateModal(true);
  };

  const handleProductChange = (index: number, productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    const updated = [...returnRows];
    updated[index] = {
      ...updated[index],
      productId: prod.id,
      productName: prod.nameAr,
      unitPrice: returnType === 'SALES_RETURN' ? prod.salePrice : prod.costPrice,
      costPrice: prod.costPrice,
    };
    setReturnRows(updated);
  };

  const addRow = () => {
    if (products.length === 0) return;
    setReturnRows([
      ...returnRows,
      {
        productId: products[0].id,
        productName: products[0].nameAr,
        quantity: 1,
        unitPrice: returnType === 'SALES_RETURN' ? products[0].salePrice : products[0].costPrice,
        costPrice: products[0].costPrice,
        discount: 0,
        taxRate: settings.defaultTaxRate,
      },
    ]);
  };

  const removeRow = (index: number) => {
    if (returnRows.length <= 1) return;
    setReturnRows(returnRows.filter((_, i) => i !== index));
  };

  const handleSaveReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (returnRows.length === 0) {
      showToast('يرجى إضافة الأصناف المرتجعة', 'error');
      return;
    }
    const party = contacts.find((c) => c.id === selectedPartyId) || {
      id: 'party-walkin',
      name: returnType === 'SALES_RETURN' ? 'عميل نقدي عام' : 'مورد عام',
    };

    createReturnInvoice({
      type: returnType,
      originalInvoiceNumber: originalInvNum,
      partyId: party.id,
      partyName: party.name,
      items: returnRows,
      paymentMethod,
      reason,
    });

    showToast('تم ترحيل إشعار المردود وتحديث المخزون والقيود بنجاح ✓', 'success');
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <RotateCcw className="w-7 h-7 text-red-400" />
            إدارة المردودات (مردودات مبيعات ومشتريات)
          </h2>
          <p className="text-sm text-slate-400">
            تسجيل البضائع المرتجعة مع التعديل التلقائي الفوري للمخزون، وعكس القيود المحاسبية وتكلفة المبيعات والضرائب
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleOpenCreate('SALES_RETURN')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/20 cursor-pointer transition-all"
          >
            <ArrowDownLeft className="w-4 h-4" />
            مردود مبيعات (من عميل)
          </button>
          <button
            onClick={() => handleOpenCreate('PURCHASE_RETURN')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-600/20 cursor-pointer transition-all"
          >
            <ArrowUpRight className="w-4 h-4" />
            مردود مشتريات (إلى مورد)
          </button>
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
            جميع المردودات
          </button>
          <button
            onClick={() => setActiveTab('SALES_RETURN')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'SALES_RETURN' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            مردودات المبيعات
          </button>
          <button
            onClick={() => setActiveTab('PURCHASE_RETURN')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'PURCHASE_RETURN' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            مردودات المشتريات
          </button>
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ابحث برقم الإشعار أو الطرف الآخر..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-3 pr-9 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-500"
          />
        </div>
      </div>

      {/* Table */}
      {filteredReturns.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400">
          <RotateCcw className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <p className="text-base font-bold text-white">لا توجد مردودات مسجلة حتى الآن</p>
          <p className="text-xs text-slate-500 mt-1">
            عند إرجاع أي بضاعة، استخدم الأزرار بالأعلى لإنشاء إشعار مدين أو دائن تلقائياً.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900 shadow-xl">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-800/90 text-slate-300 font-bold text-xs uppercase tracking-wider border-b border-slate-700">
              <tr>
                <th className="py-3 px-4">رقم الإشعار</th>
                <th className="py-3 px-4">التاريخ</th>
                <th className="py-3 px-4">النوع</th>
                <th className="py-3 px-4">الطرف الآخر</th>
                <th className="py-3 px-4 text-center">صافي القيمة</th>
                <th className="py-3 px-4 text-center">الضريبة المعكوسة</th>
                <th className="py-3 px-4 text-center">الإجمالي الشامل</th>
                <th className="py-3 px-4">السبب</th>
                <th className="py-3 px-4 text-center">القيد الآلي</th>
                <th className="py-3 px-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredReturns.map((r) => (
                <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono-num font-bold text-red-400 text-xs">
                    {r.returnNumber}
                  </td>
                  <td className="py-3.5 px-4 font-mono-num text-xs text-slate-400">{r.date}</td>
                  <td className="py-3.5 px-4">
                    {r.type === 'SALES_RETURN' ? (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                        مردود مبيعات
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        مردود مشتريات
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-white">{r.partyName}</td>
                  <td className="py-3.5 px-4 text-center font-mono-num text-slate-300">
                    {r.subtotal.toFixed(2)} {settings.baseCurrency}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono-num text-slate-400 text-xs">
                    {r.taxTotal.toFixed(2)} {settings.baseCurrency}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono-num font-extrabold text-white text-base">
                    {r.grandTotal.toFixed(2)} {settings.baseCurrency}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-300">{r.reason}</td>
                  <td className="py-3.5 px-4 text-center font-mono-num text-xs text-emerald-400">
                    {r.journalEntryId ? 'مرحل آلياً' : '-'}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => setPreviewReturn(r)}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                        title="طباعة / تصدير PDF"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          openDeleteConfirm({
                            title: 'تأكيد حذف إشعار المردود',
                            itemName: `إشعار المردود: ${r.returnNumber} (${r.type === 'SALES_RETURN' ? 'مردود مبيعات' : 'مردود مشتريات'})`,
                            message: `الطرف: ${r.partyName} - الإجمالي: ${r.grandTotal.toFixed(2)} ${r.currency || settings.baseCurrency}. سيتم التراجع عن أثر المخزون والحسابات المرتبطة تلقائياً.`,
                            onConfirm: () => deleteReturnInvoice(r.id),
                          });
                        }}
                        className="p-1.5 rounded-lg bg-red-950/40 text-red-400 hover:text-red-300 hover:bg-red-900/60 transition-colors cursor-pointer"
                        title="حذف إشعار المردود"
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

      {/* CREATE RETURN MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-6">
            <div className={`p-4 border-b flex items-center justify-between ${
              returnType === 'SALES_RETURN' ? 'bg-red-950/40 border-red-500/30' : 'bg-amber-950/40 border-amber-500/30'
            }`}>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-red-400" />
                {returnType === 'SALES_RETURN' ? 'تسجيل إشعار مردود مبيعات (من عميل)' : 'تسجيل إشعار مردود مشتريات (إلى مورد)'}
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white text-xl font-bold p-1 cursor-pointer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveReturn} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {returnType === 'SALES_RETURN' ? 'العميل' : 'المورد'}
                  </label>
                  <select
                    value={selectedPartyId}
                    onChange={(e) => setSelectedPartyId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white"
                  >
                    {contacts
                      .filter((c) => (returnType === 'SALES_RETURN' ? c.type === 'CUSTOMER' : c.type === 'SUPPLIER'))
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">طريقة التسوية</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white"
                  >
                    <option value="CREDIT">آجل (خصم من رصيد الحساب)</option>
                    <option value="CASH">نقداً فوري (رد المبلغ من الصندوق)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">سبب الإرجاع</label>
                  <input
                    type="text"
                    required
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white"
                  />
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm">الأصناف المرتجعة</h4>
                  <button
                    type="button"
                    onClick={addRow}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-red-400 font-bold text-xs cursor-pointer border border-red-500/30"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    إضافة صنف مرتجع آخر
                  </button>
                </div>

                {products.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-800/40 text-center text-xs text-slate-400">
                    لا توجد أصناف في المخزون بعد.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-800">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-slate-800 text-slate-300">
                        <tr>
                          <th className="py-2.5 px-3">الصنف</th>
                          <th className="py-2.5 px-3 text-center">الكمية المرتجعة</th>
                          <th className="py-2.5 px-3 text-center">السعر للوحدة</th>
                          <th className="py-2.5 px-3 text-center">الإجمالي</th>
                          <th className="py-2.5 px-3 text-center">حذف</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {returnRows.map((row, idx) => {
                          const lineTotal = row.quantity * row.unitPrice;
                          return (
                            <tr key={idx} className="bg-slate-900/50">
                              <td className="py-2 px-3">
                                <select
                                  value={row.productId}
                                  onChange={(e) => handleProductChange(idx, e.target.value)}
                                  className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs text-white"
                                >
                                  {products.map((p) => (
                                    <option key={p.id} value={p.id}>
                                      {p.nameAr}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="py-2 px-3 text-center">
                                <input
                                  type="number"
                                  min="1"
                                  value={row.quantity}
                                  onChange={(e) => {
                                    const updated = [...returnRows];
                                    updated[idx].quantity = parseInt(e.target.value) || 1;
                                    setReturnRows(updated);
                                  }}
                                  className="w-20 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-center text-white font-mono-num font-bold"
                                />
                              </td>
                              <td className="py-2 px-3 text-center">
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={row.unitPrice}
                                  onChange={(e) => {
                                    const updated = [...returnRows];
                                    updated[idx].unitPrice = parseFloat(e.target.value) || 0;
                                    setReturnRows(updated);
                                  }}
                                  className="w-24 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-center text-white font-mono-num font-bold"
                                />
                              </td>
                              <td className="py-2 px-3 text-center font-mono-num font-bold text-red-400">
                                {lineTotal.toFixed(2)} {settings.baseCurrency}
                              </td>
                              <td className="py-2 px-3 text-center">
                                <button
                                  type="button"
                                  disabled={returnRows.length <= 1}
                                  onClick={() => removeRow(idx)}
                                  className="p-1 rounded text-red-400 hover:bg-red-950/40 disabled:opacity-30 cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
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
                  disabled={products.length === 0}
                  className="px-6 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-sm cursor-pointer shadow-lg shadow-red-600/30"
                >
                  تأكيد وترحيل المردود وتحديث المخزون
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PREVIEW RETURN MODAL */}
      {previewReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto no-print-bg">
          <div className="bg-white text-slate-900 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden print-only-wrapper">
            <div className="p-4 bg-slate-800 text-white flex items-center justify-between no-print">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">إشعار مردود: {previewReturn.returnNumber}</span>
                <span className="text-[10px] text-red-300 hidden sm:inline">💡 اختر "حفظ بتنسيق PDF"</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-red-600/30"
                >
                  <Printer className="w-4 h-4" />
                  طباعة / حفظ PDF
                </button>
                <button
                  onClick={() => setPreviewReturn(null)}
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
                <div className="font-bold text-sm text-red-600 mt-2">
                  {previewReturn.type === 'SALES_RETURN' ? 'إشعار دائن - مردود مبيعات' : 'إشعار مدين - مردود مشتريات'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-100 p-3 rounded-xl">
                <div>
                  <div><span className="font-bold">رقم الإشعار:</span> {previewReturn.returnNumber}</div>
                  <div><span className="font-bold">التاريخ:</span> {previewReturn.date}</div>
                  <div><span className="font-bold">السبب:</span> {previewReturn.reason}</div>
                </div>
                <div>
                  <div><span className="font-bold">الطرف الآخر:</span> {previewReturn.partyName}</div>
                  <div><span className="font-bold">طريقة التسوية:</span> {previewReturn.paymentMethod}</div>
                </div>
              </div>

              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="border-b-2 border-slate-900 bg-slate-200">
                    <th className="py-2 px-2">الصنف المرتجع</th>
                    <th className="py-2 px-2 text-center">الكمية</th>
                    <th className="py-2 px-2 text-center">السعر</th>
                    <th className="py-2 px-2 text-center">الإجمالي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  {previewReturn.items.map((it) => (
                    <tr key={it.id}>
                      <td className="py-2 px-2 font-bold">{it.productName}</td>
                      <td className="py-2 px-2 text-center font-mono-num">{it.quantity}</td>
                      <td className="py-2 px-2 text-center font-mono-num">{it.unitPrice.toFixed(2)}</td>
                      <td className="py-2 px-2 text-center font-mono-num font-bold">{it.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="border-t-2 border-slate-900 pt-3 flex justify-between">
                <div className="text-xs text-slate-600">
                  <div>القيد الآلي المرتبط: {previewReturn.journalEntryId || 'مرحل'}</div>
                </div>
                <div className="w-48 space-y-1 font-mono-num text-xs">
                  <div className="flex justify-between">
                    <span>المجموع:</span>
                    <span>{previewReturn.subtotal.toFixed(2)} {settings.baseCurrency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>الضريبة المعكوسة:</span>
                    <span>{previewReturn.taxTotal.toFixed(2)} {settings.baseCurrency}</span>
                  </div>
                  <div className="flex justify-between font-black text-sm text-slate-900 border-t border-slate-300 pt-1">
                    <span>الإجمالي المسترجع:</span>
                    <span>{previewReturn.grandTotal.toFixed(2)} {settings.baseCurrency}</span>
                  </div>
                </div>
              </div>

              <div className="p-2 bg-slate-100 rounded text-slate-800 text-[11px]">
                <span className="font-bold">المبلغ كتابة:</span>{' '}
                {tafqeet(previewReturn.grandTotal, settings.baseCurrency, 'هللة')}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
