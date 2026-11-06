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
  ArrowRight,
  Copy,
  Ban,
  Sparkles,
  Package,
} from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import { Invoice, PaymentMethod, Product } from '../types/accounting';
import { tafqeet } from '../utils/tafqeet';
import { DocumentActionsBar } from './DocumentActionsBar';
import { FreeNumberInput } from './FreeNumberInput';
import { useBackHandler } from '../hooks/useBackHandler';
import { ProductQuickSearchModal } from './ProductQuickSearchModal';
import { DuplicateItemResolutionModal, DuplicateItemInfo } from './DuplicateItemResolutionModal';

export const PurchasesView: React.FC = () => {
  const {
    invoices,
    contacts,
    products,
    settings,
    currencies,
    createPurchaseInvoice,
    deleteInvoice,
    cloneInvoice,
    openDeleteConfirm,
    showToast,
  } = useAccounting();

  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);

  // Android hardware back button and swipe-back gestures
  useBackHandler({
    isOpen: showCreateModal,
    onClose: () => setShowCreateModal(false),
    stateKey: 'purchaseModal',
  });

  useBackHandler({
    isOpen: Boolean(previewInvoice),
    onClose: () => setPreviewInvoice(null),
    stateKey: 'purchasePreview',
  });

  // New Purchase Bill state
  const [selectedSupplier, setSelectedSupplier] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CREDIT');
  const [purchaseCurrency, setPurchaseCurrency] = useState<string>(settings.baseCurrency);
  const [purchaseExchangeRate, setPurchaseExchangeRate] = useState<number>(1.0);
  const [purchaseDiscount, setPurchaseDiscount] = useState<number>(0);
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
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<string | null>(null);
  const activePurchase = purchaseInvoices.find((i) => i.id === selectedPurchaseId) || purchaseInvoices[0] || null;

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

  const [showQuickSearchModal, setShowQuickSearchModal] = useState(false);
  const [duplicateItemModalInfo, setDuplicateItemModalInfo] = useState<DuplicateItemInfo | null>(null);

  // Onyx Pro: Prevent duplicate items within purchase bill, with smart resolution dialog
  const handleProductChange = (index: number, productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    // Check if this product already exists in another row
    const existingIndex = invoiceRows.findIndex((r, idx) => idx !== index && r.productId === productId);
    if (existingIndex !== -1) {
      setDuplicateItemModalInfo({
        productId: prod.id,
        productName: prod.nameAr,
        productCode: prod.code,
        unit: prod.unit,
        existingQuantity: invoiceRows[existingIndex].quantity,
        existingUnitPrice: invoiceRows[existingIndex].unitPrice,
        addedQuantity: invoiceRows[index]?.quantity || 1,
        addedUnitPrice: prod.costPrice,
        rowIndex: existingIndex,
      });
      return;
    }

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

  const handleSelectFromQuickSearch = (prod: Product, quantity: number, unitPrice: number) => {
    const existingIndex = invoiceRows.findIndex((r) => r.productId === prod.id);
    if (existingIndex !== -1) {
      setDuplicateItemModalInfo({
        productId: prod.id,
        productName: prod.nameAr,
        productCode: prod.code,
        unit: prod.unit,
        existingQuantity: invoiceRows[existingIndex].quantity,
        existingUnitPrice: invoiceRows[existingIndex].unitPrice,
        addedQuantity: quantity,
        addedUnitPrice: unitPrice,
        rowIndex: existingIndex,
      });
      return;
    }

    setInvoiceRows((prev) => [
      ...prev,
      {
        productId: prod.id,
        productName: prod.nameAr,
        quantity,
        unitPrice: prod.costPrice,
        costPrice: prod.costPrice,
        discount: 0,
        taxRate: prod.taxRate ?? settings.defaultTaxRate,
      },
    ]);
    showToast(`تمت إضافة صنف المشتريات «${prod.nameAr}» بنجاح ✓`, 'success');
  };

  const handleResolveDuplicate = (
    action: 'MERGE' | 'REPLACE' | 'REMOVE',
    resolvedQuantity: number,
    resolvedUnitPrice: number
  ) => {
    if (!duplicateItemModalInfo) return;
    const idx = duplicateItemModalInfo.rowIndex;
    if (idx === undefined || idx < 0 || idx >= invoiceRows.length) {
      setDuplicateItemModalInfo(null);
      return;
    }

    const updated = [...invoiceRows];
    if (action === 'MERGE') {
      updated[idx].quantity = resolvedQuantity;
      showToast(`تم دمج كمية الصنف «${duplicateItemModalInfo.productName}» بنجاح (${resolvedQuantity} وحدة) ✓`, 'success');
    } else if (action === 'REPLACE') {
      updated[idx].quantity = resolvedQuantity;
      updated[idx].unitPrice = resolvedUnitPrice;
      showToast(`تم تحديث الصنف «${duplicateItemModalInfo.productName}» بالكمية والسعر الجديد ✓`, 'info');
    } else if (action === 'REMOVE') {
      if (updated.length > 1) {
        updated.splice(idx, 1);
      }
      showToast(`تم حذف الصنف من الفاتورة ✓`, 'info');
    }
    setInvoiceRows(updated);
    setDuplicateItemModalInfo(null);
  };

  const addRow = () => {
    if (products.length === 0) return;
    const availableProd = products.find((p) => !invoiceRows.some((r) => r.productId === p.id)) || products[0];
    if (invoiceRows.some((r) => r.productId === availableProd.id)) {
      showToast('جميع الأصناف مسجلة في الفاتورة بالفعل، يمكنك زيادة الكمية في الجدول.', 'info');
      return;
    }
    setInvoiceRows([
      ...invoiceRows,
      {
        productId: availableProd.id,
        productName: availableProd.nameAr,
        quantity: 5,
        unitPrice: availableProd.costPrice,
        costPrice: availableProd.costPrice,
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
    let itemsSubtotal = 0;
    invoiceRows.forEach((r) => {
      itemsSubtotal += r.quantity * r.unitPrice - (r.discount || 0);
    });
    const subtotalAfterDiscount = Math.max(0, itemsSubtotal - (purchaseDiscount || 0));
    const taxTotal = subtotalAfterDiscount * settings.defaultTaxRate;
    const grandTotal = subtotalAfterDiscount + taxTotal;
    return { itemsSubtotal, purchaseDiscount, subtotal: subtotalAfterDiscount, taxTotal, grandTotal };
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

    const newInv = createPurchaseInvoice({
      partyId: supplier.id,
      partyName: supplier.name,
      currency: purchaseCurrency,
      exchangeRate: purchaseExchangeRate,
      paymentMethod,
      items: invoiceRows,
      notes,
    });

    if (newInv?.id) {
      setSelectedPurchaseId(newInv.id);
    }

    showToast('تم حفظ وتوريد فاتورة المشتريات بنجاح ✓', 'success');
    setShowCreateModal(false);
  };

  const { subtotal: formSubtotal, taxTotal: formTax, grandTotal: formGrand } = calculateFormTotals();

  return (
    <div className="space-y-6 pb-28 sm:pb-12">
      {/* Header with Onyx Pro style conditional document action buttons */}
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

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Onyx Pro Rule: Show Document Actions ONLY if saved data exists in the database */}
          {purchaseInvoices.length > 0 && activePurchase && (
            <div className="flex items-center gap-2 animate-in fade-in duration-200">
              <DocumentActionsBar
                targetElementId="selected-purchase-document-card"
                filename={`فاتورة_شراء_${activePurchase.invoiceNumber}`}
                documentTitle={`فاتورة توريد وشراء: ${activePurchase.invoiceNumber} - ${activePurchase.partyName}`}
                hasData={purchaseInvoices.length > 0}
              />
            </div>
          )}

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-sm shadow-lg shadow-amber-600/20 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            تسجيل فاتورة شراء وتوريد
          </button>
        </div>
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
              {filteredInvoices.map((inv) => {
                const isSelected = activePurchase?.id === inv.id;
                return (
                  <tr
                    key={inv.id}
                    onClick={() => setSelectedPurchaseId(inv.id)}
                    className={`transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-amber-950/40 ring-1 ring-amber-500/50'
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="py-3.5 px-4 font-mono-num font-bold text-amber-400">
                      <div className="flex items-center gap-1.5">
                        {isSelected ? (
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="المستند المحدد حالياً للطباعة والمعاينة" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-transparent" />
                        )}
                        <span>{inv.invoiceNumber}</span>
                        {isSelected && (
                          <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/30">
                            المحدد
                          </span>
                        )}
                      </div>
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
                      <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => {
                            setSelectedPurchaseId(inv.id);
                            setPreviewInvoice(inv);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                          title="معاينة وطباعة الفاتورة أو حفظها PDF"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            const cloned = cloneInvoice(inv.id);
                            if (cloned) {
                              setSelectedPurchaseId(cloned.id);
                              showToast(`تم استنساخ فاتورة الشراء كمسودة جديدة برقم ${cloned.invoiceNumber} (نظام أونكس برو) ✓`, 'success');
                            }
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 text-blue-400 hover:text-white hover:bg-blue-600 transition-colors cursor-pointer"
                          title="نسخ فاتورة الشراء (أونكس برو: نسخ مستند سابق)"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            openDeleteConfirm({
                              title: 'تأكيد حذف فاتورة الشراء',
                              itemName: `فاتورة الشراء: ${inv.invoiceNumber}`,
                              message: `المورد: ${inv.partyName} - الإجمالي: ${inv.grandTotal.toFixed(2)} ${inv.currency || settings.baseCurrency}. سيتم خصم البضاعة الموردة من المخزون وعكس القيد المحاسبي وحساب المورد تلقائياً.`,
                              onConfirm: () => {
                                deleteInvoice(inv.id);
                                if (selectedPurchaseId === inv.id) {
                                  setSelectedPurchaseId(null);
                                }
                              },
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
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE PURCHASE INVOICE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex flex-col justify-start sm:justify-center items-center bg-black/80 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto overscroll-contain touch-pan-y">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[92dvh] my-auto overscroll-contain overflow-hidden">
            <div className="p-4 bg-slate-800/95 backdrop-blur-sm border-b border-slate-700 flex items-center justify-between shrink-0">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Truck className="w-5 h-5 text-amber-400" />
                تسجيل فاتورة شراء وتوريد بضاعة جديدة
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold border border-slate-700 cursor-pointer transition-all active:scale-95 shadow-sm"
                  title="الرجوع إلى الخلف"
                >
                  <ArrowRight className="w-4 h-4 text-emerald-400" />
                  <span>رجوع للخلف</span>
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-slate-400 hover:text-white text-xl font-bold p-1 cursor-pointer"
                >
                  ×
                </button>
              </div>
            </div>

            <form onSubmit={handleSavePurchase} className="p-4 sm:p-6 space-y-6 overflow-y-auto overscroll-contain flex-1 pb-52 sm:pb-6 touch-pan-y">
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
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowQuickSearchModal(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950/60 hover:bg-amber-900/60 text-amber-400 font-bold text-xs cursor-pointer border border-amber-500/40 transition-all shadow-sm"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>بحث متقدم واختيار أصناف</span>
                    </button>
                    <button
                      type="button"
                      onClick={addRow}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs cursor-pointer border border-slate-700"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>إضافة صنف آخر</span>
                    </button>
                  </div>
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
                              <FreeNumberInput
                                value={row.quantity}
                                onChange={(val) => {
                                  const updated = [...invoiceRows];
                                  updated[idx].quantity = val || 1;
                                  setInvoiceRows(updated);
                                }}
                                allowDecimals={false}
                                className="w-20 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-center text-white font-bold"
                              />
                            </td>
                            <td className="py-2 px-3 text-center">
                              <FreeNumberInput
                                value={row.unitPrice}
                                onChange={(val) => {
                                  const updated = [...invoiceRows];
                                  updated[idx].unitPrice = val;
                                  setInvoiceRows(updated);
                                }}
                                placeholder="0.00"
                                className="w-28 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-center text-white font-bold"
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

              {/* Purchase Bill Discount Input (Onyx Pro) */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                  <span>خصم المورد على الفاتورة ({settings.baseCurrency}):</span>
                  <FreeNumberInput
                    value={purchaseDiscount}
                    onChange={(val) => setPurchaseDiscount(val || 0)}
                    placeholder="0.00"
                    className="w-28 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-center text-amber-400 font-bold font-mono-num"
                  />
                </div>
                <div className="text-xs text-slate-400">
                  قبل الخصم:{' '}
                  <span className="font-mono-num font-bold text-white">
                    {calculateFormTotals().itemsSubtotal.toFixed(2)} {settings.baseCurrency}
                  </span>
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
                <DocumentActionsBar
                  targetElementId="purchase-print-content"
                  filename={`فاتورة_شراء_${previewInvoice.invoiceNumber}`}
                  documentTitle={`فاتورة مشتريات رقم ${previewInvoice.invoiceNumber}`}
                />
                <button
                  type="button"
                  onClick={() => setPreviewInvoice(null)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold border border-slate-600 cursor-pointer transition-all active:scale-95"
                  title="الرجوع إلى قائمة المشتريات"
                >
                  <ArrowRight className="w-4 h-4 text-emerald-400" />
                  <span>رجوع</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewInvoice(null)}
                  className="p-1 rounded-xl text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div id="purchase-print-content" className="p-8 text-right printable-card text-xs space-y-4">
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

      {/* Hidden Print Container for the Active Selected Purchase Invoice (Used by top action bar) */}
      {activePurchase && (
        <div id="selected-purchase-document-card" className="hidden print:block printable-card p-8 text-right text-xs space-y-4">
          <div className="text-center border-b-2 border-slate-900 pb-3">
            <h3 className="text-lg font-black text-slate-900">{settings.companyName}</h3>
            <div className="text-slate-600 font-mono-num">الرقم الضريبي: {settings.taxNumber}</div>
            <div className="font-bold text-sm text-slate-900 mt-2">فاتورة شراء وتوريد مخزني معتمدة</div>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-slate-100 p-3 rounded-xl text-slate-900">
            <div>
              <div><span className="font-bold">رقم الفاتورة:</span> {activePurchase.invoiceNumber}</div>
              <div><span className="font-bold">التاريخ:</span> {activePurchase.date}</div>
            </div>
            <div>
              <div><span className="font-bold">المورد:</span> {activePurchase.partyName}</div>
              <div><span className="font-bold">طريقة السداد:</span> {activePurchase.paymentMethod === 'CASH' ? 'نقداً' : 'آجل للمورد'}</div>
            </div>
          </div>

          <table className="w-full text-right border-collapse text-xs text-slate-900">
            <thead>
              <tr className="border-b-2 border-slate-900 bg-slate-200">
                <th className="py-2 px-2">الصنف المورد</th>
                <th className="py-2 px-2 text-center">الكمية الموردة</th>
                <th className="py-2 px-2 text-center">سعر الشراء</th>
                <th className="py-2 px-2 text-center">الإجمالي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              {activePurchase.items.map((it) => (
                <tr key={it.id}>
                  <td className="py-2 px-2 font-bold">{it.productName}</td>
                  <td className="py-2 px-2 text-center font-mono-num">{it.quantity}</td>
                  <td className="py-2 px-2 text-center font-mono-num">{it.unitPrice.toFixed(2)}</td>
                  <td className="py-2 px-2 text-center font-mono-num font-bold">{it.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="border-t-2 border-slate-900 pt-3 flex justify-between text-slate-900">
            <div className="text-xs text-slate-600">
              <div>القيد الآلي المرتبط: {activePurchase.journalEntryId || 'مرحل'}</div>
            </div>
            <div className="w-48 space-y-1 font-mono-num text-xs">
              <div className="flex justify-between">
                <span>المجموع:</span>
                <span>{activePurchase.subtotal.toFixed(2)} {settings.baseCurrency}</span>
              </div>
              <div className="flex justify-between">
                <span>الضريبة 15%:</span>
                <span>{activePurchase.taxTotal.toFixed(2)} {settings.baseCurrency}</span>
              </div>
              <div className="flex justify-between font-black text-sm text-slate-900 border-t border-slate-300 pt-1">
                <span>الإجمالي:</span>
                <span>{activePurchase.grandTotal.toFixed(2)} {settings.baseCurrency}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Onyx Pro: Product Quick Search Modal */}
      <ProductQuickSearchModal
        isOpen={showQuickSearchModal}
        onClose={() => setShowQuickSearchModal(false)}
        onSelectProduct={handleSelectFromQuickSearch}
        title="البحث المتقدم واختيار أصناف المشتريات"
        excludeProductIds={invoiceRows.map((r) => r.productId)}
      />

      {/* Onyx Pro: Duplicate Prevention & Merging Dialog */}
      <DuplicateItemResolutionModal
        isOpen={Boolean(duplicateItemModalInfo)}
        itemInfo={duplicateItemModalInfo}
        onClose={() => setDuplicateItemModalInfo(null)}
        onResolve={handleResolveDuplicate}
        currency={purchaseCurrency || settings.baseCurrency}
      />
    </div>
  );
};
