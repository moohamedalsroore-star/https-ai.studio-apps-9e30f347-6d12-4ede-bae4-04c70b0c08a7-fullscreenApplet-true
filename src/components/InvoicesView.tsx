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
  ArrowRight,
  Copy,
  Ban,
  AlertTriangle,
  Sparkles,
  Package,
} from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import { Invoice, PaymentMethod, Product, PriceTier } from '../types/accounting';
import { tafqeet } from '../utils/tafqeet';
import { DocumentActionsBar } from './DocumentActionsBar';
import { FreeNumberInput } from './FreeNumberInput';
import { useBackHandler } from '../hooks/useBackHandler';
import { ProductQuickSearchModal } from './ProductQuickSearchModal';
import { DuplicateItemResolutionModal, DuplicateItemInfo } from './DuplicateItemResolutionModal';

export const InvoicesView: React.FC = () => {
  const {
    invoices,
    contacts,
    products,
    settings,
    currencies,
    createSalesInvoice,
    deleteInvoice,
    cloneInvoice,
    voidInvoice,
    openDeleteConfirm,
    showToast,
  } = useAccounting();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);

  // Android back button and swipe-back gestures
  useBackHandler({
    isOpen: showCreateModal,
    onClose: () => setShowCreateModal(false),
    stateKey: 'invoiceModal',
  });

  useBackHandler({
    isOpen: Boolean(previewInvoice),
    onClose: () => setPreviewInvoice(null),
    stateKey: 'invoicePreview',
  });

  // New Invoice State
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [priceTier, setPriceTier] = useState<PriceTier>('RETAIL');
  const [invoiceCurrency, setInvoiceCurrency] = useState<string>(settings.baseCurrency);
  const [invoiceExchangeRate, setInvoiceExchangeRate] = useState<number>(1.0);
  const [invoiceDiscount, setInvoiceDiscount] = useState<number>(0);
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
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

  // Active selected invoice in database:
  const activeInvoice = salesInvoices.find((i) => i.id === selectedInvoiceId) || salesInvoices[0] || null;

  const filteredInvoices = salesInvoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.partyName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || inv.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getProductPriceForTier = (prod: Product, tier: PriceTier = priceTier) => {
    if (tier === 'SUPER_WHOLESALE') return prod.specialPrice || prod.wholesalePrice || prod.salePrice;
    if (tier === 'WHOLESALE') return prod.wholesalePrice || prod.salePrice;
    return prod.salePrice;
  };

  const handlePriceTierChange = (newTier: PriceTier) => {
    setPriceTier(newTier);
    setInvoiceRows((prev) =>
      prev.map((row) => {
        const prod = products.find((p) => p.id === row.productId);
        if (!prod) return row;
        return {
          ...row,
          unitPrice: getProductPriceForTier(prod, newTier),
        };
      })
    );
  };

  const [showQuickSearchModal, setShowQuickSearchModal] = useState(false);
  const [duplicateItemModalInfo, setDuplicateItemModalInfo] = useState<DuplicateItemInfo | null>(null);

  // Onyx Pro Feature: Prevent duplicate items within document, with smart resolution dialog
  const handleProductChange = (index: number, productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    // Check if this product is already in another row
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
        addedUnitPrice: getProductPriceForTier(prod, priceTier),
        rowIndex: existingIndex,
      });
      return;
    }

    const updated = [...invoiceRows];
    updated[index] = {
      ...updated[index],
      productId: prod.id,
      productName: prod.nameAr,
      unitPrice: getProductPriceForTier(prod, priceTier),
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
        unitPrice,
        costPrice: prod.costPrice,
        discount: 0,
        taxRate: prod.taxRate ?? settings.defaultTaxRate,
      },
    ]);
    showToast(`تمت إضافة الصنف «${prod.nameAr}» بنجاح ✓`, 'success');
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
    // Find first product not yet in rows to prevent duplicates
    const availableProd = products.find((p) => !invoiceRows.some((r) => r.productId === p.id)) || products[0];
    
    // If all products are already added, inform user
    if (invoiceRows.some((r) => r.productId === availableProd.id)) {
      showToast('جميع الأصناف مسجلة في الفاتورة بالفعل، يمكنك زيادة الكمية مباشرة في الجدول.', 'info');
      return;
    }

    setInvoiceRows([
      ...invoiceRows,
      {
        productId: availableProd.id,
        productName: availableProd.nameAr,
        quantity: 1,
        unitPrice: getProductPriceForTier(availableProd, priceTier),
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
    const subtotalAfterInvoiceDiscount = Math.max(0, itemsSubtotal - (invoiceDiscount || 0));
    const taxTotal = subtotalAfterInvoiceDiscount * settings.defaultTaxRate;
    const grandTotal = subtotalAfterInvoiceDiscount + taxTotal;
    return { itemsSubtotal, invoiceDiscount, subtotal: subtotalAfterInvoiceDiscount, taxTotal, grandTotal };
  };

  const handleOpenCreateModal = () => {
    if (contacts.filter((c) => c.type === 'CUSTOMER').length > 0) {
      setSelectedCustomer(contacts.filter((c) => c.type === 'CUSTOMER')[0].id);
    }
    setPriceTier('RETAIL');
    if (products.length > 0) {
      setInvoiceRows([
        {
          productId: products[0].id,
          productName: products[0].nameAr,
          quantity: 1,
          unitPrice: getProductPriceForTier(products[0], 'RETAIL'),
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

    const newInv = createSalesInvoice({
      partyId: customer.id,
      partyName: customer.name,
      currency: invoiceCurrency,
      exchangeRate: invoiceExchangeRate,
      paymentMethod,
      items: invoiceRows,
      notes,
    });

    if (newInv?.id) {
      setSelectedInvoiceId(newInv.id);
    }

    showToast('تم حفظ وترحيل فاتورة المبيعات بنجاح ✓', 'success');
    setShowCreateModal(false);
  };

  const { subtotal: formSubtotal, taxTotal: formTax, grandTotal: formGrand, itemsSubtotal, invoiceDiscount: currentDiscount } = calculateFormTotals();
  const selectedCustomerObj = contacts.find((c) => c.id === selectedCustomer);

  return (
    <div className="space-y-6 pb-28 sm:pb-12">
      {/* Header with Onyx Pro style conditional document action buttons */}
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

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Onyx Pro Rule: Show Document Actions ONLY if saved data exists in the database */}
          {salesInvoices.length > 0 && activeInvoice && (
            <div className="flex items-center gap-2 animate-in fade-in duration-200">
              <DocumentActionsBar
                targetElementId="selected-invoice-document-card"
                filename={`فاتورة_مبيعات_${activeInvoice.invoiceNumber}`}
                documentTitle={`فاتورة رقم ${activeInvoice.invoiceNumber} - ${activeInvoice.partyName}`}
                hasData={salesInvoices.length > 0}
              />
            </div>
          )}

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            إنشاء فاتورة مبيعات جديدة
          </button>
        </div>
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

      {/* Invoices Table or Empty State */}
      {filteredInvoices.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400">
          <Receipt className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-base font-bold text-white">لا توجد فواتير مبيعات محفوظة حالياً</p>
          <p className="text-xs text-slate-500 mt-1">
            اضغط على زر "إنشاء فاتورة مبيعات جديدة" لإصدار فاتورة وحفظها في النظام.
          </p>
        </div>
      ) : (
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
              {filteredInvoices.map((inv) => {
                const isSelected = activeInvoice?.id === inv.id;
                return (
                  <tr
                    key={inv.id}
                    onClick={() => setSelectedInvoiceId(inv.id)}
                    className={`transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-950/40 ring-1 ring-emerald-500/50'
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="py-3.5 px-4 font-mono-num font-bold text-emerald-400">
                      <div className="flex items-center gap-1.5">
                        {isSelected ? (
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="المستند المحدد حالياً للطباعة والمعاينة" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-transparent" />
                        )}
                        <span>{inv.invoiceNumber}</span>
                        {isSelected && (
                          <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-500/30">
                            المحدد
                          </span>
                        )}
                      </div>
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
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-mono-num text-xs text-emerald-400">
                          {inv.journalEntryId ? 'مرحل آلياً' : '-'}
                        </span>
                        {inv.workflowStatus === 'VOID' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                            ملغية
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            مرحّلة
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => {
                            setSelectedInvoiceId(inv.id);
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
                              setSelectedInvoiceId(cloned.id);
                              showToast(`تم استنساخ الفاتورة كمسودة جديدة برقم ${cloned.invoiceNumber} (نظام أونكس برو) ✓`, 'success');
                            }
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 text-blue-400 hover:text-white hover:bg-blue-600 transition-colors cursor-pointer"
                          title="نسخ الفاتورة (أونكس برو: نسخ مستند سابق)"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        {inv.workflowStatus !== 'VOID' && (
                          <button
                            onClick={() => {
                              openDeleteConfirm({
                                title: 'إلغاء وإبطال الفاتورة (أونكس برو)',
                                itemName: `فاتورة المبيعات: ${inv.invoiceNumber}`,
                                message: `هل تريد إبطال وإلغاء هذه الفاتورة؟ سيتم توليد قيد عكسي تسووي وإرجاع الكميات للمخزون وتحويل حالة الفاتورة إلى ملغية.`,
                                onConfirm: () => {
                                  voidInvoice(inv.id, 'إلغاء يدوي من شاشة الفواتير');
                                },
                              });
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 text-amber-400 hover:text-white hover:bg-amber-600 transition-colors cursor-pointer"
                            title="إلغاء الفاتورة وتوليد قيد عكسي"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            openDeleteConfirm({
                              title: 'تأكيد حذف فاتورة المبيعات',
                              itemName: `فاتورة المبيعات: ${inv.invoiceNumber}`,
                              message: `العميل: ${inv.partyName} - الإجمالي: ${inv.grandTotal.toFixed(2)} ${inv.currency || settings.baseCurrency}. سيتم إرجاع كميات الأصناف للمخزون وعكس القيد المحاسبي وتعديل رصيد العميل تلقائياً.`,
                              onConfirm: () => {
                                deleteInvoice(inv.id);
                                if (selectedInvoiceId === inv.id) {
                                  setSelectedInvoiceId(null);
                                }
                              },
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
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE INVOICE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex flex-col justify-start sm:justify-center items-center bg-black/80 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto overscroll-contain touch-pan-y">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[92dvh] my-auto overscroll-contain overflow-hidden">
            <div className="p-4 bg-slate-800/95 backdrop-blur-sm border-b border-slate-700 flex items-center justify-between shrink-0">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-400" />
                إنشاء فاتورة مبيعات جديدة
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

            <form onSubmit={handleSaveInvoice} className="p-4 sm:p-6 space-y-6 overflow-y-auto overscroll-contain flex-1 pb-52 sm:pb-6 touch-pan-y">
              {/* Header Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
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
                  <label className="block text-xs font-bold text-amber-400 mb-1">فئة التسعير</label>
                  <select
                    value={priceTier}
                    onChange={(e) => handlePriceTierChange(e.target.value as PriceTier)}
                    className="w-full px-3 py-2 bg-slate-800 border border-amber-500/50 rounded-lg text-sm text-amber-300 font-bold focus:border-amber-400"
                  >
                    <option value="RETAIL">مفرق (قطاعي / تجزئة)</option>
                    <option value="WHOLESALE">سعر جملة</option>
                    <option value="SUPER_WHOLESALE">سعر جملة الجملة</option>
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
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <h4 className="font-bold text-white text-sm">بنود وأصناف الفاتورة</h4>
                    {/* Price Tier Selector */}
                    <div className="inline-flex rounded-lg bg-slate-950 p-1 border border-slate-700/80">
                      <button
                        type="button"
                        onClick={() => handlePriceTierChange('RETAIL')}
                        className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                          priceTier === 'RETAIL'
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        سعر التجزئة
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePriceTierChange('WHOLESALE')}
                        className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                          priceTier === 'WHOLESALE'
                            ? 'bg-amber-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        سعر الجملة
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePriceTierChange('SUPER_WHOLESALE')}
                        className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                          priceTier === 'SUPER_WHOLESALE'
                            ? 'bg-purple-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        جملة الجملة
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowQuickSearchModal(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-400 font-bold text-xs cursor-pointer border border-emerald-500/40 transition-all shadow-sm"
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
                        const prod = products.find((p) => p.id === row.productId);
                        const isOverStock = Boolean(prod && row.quantity > prod.stockQty);

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
                              {isOverStock && (
                                <div className="text-[10px] text-amber-400 font-bold flex items-center gap-1 mt-1 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">
                                  <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                                  <span>تنبيه: الكمية ({row.quantity}) تتجاوز الرصيد المتوفر بالمخزن ({prod?.stockQty || 0} {prod?.unit})</span>
                                </div>
                              )}
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
                                className="w-16 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-center text-white font-bold"
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
                                className="w-24 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-center text-white font-bold"
                              />
                            </td>
                            <td className="py-2 px-3 text-center">
                              <FreeNumberInput
                                value={row.discount}
                                onChange={(val) => {
                                  const updated = [...invoiceRows];
                                  updated[idx].discount = val;
                                  setInvoiceRows(updated);
                                }}
                                placeholder="0.00"
                                className="w-20 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-center text-white"
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

              {/* Customer Credit Limit Warning (Onyx Pro rule) */}
              {selectedCustomerObj?.creditLimit && selectedCustomerObj.creditLimit > 0 && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-2 ${
                    (selectedCustomerObj.balance || 0) + formGrand > selectedCustomerObj.creditLimit
                      ? 'bg-red-950/40 border-red-500/50 text-red-200'
                      : 'bg-slate-800/60 border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle
                      className={`w-4 h-4 shrink-0 ${
                        (selectedCustomerObj.balance || 0) + formGrand > selectedCustomerObj.creditLimit
                          ? 'text-red-400'
                          : 'text-amber-400'
                      }`}
                    />
                    <div>
                      <span className="font-bold">حد الائتمان للعميل: </span>
                      <span className="font-mono-num">
                        {selectedCustomerObj.creditLimit.toFixed(2)} {settings.baseCurrency}
                      </span>
                      <span className="mx-2">•</span>
                      <span>الرصيد القائم: </span>
                      <span className="font-mono-num font-bold">
                        {(selectedCustomerObj.balance || 0).toFixed(2)} {settings.baseCurrency}
                      </span>
                    </div>
                  </div>
                  {(selectedCustomerObj.balance || 0) + formGrand > selectedCustomerObj.creditLimit && (
                    <span className="text-[11px] font-bold text-red-300 bg-red-900/60 px-2 py-0.5 rounded border border-red-500/30">
                      ⚠️ تحذير: إجمالي الفاتورة يتجاوز الحد الائتماني
                    </span>
                  )}
                </div>
              )}

              {/* Invoice-Level Discount Input (Onyx Pro) */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                  <span>خصم إجمالي على الفاتورة ({settings.baseCurrency}):</span>
                  <FreeNumberInput
                    value={invoiceDiscount}
                    onChange={(val) => setInvoiceDiscount(val || 0)}
                    placeholder="0.00"
                    className="w-28 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-center text-amber-400 font-bold font-mono-num"
                  />
                </div>
                <div className="text-xs text-slate-400">
                  إجمالي البنود قبل خصم الفاتورة:{' '}
                  <span className="font-mono-num font-bold text-white">
                    {itemsSubtotal.toFixed(2)} {settings.baseCurrency}
                  </span>
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
                <DocumentActionsBar
                  targetElementId="invoice-print-content"
                  filename={`فاتورة_${previewInvoice.invoiceNumber}`}
                  documentTitle={`فاتورة رقم ${previewInvoice.invoiceNumber}`}
                />
                <button
                  type="button"
                  onClick={() => setPreviewInvoice(null)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold border border-slate-600 cursor-pointer transition-all active:scale-95"
                  title="الرجوع إلى قائمة الفواتير"
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

            <div id="invoice-print-content" className="p-8 text-right printable-card text-xs space-y-4">
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

      {/* Hidden Print Container for the Active Selected Invoice (Used by top action bar) */}
      {activeInvoice && (
        <div id="selected-invoice-document-card" className="hidden print:block printable-card p-8 text-right text-xs space-y-4">
          <div className="text-center border-b-2 border-slate-900 pb-3">
            <h3 className="text-lg font-black text-slate-900">{settings.companyName}</h3>
            <div className="text-slate-600 font-mono-num">الرقم الضريبي: {settings.taxNumber}</div>
            <div className="font-bold text-sm text-slate-900 mt-2">فاتورة مبيعات ضريبية رسمية</div>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-slate-100 p-3 rounded-xl text-slate-900">
            <div>
              <div><span className="font-bold">رقم الفاتورة:</span> {activeInvoice.invoiceNumber}</div>
              <div><span className="font-bold">التاريخ:</span> {activeInvoice.date}</div>
            </div>
            <div>
              <div><span className="font-bold">العميل:</span> {activeInvoice.partyName}</div>
              <div><span className="font-bold">طريقة السداد:</span> {activeInvoice.paymentMethod}</div>
            </div>
          </div>

          <table className="w-full text-right border-collapse text-xs text-slate-900">
            <thead>
              <tr className="border-b-2 border-slate-900 bg-slate-200">
                <th className="py-2 px-2">الصنف</th>
                <th className="py-2 px-2 text-center">الكمية</th>
                <th className="py-2 px-2 text-center">السعر</th>
                <th className="py-2 px-2 text-center">الإجمالي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              {activeInvoice.items.map((it) => (
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
              <div>القيد الآلي المرتبط: {activeInvoice.journalEntryId || 'مرحل'}</div>
            </div>
            <div className="w-48 space-y-1 font-mono-num text-xs">
              <div className="flex justify-between">
                <span>الصافي:</span>
                <span>{activeInvoice.subtotal.toFixed(2)} {settings.baseCurrency}</span>
              </div>
              <div className="flex justify-between">
                <span>الضريبة:</span>
                <span>{activeInvoice.taxTotal.toFixed(2)} {settings.baseCurrency}</span>
              </div>
              <div className="flex justify-between font-black text-sm text-slate-900 border-t border-slate-300 pt-1">
                <span>الإجمالي:</span>
                <span>{activeInvoice.grandTotal.toFixed(2)} {settings.baseCurrency}</span>
              </div>
            </div>
          </div>

          <div className="p-2 bg-slate-100 rounded text-slate-800 text-[11px]">
            <span className="font-bold">المبلغ كتابة:</span>{' '}
            {tafqeet(activeInvoice.grandTotal, settings.baseCurrency, 'هللة')}
          </div>
        </div>
      )}

      {/* Onyx Pro: Product Quick Search Modal */}
      <ProductQuickSearchModal
        isOpen={showQuickSearchModal}
        onClose={() => setShowQuickSearchModal(false)}
        onSelectProduct={handleSelectFromQuickSearch}
        priceTier={priceTier}
        title="البحث المتقدم واختيار أصناف الفاتورة"
        excludeProductIds={invoiceRows.map((r) => r.productId)}
      />

      {/* Onyx Pro: Smart Duplicate Prevention & Merging Dialog */}
      <DuplicateItemResolutionModal
        isOpen={Boolean(duplicateItemModalInfo)}
        itemInfo={duplicateItemModalInfo}
        onClose={() => setDuplicateItemModalInfo(null)}
        onResolve={handleResolveDuplicate}
        currency={invoiceCurrency || settings.baseCurrency}
      />
    </div>
  );
};
