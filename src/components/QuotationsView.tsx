import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Printer,
  Calendar,
  CheckCircle,
  ArrowRight,
  PlusCircle,
  Trash2,
  X,
  FileCheck,
  Send,
} from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import { Quotation } from '../types/accounting';
import { tafqeet } from '../utils/tafqeet';

export const QuotationsView: React.FC = () => {
  const {
    quotations,
    contacts,
    products,
    settings,
    createQuotation,
    convertQuoteToInvoice,
    setActiveView,
    currencies,
    addContact,
    deleteQuotation,
    openDeleteConfirm,
    showToast,
  } = useAccounting();

  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [previewQuote, setPreviewQuote] = useState<Quotation | null>(null);

  // New quote form state: Registered customer vs Free text custom customer
  const [customerMode, setCustomerMode] = useState<'REGISTERED' | 'CUSTOM'>('REGISTERED');
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [customName, setCustomName] = useState('');
  const [customPhone, setCustomPhone] = useState('');
  const [customTaxNumber, setCustomTaxNumber] = useState('');
  const [saveToContacts, setSaveToContacts] = useState(false);

  // Currency & Validity
  const [quoteCurrency, setQuoteCurrency] = useState(settings.baseCurrency);
  const [validDays, setValidDays] = useState(15);
  const [notes, setNotes] = useState('عرض السعر ساري لمدة 15 يوماً من تاريخه. الأسعار شاملة ضريبة القيمة المضافة.');
  const [quoteRows, setQuoteRows] = useState<
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

  const filteredQuotes = quotations.filter((q) => {
    return (
      q.quoteNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.partyName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const registeredCustomers = contacts.filter((c) => c.type === 'CUSTOMER');

  const handleOpenCreate = () => {
    if (registeredCustomers.length > 0) {
      setSelectedCustomer(registeredCustomers[0].id);
      setCustomerMode('REGISTERED');
    } else {
      setCustomerMode('CUSTOM');
    }
    setCustomName('');
    setCustomPhone('');
    setCustomTaxNumber('');
    setSaveToContacts(false);
    setQuoteCurrency(settings.baseCurrency);

    if (products.length > 0) {
      setQuoteRows([
        {
          productId: products[0].id,
          productName: products[0].nameAr,
          quantity: 1,
          unitPrice: products[0].salePrice,
          costPrice: products[0].costPrice,
          discount: 0,
          taxRate: settings.taxEnabled !== false ? settings.defaultTaxRate : 0,
        },
      ]);
    } else {
      setQuoteRows([]);
    }
    setShowCreateModal(true);
  };

  const handleProductChange = (index: number, productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    const updated = [...quoteRows];
    updated[index] = {
      ...updated[index],
      productId: prod.id,
      productName: prod.nameAr,
      unitPrice: prod.salePrice,
      costPrice: prod.costPrice,
    };
    setQuoteRows(updated);
  };

  const addRow = () => {
    if (products.length === 0) return;
    setQuoteRows([
      ...quoteRows,
      {
        productId: products[0].id,
        productName: products[0].nameAr,
        quantity: 1,
        unitPrice: products[0].salePrice,
        costPrice: products[0].costPrice,
        discount: 0,
        taxRate: settings.taxEnabled !== false ? settings.defaultTaxRate : 0,
      },
    ]);
  };

  const removeRow = (index: number) => {
    if (quoteRows.length <= 1) return;
    setQuoteRows(quoteRows.filter((_, i) => i !== index));
  };

  const handleSaveQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (quoteRows.length === 0) {
      showToast('يرجى إضافة أصناف لعرض السعر أولاً.', 'error');
      return;
    }

    let partyId = 'cust-walkin';
    let partyName = 'عميل نقدي عام';

    if (customerMode === 'REGISTERED') {
      const cust = contacts.find((c) => c.id === selectedCustomer);
      if (cust) {
        partyId = cust.id;
        partyName = cust.name;
      }
    } else {
      if (!customName.trim()) {
        showToast('يرجى إدخال اسم العميل لعرض السعر.', 'error');
        return;
      }
      partyName = customName.trim();

      // Optionally persist to registered contacts
      if (saveToContacts) {
        const newCust = addContact({
          code: `CUST-${String(registeredCustomers.length + 1).padStart(3, '0')}`,
          name: partyName,
          type: 'CUSTOMER',
          phone: customPhone.trim() || '0500000000',
          taxNumber: customTaxNumber.trim() || undefined,
          accountId: 'acc-1105',
          creditLimit: 10000,
        });
        partyId = newCust.id;
      } else {
        partyId = `cust-custom-${Date.now()}`;
      }
    }

    const validUntilDate = new Date(Date.now() + validDays * 86400000)
      .toISOString()
      .split('T')[0];

    const currConfig = currencies.find((c) => c.code === quoteCurrency);
    const rate = currConfig?.rate || 1.0;

    let fullNotes = notes;
    if (customerMode === 'CUSTOM' && (customPhone.trim() || customTaxNumber.trim())) {
      const extraContact = [
        customPhone.trim() ? `هاتف العميل: ${customPhone.trim()}` : null,
        customTaxNumber.trim() ? `الرقم الضريبي للعميل: ${customTaxNumber.trim()}` : null,
      ]
        .filter(Boolean)
        .join(' | ');
      fullNotes = `${extraContact}\n${notes}`.trim();
    }

    createQuotation({
      partyId,
      partyName,
      validUntil: validUntilDate,
      currency: quoteCurrency,
      exchangeRate: rate,
      items: quoteRows,
      notes: fullNotes,
    });

    showToast('تم حفظ عرض السعر بنجاح ✓', 'success');
    setShowCreateModal(false);
  };

  const handleConvert = (quote: Quotation) => {
    openDeleteConfirm({
      title: 'تحويل عرض السعر إلى فاتورة مبيعات',
      itemName: `عرض السعر رقم: ${quote.quoteNumber}`,
      message: 'هل تريد بالتأكيد اعتماد هذا العرض وتحويله إلى فاتورة مبيعات معتمدة وخصم كميات المخزون وترحيل القيود آلياً؟',
      confirmLabel: 'تحويل لفاتورة الآن',
      onConfirm: () => {
        const inv = convertQuoteToInvoice(quote.id);
        if (inv) {
          showToast(`تم تحويل عرض السعر إلى فاتورة مبيعات رقم ${inv.invoiceNumber} بنجاح!`, 'success');
          setActiveView('invoices');
        }
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <FileText className="w-7 h-7 text-emerald-400" />
            عروض الأسعار للعملاء (Price Quotations)
          </h2>
          <p className="text-sm text-slate-400">
            إنشاء وطباعة عروض أسعار تجارية احترافية، مع ميزة التحويل المباشر إلى فاتورة مبيعات معتمدة بضغطة زر
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4" />
          إنشاء عرض سعر جديد
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ابحث برقم عرض السعر أو اسم العميل..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-3 pr-9 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="text-xs text-slate-400 font-mono-num">
          إجمالي عروض الأسعار: <span className="font-bold text-white">{filteredQuotes.length}</span>
        </div>
      </div>

      {/* Quotations List */}
      {filteredQuotes.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400">
          <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-base font-bold text-white">لا توجد عروض أسعار مسجلة</p>
          <p className="text-xs text-slate-500 mt-1">اضغط على زر "إنشاء عرض سعر جديد" لتقديم تسعيرة للعميل.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900 shadow-xl">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-800/90 text-slate-300 font-bold text-xs uppercase tracking-wider border-b border-slate-700">
              <tr>
                <th className="py-3 px-4">رقم العرض</th>
                <th className="py-3 px-4">تاريخ الإصدار</th>
                <th className="py-3 px-4">ساري حتى تاريخ</th>
                <th className="py-3 px-4">العميل المستهدف</th>
                <th className="py-3 px-4 text-center">المجموع الصافي</th>
                <th className="py-3 px-4 text-center">الضريبة 15%</th>
                <th className="py-3 px-4 text-center">الإجمالي الشامل</th>
                <th className="py-3 px-4 text-center">حالة العرض</th>
                <th className="py-3 px-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredQuotes.map((q) => (
                <tr key={q.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono-num font-bold text-emerald-400 text-xs">
                    {q.quoteNumber}
                  </td>
                  <td className="py-3.5 px-4 font-mono-num text-xs text-slate-400">{q.date}</td>
                  <td className="py-3.5 px-4 font-mono-num text-xs text-amber-400">{q.validUntil}</td>
                  <td className="py-3.5 px-4 font-bold text-white">{q.partyName}</td>
                  <td className="py-3.5 px-4 text-center font-mono-num text-slate-300">
                    {q.subtotal.toFixed(2)} {q.currency || settings.baseCurrency}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono-num text-slate-400 text-xs">
                    {q.taxTotal.toFixed(2)} {q.currency || settings.baseCurrency}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono-num font-extrabold text-white text-base">
                    {q.grandTotal.toFixed(2)} {q.currency || settings.baseCurrency}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {q.status === 'CONVERTED' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        معتمد ومحول لفاتورة
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        عرض سعر قيد الانتظار
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {q.status !== 'CONVERTED' && (
                        <button
                          onClick={() => handleConvert(q)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow transition-colors"
                          title="تحويل إلى فاتورة مبيعات مباشرة"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>تحويل لفاتورة</span>
                        </button>
                      )}
                      <button
                        onClick={() => setPreviewQuote(q)}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                        title="معاينة وطباعة أو حفظ PDF"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          openDeleteConfirm({
                            title: 'تأكيد حذف عرض السعر',
                            itemName: `عرض السعر رقم: ${q.quoteNumber}`,
                            message: `العميل: ${q.partyName} - إجمالي العرض: ${q.grandTotal.toFixed(2)} ${q.currency || settings.baseCurrency}`,
                            onConfirm: () => deleteQuotation(q.id),
                          });
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 text-red-400 hover:text-white hover:bg-red-600 transition-colors cursor-pointer"
                        title="حذف عرض السعر"
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

      {/* CREATE QUOTE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-6">
            <div className="p-4 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                إنشاء عرض سعر جديد للعميل
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white text-xl font-bold p-1 cursor-pointer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveQuote} className="p-6 space-y-6">
              {/* Customer Selection: Registered Account vs Free-Text Custom Name */}
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">العميل الموجه له عرض السعر:</span>
                    <span className="text-[11px] text-slate-400">
                      (يمكنك اختيار عميل مسجل أو كتابة الاسم حراً لأي شخص)
                    </span>
                  </div>

                  <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-700">
                    <button
                      type="button"
                      onClick={() => setCustomerMode('REGISTERED')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        customerMode === 'REGISTERED'
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      عميل مسجل بالقائمة ({registeredCustomers.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomerMode('CUSTOM')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        customerMode === 'CUSTOM'
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      كتابة اسم حر / عميل جديد ✍️
                    </button>
                  </div>
                </div>

                {customerMode === 'REGISTERED' ? (
                  <div>
                    {registeredCustomers.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-300 mb-1">
                            اختر العميل من دفتر العملاء
                          </label>
                          <select
                            value={selectedCustomer}
                            onChange={(e) => setSelectedCustomer(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
                          >
                            {registeredCustomers.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name} ({c.code}) - الرصيد: {c.balance.toFixed(2)} {settings.baseCurrency}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-700/80 text-xs">
                          <div>
                            <span className="text-slate-400 block text-[10px]">كود وهوية العميل:</span>
                            <span className="font-mono-num text-emerald-400 font-bold">
                              {contacts.find((c) => c.id === selectedCustomer)?.code || '-'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">هاتف التواصل:</span>
                            <span className="font-mono-num text-slate-200">
                              {contacts.find((c) => c.id === selectedCustomer)?.phone || 'غير مسجل'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
                        <span>لا يوجد عملاء مسجلين حالياً. يمكنك استخدام خيار "كتابة اسم حر".</span>
                        <button
                          type="button"
                          onClick={() => setCustomerMode('CUSTOM')}
                          className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs cursor-pointer"
                        >
                          كتابة اسم حر الآن
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3 pt-1">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="md:col-span-1">
                        <label className="block text-[11px] font-bold text-emerald-400 mb-1">
                          اسم العميل أو المؤسسة (حر) *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="مثال: شركة النور للتجارة، أحمد خالد..."
                          value={customName}
                          onChange={(e) => setCustomName(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-900 border border-emerald-500/50 rounded-xl text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">
                          رقم الهاتف / الجوال (اختياري)
                        </label>
                        <input
                          type="text"
                          placeholder="05XXXXXXXX"
                          value={customPhone}
                          onChange={(e) => setCustomPhone(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono-num placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">
                          الرقم الضريبي للعميل (اختياري)
                        </label>
                        <input
                          type="text"
                          placeholder="300XXXXXXXXXXXX"
                          value={customTaxNumber}
                          onChange={(e) => setCustomTaxNumber(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono-num placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={saveToContacts}
                        onChange={(e) => setSaveToContacts(e.target.checked)}
                        className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0 w-4 h-4 cursor-pointer"
                      />
                      <span className="font-bold text-slate-200">
                        حفظ هذا العميل تلقائياً في دفتر وحسابات العملاء للرجوع له لاحقاً
                      </span>
                    </label>
                  </div>
                )}
              </div>

              {/* Currency & Validity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    عملة عرض السعر
                  </label>
                  <select
                    value={quoteCurrency}
                    onChange={(e) => setQuoteCurrency(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-emerald-500"
                  >
                    {currencies.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} - {c.name} ({c.symbol}) {c.rate !== 1 && `[سعر الصرف: ${c.rate}]`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    فترة صلاحية العرض (أيام)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={validDays}
                    onChange={(e) => setValidDays(parseInt(e.target.value) || 15)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white font-mono-num font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm">الأصناف والأسعار المقترحة</h4>
                  {products.length > 0 ? (
                    <button
                      type="button"
                      onClick={addRow}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs cursor-pointer border border-emerald-500/30"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      إضافة صنف آخر
                    </button>
                  ) : (
                    <span className="text-xs text-amber-400">
                      يجب إضافة أصناف في المخزون أولاً لتتمكن من تسعيرها.
                    </span>
                  )}
                </div>

                {products.length === 0 ? (
                  <div className="p-6 text-center rounded-xl bg-slate-800/40 border border-slate-800 text-xs text-slate-400">
                    قائمة الأصناف فارغة حالياً (التطبيق مصفر). يرجى الذهاب إلى تبويب "المخزون و COGS" وإضافة أصنافك أولاً.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-800">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-slate-800 text-slate-300">
                        <tr>
                          <th className="py-2.5 px-3">الصنف</th>
                          <th className="py-2.5 px-3 text-center">الكمية</th>
                          <th className="py-2.5 px-3 text-center">سعر العرض للوحدة</th>
                          <th className="py-2.5 px-3 text-center">الخصم</th>
                          <th className="py-2.5 px-3 text-center">إجمالي البند</th>
                          <th className="py-2.5 px-3 text-center">حذف</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {quoteRows.map((row, idx) => {
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
                                    const updated = [...quoteRows];
                                    updated[idx].quantity = parseInt(e.target.value) || 1;
                                    setQuoteRows(updated);
                                  }}
                                  className="w-16 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-center text-white font-mono-num font-bold"
                                />
                              </td>
                              <td className="py-2 px-3 text-center">
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={row.unitPrice}
                                  onChange={(e) => {
                                    const updated = [...quoteRows];
                                    updated[idx].unitPrice = parseFloat(e.target.value) || 0;
                                    setQuoteRows(updated);
                                  }}
                                  className="w-24 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-center text-white font-mono-num font-bold"
                                />
                              </td>
                              <td className="py-2 px-3 text-center">
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={row.discount}
                                  onChange={(e) => {
                                    const updated = [...quoteRows];
                                    updated[idx].discount = parseFloat(e.target.value) || 0;
                                    setQuoteRows(updated);
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
                                  disabled={quoteRows.length <= 1}
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

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  شروط وملاحظات عرض السعر
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
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
                  disabled={products.length === 0}
                  className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-sm cursor-pointer shadow-lg shadow-emerald-600/30"
                >
                  حفظ عرض السعر
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PREVIEW QUOTE MODAL */}
      {previewQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto no-print-bg">
          <div className="bg-white text-slate-900 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden print-only-wrapper">
            <div className="p-4 bg-slate-800 text-white flex items-center justify-between no-print">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">عرض سعر: {previewQuote.quoteNumber}</span>
                <span className="text-[10px] text-emerald-300 hidden sm:inline">💡 اختر "حفظ بتنسيق PDF"</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-600/30"
                  title="طباعة عرض السعر أو حفظه كملف PDF"
                >
                  <Printer className="w-4 h-4" />
                  طباعة / حفظ PDF
                </button>
                <button
                  onClick={() => setPreviewQuote(null)}
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
                <div className="inline-block mt-2 px-3 py-0.5 rounded-full bg-slate-900 text-white font-extrabold text-sm">
                  عرض سعر تجاري (Price Quotation)
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-100 p-3 rounded-xl">
                <div>
                  <div><span className="font-bold">رقم العرض:</span> {previewQuote.quoteNumber}</div>
                  <div><span className="font-bold">تاريخ الإصدار:</span> {previewQuote.date}</div>
                  <div><span className="font-bold">ساري المفعول حتى:</span> {previewQuote.validUntil}</div>
                </div>
                <div>
                  <div><span className="font-bold">مقدم إلى العميل:</span> {previewQuote.partyName}</div>
                  <div><span className="font-bold">الحالة:</span> {previewQuote.status === 'CONVERTED' ? 'معتمد' : 'مقدم'}</div>
                </div>
              </div>

              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="border-b-2 border-slate-900 bg-slate-200">
                    <th className="py-2 px-2">م</th>
                    <th className="py-2 px-2">الصنف والوصف</th>
                    <th className="py-2 px-2 text-center">الكمية</th>
                    <th className="py-2 px-2 text-center">سعر الوحدة</th>
                    <th className="py-2 px-2 text-center">الإجمالي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  {previewQuote.items.map((it, idx) => (
                    <tr key={it.id}>
                      <td className="py-2 px-2 font-mono-num">{idx + 1}</td>
                      <td className="py-2 px-2 font-bold">{it.productName}</td>
                      <td className="py-2 px-2 text-center font-mono-num">{it.quantity}</td>
                      <td className="py-2 px-2 text-center font-mono-num">{it.unitPrice.toFixed(2)}</td>
                      <td className="py-2 px-2 text-center font-mono-num font-bold">{it.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="border-t-2 border-slate-900 pt-3 flex justify-between">
                <div className="text-xs text-slate-600 max-w-xs">
                  <div className="font-bold mb-1">الشروط والأحكام:</div>
                  <div>{previewQuote.notes}</div>
                </div>
                <div className="w-48 space-y-1 font-mono-num text-xs">
                  <div className="flex justify-between">
                    <span>المجموع:</span>
                    <span>{previewQuote.subtotal.toFixed(2)} {previewQuote.currency || settings.baseCurrency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>الضريبة:</span>
                    <span>{previewQuote.taxTotal.toFixed(2)} {previewQuote.currency || settings.baseCurrency}</span>
                  </div>
                  <div className="flex justify-between font-black text-sm text-slate-900 border-t border-slate-300 pt-1">
                    <span>الإجمالي الشامل:</span>
                    <span>{previewQuote.grandTotal.toFixed(2)} {previewQuote.currency || settings.baseCurrency}</span>
                  </div>
                </div>
              </div>

              <div className="p-2 bg-slate-100 rounded text-slate-800 text-[11px]">
                <span className="font-bold">المبلغ كتابة:</span>{' '}
                {tafqeet(previewQuote.grandTotal, previewQuote.currency || settings.baseCurrency, 'هللة')}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
