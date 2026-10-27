import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Search,
  Printer,
  Calendar,
  X,
  PlusCircle,
  Trash2,
  PackagePlus,
  Coins,
} from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import { Invoice, PaymentMethod } from '../types/accounting';
import { tafqeet } from '../utils/tafqeet';

export const PurchasesView: React.FC = () => {
  const {
    invoices,
    contacts,
    products,
    settings,
    currencies,
    createPurchaseInvoice,
    deleteInvoice,
    openDeleteConfirm,
    showToast,
  } = useAccounting();

  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);

  // New Purchase Bill state
  const [selectedSupplier, setSelectedSupplier] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CREDIT');
  const [purchaseCurrency, setPurchaseCurrency] = useState<string>(settings.baseCurrency);
  const [purchaseExchangeRate, setPurchaseExchangeRate] = useState<number>(1.0);
  const [notes, setNotes] = useState('');
  const [invoiceRows, setInvoiceRows] = useState<
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

  const purchaseInvoices = invoices.filter((i) => i.type === 'PURCHASE');

  const filteredInvoices = purchaseInvoices.filter((inv) => {
    return (
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.partyName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleOpenCreateModal = () => {
    if (contacts.filter((c) => c.type === 'SUPPLIER').length > 0) {
      setSelectedSupplier(contacts.filter((c) => c.type === 'SUPPLIER')[0].id);
    }
    if (products.length > 0) {
      setInvoiceRows([
        {
          productId: products[0].id,
          productName: products[0].nameAr,
          quantity: 5,
          unitPrice: products[0].costPrice,
          costPrice: products[0].costPrice,
          discount: 0,
          taxRate: settings.defaultTaxRate,
        },
      ]);
    } else {
      setInvoiceRows([]);
    }
    setShowCreateModal(true);
  };

  const handleProductChange = (index: number, productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    const updated = [...invoiceRows];
    updated[index] = {
      ...updated[index],
      productId: prod.id,
      productName: prod.nameAr,
      unitPrice: prod.costPrice,
      costPrice: prod.costPrice,
    };
    setInvoiceRows(updated);
  };

  const addRow = () => {
    if (products.length === 0) return;
    setInvoiceRows([
      ...invoiceRows,
      {
        productId: products[0].id,
        productName: products[0].nameAr,
        quantity: 5,
        unitPrice: products[0].costPrice,
        costPrice: products[0].costPrice,
        discount: 0,
        taxRate: settings.defaultTaxRate,
      },
    ]);
  };

  const removeRow = (index: number) => {
    if (invoiceRows.length <= 1) return;
    setInvoiceRows(invoiceRows.filter((_, i) => i !== index));
  };

  const calculateFormTotals = () => {
    let subtotal = 0;
    invoiceRows.forEach((r) => {
      subtotal += r.quantity * r.unitPrice - r.discount;
    });
    const taxTotal = subtotal * settings.defaultTaxRate;
    const grandTotal = subtotal + taxTotal;
    return { subtotal, taxTotal, grandTotal };
  };

  const handleSavePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (invoiceRows.length === 0) {
      showToast('يرجى إضافة أصناف لفاتورة الشراء أولاً.', 'error');
      return;
    }
    const supplier =
      contacts.find((c) => c.id === selectedSupplier) ||
      contacts.find((c) => c.type === 'SUPPLIER') ||
      contacts[0] || {
        id: 'supp-walkin',
        name: 'مورد عام',
      };

    createPurchaseInvoice({
      partyId: supplier.id,
      partyName: supplier.name,
      currency: purchaseCurrency,
      exchangeRate: purchaseExchangeRate,
      paymentMethod,
      items: invoiceRows,
      notes,
    });

    showToast('تم حفظ وتوريد فاتورة المشتريات بنجاح ✓', 'success');
    setShowCreateModal(false);
  };

  const { subtotal: formSubtotal, taxTotal: formTax, grandTotal: formGrand } = calculateFormTotals();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Truck className="w-7 h-7 text-amber-400" />
            فواتير المشتريات والتوريد
          </h2>
          <p className="text-sm text-slate-400">
            إدخال فواتير الشراء، زيادة كميات المخزون فورياً، إعادة احتساب متوسط التكلفة المرجح، وقيد مستحقات الموردين آلياً
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-sm shadow-lg shadow-amber-600/20 cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4" />
          تسجيل فاتورة شراء وتوريد
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ابحث برقم الفاتورة أو اسم المورد..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-3 pr-9 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="text-xs text-slate-400">
          إجمالي فواتير التوريد: <span className="font-bold text-white">{filteredInvoices.length}</span>
        </div>
      </div>

      {/* Purchases Table */}
      {filteredInvoices.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400">
          <Truck className="w-12 h-12 text-amber-500/40 mx-auto mb-3" />
          <p className="text-base font-bold text-white">لا توجد فواتير شراء مسجلة بعد</p>
          <p className="text-xs text-slate-500 mt-1">اضغط على زر "تسجيل فاتورة شراء وتوريد" لإضافة بضاعة للمستودع.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900 shadow-xl">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-800/90 text-slate-300 font-bold text-xs uppercase tracking-wider border-b border-slate-700">
              <tr>
                <th className="py-3 px-4">رقم الفاتورة</th>
                <th className="py-3 px-4">التاريخ</th>
                <th className="py-3 px-4">المورد</th>
                <th className="py-3 px-4 text-center">طريقة الدفع</th>
                <th className="py-3 px-4 text-center">صافي البضاعة</th>
                <th className="py-3 px-4 text-center">ضريبة المدخلات 15%</th>
                <th className="py-3 px-4 text-center">الإجمالي المطلوب</th>
                <th className="py-3 px-4 text-center">حالة السداد</th>
                <th className="py-3 px-4 text-center">قيد التوريد الآلي</th>
                <th className="py-3 px-4 text-center">عرض</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono-num font-bold text-amber-400">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-3.5 px-4 font-mono-num text-xs text-slate-400">{inv.date}</td>
                  <td className="py-3.5 px-4 font-semibold text-white">{inv.partyName}</td>
                  <td className="py-3.5 px-4 text-center text-xs text-slate-300">
                    {inv.paymentMethod === 'CASH' ? 'نقداً' : 'آجل (ذمم دائنة)'}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono-num text-slate-300">
                    {inv.subtotal.toFixed(2)} {settings.baseCurrency}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono-num text-slate-400 text-xs">
                    {inv.taxTotal.toFixed(2)} {settings.baseCurrency}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono-num font-bold text-white text-base">
                    {inv.grandTotal.toFixed(2)} {settings.baseCurrency}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                      inv.status === 'PAID'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    }`}>
                      {inv.status === 'PAID' ? 'مسددة' : 'آجلة للمورد'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono-num text-xs text-emerald-400">
                    {inv.journalEntryId ? 'مرحل آلياً بالدفتر' : '-'}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => setPreviewInvoice(inv)}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                        title="معاينة وطباعة الفاتورة أو حفظها PDF"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          openDeleteConfirm({
                            title: 'تأكيد حذف فاتورة الشراء',
                            itemName: `فاتورة الشراء: ${inv.invoiceNumber}`,
                            message: `المورد: ${inv.partyName} - الإجمالي: ${inv.grandTotal.toFixed(2)} ${inv.currency || settings.baseCurrency}. سيتم خصم البضاعة الموردة من المخزون وعكس القيد المحاسبي وحساب المورد تلقائياً.`,
                            onConfirm: () => deleteInvoice(inv.id),
                          });
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 text-red-400 hover:text-white hover:bg-red-600 transition-colors cursor-pointer"
                        title="حذف الفاتورة وعكس أثرها"
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

      {/* CREATE PURCHASE INVOICE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-6">
            <div className="p-4 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Truck className="w-5 h-5 text-amber-400" />
                تسجيل فاتورة شراء وتوريد بضاعة جديدة
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white text-xl font-bold p-1 cursor-pointer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSavePurchase} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">المورد</label>
                  <select
                    value={selectedSupplier}
                    onChange={(e) => setSelectedSupplier(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white"
                  >
                    {contacts
                      .filter((c) => c.type === 'SUPPLIER')
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">طريقة السداد للمورد</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white"
                  >
                    <option value="CREDIT">آجل (ذمة الموردين)</option>
                    <option value="CASH">نقداً فوري (الخزينة)</option>
                    <option value="BANK">تحويل بنكي</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-400 mb-1">عملة الشراء والتوريد</label>
                  <select
                    value={purchaseCurrency}
                    onChange={(e) => {
                      const code = e.target.value;
                      setPurchaseCurrency(code);
                      const r = currencies.find((c) => c.code === code)?.rate || 1.0;
                      setPurchaseExchangeRate(r);
                    }}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-bold"
                  >
                    {currencies.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} - {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {purchaseCurrency === settings.baseCurrency
                      ? 'ملاحظات الفاتورة'
                      : `سعر الصرف (مقابل ${settings.baseCurrency})`}
                  </label>
                  {purchaseCurrency === settings.baseCurrency ? (
                    <input
                      type="text"
                      placeholder="رقم إرسالية المورد أو الملاحظات..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white"
                    />
                  ) : (
                    <input
                      type="number"
                      step="0.0001"
                      min="0.0001"
                      value={purchaseExchangeRate}
                      onChange={(e) => setPurchaseExchangeRate(parseFloat(e.target.value) || 1.0)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-mono-num font-bold text-amber-400"
                    />
                  )}
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm">البضائع والأصناف الواردة للمستودع</h4>
                  <button
                    type="button"
                    onClick={addRow}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs cursor-pointer border border-amber-500/30"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    إضافة صنف آخر
                  </button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-800 text-slate-300">
                      <tr>
                        <th className="py-2.5 px-3">الصنف المستورد</th>
                        <th className="py-2.5 px-3 text-center">الكمية الواردة</th>
                        <th className="py-2.5 px-3 text-center">سعر الشراء للوحدة</th>
                        <th className="py-2.5 px-3 text-center">إجمالي البند</th>
                        <th className="py-2.5 px-3 text-center">إجراء</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {invoiceRows.map((row, idx) => {
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
                                    {p.nameAr} (الرصيد الحالي: {p.stockQty} {p.unit})
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
                                  const updated = [...invoiceRows];
                                  updated[idx].quantity = parseInt(e.target.value) || 1;
                                  setInvoiceRows(updated);
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
                                  const updated = [...invoiceRows];
                                  updated[idx].unitPrice = parseFloat(e.target.value) || 0;
                                  setInvoiceRows(updated);
                                }}
                                className="w-28 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-center text-white font-mono-num font-bold"
                              />
                            </td>
                            <td className="py-2 px-3 text-center font-mono-num font-bold text-amber-400">
                              {lineTotal.toFixed(2)} {settings.baseCurrency}
                            </td>
                            <td className="py-2 px-3 text-center">
                              <button
                                type="button"
                                disabled={invoiceRows.length <= 1}
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
              </div>

              {/* Totals & Tafqeet */}
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-wrap items-center justify-between gap-4">
                <div className="text-xs text-slate-300">
                  <span className="font-bold text-white">تفقيط المبلغ:</span>{' '}
                  <span className="text-slate-400 italic">
                    {tafqeet(formGrand, settings.baseCurrency, 'هللة')}
                  </span>
                </div>

                <div className="flex items-center gap-6 font-mono-num text-xs">
                  <div>
                    <span className="text-slate-400">صافي المشتريات: </span>
                    <span className="font-bold text-white">{formSubtotal.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">ضريبة المدخلات: </span>
                    <span className="font-bold text-emerald-400">{formTax.toFixed(2)}</span>
                  </div>
                  <div className="text-sm font-black text-white bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700">
                    <span className="text-amber-400">الإجمالي المستحق: </span>
                    <span>{formGrand.toFixed(2)} {settings.baseCurrency}</span>
                  </div>
                </div>
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
                  className="px-6 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm cursor-pointer shadow-lg shadow-amber-600/30"
                >
                  توريد البضاعة وترحيل القيد آلياً
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PURCHASE PREVIEW MODAL */}
      {previewInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto no-print-bg">
          <div className="bg-white text-slate-900 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden print-only-wrapper">
            <div className="p-4 bg-slate-800 text-white flex items-center justify-between no-print">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">فاتورة شراء: {previewInvoice.invoiceNumber}</span>
                <span className="text-[10px] text-amber-300 hidden sm:inline">💡 اختر "حفظ بتنسيق PDF"</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-600/30"
                  title="طباعة الفاتورة أو حفظها كملف PDF"
                >
                  <Printer className="w-4 h-4" />
                  طباعة / حفظ PDF
                </button>
                <button
                  onClick={() => setPreviewInvoice(null)}
                  className="p-1 rounded-xl text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-8 text-right printable-card text-xs space-y-4">
              <div className="text-center border-b-2 border-slate-900 pb-3">
                <h3 className="text-lg font-black">{settings.companyName}</h3>
                <div className="font-bold text-sm text-slate-900 mt-2">سند استلام وتوريد مشتريات</div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-100 p-3 rounded-xl">
                <div>
                  <div><span className="font-bold">رقم الفاتورة:</span> {previewInvoice.invoiceNumber}</div>
                  <div><span className="font-bold">التاريخ:</span> {previewInvoice.date}</div>
                </div>
                <div>
                  <div><span className="font-bold">المورد:</span> {previewInvoice.partyName}</div>
                  <div><span className="font-bold">طريقة الدفع:</span> {previewInvoice.paymentMethod}</div>
                </div>
              </div>

              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="border-b-2 border-slate-900 bg-slate-200">
                    <th className="py-2 px-2">الصنف المستلم</th>
                    <th className="py-2 px-2 text-center">الكمية</th>
                    <th className="py-2 px-2 text-center">سعر الشراء</th>
                    <th className="py-2 px-2 text-center">الإجمالي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  {previewInvoice.items.map((it) => (
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
                  <div>القيد الآلي المرتبط: {previewInvoice.journalEntryId || 'مرحل'}</div>
                </div>
                <div className="w-48 space-y-1 font-mono-num text-xs">
                  <div className="flex justify-between">
                    <span>المجموع:</span>
                    <span>{previewInvoice.subtotal.toFixed(2)} {settings.baseCurrency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>الضريبة 15%:</span>
                    <span>{previewInvoice.taxTotal.toFixed(2)} {settings.baseCurrency}</span>
                  </div>
                  <div className="flex justify-between font-black text-sm text-slate-900 border-t border-slate-300 pt-1">
                    <span>الإجمالي:</span>
                    <span>{previewInvoice.grandTotal.toFixed(2)} {settings.baseCurrency}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
