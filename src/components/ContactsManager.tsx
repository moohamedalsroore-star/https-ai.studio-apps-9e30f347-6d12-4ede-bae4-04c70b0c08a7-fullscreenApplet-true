import React, { useState } from 'react';
import {
  Users,
  UserCheck,
  Building2,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Plus,
  Search,
  FileText,
  DollarSign,
  AlertCircle,
  Printer,
  Edit2,
  Trash2,
  ArrowUpRight,
  ArrowDownLeft,
  MessageSquare,
} from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import { Contact, PaymentMethod } from '../types/accounting';
import { tafqeet } from '../utils/tafqeet';

export const ContactsManager: React.FC = () => {
  const {
    contacts,
    invoices,
    vouchers,
    settings,
    addContact,
    updateContact,
    deleteContact,
    createVoucher,
    accounts,
    openDeleteConfirm,
    showToast,
  } = useAccounting();

  const [activeTab, setActiveTab] = useState<'CUSTOMER' | 'SUPPLIER'>('CUSTOMER');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBalance, setFilterBalance] = useState<'ALL' | 'HAS_BALANCE' | 'ZERO' | 'OVER_LIMIT'>('ALL');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [selectedContactHistory, setSelectedContactHistory] = useState<Contact | null>(null);
  const [quickVoucherContact, setQuickVoucherContact] = useState<Contact | null>(null);

  // Contact form
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'CUSTOMER' as 'CUSTOMER' | 'SUPPLIER',
    phone: '',
    email: '',
    taxNumber: '',
    address: '',
    creditLimit: 0,
    accountId: 'acc-1105',
  });

  // Quick Voucher form
  const [voucherAmount, setVoucherAmount] = useState<number>(0);
  const [voucherMethod, setVoucherMethod] = useState<PaymentMethod>('CASH');
  const [voucherAccount, setVoucherAccount] = useState<string>('acc-1101');
  const [voucherNotes, setVoucherNotes] = useState('');

  // Filtered contacts
  const currentContacts = contacts.filter((c) => c.type === activeTab);

  const filteredContacts = currentContacts.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.taxNumber && c.taxNumber.includes(searchQuery));

    let matchesBalance = true;
    if (filterBalance === 'HAS_BALANCE') matchesBalance = c.balance > 0;
    else if (filterBalance === 'ZERO') matchesBalance = c.balance === 0;
    else if (filterBalance === 'OVER_LIMIT') {
      matchesBalance = Boolean(c.creditLimit && c.creditLimit > 0 && c.balance > c.creditLimit);
    }

    return matchesSearch && matchesBalance;
  });

  // KPI Calculations
  const totalCustomerReceivables = contacts
    .filter((c) => c.type === 'CUSTOMER')
    .reduce((sum, c) => sum + c.balance, 0);

  const totalSupplierPayables = contacts
    .filter((c) => c.type === 'SUPPLIER')
    .reduce((sum, c) => sum + c.balance, 0);

  const overLimitCustomersCount = contacts.filter(
    (c) => c.type === 'CUSTOMER' && c.creditLimit && c.creditLimit > 0 && c.balance > c.creditLimit
  ).length;

  const getWhatsAppUrl = (c: Contact) => {
    const cleanDigits = (c.phone || '').replace(/[^0-9]/g, '');
    let targetPhone = cleanDigits;
    if (targetPhone.startsWith('05')) {
      targetPhone = '966' + targetPhone.slice(1);
    } else if (targetPhone.startsWith('77') || targetPhone.startsWith('73') || targetPhone.startsWith('71') || targetPhone.startsWith('70')) {
      targetPhone = '967' + targetPhone;
    }

    const greeting = 'السلام عليكم ورحمة الله وبركاته،';
    const formattedBal = c.balance.toLocaleString('en-US', { minimumFractionDigits: 2 });
    const text =
      c.type === 'CUSTOMER'
        ? `${greeting}\nعزيزنا العميل: *${c.name}*\nنود تذكيركم بأن رصيد حسابكم الحالي المستحق لدى "*${settings.companyName}*" هو: *${formattedBal} ${settings.baseCurrency}*.\nيرجى التكرم بسداد المبلغ شاكرين لكم حسن تعاونكم الدائم معنا.\nللتواصل: ${settings.phone || ''}`
        : `${greeting}\nالأخوة الكرام في: *${c.name}*\nنود إفادتكم بأن رصيد حسابكم المسجل لدينا هو: *${formattedBal} ${settings.baseCurrency}*.\nمع خالص التحية، *${settings.companyName}*`;

    return targetPhone.length >= 8
      ? `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodeURIComponent(text)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  };

  const handleOpenAdd = () => {
    setEditingContact(null);
    const prefix = activeTab === 'CUSTOMER' ? 'CUST' : 'SUPP';
    const count = currentContacts.length + 1;
    setFormData({
      code: `${prefix}-${String(count).padStart(3, '0')}`,
      name: '',
      type: activeTab,
      phone: '',
      email: '',
      taxNumber: '',
      address: '',
      creditLimit: activeTab === 'CUSTOMER' ? 10000 : 50000,
      accountId: activeTab === 'CUSTOMER' ? 'acc-1105' : 'acc-2101',
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (c: Contact) => {
    setEditingContact(c);
    setFormData({
      code: c.code,
      name: c.name,
      type: c.type,
      phone: c.phone,
      email: c.email || '',
      taxNumber: c.taxNumber || '',
      address: c.address || '',
      creditLimit: c.creditLimit || 0,
      accountId: c.accountId,
    });
    setShowAddModal(true);
  };

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingContact) {
      updateContact(editingContact.id, {
        ...formData,
        creditLimit: Number(formData.creditLimit),
      });
    } else {
      addContact({
        ...formData,
        creditLimit: Number(formData.creditLimit),
      });
    }
    setShowAddModal(false);
  };

  // Quick Voucher Handler
  const handleOpenQuickVoucher = (c: Contact) => {
    setQuickVoucherContact(c);
    setVoucherAmount(c.balance > 0 ? c.balance : 0);
    setVoucherMethod('CASH');
    setVoucherAccount('acc-1101');
    setVoucherNotes(
      c.type === 'CUSTOMER'
        ? `تحصيل دفعة من حساب العميل: ${c.name}`
        : `سداد مستحقات للمورد: ${c.name}`
    );
  };

  const handleSaveQuickVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickVoucherContact || voucherAmount <= 0) return;

    const voucherType = quickVoucherContact.type === 'CUSTOMER' ? 'RECEIPT' : 'PAYMENT';

    createVoucher({
      type: voucherType,
      accountId: voucherAccount,
      partyAccountId: quickVoucherContact.accountId,
      amount: Number(voucherAmount),
      paymentMethod: voucherMethod,
      description: voucherNotes,
      contactId: quickVoucherContact.id,
    });

    setQuickVoucherContact(null);
  };

  // Gather Contact History (Invoices + Vouchers)
  const getContactHistory = (contact: Contact) => {
    const contactInvoices = invoices.filter(
      (inv) => inv.partyId === contact.id || inv.partyName === contact.name
    );

    const contactVouchers = vouchers.filter(
      (v) => v.partyAccountName.includes(contact.name) || v.description.includes(contact.name)
    );

    return { contactInvoices, contactVouchers };
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Users className="w-7 h-7 text-emerald-400" />
            إدارة العملاء والموردين وكشوف الحسابات
          </h2>
          <p className="text-sm text-slate-400">
            متابعة دقيقة لبيانات الاتصال، الحدود الائتمانية، سجل المعاملات، وحالات سداد الفواتير
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            {activeTab === 'CUSTOMER' ? 'إضافة عميل جديد' : 'إضافة مورد جديد'}
          </button>
        </div>
      </div>

      {/* 3 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Receivables */}
        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">إجمالي ديون العملاء (ذمم مدينة)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-mono-num text-2xl font-black text-emerald-400">
              {totalCustomerReceivables.toLocaleString('en-US', { minimumFractionDigits: 2 })}{' '}
              <span className="text-xs font-normal text-slate-400">{settings.baseCurrency}</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              مستحقات على {contacts.filter((c) => c.type === 'CUSTOMER' && c.balance > 0).length} عميل
            </div>
          </div>
        </div>

        {/* Total Payables */}
        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">إجمالي مستحقات الموردين (ذمم دائنة)</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-mono-num text-2xl font-black text-amber-400">
              {totalSupplierPayables.toLocaleString('en-US', { minimumFractionDigits: 2 })}{' '}
              <span className="text-xs font-normal text-slate-400">{settings.baseCurrency}</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              مستحقة لـ {contacts.filter((c) => c.type === 'SUPPLIER' && c.balance > 0).length} مورد
            </div>
          </div>
        </div>

        {/* Credit Limit Watch */}
        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">مراقبة سقف الائتمان</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-mono-num text-2xl font-black text-white">
              {overLimitCustomersCount}{' '}
              <span className="text-xs font-normal text-red-400">عميل متجاوز للحد</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              تنبيه حظر البيع الآجل تلقائياً عند تجاوز السقف المحدد
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Switcher: العملاء / الموردين */}
      <div className="flex border-b border-slate-800 space-x-reverse space-x-4">
        <button
          onClick={() => setActiveTab('CUSTOMER')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'CUSTOMER'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          قائمة العملاء (ذمم مدينة) ({contacts.filter((c) => c.type === 'CUSTOMER').length})
        </button>

        <button
          onClick={() => setActiveTab('SUPPLIER')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'SUPPLIER'
              ? 'border-amber-500 text-amber-400 bg-amber-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          قائمة الموردين (ذمم دائنة) ({contacts.filter((c) => c.type === 'SUPPLIER').length})
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700">
        <div className="flex items-center gap-3 flex-1 min-w-[260px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`ابحث باسم ${activeTab === 'CUSTOMER' ? 'العميل' : 'المورد'}، رقم الهاتف، أو الرقم الضريبي...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-3 pr-9 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <select
            value={filterBalance}
            onChange={(e) => setFilterBalance(e.target.value as any)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">جميع الأرصدة</option>
            <option value="HAS_BALANCE">
              {activeTab === 'CUSTOMER' ? 'عليه مديونية (> 0)' : 'له مستحقات (> 0)'}
            </option>
            <option value="ZERO">حساب خالص (رصيد 0)</option>
            {activeTab === 'CUSTOMER' && <option value="OVER_LIMIT">متجاوز الحد الائتماني</option>}
          </select>
        </div>

        <div className="text-xs text-slate-400">
          إجمالي النتائج: <span className="font-bold text-white">{filteredContacts.length}</span>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900 shadow-xl">
        <table className="w-full text-right text-sm">
          <thead className="bg-slate-800/90 text-slate-300 font-bold text-xs uppercase tracking-wider border-b border-slate-700">
            <tr>
              <th className="py-3 px-4">الكود / الاسم</th>
              <th className="py-3 px-4">بيانات الاتصال</th>
              <th className="py-3 px-4">الرقم الضريبي / السجل</th>
              <th className="py-3 px-4 text-center">الحد الائتماني</th>
              <th className="py-3 px-4 text-center">الرصيد القائم</th>
              <th className="py-3 px-4 text-center">حالة الحساب</th>
              <th className="py-3 px-4 text-center">الإجراءات المحاسبية</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {filteredContacts.map((c) => {
              const isOverLimit = Boolean(c.creditLimit && c.creditLimit > 0 && c.balance > c.creditLimit);
              const hasDebt = c.balance > 0;

              return (
                <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-mono-num font-bold text-emerald-400 text-xs">{c.code}</div>
                    <div className="font-bold text-white text-sm">{c.name}</div>
                    {c.address && (
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        {c.address}
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-xs">
                    <div className="text-slate-200 flex items-center gap-1.5 font-mono-num">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {c.phone}
                    </div>
                    {c.email && (
                      <div className="text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <Mail className="w-3.5 h-3.5 text-slate-500" />
                        {c.email}
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-mono-num text-xs text-slate-300">
                    {c.taxNumber || <span className="text-slate-500 text-[11px]">غير مسجل</span>}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono-num text-xs text-slate-300">
                    {c.creditLimit && c.creditLimit > 0
                      ? `${c.creditLimit.toLocaleString('en-US')} ${settings.baseCurrency}`
                      : 'غير محدد'}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div
                      className={`font-mono-num text-base font-extrabold ${
                        hasDebt
                          ? c.type === 'CUSTOMER'
                            ? 'text-emerald-400'
                            : 'text-amber-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {c.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}{' '}
                      <span className="text-xs font-normal text-slate-400">{settings.baseCurrency}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {isOverLimit ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                        <AlertCircle className="w-3 h-3" />
                        تجاوز الائتمان
                      </span>
                    ) : hasDebt ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {c.type === 'CUSTOMER' ? 'مطلوب سداد' : 'مستحق له'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-700/60 text-slate-300">
                        حساب خالص (0)
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* View Ledger & History */}
                      <button
                        onClick={() => setSelectedContactHistory(c)}
                        title="كشف الحساب وتاريخ المعاملات"
                        className="p-1.5 rounded-lg bg-slate-800 text-cyan-400 hover:bg-cyan-950/50 hover:text-cyan-300 transition-colors cursor-pointer"
                      >
                        <FileText className="w-4 h-4" />
                      </button>

                      {/* Quick Receipt or Payment Voucher */}
                      <button
                        onClick={() => handleOpenQuickVoucher(c)}
                        title={c.type === 'CUSTOMER' ? 'سند قبض فوري' : 'سند صرف فوري'}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          c.type === 'CUSTOMER'
                            ? 'bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/60 hover:text-emerald-300'
                            : 'bg-amber-950/40 text-amber-400 hover:bg-amber-900/60 hover:text-amber-300'
                        }`}
                      >
                        <DollarSign className="w-4 h-4" />
                      </button>

                      {/* WhatsApp Reminder for Debt */}
                      {hasDebt && (
                        <a
                          href={getWhatsAppUrl(c)}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="إرسال رسالة تذكير بالسداد عبر واتساب"
                          className="p-1.5 rounded-lg bg-emerald-950/60 text-emerald-400 hover:bg-emerald-900 hover:text-emerald-300 transition-colors inline-flex items-center cursor-pointer border border-emerald-500/30"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </a>
                      )}

                      {/* Edit */}
                      <button
                        onClick={() => handleOpenEdit(c)}
                        title="تعديل البيانات"
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => {
                          openDeleteConfirm({
                            title: `تأكيد حذف ${c.type === 'CUSTOMER' ? 'العميل' : 'المورد'}`,
                            itemName: `${c.name} (${c.code})`,
                            message: `الرصيد المالي الحالي: ${c.balance.toFixed(2)} ${settings.baseCurrency}. هل أنت متأكد من الحذف نهائياً؟`,
                            onConfirm: () => deleteContact(c.id),
                          });
                        }}
                        title="حذف"
                        className="p-1.5 rounded-lg bg-slate-800 text-red-400 hover:bg-red-950/50 hover:text-red-300 transition-colors cursor-pointer"
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

      {/* DRAWER / MODAL: Contact Transaction History & Ledger */}
      {selectedContactHistory && (() => {
        const { contactInvoices, contactVouchers } = getContactHistory(selectedContactHistory);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col printable-card print:border-none print:shadow-none print:max-h-none print:overflow-visible">
              {/* Header */}
              <div className="p-4 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between no-print">
                <div>
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-400" />
                    كشف حساب وسجل معاملات: {selectedContactHistory.name}
                  </h3>
                  <div className="text-xs text-slate-400 font-mono-num mt-0.5">
                    كود: {selectedContactHistory.code} | هاتف: {selectedContactHistory.phone} | ضريبي: {selectedContactHistory.taxNumber || 'غير مسجل'}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {selectedContactHistory.balance > 0 && (
                    <a
                      href={getWhatsAppUrl(selectedContactHistory)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-colors"
                      title="إرسال مطالبة بالسداد للواتساب"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>تذكير واتساب</span>
                    </a>
                  )}

                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 cursor-pointer transition-all"
                    title="طباعة كشف الحساب أو حفظه بصيغة PDF"
                  >
                    <Printer className="w-4 h-4" />
                    طباعة / حفظ PDF
                  </button>
                  <button
                    onClick={() => setSelectedContactHistory(null)}
                    className="text-slate-400 hover:text-white text-xl font-bold p-1 cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Print-Only Official Document Header */}
              <div className="p-6 text-center border-b-2 border-slate-900 pb-3 hidden print:block text-black">
                <h2 className="text-xl font-black">{settings.companyName}</h2>
                <div className="text-xs font-mono-num mt-1">الرقم الضريبي: {settings.taxNumber}</div>
                <div className="font-bold text-base mt-2">كشف حساب مالي تفصيلي (Account Statement)</div>
                <div className="mt-2 text-xs grid grid-cols-2 text-right bg-slate-100 p-3 rounded">
                  <div><span className="font-bold">اسم الحساب / العميل:</span> {selectedContactHistory.name} ({selectedContactHistory.code})</div>
                  <div><span className="font-bold">الهاتف:</span> {selectedContactHistory.phone} | <span className="font-bold">التاريخ:</span> {new Date().toISOString().split('T')[0]}</div>
                </div>
              </div>

              {/* Balance Summary Header Bar */}
              <div className="p-4 bg-slate-950/60 border-b border-slate-800 grid grid-cols-3 gap-4 text-center">
                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                  <span className="text-xs text-slate-400">إجمالي المعاملات والفواتير</span>
                  <div className="font-mono-num font-bold text-white text-base mt-1">
                    {contactInvoices.length} فاتورة
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                  <span className="text-xs text-slate-400">سندات القبض والصرف المسددة</span>
                  <div className="font-mono-num font-bold text-emerald-400 text-base mt-1">
                    {contactVouchers.length} سند
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                  <span className="text-xs text-slate-400">الرصيد الختامي الحالي</span>
                  <div className="font-mono-num font-extrabold text-amber-400 text-base mt-1">
                    {selectedContactHistory.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}{' '}
                    <span className="text-xs font-normal text-slate-400">{settings.baseCurrency}</span>
                  </div>
                </div>
              </div>

              {/* Transactions List */}
              <div className="p-5 overflow-y-auto space-y-6">
                {/* 1. Invoices & Payment Statuses */}
                <div>
                  <h4 className="font-bold text-white text-sm mb-3 flex items-center justify-between">
                    <span>فواتير {selectedContactHistory.type === 'CUSTOMER' ? 'المبيعات' : 'المشتريات'} وحالات السداد</span>
                    <span className="text-xs text-slate-400 font-mono-num">({contactInvoices.length})</span>
                  </h4>

                  {contactInvoices.length === 0 ? (
                    <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 text-center text-xs text-slate-400">
                      لا توجد فواتير مسجلة حتى الآن
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-800">
                      <table className="w-full text-right text-xs">
                        <thead className="bg-slate-800 text-slate-300">
                          <tr>
                            <th className="py-2.5 px-3">رقم الفاتورة</th>
                            <th className="py-2.5 px-3">التاريخ</th>
                            <th className="py-2.5 px-3 text-center">طريقة الدفع</th>
                            <th className="py-2.5 px-3 text-center">إجمالي الفاتورة</th>
                            <th className="py-2.5 px-3 text-center">المبلغ المسدد</th>
                            <th className="py-2.5 px-3 text-center">المتبقي غير مسدد</th>
                            <th className="py-2.5 px-3 text-center">حالة السداد</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {contactInvoices.map((inv) => (
                            <tr key={inv.id} className="hover:bg-slate-800/30">
                              <td className="py-2.5 px-3 font-mono-num font-bold text-emerald-400">
                                {inv.invoiceNumber}
                              </td>
                              <td className="py-2.5 px-3 font-mono-num text-slate-400">{inv.date}</td>
                              <td className="py-2.5 px-3 text-center text-slate-300">
                                {inv.paymentMethod === 'CASH' && 'نقدي'}
                                {inv.paymentMethod === 'CREDIT' && 'آجل'}
                                {inv.paymentMethod === 'BANK' && 'تحويل بنكي / شبكة'}
                                {inv.paymentMethod === 'SPLIT' && 'جزئي'}
                              </td>
                              <td className="py-2.5 px-3 text-center font-mono-num font-bold text-white">
                                {inv.grandTotal.toFixed(2)} {settings.baseCurrency}
                              </td>
                              <td className="py-2.5 px-3 text-center font-mono-num text-emerald-400">
                                {inv.paidAmount.toFixed(2)} {settings.baseCurrency}
                              </td>
                              <td className="py-2.5 px-3 text-center font-mono-num font-bold text-red-400">
                                {inv.remainingAmount.toFixed(2)} {settings.baseCurrency}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                {inv.status === 'PAID' && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                                    مسددة بالكامل
                                  </span>
                                )}
                                {inv.status === 'PARTIAL' && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400">
                                    مسددة جزئياً
                                  </span>
                                )}
                                {inv.status === 'UNPAID' && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400">
                                    غير مسددة
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* 2. Vouchers History */}
                <div>
                  <h4 className="font-bold text-white text-sm mb-3">سجل سندات القبض والصرف المسجلة</h4>
                  {contactVouchers.length === 0 ? (
                    <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 text-center text-xs text-slate-400">
                      لا توجد سندات قبض أو صرف منفصلة
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {contactVouchers.map((v) => (
                        <div
                          key={v.id}
                          className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${v.type === 'RECEIPT' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                              {v.type === 'RECEIPT' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                            </div>
                            <div>
                              <div className="font-mono-num font-bold text-white">{v.voucherNumber} - {v.date}</div>
                              <div className="text-slate-400">{v.description}</div>
                            </div>
                          </div>
                          <div className="text-left font-mono-num">
                            <div className="font-bold text-emerald-400 text-sm">
                              {v.amount.toFixed(2)} {settings.baseCurrency}
                            </div>
                            <div className="text-[10px] text-slate-500">{v.accountName}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL 1: Add / Edit Contact */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-4 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                {editingContact
                  ? `تعديل بيانات ${formData.type === 'CUSTOMER' ? 'العميل' : 'المورد'}`
                  : `إضافة ${formData.type === 'CUSTOMER' ? 'عميل' : 'مورد'} جديد`}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-xl font-bold p-1 cursor-pointer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveContact} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">الكود</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-mono-num"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">النوع</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white"
                  >
                    <option value="CUSTOMER">عميل (ذمم مدينة)</option>
                    <option value="SUPPLIER">مورد (ذمم دائنة)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  الاسم الكامل / اسم الشركة أو المؤسسة
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: مؤسسة النور للتجارة"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">رقم الهاتف / الجوال</label>
                  <input
                    type="text"
                    required
                    placeholder="05xxxxxxxx"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-mono-num"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">البريد الإلكتروني</label>
                  <input
                    type="email"
                    placeholder="name@domain.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">الرقم الضريبي (VAT ID)</label>
                  <input
                    type="text"
                    placeholder="300xxxxxxxxx"
                    value={formData.taxNumber}
                    onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-mono-num"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-purple-400 mb-1">
                    الحد الائتماني المسموح به ({settings.baseCurrency})
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.creditLimit}
                    onChange={(e) => setFormData({ ...formData, creditLimit: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-purple-300 font-mono-num font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">العنوان الوطني / المدينة</label>
                <input
                  type="text"
                  placeholder="مثال: الرياض - طريق الملك فهد"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm cursor-pointer shadow-lg shadow-emerald-600/30"
                >
                  {editingContact ? 'حفظ التعديلات' : 'إضافة جهة الاتصال'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Quick Receipt / Payment Voucher */}
      {quickVoucherContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className={`p-4 border-b flex items-center justify-between ${
              quickVoucherContact.type === 'CUSTOMER'
                ? 'bg-emerald-950/40 border-emerald-500/30'
                : 'bg-amber-950/40 border-amber-500/30'
            }`}>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                {quickVoucherContact.type === 'CUSTOMER'
                  ? `سند قبض نقدي من: ${quickVoucherContact.name}`
                  : `سند صرف للمورد: ${quickVoucherContact.name}`}
              </h3>
              <button
                onClick={() => setQuickVoucherContact(null)}
                className="text-slate-400 hover:text-white text-xl font-bold p-1 cursor-pointer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveQuickVoucher} className="p-5 space-y-4">
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex justify-between text-xs">
                <span className="text-slate-400">الرصيد القائم الحالي:</span>
                <span className="font-mono-num font-bold text-white text-sm">
                  {quickVoucherContact.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })} {settings.baseCurrency}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-400 mb-1">
                  المبلغ المدفوع ({settings.baseCurrency})
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={voucherAmount}
                  onChange={(e) => setVoucherAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-lg font-bold text-white font-mono-num"
                />
                {voucherAmount > 0 && (
                  <div className="text-[11px] text-slate-400 mt-1 italic">
                    {tafqeet(voucherAmount, settings.baseCurrency, 'هللة')}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">طريقة السداد</label>
                  <select
                    value={voucherMethod}
                    onChange={(e) => setVoucherMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                  >
                    <option value="CASH">نقداً</option>
                    <option value="BANK">تحويل بنكي / شبكة</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">الصندوق أو البنك</label>
                  <select
                    value={voucherAccount}
                    onChange={(e) => setVoucherAccount(e.target.value)}
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
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">البيان / ملاحظات السند</label>
                <input
                  type="text"
                  required
                  value={voucherNotes}
                  onChange={(e) => setVoucherNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setQuickVoucherContact(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm cursor-pointer shadow-lg shadow-emerald-600/30"
                >
                  حفظ وترحيل السند آلياً
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
