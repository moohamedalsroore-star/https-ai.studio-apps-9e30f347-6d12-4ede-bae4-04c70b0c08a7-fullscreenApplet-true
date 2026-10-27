import {
  Account,
  Invoice,
  JournalEntry,
  JournalLine,
  Product,
  Voucher,
  Contact,
  SystemSettings,
  ReturnInvoice,
  StockReceiptNote,
} from '../types/accounting';

export function generateId(prefix: string = 'id'): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
}

export function calculateInvoiceTotals(items: Invoice['items'], discountTotal: number = 0) {
  let subtotal = 0;
  let taxTotal = 0;
  let totalCost = 0;

  for (const item of items) {
    const lineSubtotal = item.quantity * item.unitPrice - (item.discount || 0);
    const lineTax = lineSubtotal * (item.taxRate || 0);
    item.taxAmount = lineTax;
    item.total = lineSubtotal + lineTax;

    subtotal += lineSubtotal;
    taxTotal += lineTax;
    totalCost += item.quantity * (item.costPrice || 0);
  }

  const grandTotal = Math.max(0, subtotal - discountTotal + taxTotal);

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    taxTotal: Math.round(taxTotal * 100) / 100,
    grandTotal: Math.round(grandTotal * 100) / 100,
    totalCost: Math.round(totalCost * 100) / 100,
  };
}

/**
 * Automated Journal Entry for Sales Invoice (Multi-Currency Compliant)
 * Debit and credit are always converted and posted in Base Currency.
 */
export function generateSalesInvoiceJournal(
  invoice: Invoice,
  accounts: Account[],
  _settings: SystemSettings
): JournalEntry {
  const lines: JournalLine[] = [];
  const entryDate = invoice.date || new Date().toISOString().split('T')[0];
  const rate = invoice.exchangeRate || 1.0;
  const curr = invoice.currency || _settings.baseCurrency;

  const cashAccount =
    accounts.find((a) => a.id === invoice.cashAccountId) ||
    accounts.find((a) => a.code === '1102') ||
    accounts.find((a) => a.code === '1101');

  const receivableAccount = accounts.find((a) => a.code === '1105');
  const salesRevAccount = accounts.find((a) => a.code === '4101');
  const vatOutputAccount = accounts.find((a) => a.code === '2102');
  const cogsAccount = accounts.find((a) => a.code === '5101');
  const inventoryAccount = accounts.find((a) => a.code === '1106');

  // Convert amounts to Base Currency
  const grandTotalBase = Math.round(invoice.grandTotal * rate * 100) / 100;
  const netSalesBase = Math.round((invoice.subtotal - invoice.discountTotal) * rate * 100) / 100;
  const taxTotalBase = Math.round(invoice.taxTotal * rate * 100) / 100;
  const paidBase = Math.round(invoice.paidAmount * rate * 100) / 100;
  const remainingBase = Math.round(invoice.remainingAmount * rate * 100) / 100;

  if (invoice.paymentMethod === 'CASH' || invoice.paymentMethod === 'BANK') {
    lines.push({
      id: generateId('line'),
      accountId: cashAccount?.id || 'acc-1102',
      accountCode: cashAccount?.code || '1102',
      accountName: cashAccount?.nameAr || 'صندوق الكاشير / البنك',
      debit: grandTotalBase,
      credit: 0,
      currency: curr,
      exchangeRate: rate,
      foreignAmount: invoice.grandTotal,
      memo: `تحصيل مبيعات ${invoice.invoiceNumber} (${curr} ${invoice.grandTotal.toFixed(2)})`,
    });
  } else if (invoice.paymentMethod === 'CREDIT') {
    lines.push({
      id: generateId('line'),
      accountId: receivableAccount?.id || 'acc-1105',
      accountCode: receivableAccount?.code || '1105',
      accountName: `${receivableAccount?.nameAr || 'العملاء'} - ${invoice.partyName}`,
      debit: grandTotalBase,
      credit: 0,
      currency: curr,
      exchangeRate: rate,
      foreignAmount: invoice.grandTotal,
      memo: `مبيعات آجلة ${invoice.invoiceNumber} (${curr} ${invoice.grandTotal.toFixed(2)}) - ${invoice.partyName}`,
    });
  } else if (invoice.paymentMethod === 'SPLIT') {
    if (invoice.paidAmount > 0) {
      lines.push({
        id: generateId('line'),
        accountId: cashAccount?.id || 'acc-1102',
        accountCode: cashAccount?.code || '1102',
        accountName: cashAccount?.nameAr || 'صندوق الكاشير',
        debit: paidBase,
        credit: 0,
        currency: curr,
        exchangeRate: rate,
        foreignAmount: invoice.paidAmount,
        memo: `دفعة نقدية لفاتورة ${invoice.invoiceNumber}`,
      });
    }
    if (invoice.remainingAmount > 0) {
      lines.push({
        id: generateId('line'),
        accountId: receivableAccount?.id || 'acc-1105',
        accountCode: receivableAccount?.code || '1105',
        accountName: `${receivableAccount?.nameAr || 'العملاء'} - ${invoice.partyName}`,
        debit: remainingBase,
        credit: 0,
        currency: curr,
        exchangeRate: rate,
        foreignAmount: invoice.remainingAmount,
        memo: `المتبقي آجل لفاتورة ${invoice.invoiceNumber}`,
      });
    }
  }

  // Credit Sales Revenue (in Base)
  lines.push({
    id: generateId('line'),
    accountId: salesRevAccount?.id || 'acc-4101',
    accountCode: salesRevAccount?.code || '4101',
    accountName: salesRevAccount?.nameAr || 'إيراد مبيعات المنتجات',
    debit: 0,
    credit: netSalesBase,
    currency: curr,
    exchangeRate: rate,
    foreignAmount: invoice.subtotal - invoice.discountTotal,
    memo: `إيراد مبيعات فاتورة رقم ${invoice.invoiceNumber}`,
  });

  // Credit VAT Output Tax (in Base)
  if (invoice.taxTotal > 0) {
    lines.push({
      id: generateId('line'),
      accountId: vatOutputAccount?.id || 'acc-2102',
      accountCode: vatOutputAccount?.code || '2102',
      accountName: vatOutputAccount?.nameAr || 'ضريبة القيمة المضافة مخرجات',
      debit: 0,
      credit: taxTotalBase,
      currency: curr,
      exchangeRate: rate,
      foreignAmount: invoice.taxTotal,
      memo: `ضريبة مبيعات 15% للفاتورة رقم ${invoice.invoiceNumber}`,
    });
  }

  // COGS & Inventory (Cost is tracked in base currency)
  const totalCostBase = invoice.items.reduce(
    (sum, it) => sum + it.quantity * (it.costPrice || 0),
    0
  );
  if (totalCostBase > 0) {
    lines.push({
      id: generateId('line'),
      accountId: cogsAccount?.id || 'acc-5101',
      accountCode: cogsAccount?.code || '5101',
      accountName: cogsAccount?.nameAr || 'تكلفة البضاعة المباعة',
      debit: totalCostBase,
      credit: 0,
      memo: `تكلفة بضاعة فاتورة مبيعات ${invoice.invoiceNumber}`,
    });
    lines.push({
      id: generateId('line'),
      accountId: inventoryAccount?.id || 'acc-1106',
      accountCode: inventoryAccount?.code || '1106',
      accountName: inventoryAccount?.nameAr || 'مخزون البضاعة بالمستودع',
      debit: 0,
      credit: totalCostBase,
      memo: `صرف مخزون للفاتورة رقم ${invoice.invoiceNumber}`,
    });
  }

  const totalDebit = lines.reduce((s, l) => s + l.debit, 0);
  const totalCredit = lines.reduce((s, l) => s + l.credit, 0);

  return {
    id: generateId('je'),
    entryNumber: `JV-${invoice.invoiceNumber}`,
    date: entryDate,
    description: `قيد آلي لمبيعات ${invoice.invoiceNumber} (${curr} ${invoice.grandTotal.toFixed(2)}) بمعدل صرف ${rate}`,
    sourceType: 'SALES_INVOICE',
    sourceId: invoice.id,
    branchId: invoice.branchId,
    currency: curr,
    exchangeRate: rate,
    lines,
    totalDebit: Math.round(totalDebit * 100) / 100,
    totalCredit: Math.round(totalCredit * 100) / 100,
    isBalanced: Math.abs(totalDebit - totalCredit) < 0.05,
    isPosted: true,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Automated Journal Entry for Purchase Invoice (Multi-Currency)
 */
export function generatePurchaseInvoiceJournal(
  invoice: Invoice,
  accounts: Account[],
  _settings: SystemSettings
): JournalEntry {
  const lines: JournalLine[] = [];
  const entryDate = invoice.date || new Date().toISOString().split('T')[0];
  const rate = invoice.exchangeRate || 1.0;
  const curr = invoice.currency || _settings.baseCurrency;

  const cashAccount =
    accounts.find((a) => a.id === invoice.cashAccountId) ||
    accounts.find((a) => a.code === '1101');
  const payableAccount = accounts.find((a) => a.code === '2101');
  const inventoryAccount = accounts.find((a) => a.code === '1106');
  const vatInputAccount = accounts.find((a) => a.code === '1107');

  const grandTotalBase = Math.round(invoice.grandTotal * rate * 100) / 100;
  const netPurchaseBase = Math.round((invoice.subtotal - invoice.discountTotal) * rate * 100) / 100;
  const taxTotalBase = Math.round(invoice.taxTotal * rate * 100) / 100;

  lines.push({
    id: generateId('line'),
    accountId: inventoryAccount?.id || 'acc-1106',
    accountCode: inventoryAccount?.code || '1106',
    accountName: inventoryAccount?.nameAr || 'مخزون البضاعة بالمستودع',
    debit: netPurchaseBase,
    credit: 0,
    currency: curr,
    exchangeRate: rate,
    foreignAmount: invoice.subtotal - invoice.discountTotal,
    memo: `إضافة مخزون بفاتورة شراء ${invoice.invoiceNumber}`,
  });

  if (invoice.taxTotal > 0) {
    lines.push({
      id: generateId('line'),
      accountId: vatInputAccount?.id || 'acc-1107',
      accountCode: vatInputAccount?.code || '1107',
      accountName: vatInputAccount?.nameAr || 'ضريبة القيمة المضافة مدخلات',
      debit: taxTotalBase,
      credit: 0,
      currency: curr,
      exchangeRate: rate,
      foreignAmount: invoice.taxTotal,
      memo: `ضريبة مشتريات للفاتورة رقم ${invoice.invoiceNumber}`,
    });
  }

  if (invoice.paymentMethod === 'CASH' || invoice.paymentMethod === 'BANK') {
    lines.push({
      id: generateId('line'),
      accountId: cashAccount?.id || 'acc-1101',
      accountCode: cashAccount?.code || '1101',
      accountName: cashAccount?.nameAr || 'الصندوق الرئيسي',
      debit: 0,
      credit: grandTotalBase,
      currency: curr,
      exchangeRate: rate,
      foreignAmount: invoice.grandTotal,
      memo: `سداد نقدي لفاتورة مشتريات رقم ${invoice.invoiceNumber}`,
    });
  } else {
    lines.push({
      id: generateId('line'),
      accountId: payableAccount?.id || 'acc-2101',
      accountCode: payableAccount?.code || '2101',
      accountName: `${payableAccount?.nameAr || 'الموردون'} - ${invoice.partyName}`,
      debit: 0,
      credit: grandTotalBase,
      currency: curr,
      exchangeRate: rate,
      foreignAmount: invoice.grandTotal,
      memo: `فاتورة مشتريات آجلة ${invoice.invoiceNumber} (${curr} ${invoice.grandTotal.toFixed(2)})`,
    });
  }

  const totalDebit = lines.reduce((s, l) => s + l.debit, 0);
  const totalCredit = lines.reduce((s, l) => s + l.credit, 0);

  return {
    id: generateId('je'),
    entryNumber: `JV-${invoice.invoiceNumber}`,
    date: entryDate,
    description: `قيد آلي لمشتريات ${invoice.invoiceNumber} (${curr} ${invoice.grandTotal.toFixed(2)}) بمعدل صرف ${rate}`,
    sourceType: 'PURCHASE_INVOICE',
    sourceId: invoice.id,
    branchId: invoice.branchId,
    currency: curr,
    exchangeRate: rate,
    lines,
    totalDebit: Math.round(totalDebit * 100) / 100,
    totalCredit: Math.round(totalCredit * 100) / 100,
    isBalanced: Math.abs(totalDebit - totalCredit) < 0.05,
    isPosted: true,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Automated Journal Entry for Vouchers (Multi-Currency)
 */
export function generateVoucherJournal(voucher: Voucher, accounts: Account[]): JournalEntry {
  const lines: JournalLine[] = [];
  const entryDate = voucher.date || new Date().toISOString().split('T')[0];
  const rate = voucher.exchangeRate || 1.0;
  const curr = voucher.currency || 'SAR';
  const amountBase = Math.round(voucher.amount * rate * 100) / 100;

  const cashOrBank = accounts.find((a) => a.id === voucher.accountId);
  const counterpartyAcc = accounts.find((a) => a.id === voucher.partyAccountId);

  if (voucher.type === 'RECEIPT') {
    lines.push({
      id: generateId('line'),
      accountId: cashOrBank?.id || voucher.accountId,
      accountCode: cashOrBank?.code || '1101',
      accountName: cashOrBank?.nameAr || voucher.accountName,
      debit: amountBase,
      credit: 0,
      currency: curr,
      exchangeRate: rate,
      foreignAmount: voucher.amount,
      memo: voucher.description || `سند قبض ${voucher.voucherNumber}`,
    });

    lines.push({
      id: generateId('line'),
      accountId: counterpartyAcc?.id || voucher.partyAccountId,
      accountCode: counterpartyAcc?.code || '1105',
      accountName: counterpartyAcc?.nameAr || voucher.partyAccountName,
      debit: 0,
      credit: amountBase,
      currency: curr,
      exchangeRate: rate,
      foreignAmount: voucher.amount,
      memo: voucher.description || `قبض من ${voucher.partyAccountName}`,
    });
  } else {
    lines.push({
      id: generateId('line'),
      accountId: counterpartyAcc?.id || voucher.partyAccountId,
      accountCode: counterpartyAcc?.code || '2101',
      accountName: counterpartyAcc?.nameAr || voucher.partyAccountName,
      debit: amountBase,
      credit: 0,
      currency: curr,
      exchangeRate: rate,
      foreignAmount: voucher.amount,
      memo: voucher.description || `سند صرف ${voucher.voucherNumber}`,
    });

    lines.push({
      id: generateId('line'),
      accountId: cashOrBank?.id || voucher.accountId,
      accountCode: cashOrBank?.code || '1101',
      accountName: cashOrBank?.nameAr || voucher.accountName,
      debit: 0,
      credit: amountBase,
      currency: curr,
      exchangeRate: rate,
      foreignAmount: voucher.amount,
      memo: voucher.description || `صرف لصالح ${voucher.partyAccountName}`,
    });
  }

  const totalDebit = lines.reduce((s, l) => s + l.debit, 0);
  const totalCredit = lines.reduce((s, l) => s + l.credit, 0);

  return {
    id: generateId('je'),
    entryNumber: `JV-${voucher.voucherNumber}`,
    date: entryDate,
    description: `قيد آلي لـ ${voucher.type === 'RECEIPT' ? 'سند قبض' : 'سند صرف'} ${voucher.voucherNumber} (${curr} ${voucher.amount})`,
    sourceType: voucher.type === 'RECEIPT' ? 'RECEIPT_VOUCHER' : 'PAYMENT_VOUCHER',
    sourceId: voucher.id,
    branchId: voucher.branchId,
    currency: curr,
    exchangeRate: rate,
    lines,
    totalDebit: Math.round(totalDebit * 100) / 100,
    totalCredit: Math.round(totalCredit * 100) / 100,
    isBalanced: Math.abs(totalDebit - totalCredit) < 0.01,
    isPosted: true,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Automated Journal Entry for Sales Return
 */
export function generateSalesReturnJournal(
  retInv: ReturnInvoice,
  accounts: Account[],
  _settings: SystemSettings
): JournalEntry {
  const lines: JournalLine[] = [];
  const entryDate = retInv.date || new Date().toISOString().split('T')[0];
  const rate = retInv.exchangeRate || 1.0;
  const curr = retInv.currency || _settings.baseCurrency;

  const salesReturnAcc = accounts.find((a) => a.code === '4102') || accounts.find((a) => a.code === '4101');
  const vatOutputAccount = accounts.find((a) => a.code === '2102');
  const cashAccount = accounts.find((a) => a.code === '1101') || accounts.find((a) => a.code === '1102');
  const receivableAccount = accounts.find((a) => a.code === '1105');
  const cogsAccount = accounts.find((a) => a.code === '5101');
  const inventoryAccount = accounts.find((a) => a.code === '1106');

  const grandTotalBase = Math.round(retInv.grandTotal * rate * 100) / 100;
  const subtotalBase = Math.round(retInv.subtotal * rate * 100) / 100;
  const taxTotalBase = Math.round(retInv.taxTotal * rate * 100) / 100;

  lines.push({
    id: generateId('line'),
    accountId: salesReturnAcc?.id || 'acc-4102',
    accountCode: salesReturnAcc?.code || '4102',
    accountName: salesReturnAcc?.nameAr || 'مردودات المبيعات',
    debit: subtotalBase,
    credit: 0,
    currency: curr,
    exchangeRate: rate,
    foreignAmount: retInv.subtotal,
    memo: `مردود مبيعات سند رقم ${retInv.returnNumber}`,
  });

  if (retInv.taxTotal > 0) {
    lines.push({
      id: generateId('line'),
      accountId: vatOutputAccount?.id || 'acc-2102',
      accountCode: vatOutputAccount?.code || '2102',
      accountName: vatOutputAccount?.nameAr || 'ضريبة القيمة المضافة مخرجات',
      debit: taxTotalBase,
      credit: 0,
      currency: curr,
      exchangeRate: rate,
      foreignAmount: retInv.taxTotal,
      memo: `عكس ضريبة مخرجات لمردود مبيعات رقم ${retInv.returnNumber}`,
    });
  }

  if (retInv.paymentMethod === 'CASH' || retInv.paymentMethod === 'BANK') {
    lines.push({
      id: generateId('line'),
      accountId: cashAccount?.id || 'acc-1101',
      accountCode: cashAccount?.code || '1101',
      accountName: cashAccount?.nameAr || 'الصندوق الرئيسي',
      debit: 0,
      credit: grandTotalBase,
      currency: curr,
      exchangeRate: rate,
      foreignAmount: retInv.grandTotal,
      memo: `رد نقدي للعميل لمردود رقم ${retInv.returnNumber}`,
    });
  } else {
    lines.push({
      id: generateId('line'),
      accountId: receivableAccount?.id || 'acc-1105',
      accountCode: receivableAccount?.code || '1105',
      accountName: `${receivableAccount?.nameAr || 'العملاء'} - ${retInv.partyName}`,
      debit: 0,
      credit: grandTotalBase,
      currency: curr,
      exchangeRate: rate,
      foreignAmount: retInv.grandTotal,
      memo: `تخفيض حساب العميل لمردود مبيعات رقم ${retInv.returnNumber}`,
    });
  }

  const totalCost = retInv.items.reduce((s, it) => s + it.quantity * (it.costPrice || 0), 0);
  if (totalCost > 0) {
    lines.push({
      id: generateId('line'),
      accountId: inventoryAccount?.id || 'acc-1106',
      accountCode: inventoryAccount?.code || '1106',
      accountName: inventoryAccount?.nameAr || 'مخزون البضاعة بالمستودع',
      debit: totalCost,
      credit: 0,
      memo: `إعادة إدخال بضاعة مرتجعة للمخزن سند ${retInv.returnNumber}`,
    });

    lines.push({
      id: generateId('line'),
      accountId: cogsAccount?.id || 'acc-5101',
      accountCode: cogsAccount?.code || '5101',
      accountName: cogsAccount?.nameAr || 'تكلفة البضاعة المباعة',
      debit: 0,
      credit: totalCost,
      memo: `تخفيض تكلفة المبيعات لمردود رقم ${retInv.returnNumber}`,
    });
  }

  const totalDebit = lines.reduce((s, l) => s + l.debit, 0);
  const totalCredit = lines.reduce((s, l) => s + l.credit, 0);

  return {
    id: generateId('je-ret'),
    entryNumber: `JV-${retInv.returnNumber}`,
    date: entryDate,
    description: `قيد آلي لمردود مبيعات ${retInv.returnNumber} (${curr} ${retInv.grandTotal.toFixed(2)})`,
    sourceType: 'SALES_RETURN',
    sourceId: retInv.id,
    branchId: retInv.branchId,
    currency: curr,
    exchangeRate: rate,
    lines,
    totalDebit: Math.round(totalDebit * 100) / 100,
    totalCredit: Math.round(totalCredit * 100) / 100,
    isBalanced: Math.abs(totalDebit - totalCredit) < 0.05,
    isPosted: true,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Automated Journal Entry for Purchase Return
 */
export function generatePurchaseReturnJournal(
  retInv: ReturnInvoice,
  accounts: Account[],
  _settings: SystemSettings
): JournalEntry {
  const lines: JournalLine[] = [];
  const entryDate = retInv.date || new Date().toISOString().split('T')[0];
  const rate = retInv.exchangeRate || 1.0;
  const curr = retInv.currency || _settings.baseCurrency;

  const cashAccount = accounts.find((a) => a.code === '1101');
  const payableAccount = accounts.find((a) => a.code === '2101');
  const inventoryAccount = accounts.find((a) => a.code === '1106');
  const vatInputAccount = accounts.find((a) => a.code === '1107');

  const grandTotalBase = Math.round(retInv.grandTotal * rate * 100) / 100;
  const subtotalBase = Math.round(retInv.subtotal * rate * 100) / 100;
  const taxTotalBase = Math.round(retInv.taxTotal * rate * 100) / 100;

  if (retInv.paymentMethod === 'CASH' || retInv.paymentMethod === 'BANK') {
    lines.push({
      id: generateId('line'),
      accountId: cashAccount?.id || 'acc-1101',
      accountCode: cashAccount?.code || '1101',
      accountName: cashAccount?.nameAr || 'الصندوق الرئيسي',
      debit: grandTotalBase,
      credit: 0,
      currency: curr,
      exchangeRate: rate,
      foreignAmount: retInv.grandTotal,
      memo: `استرداد نقدي لمردود مشتريات رقم ${retInv.returnNumber}`,
    });
  } else {
    lines.push({
      id: generateId('line'),
      accountId: payableAccount?.id || 'acc-2101',
      accountCode: payableAccount?.code || '2101',
      accountName: `${payableAccount?.nameAr || 'الموردون'} - ${retInv.partyName}`,
      debit: grandTotalBase,
      credit: 0,
      currency: curr,
      exchangeRate: rate,
      foreignAmount: retInv.grandTotal,
      memo: `تخفيض مديونية المورد لمردود مشتريات رقم ${retInv.returnNumber}`,
    });
  }

  lines.push({
    id: generateId('line'),
    accountId: inventoryAccount?.id || 'acc-1106',
    accountCode: inventoryAccount?.code || '1106',
    accountName: inventoryAccount?.nameAr || 'مخزون البضاعة بالمستودع',
    debit: 0,
    credit: subtotalBase,
    currency: curr,
    exchangeRate: rate,
    foreignAmount: retInv.subtotal,
    memo: `إخراج بضاعة مرتجعة للمورد سند ${retInv.returnNumber}`,
  });

  if (retInv.taxTotal > 0) {
    lines.push({
      id: generateId('line'),
      accountId: vatInputAccount?.id || 'acc-1107',
      accountCode: vatInputAccount?.code || '1107',
      accountName: vatInputAccount?.nameAr || 'ضريبة القيمة المضافة مدخلات',
      debit: 0,
      credit: taxTotalBase,
      currency: curr,
      exchangeRate: rate,
      foreignAmount: retInv.taxTotal,
      memo: `عكس ضريبة مدخلات لمردود مشتريات سند ${retInv.returnNumber}`,
    });
  }

  const totalDebit = lines.reduce((s, l) => s + l.debit, 0);
  const totalCredit = lines.reduce((s, l) => s + l.credit, 0);

  return {
    id: generateId('je-pret'),
    entryNumber: `JV-${retInv.returnNumber}`,
    date: entryDate,
    description: `قيد آلي لمردود مشتريات ${retInv.returnNumber} (${curr} ${retInv.grandTotal.toFixed(2)})`,
    sourceType: 'PURCHASE_RETURN',
    sourceId: retInv.id,
    branchId: retInv.branchId,
    currency: curr,
    exchangeRate: rate,
    lines,
    totalDebit: Math.round(totalDebit * 100) / 100,
    totalCredit: Math.round(totalCredit * 100) / 100,
    isBalanced: Math.abs(totalDebit - totalCredit) < 0.05,
    isPosted: true,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Currency Revaluation Journal Entry (قيد تقييم فروق أسعار الصرف للأرصدة الأجنبية)
 */
export function generateCurrencyRevaluationJournal(
  accountId: string,
  accountCode: string,
  accountName: string,
  varianceAmountBase: number, // Positive: Gain (Credit FX Gain), Negative: Loss (Debit FX Loss)
  currency: string,
  newRate: number
): JournalEntry {
  const lines: JournalLine[] = [];
  const entryDate = new Date().toISOString().split('T')[0];
  const absAmount = Math.abs(varianceAmountBase);

  if (varianceAmountBase > 0) {
    // Gain: Debit the Asset (e.g. Bank/Cash in USD) and Credit 4104 (FX Gain)
    lines.push({
      id: generateId('line'),
      accountId,
      accountCode,
      accountName,
      debit: absAmount,
      credit: 0,
      memo: `زيادة تقييم رصيد العملة الأجنبية (${currency}) بسعر صرف ${newRate}`,
    });
    lines.push({
      id: generateId('line'),
      accountId: 'acc-4104',
      accountCode: '4104',
      accountName: 'أرباح فروق أسعار الصرف (FX Gains)',
      debit: 0,
      credit: absAmount,
      memo: `أرباح فروق تقييم أسعار الصرف للعملة (${currency})`,
    });
  } else {
    // Loss: Debit 5207 (FX Loss) and Credit the Asset
    lines.push({
      id: generateId('line'),
      accountId: 'acc-5207',
      accountCode: '5207',
      accountName: 'خسائر فروق أسعار الصرف (FX Losses)',
      debit: absAmount,
      credit: 0,
      memo: `خسائر فروق تقييم أسعار الصرف للعملة (${currency})`,
    });
    lines.push({
      id: generateId('line'),
      accountId,
      accountCode,
      accountName,
      debit: 0,
      credit: absAmount,
      memo: `تخفيض تقييم رصيد العملة الأجنبية (${currency}) بسعر صرف ${newRate}`,
    });
  }

  return {
    id: generateId('je-fx'),
    entryNumber: `JV-FX-${Date.now().toString(36).toUpperCase()}`,
    date: entryDate,
    description: `قيد تقييم فروق أسعار الصرف (${currency}) - فارق ${varianceAmountBase.toFixed(2)}`,
    sourceType: 'CURRENCY_REVALUATION',
    currency,
    exchangeRate: newRate,
    lines,
    totalDebit: Math.round(absAmount * 100) / 100,
    totalCredit: Math.round(absAmount * 100) / 100,
    isBalanced: true,
    isPosted: true,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Recalculate account balances directly from all posted Journal Entries
 */
export function recalculateAllAccountBalances(
  accounts: Account[],
  entries: JournalEntry[]
): Account[] {
  const balanceMap = new Map<string, { debits: number; credits: number }>();

  accounts.forEach((acc) => {
    balanceMap.set(acc.id, { debits: 0, credits: 0 });
  });

  entries
    .filter((e) => e.isPosted)
    .forEach((entry) => {
      entry.lines.forEach((line) => {
        const current = balanceMap.get(line.accountId) || { debits: 0, credits: 0 };
        current.debits += line.debit || 0;
        current.credits += line.credit || 0;
        balanceMap.set(line.accountId, current);
      });
    });

  return accounts.map((acc) => {
    const stats = balanceMap.get(acc.id) || { debits: 0, credits: 0 };
    let newBalance = 0;
    if (acc.isDebitNormal) {
      newBalance = stats.debits - stats.credits;
    } else {
      newBalance = stats.credits - stats.debits;
    }

    return {
      ...acc,
      balance: Math.round(newBalance * 100) / 100,
    };
  });
}

// Trial Balance
export interface TrialBalanceRow {
  accountCode: string;
  accountName: string;
  category: string;
  totalDebit: number;
  totalCredit: number;
  endingDebit: number;
  endingCredit: number;
}

export function generateTrialBalance(accounts: Account[], entries: JournalEntry[]) {
  const accountTotals = new Map<string, { debit: number; credit: number }>();
  accounts.forEach((a) => accountTotals.set(a.id, { debit: 0, credit: 0 }));

  entries
    .filter((e) => e.isPosted)
    .forEach((e) => {
      e.lines.forEach((l) => {
        const curr = accountTotals.get(l.accountId) || { debit: 0, credit: 0 };
        curr.debit += l.debit || 0;
        curr.credit += l.credit || 0;
        accountTotals.set(l.accountId, curr);
      });
    });

  const rows: TrialBalanceRow[] = [];
  let sumDebit = 0;
  let sumCredit = 0;
  let sumEndDebit = 0;
  let sumEndCredit = 0;

  accounts
    .filter((a) => a.level >= 2)
    .sort((a, b) => a.code.localeCompare(b.code))
    .forEach((acc) => {
      const totals = accountTotals.get(acc.id) || { debit: 0, credit: 0 };
      const net = totals.debit - totals.credit;

      const endDebit = net > 0 ? net : 0;
      const endCredit = net < 0 ? Math.abs(net) : 0;

      if (totals.debit > 0 || totals.credit > 0 || endDebit > 0 || endCredit > 0) {
        rows.push({
          accountCode: acc.code,
          accountName: acc.nameAr,
          category: acc.category,
          totalDebit: Math.round(totals.debit * 100) / 100,
          totalCredit: Math.round(totals.credit * 100) / 100,
          endingDebit: Math.round(endDebit * 100) / 100,
          endingCredit: Math.round(endCredit * 100) / 100,
        });

        sumDebit += totals.debit;
        sumCredit += totals.credit;
        sumEndDebit += endDebit;
        sumEndCredit += endCredit;
      }
    });

  return {
    rows,
    totals: {
      totalDebit: Math.round(sumDebit * 100) / 100,
      totalCredit: Math.round(sumCredit * 100) / 100,
      endingDebit: Math.round(sumEndDebit * 100) / 100,
      endingCredit: Math.round(sumEndCredit * 100) / 100,
      isBalanced: Math.abs(sumEndDebit - sumEndCredit) < 0.05,
    },
  };
}

// Income Statement
export function generateIncomeStatement(accounts: Account[]) {
  const revenues = accounts.filter((a) => a.category === 'REVENUE' && a.level >= 2);
  const expenses = accounts.filter((a) => a.category === 'EXPENSE' && a.level >= 2);

  const cogsAccount = accounts.find((a) => a.code === '5101');
  const cogsAmount = cogsAccount ? cogsAccount.balance : 0;

  const totalRevenue = revenues.reduce((s, a) => s + (a.balance || 0), 0);
  const operatingExpenses = expenses
    .filter((a) => a.code !== '5101')
    .reduce((s, a) => s + (a.balance || 0), 0);

  const grossProfit = totalRevenue - cogsAmount;
  const netProfit = grossProfit - operatingExpenses;

  return {
    revenues: revenues.map((a) => ({ code: a.code, name: a.nameAr, amount: a.balance })),
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    cogs: cogsAmount,
    grossProfit: Math.round(grossProfit * 100) / 100,
    operatingExpensesList: expenses
      .filter((a) => a.code !== '5101')
      .map((a) => ({ code: a.code, name: a.nameAr, amount: a.balance })),
    totalOperatingExpenses: Math.round(operatingExpenses * 100) / 100,
    netProfit: Math.round(netProfit * 100) / 100,
  };
}

// Balance Sheet
export function generateBalanceSheet(accounts: Account[], netProfit: number) {
  const assets = accounts.filter((a) => a.category === 'ASSET' && a.level >= 2);
  const liabilities = accounts.filter((a) => a.category === 'LIABILITY' && a.level >= 2);
  const equity = accounts.filter((a) => a.category === 'EQUITY' && a.level >= 2);

  const currentAssets = assets.filter((a) => a.code.startsWith('11'));
  const fixedAssets = assets.filter((a) => a.code.startsWith('12'));

  const totalCurrentAssets = currentAssets.reduce((s, a) => s + (a.balance || 0), 0);
  const totalFixedAssets = fixedAssets.reduce((s, a) => s + (a.balance || 0), 0);
  const totalAssets = totalCurrentAssets + totalFixedAssets;

  const totalLiabilities = liabilities.reduce((s, a) => s + (a.balance || 0), 0);
  const totalBaseEquity = equity.reduce((s, a) => s + (a.balance || 0), 0);
  const totalEquity = totalBaseEquity + netProfit;

  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

  return {
    currentAssets: currentAssets.map((a) => ({ code: a.code, name: a.nameAr, balance: a.balance })),
    totalCurrentAssets: Math.round(totalCurrentAssets * 100) / 100,
    fixedAssets: fixedAssets.map((a) => ({ code: a.code, name: a.nameAr, balance: a.balance })),
    totalFixedAssets: Math.round(totalFixedAssets * 100) / 100,
    totalAssets: Math.round(totalAssets * 100) / 100,

    liabilities: liabilities.map((a) => ({ code: a.code, name: a.nameAr, balance: a.balance })),
    totalLiabilities: Math.round(totalLiabilities * 100) / 100,

    equity: equity.map((a) => ({ code: a.code, name: a.nameAr, balance: a.balance })),
    netProfitPeriod: Math.round(netProfit * 100) / 100,
    totalEquity: Math.round(totalEquity * 100) / 100,

    totalLiabilitiesAndEquity: Math.round(totalLiabilitiesAndEquity * 100) / 100,
    isBalanced: Math.abs(totalAssets - totalLiabilitiesAndEquity) < 0.05,
    difference: Math.round(Math.abs(totalAssets - totalLiabilitiesAndEquity) * 100) / 100,
  };
}

// VAT Tax Return
export function generateVatReport(invoices: Invoice[]) {
  const salesInvoices = invoices.filter((i) => i.type === 'SALES');
  const purchaseInvoices = invoices.filter((i) => i.type === 'PURCHASE');

  // Convert to base currency
  const salesSubtotal = salesInvoices.reduce(
    (s, i) => s + (i.subtotal - i.discountTotal) * (i.exchangeRate || 1.0),
    0
  );
  const salesVatOutput = salesInvoices.reduce(
    (s, i) => s + i.taxTotal * (i.exchangeRate || 1.0),
    0
  );

  const purchaseSubtotal = purchaseInvoices.reduce(
    (s, i) => s + (i.subtotal - i.discountTotal) * (i.exchangeRate || 1.0),
    0
  );
  const purchaseVatInput = purchaseInvoices.reduce(
    (s, i) => s + i.taxTotal * (i.exchangeRate || 1.0),
    0
  );

  const netTaxPayable = salesVatOutput - purchaseVatInput;

  return {
    salesSubtotal: Math.round(salesSubtotal * 100) / 100,
    salesVatOutput: Math.round(salesVatOutput * 100) / 100,
    purchaseSubtotal: Math.round(purchaseSubtotal * 100) / 100,
    purchaseVatInput: Math.round(purchaseVatInput * 100) / 100,
    netTaxPayable: Math.round(netTaxPayable * 100) / 100,
    isPayable: netTaxPayable >= 0,
  };
}

// Account Ledger
export interface LedgerRow {
  date: string;
  entryNumber: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
  currency?: string;
  foreignAmount?: number;
}

export function generateAccountLedger(
  accountId: string,
  accounts: Account[],
  entries: JournalEntry[]
): {
  account: Account | undefined;
  rows: LedgerRow[];
  totalDebit: number;
  totalCredit: number;
  finalBalance: number;
} {
  const account = accounts.find((a) => a.id === accountId);
  if (!account) {
    return { account: undefined, rows: [], totalDebit: 0, totalCredit: 0, finalBalance: 0 };
  }

  const rows: LedgerRow[] = [];
  let runningBalance = 0;
  let totalDebit = 0;
  let totalCredit = 0;

  const sortedEntries = [...entries]
    .filter((e) => e.isPosted)
    .sort((a, b) => a.date.localeCompare(b.date));

  for (const entry of sortedEntries) {
    for (const line of entry.lines) {
      if (line.accountId === accountId) {
        const debit = line.debit || 0;
        const credit = line.credit || 0;
        totalDebit += debit;
        totalCredit += credit;

        if (account.isDebitNormal) {
          runningBalance += debit - credit;
        } else {
          runningBalance += credit - debit;
        }

        rows.push({
          date: entry.date,
          entryNumber: entry.entryNumber,
          description: line.memo || entry.description,
          debit,
          credit,
          balance: Math.round(runningBalance * 100) / 100,
          currency: line.currency || entry.currency,
          foreignAmount: line.foreignAmount,
        });
      }
    }
  }

  return {
    account,
    rows,
    totalDebit: Math.round(totalDebit * 100) / 100,
    totalCredit: Math.round(totalCredit * 100) / 100,
    finalBalance: Math.round(runningBalance * 100) / 100,
  };
}
