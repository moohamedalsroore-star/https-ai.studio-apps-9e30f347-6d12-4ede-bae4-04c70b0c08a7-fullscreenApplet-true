import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  Search,
  Printer,
  Calendar,
  X,
  PlusCircle,
  Trash2,
} from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import { Invoice, PaymentMethod } from '../types/accounting';
import { tafqeet } from '../utils/tafqeet';

export const InvoicesView: React.FC = () => {
  const {
    invoices,
    contacts,
    products,
    settings,
    currencies,
    createSalesInvoice,
    deleteInvoice,
    openDeleteConfirm,
    showToast,
  } = useAccounting();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);

  // New Invoice State
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [invoiceCurrency, setInvoiceCurrency] = useState<string>(settings.baseCurrency);
  const [invoiceExchangeRate, setInvoiceExchangeRate] = useState<number>(1.0);
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

  const salesInvoices = invoices.filter((i) => i.type === 'SALES');

  const filteredInvoices = salesInvoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.partyName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || inv.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleProductChange = (index: number, productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    const updated = [...invoiceRows];
    updated[index] = {
      ...updated[index],
      productId: prod.id,
      productName: prod.nameAr,
      unitPrice: prod.salePrice,
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
        quantity: 1,
        unitPrice: products[0].salePrice,
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

  const handleOpenCreateModal = () => {
    if (contacts.filter((c) => c.type === 'CUSTOMER').length > 0) {
      setSelectedCustomer(contacts.filter((c) => c.type === 'CUSTOMER')[0].id);
    }
    if (products.length > 0) {
      setInvoiceRows([
        {
          productId: products[0].id,
          productName: products[0].nameAr,
          quantity: 1,
          unitPrice: products[0].salePrice,
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

  const handleSaveInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (invoiceRows.length === 0) {
      showToast('يرجى إضافة أصناف للفاتورة أولاً.', 'error');
      return;
    }
    const customer =
      contacts.find((c) => c.id === selectedCustomer) ||
      contacts[0] || {
        id: 'cust-walkin',
        name: 'عميل نقدي عام / المعرض',
      };

    createSalesInvoice({
      partyId: customer.id,
      partyName: customer.name,
      currency: invoiceCurrency,
      exchangeRate: invoiceExchangeRate,
      paymentMethod,
      items: invoiceRows,
      notes,
    });

    showToast('تم حفظ وترحيل فاتورة المبيعات بنجاح ✓', 'success');
    setShowCreateModal(false);
  };

  const { subtotal: formSubtotal, taxTotal: formTax, grandTotal: formGrand } = calculateFormTotals();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Receipt className="w-7 h-7 text-emerald-400" />
            فواتير المبيعات الضريبية
          </h2>
          <p className="text-sm text-slate-400">
            إصدار الفواتير النقدية والآجلة، مع خصم المخزون التلقائي وقيد تكلفة المبيعات وضريبة القيمة المضافة
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4" />
          إنشاء فاتورة مبيعات جديدة
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700">
        <div className="flex items-center gap-3 flex-1 min-w-[260px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ابحث برقم الفاتورة أو اسم العميل..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-3 pr-9 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">جميع الحالات</option>
            <option value="PAID">مسددة بالكامل</option>
            <option value="PARTIAL">مسددة جزئياً</option>
            <option value="UNPAID">آجلة / غير مسددة</option>
          </select>
        </div>

        <div className="text-xs text-slate-400">
          إجمالي الفواتير: <span className="font-bold text-white">{filteredInvoices.length}</span>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900 shadow-xl">
        <table className="w-full text-right text-sm">
          <thead className="bg-slate-800/90 text-slate-300 font-bold text-xs uppercase tracking-wider border-b border-slate-700">
            <tr>
              <th className="py-3 px-4">رقم الفاتورة</th>
              <th className="py-3 px-4">التاريخ</th>
              <th className="py-3 px-4">العميل</th>
              <th className="py-3 px-4 text-center">طريقة الدفع</th>
              <th className="py-3 px-4 text-center">المجموع قبل الضريبة</th>
              <th className="py-3 px-4 text-center">الضريبة 15%</th>
              <th className="py-3 px-4 text-center">الإجمالي الشامل</th>
              <th className="py-3 px-4 text-center">حالة السداد</th>
              <th className="py-3 px-4 text-center">القيد المحاسبي</th>
              <th className="py-3 px-4 text-center">طباعة / عرض</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {filteredInvoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3.5 px-4 font-mono-num font-bold text-emerald-400">
                  {inv.invoiceNumber}
                </td>
                <td className="py-3.5 px-4 font-mono-num text-xs text-slate-400">{inv.date}</td>
                <td className="py-3.5 px-4 font-semibold text-white">{inv.partyName}</td>
                <td className="py-3.5 px-4 text-center text-xs text-slate-300">
                  {inv.paymentMethod === 'CASH' && 'نقداً'}
                  {inv.paymentMethod === 'BANK' && 'شبكة / تحويل'}
                  {inv.paymentMethod === 'CREDIT' && 'آجل'}
                  {inv.paymentMethod === 'SPLIT' && 'جزئي'}
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
                  {inv.status === 'PAID' && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      مسددة
                    </span>
                  )}
                  {inv.status === 'PARTIAL' && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      جزئي
                    </span>
                  )}
                  {inv.status === 'UNPAID' && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                      آجلة
                    </span>
                  )}
                </td>
                <td className="py-3.5 px-4 text-center font-mono-num text-xs text-emerald-400">
                  {inv.journalEntryId ? 'مرحل آلياً' : '-'}
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
                          title: 'تأكيد حذف فاتورة المبيعات',
                          itemName: `فاتورة المبيعات: ${inv.invoiceNumber}`,
                          message: `العميل: ${inv.partyName} - الإجمالي: ${inv.grandTotal.toFixed(2)} ${inv.currency || settings.baseCurrency}. سيتم إرجاع كميات الأصناف للمخزون وعكس القيد المحاسبي وتعديل رصيد العميل تلقائياً.`,
                          onConfirm: () => deleteInvoice(inv.id),
                        });
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 text-red-400 hover:text-white hover:bg-red-600 transition-colors cursor-pointer"
                      title="حذف الفاتورة وإلغاء أثرها المحاسبي والمخزني"
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

      {/* CREATE INVOICE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-6">
            <div className="p-4 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-400" />
                إنشاء فاتورة مبيعات جديدة
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white text-xl font-bold p-1 cursor-pointer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveInvoice} className="p-6 space-y-6">
              {/* Header Fields */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">العميل</label>
                  <select
                    value={selectedCustomer}
                    onChange={(e) => setSelectedCustomer(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white"
                  >
                    {contacts
                      .filter((c) => c.type === 'CUSTOMER')
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">طريقة السداد</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white"
                  >
                    <option value="CASH">نقداً (الصندوق)</option>
                    <option value="BANK">تحويل بنكي / شبكة مدى</option>
                    <option value="CREDIT">آجل (على الحساب)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-400 mb-1">عملة الفاتورة</label>
                  <select
                    value={invoiceCurrency}
                    onChange={(e) => {
                      const code = e.target.value;
                      setInvoiceCurrency(code);
                      const r = currencies.find((c) => c.code === code)?.rate || 1.0;
                      setInvoiceExchangeRate(r);
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
                    {invoiceCurrency === settings.baseCurrency
                      ? 'ملاحظات الفاتورة'
                      : `سعر الصرف (مقابل ${settings.baseCurrency})`}
                  </label>
                  {invoiceCurrency === settings.baseCurrency ? (
                    <input
                      type="text"
                      placeholder="ملاحظات اختيارية..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white"
                    />
                  ) : (
                    <input
                      type="number"
                      step="0.0001"
                      min="0.0001"
                      value={invoiceExchangeRate}
                      onChange={(e) => setInvoiceExchangeRate(parseFloat(e.target.value) || 1.0)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-mono-num font-bold text-emerald-400"
                    />
                  )}
                </div>
              </div>

              {/* Items Table in Modal */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm">بنود وأصناف الفاتورة</h4>
                  <button
                    type="button"
                    onClick={addRow}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs cursor-pointer border border-emerald-500/30"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    إضافة صنف آخر
                  </button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-800 text-slate-300">
                      <tr>
                        <th className="py-2.5 px-3">الصنف</th>
                        <th className="py-2.5 px-3 text-center">الكمية</th>
                        <th className="py-2.5 px-3 text-center">سعر الوحدة</th>
                        <th className="py-2.5 px-3 text-center">الخصم</th>
                        <th className="py-2.5 px-3 text-center">الإجمالي</th>
                        <th className="py-2.5 px-3 text-center">إجراء</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {invoiceRows.map((row, idx) => {
                        const lineTotal = row.quantity * row.unitPrice - row.discount;
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
                                    {p.nameAr} (متوفر: {p.stockQty} {p.unit})
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
                                className="w-16 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-center text-white font-mono-num"
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
                                className="w-24 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-center text-white font-mono-num"
                              />
                            </td>
                            <td className="py-2 px-3 text-center">
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={row.discount}
                                onChange={(e) => {
                                  const updated = [...invoiceRows];
                                  updated[idx].discount = parseFloat(e.target.value) || 0;
                                  setInvoiceRows(updated);
                                }}
                                className="w-20 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-center text-white font-mono-num"
                              />
                            </td>
                            <td className="py-2 px-3 text-center font-mono-num font-bold text-emerald-400">
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

              {/* Calculations Footer */}
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-wrap items-center justify-between gap-4">
                <div className="text-xs text-slate-300">
                  <span className="font-bold text-white">تفقيط المبلغ:</span>{' '}
                  <span className="text-slate-400 italic">
                    {tafqeet(formGrand, settings.baseCurrency, 'هللة')}
                  </span>
                </div>

                <div className="flex items-center gap-6 font-mono-num text-xs">
                  <div>
                    <span className="text-slate-400">قبل الضريبة: </span>
                    <span className="font-bold text-white">{formSubtotal.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">الضريبة 15%: </span>
                    <span className="font-bold text-emerald-400">{formTax.toFixed(2)}</span>
                  </div>
                  <div className="text-sm font-black text-white bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700">
                    <span className="text-emerald-400">الإجمالي: </span>
                    <span>{formGrand.toFixed(2)} {settings.baseCurrency}</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
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
                  ترحيل الفاتورة وتحديث المخزون
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INVOICE PREVIEW MODAL */}
      {previewInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto no-print-bg">
          <div className="bg-white text-slate-900 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden print-only-wrapper">
            <div className="p-4 bg-slate-800 text-white flex items-center justify-between no-print">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">معاينة الفاتورة: {previewInvoice.invoiceNumber}</span>
                <span className="text-[10px] text-emerald-300 hidden sm:inline">💡 اختر "حفظ بتنسيق PDF"</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-600/30"
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
                <div className="text-slate-600 font-mono-num">الرقم الضريبي: {settings.taxNumber}</div>
                <div className="font-bold text-sm text-slate-900 mt-2">فاتورة مبيعات ضريبية</div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-100 p-3 rounded-xl">
                <div>
                  <div><span className="font-bold">رقم الفاتورة:</span> {previewInvoice.invoiceNumber}</div>
                  <div><span className="font-bold">التاريخ:</span> {previewInvoice.date}</div>
                </div>
                <div>
                  <div><span className="font-bold">العميل:</span> {previewInvoice.partyName}</div>
                  <div><span className="font-bold">طريقة السداد:</span> {previewInvoice.paymentMethod}</div>
                </div>
              </div>

              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="border-b-2 border-slate-900 bg-slate-200">
                    <th className="py-2 px-2">الصنف</th>
                    <th className="py-2 px-2 text-center">الكمية</th>
                    <th className="py-2 px-2 text-center">السعر</th>
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
                    <span>الصافي:</span>
                    <span>{previewInvoice.subtotal.toFixed(2)} {settings.baseCurrency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>الضريبة:</span>
                    <span>{previewInvoice.taxTotal.toFixed(2)} {settings.baseCurrency}</span>
                  </div>
                  <div className="flex justify-between font-black text-sm text-slate-900 border-t border-slate-300 pt-1">
                    <span>الإجمالي:</span>
                    <span>{previewInvoice.grandTotal.toFixed(2)} {settings.baseCurrency}</span>
                  </div>
                </div>
              </div>

              <div className="p-2 bg-slate-100 rounded text-slate-800 text-[11px]">
                <span className="font-bold">المبلغ كتابة:</span>{' '}
                {tafqeet(previewInvoice.grandTotal, settings.baseCurrency, 'هللة')}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
