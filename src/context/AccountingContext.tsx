import React, { createContext, useContext, useState, useEffect } from 'react';
import { Trash2, AlertTriangle, CheckCircle2, X } from 'lucide-react';
import {
  Account,
  Branch,
  Contact,
  CostCenter,
  CurrencyConfig,
  Invoice,
  JournalEntry,
  PaymentMethod,
  Product,
  Quotation,
  ReturnInvoice,
  StockReceiptNote,
  StockTransfer,
  SystemSettings,
  Voucher,
  Warehouse,
} from '../types/accounting';
import { StockAdjustment, StockMovement, InventoryValuationSummary } from '../types/inventory';
import {
  INITIAL_ACCOUNTS,
  INITIAL_BRANCHES,
  INITIAL_CONTACTS,
  INITIAL_COST_CENTERS,
  INITIAL_CURRENCIES,
  INITIAL_PRODUCTS,
  INITIAL_SETTINGS,
  INITIAL_WAREHOUSES,
} from '../utils/mockData';
import {
  calculateInvoiceTotals,
  generateCurrencyRevaluationJournal,
  generateId,
  generatePurchaseInvoiceJournal,
  generatePurchaseReturnJournal,
  generateSalesInvoiceJournal,
  generateSalesReturnJournal,
  generateVoucherJournal,
  recalculateAllAccountBalances,
} from '../utils/accountingEngine';

export interface ToastNotification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface DeleteConfirmDialog {
  title: string;
  itemName: string;
  message?: string;
  confirmLabel?: string;
  onConfirm: () => void;
}

interface AccountingContextType {
  accounts: Account[];
  products: Product[];
  contacts: Contact[];
  invoices: Invoice[];
  vouchers: Voucher[];
  journalEntries: JournalEntry[];
  stockMovements: StockMovement[];
  stockAdjustments: StockAdjustment[];
  branches: Branch[];
  warehouses: Warehouse[];
  quotations: Quotation[];
  returnInvoices: ReturnInvoice[];
  stockTransfers: StockTransfer[];
  stockReceiptNotes: StockReceiptNote[];
  costCenters: CostCenter[];
  settings: SystemSettings;
  currencies: CurrencyConfig[];
  activeView: string;
  setActiveView: (view: string) => void;
  selectedBranchId: string;
  setSelectedBranchId: (id: string) => void;

  // Currency Management Actions
  updateCurrencyRate: (code: string, newRate: number) => void;
  addCurrency: (currency: CurrencyConfig) => void;
  autoFetchExchangeRates: () => void;
  performCurrencyRevaluation: (
    accountId: string,
    accountCode: string,
    accountName: string,
    varianceAmountBase: number,
    currency: string,
    newRate: number
  ) => void;

  // Actions
  createSalesInvoice: (data: {
    partyId: string;
    partyName: string;
    branchId?: string;
    currency?: string;
    exchangeRate?: number;
    items: {
      productId: string;
      productName: string;
      quantity: number;
      unitPrice: number;
      costPrice: number;
      discount?: number;
      taxRate?: number;
    }[];
    paymentMethod: PaymentMethod;
    paidAmount?: number;
    notes?: string;
  }) => Invoice;

  createPurchaseInvoice: (data: {
    partyId: string;
    partyName: string;
    branchId?: string;
    currency?: string;
    exchangeRate?: number;
    items: {
      productId: string;
      productName: string;
      quantity: number;
      unitPrice: number;
      costPrice: number;
      discount?: number;
      taxRate?: number;
    }[];
    paymentMethod: PaymentMethod;
    paidAmount?: number;
    notes?: string;
  }) => Invoice;

  createReturnInvoice: (data: {
    type: 'SALES_RETURN' | 'PURCHASE_RETURN';
    originalInvoiceNumber?: string;
    partyId: string;
    partyName: string;
    branchId?: string;
    currency?: string;
    exchangeRate?: number;
    items: {
      productId: string;
      productName: string;
      quantity: number;
      unitPrice: number;
      costPrice: number;
      discount?: number;
      taxRate?: number;
    }[];
    paymentMethod: PaymentMethod;
    reason: string;
  }) => ReturnInvoice;

  createQuotation: (data: {
    partyId: string;
    partyName: string;
    validUntil?: string;
    branchId?: string;
    currency?: string;
    exchangeRate?: number;
    items: {
      productId: string;
      productName: string;
      quantity: number;
      unitPrice: number;
      costPrice: number;
      discount?: number;
      taxRate?: number;
    }[];
    notes?: string;
  }) => Quotation;

  convertQuoteToInvoice: (quoteId: string) => Invoice | null;

  createStockTransfer: (data: {
    fromBranchId: string;
    toBranchId: string;
    fromWarehouseId: string;
    toWarehouseId: string;
    items: {
      productId: string;
      quantity: number;
    }[];
    notes?: string;
  }) => StockTransfer;

  createStockReceiptNote: (data: {
    type: 'IN' | 'OUT';
    branchId: string;
    warehouseId: string;
    reason: string;
    items: {
      productId: string;
      quantity: number;
      unitCost?: number;
    }[];
    notes?: string;
  }) => StockReceiptNote;

  createVoucher: (data: {
    type: 'RECEIPT' | 'PAYMENT';
    accountId: string;
    partyAccountId: string;
    amount: number;
    currency?: string;
    exchangeRate?: number;
    paymentMethod: PaymentMethod;
    referenceNumber?: string;
    description: string;
    contactId?: string;
    branchId?: string;
  }) => Voucher;

  createManualJournalEntry: (data: {
    date: string;
    description: string;
    branchId?: string;
    lines: {
      accountId: string;
      debit: number;
      credit: number;
      memo?: string;
    }[];
  }) => { success: boolean; message: string };

  recordStockAdjustment: (data: {
    productId: string;
    actualQty: number;
    reason: string;
  }) => StockAdjustment;

  // Entities CRUD & Universal Deletions
  deleteInvoice: (invoiceId: string) => boolean;
  deleteQuotation: (quoteId: string) => boolean;
  deleteReturnInvoice: (returnId: string) => boolean;
  deleteVoucher: (voucherId: string) => boolean;
  deleteJournalEntry: (entryId: string) => boolean;
  deleteStockTransfer: (transferId: string) => boolean;
  deleteStockReceiptNote: (receiptId: string) => boolean;
  deleteStockAdjustment: (adjustmentId: string) => boolean;
  deleteCurrency: (code: string) => boolean;
  deleteBranch: (branchId: string) => boolean;
  deleteWarehouse: (warehouseId: string) => boolean;
  deleteCostCenter: (id: string) => boolean;
  deleteAllProducts: () => void;
  addAccount: (account: Omit<Account, 'id' | 'balance'>) => Account;
  deleteAccount: (id: string) => boolean;

  addProduct: (product: Omit<Product, 'id'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  addContact: (contact: Omit<Contact, 'id' | 'balance'>) => Contact;
  updateContact: (id: string, updates: Partial<Contact>) => void;
  deleteContact: (id: string) => void;

  addBranch: (branch: Omit<Branch, 'id'>) => Branch;
  addWarehouse: (warehouse: Omit<Warehouse, 'id'>) => Warehouse;
  addCostCenter: (cc: Omit<CostCenter, 'id'>) => CostCenter;

  updateSettings: (updates: Partial<SystemSettings>) => void;
  radicalFactoryReset: () => void;
  exportDatabaseJson: () => string;
  importDatabaseJson: (json: string) => boolean;

  inventorySummary: InventoryValuationSummary;
  lowStockItems: Product[];

  // Global Dialogs & Notifications (100% In-App, never blocked by iframes)
  toast: ToastNotification | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  deleteConfirm: DeleteConfirmDialog | null;
  openDeleteConfirm: (dialog: DeleteConfirmDialog) => void;
  closeDeleteConfirm: () => void;

  // Branch & Warehouse Direct Creation State from Header
  branchActionModal: 'BRANCH' | 'WAREHOUSE' | 'MENU' | null;
  setBranchActionModal: (action: 'BRANCH' | 'WAREHOUSE' | 'MENU' | null) => void;
}

const AccountingContext = createContext<AccountingContextType | undefined>(undefined);

// Clean storage key ensuring zero sample products or demo clutter
const STORAGE_KEY = 'smart_accountant_pro_v3_clean';

export const AccountingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [branchActionModal, setBranchActionModal] = useState<'BRANCH' | 'WAREHOUSE' | 'MENU' | null>(null);

  // In-App Toast & Confirmation Modal State (Bypasses all iframe confirm/alert blocks)
  const [toast, setToast] = useState<ToastNotification | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmDialog | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString();
    setToast({ id, message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.id === id ? null : prev));
    }, 3500);
  };

  const openDeleteConfirm = (dialog: DeleteConfirmDialog) => {
    setDeleteConfirm(dialog);
  };

  const closeDeleteConfirm = () => {
    setDeleteConfirm(null);
  };

  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_settings`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.companyName === 'مؤسسة التجارة والخدمات العامة' || !parsed.companyName) {
          parsed.companyName = 'الغفاري سوفت برو';
          parsed.companyNameEn = 'Al-Ghafari Soft Pro';
        }
        return parsed;
      } catch {
        return INITIAL_SETTINGS;
      }
    }
    return INITIAL_SETTINGS;
  });

  const [branches, setBranches] = useState<Branch[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_branches`);
    let list: Branch[] = saved ? JSON.parse(saved) : INITIAL_BRANCHES;
    // Permanently remove "الفرع الرئيسي (الإدارة العامة)" per user request
    list = list.filter(
      (b) =>
        b.nameAr !== 'الفرع الرئيسي (الإدارة العامة)' &&
        b.id !== 'br-main' &&
        !b.nameAr.includes('الفرع الرئيسي')
    );
    try {
      localStorage.setItem(`${STORAGE_KEY}_branches`, JSON.stringify(list));
    } catch {
      // ignore
    }
    return list;
  });

  const [selectedBranchId, setSelectedBranchId] = useState<string>(() => {
    return branches[0]?.id || '';
  });

  const [warehouses, setWarehouses] = useState<Warehouse[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_warehouses`);
    return saved ? JSON.parse(saved) : INITIAL_WAREHOUSES;
  });

  const [costCenters, setCostCenters] = useState<CostCenter[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_cost_centers`);
    return saved ? JSON.parse(saved) : INITIAL_COST_CENTERS;
  });

  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_accounts`);
    let list: Account[] = saved ? JSON.parse(saved) : INITIAL_ACCOUNTS;
    // Permanently remove Rajhi and Ahli bank accounts per user request
    list = list.filter(
      (a) =>
        !a.nameAr.includes('الراجحي') &&
        !a.nameAr.includes('الأهلي') &&
        !a.nameAr.includes('الاهلي') &&
        a.code !== '1103' &&
        a.code !== '1104'
    );
    try {
      localStorage.setItem(`${STORAGE_KEY}_accounts`, JSON.stringify(list));
    } catch {}
    return list;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_products`);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_contacts`);
    return saved ? JSON.parse(saved) : INITIAL_CONTACTS;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_invoices`);
    return saved ? JSON.parse(saved) : [];
  });

  const [quotations, setQuotations] = useState<Quotation[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_quotations`);
    return saved ? JSON.parse(saved) : [];
  });

  const [returnInvoices, setReturnInvoices] = useState<ReturnInvoice[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_returns`);
    return saved ? JSON.parse(saved) : [];
  });

  const [stockTransfers, setStockTransfers] = useState<StockTransfer[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_transfers`);
    return saved ? JSON.parse(saved) : [];
  });

  const [stockReceiptNotes, setStockReceiptNotes] = useState<StockReceiptNote[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_receipt_notes`);
    return saved ? JSON.parse(saved) : [];
  });

  const [vouchers, setVouchers] = useState<Voucher[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_vouchers`);
    return saved ? JSON.parse(saved) : [];
  });

  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_journal`);
    return saved ? JSON.parse(saved) : [];
  });

  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_stock_movements`);
    return saved ? JSON.parse(saved) : [];
  });

  const [stockAdjustments, setStockAdjustments] = useState<StockAdjustment[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_stock_adjustments`);
    return saved ? JSON.parse(saved) : [];
  });

  const [currencies, setCurrencies] = useState<CurrencyConfig[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_currencies`);
    return saved ? JSON.parse(saved) : INITIAL_CURRENCIES;
  });

  // LocalStorage Sync
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_settings`, JSON.stringify(settings));
    localStorage.setItem(`${STORAGE_KEY}_currencies`, JSON.stringify(currencies));
    localStorage.setItem(`${STORAGE_KEY}_branches`, JSON.stringify(branches));
    localStorage.setItem(`${STORAGE_KEY}_warehouses`, JSON.stringify(warehouses));
    localStorage.setItem(`${STORAGE_KEY}_cost_centers`, JSON.stringify(costCenters));
    localStorage.setItem(`${STORAGE_KEY}_accounts`, JSON.stringify(accounts));
    localStorage.setItem(`${STORAGE_KEY}_products`, JSON.stringify(products));
    localStorage.setItem(`${STORAGE_KEY}_contacts`, JSON.stringify(contacts));
    localStorage.setItem(`${STORAGE_KEY}_invoices`, JSON.stringify(invoices));
    localStorage.setItem(`${STORAGE_KEY}_quotations`, JSON.stringify(quotations));
    localStorage.setItem(`${STORAGE_KEY}_returns`, JSON.stringify(returnInvoices));
    localStorage.setItem(`${STORAGE_KEY}_transfers`, JSON.stringify(stockTransfers));
    localStorage.setItem(`${STORAGE_KEY}_receipt_notes`, JSON.stringify(stockReceiptNotes));
    localStorage.setItem(`${STORAGE_KEY}_vouchers`, JSON.stringify(vouchers));
    localStorage.setItem(`${STORAGE_KEY}_journal`, JSON.stringify(journalEntries));
    localStorage.setItem(`${STORAGE_KEY}_stock_movements`, JSON.stringify(stockMovements));
    localStorage.setItem(`${STORAGE_KEY}_stock_adjustments`, JSON.stringify(stockAdjustments));
  }, [
    settings,
    currencies,
    branches,
    warehouses,
    costCenters,
    accounts,
    products,
    contacts,
    invoices,
    quotations,
    returnInvoices,
    stockTransfers,
    stockReceiptNotes,
    vouchers,
    journalEntries,
    stockMovements,
    stockAdjustments,
  ]);

  // Inventory & COGS Summary
  const totalItemsCount = products.length;
  const totalUnitsInStock = products.reduce((sum, p) => sum + p.stockQty, 0);
  const totalCostValue = products.reduce((sum, p) => sum + p.stockQty * p.costPrice, 0);
  const totalRetailValue = products.reduce((sum, p) => sum + p.stockQty * p.salePrice, 0);
  const potentialProfit = totalRetailValue - totalCostValue;
  const potentialMarginPercent =
    totalRetailValue > 0 ? (potentialProfit / totalRetailValue) * 100 : 0;

  const lowStockItems = products.filter((p) => p.stockQty <= p.minStockAlert);
  const outOfStockItemsCount = products.filter((p) => p.stockQty <= 0).length;

  const periodCogsTotal = stockMovements
    .filter((m) => m.type === 'SALE')
    .reduce((sum, m) => sum + Math.abs(m.quantityChange) * m.unitCost, 0);

  const inventorySummary: InventoryValuationSummary = {
    totalItemsCount,
    totalUnitsInStock,
    totalCostValue: Math.round(totalCostValue * 100) / 100,
    totalRetailValue: Math.round(totalRetailValue * 100) / 100,
    potentialProfit: Math.round(potentialProfit * 100) / 100,
    potentialMarginPercent: Math.round(potentialMarginPercent * 10) / 10,
    lowStockItemsCount: lowStockItems.length,
    outOfStockItemsCount,
    periodCogsTotal: Math.round(periodCogsTotal * 100) / 100,
  };

  /**
   * Action: Create Sales Invoice
   */
  const createSalesInvoice = (data: {
    partyId: string;
    partyName: string;
    branchId?: string;
    currency?: string;
    exchangeRate?: number;
    items: {
      productId: string;
      productName: string;
      quantity: number;
      unitPrice: number;
      costPrice: number;
      discount?: number;
      taxRate?: number;
    }[];
    paymentMethod: PaymentMethod;
    paidAmount?: number;
    notes?: string;
  }): Invoice => {
    const invoiceNum = `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(4, '0')}`;
    const invoiceItems = data.items.map((it) => ({
      id: generateId('item'),
      productId: it.productId,
      productName: it.productName,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      costPrice: it.costPrice,
      discount: it.discount || 0,
      taxRate: it.taxRate ?? settings.defaultTaxRate,
      taxAmount: 0,
      total: 0,
    }));

    const totals = calculateInvoiceTotals(invoiceItems, 0);
    const paid =
      data.paymentMethod === 'CASH' || data.paymentMethod === 'BANK'
        ? totals.grandTotal
        : data.paidAmount || 0;
    const remaining = Math.max(0, totals.grandTotal - paid);

    let status: Invoice['status'] = 'UNPAID';
    if (remaining <= 0) status = 'PAID';
    else if (paid > 0) status = 'PARTIAL';

    const selectedCurr = data.currency || settings.baseCurrency;
    const rate = data.exchangeRate ?? (currencies.find((c) => c.code === selectedCurr)?.rate || 1.0);
    const grandTotalBase = Math.round(totals.grandTotal * rate * 100) / 100;

    const newInvoice: Invoice = {
      id: generateId('inv'),
      invoiceNumber: invoiceNum,
      type: 'SALES',
      date: new Date().toISOString().split('T')[0],
      branchId: data.branchId || selectedBranchId,
      partyId: data.partyId,
      partyName: data.partyName,
      items: invoiceItems,
      subtotal: totals.subtotal,
      discountTotal: 0,
      taxTotal: totals.taxTotal,
      grandTotal: totals.grandTotal,
      currency: selectedCurr,
      exchangeRate: rate,
      grandTotalBase,
      paymentMethod: data.paymentMethod,
      paidAmount: paid,
      remainingAmount: remaining,
      status,
      notes: data.notes,
      createdAt: new Date().toISOString(),
    };

    // 1. Deduct Stock
    const updatedProducts = [...products];
    const newMovements: StockMovement[] = [];

    data.items.forEach((item) => {
      const pIdx = updatedProducts.findIndex((p) => p.id === item.productId);
      if (pIdx !== -1) {
        const prod = updatedProducts[pIdx];
        const newBalance = prod.stockQty - item.quantity;
        updatedProducts[pIdx] = { ...prod, stockQty: newBalance };

        newMovements.push({
          id: generateId('sm'),
          productId: prod.id,
          productName: prod.nameAr,
          type: 'SALE',
          referenceNumber: invoiceNum,
          date: newInvoice.date,
          quantityChange: -item.quantity,
          unitCost: item.costPrice,
          totalCost: item.quantity * item.costPrice,
          balanceAfter: newBalance,
          notes: `صرف مبيعات فاتورة رقم ${invoiceNum}`,
          createdAt: new Date().toISOString(),
        });
      }
    });

    // 2. Update Customer Balance if credit (converted to Base Currency)
    let updatedContacts = [...contacts];
    if (data.partyId && remaining > 0) {
      const remainingBase = Math.round(remaining * rate * 100) / 100;
      updatedContacts = updatedContacts.map((c) =>
        c.id === data.partyId ? { ...c, balance: (c.balance || 0) + remainingBase } : c
      );
    }

    // 3. Automated Journal Entry
    const journalEntry = generateSalesInvoiceJournal(newInvoice, accounts, settings);
    newInvoice.journalEntryId = journalEntry.id;

    const updatedJournalEntries = [journalEntry, ...journalEntries];
    const updatedAccounts = recalculateAllAccountBalances(accounts, updatedJournalEntries);

    setProducts(updatedProducts);
    setStockMovements((prev) => [...newMovements, ...prev]);
    setContacts(updatedContacts);
    setJournalEntries(updatedJournalEntries);
    setAccounts(updatedAccounts);
    setInvoices((prev) => [newInvoice, ...prev]);

    return newInvoice;
  };

  /**
   * Action: Create Purchase Invoice
   */
  const createPurchaseInvoice = (data: {
    partyId: string;
    partyName: string;
    branchId?: string;
    currency?: string;
    exchangeRate?: number;
    items: {
      productId: string;
      productName: string;
      quantity: number;
      unitPrice: number;
      costPrice: number;
      discount?: number;
      taxRate?: number;
    }[];
    paymentMethod: PaymentMethod;
    paidAmount?: number;
    notes?: string;
  }): Invoice => {
    const invoiceNum = `BILL-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(4, '0')}`;
    const invoiceItems = data.items.map((it) => ({
      id: generateId('item'),
      productId: it.productId,
      productName: it.productName,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      costPrice: it.costPrice || it.unitPrice,
      discount: it.discount || 0,
      taxRate: it.taxRate ?? settings.defaultTaxRate,
      taxAmount: 0,
      total: 0,
    }));

    const totals = calculateInvoiceTotals(invoiceItems, 0);
    const paid =
      data.paymentMethod === 'CASH' || data.paymentMethod === 'BANK'
        ? totals.grandTotal
        : data.paidAmount || 0;
    const remaining = Math.max(0, totals.grandTotal - paid);

    let status: Invoice['status'] = 'UNPAID';
    if (remaining <= 0) status = 'PAID';
    else if (paid > 0) status = 'PARTIAL';

    const selectedCurr = data.currency || settings.baseCurrency;
    const rate = data.exchangeRate ?? (currencies.find((c) => c.code === selectedCurr)?.rate || 1.0);
    const grandTotalBase = Math.round(totals.grandTotal * rate * 100) / 100;

    const newInvoice: Invoice = {
      id: generateId('inv-pur'),
      invoiceNumber: invoiceNum,
      type: 'PURCHASE',
      date: new Date().toISOString().split('T')[0],
      branchId: data.branchId || selectedBranchId,
      partyId: data.partyId,
      partyName: data.partyName,
      items: invoiceItems,
      subtotal: totals.subtotal,
      discountTotal: 0,
      taxTotal: totals.taxTotal,
      grandTotal: totals.grandTotal,
      currency: selectedCurr,
      exchangeRate: rate,
      grandTotalBase,
      paymentMethod: data.paymentMethod,
      paidAmount: paid,
      remainingAmount: remaining,
      status,
      notes: data.notes,
      createdAt: new Date().toISOString(),
    };

    // Stock increase & Weighted Average Costing in Base Currency
    const updatedProducts = [...products];
    const newMovements: StockMovement[] = [];

    data.items.forEach((item) => {
      const pIdx = updatedProducts.findIndex((p) => p.id === item.productId);
      if (pIdx !== -1) {
        const prod = updatedProducts[pIdx];
        const oldQty = Math.max(0, prod.stockQty);
        const addedQty = item.quantity;
        const newQty = oldQty + addedQty;
        // Convert purchased unit price to base currency for perpetual stock valuation
        const itemUnitPriceBase = item.unitPrice * rate;

        let newWeightedCost = prod.costPrice;
        if (newQty > 0) {
          newWeightedCost = (oldQty * prod.costPrice + addedQty * itemUnitPriceBase) / newQty;
        }

        updatedProducts[pIdx] = {
          ...prod,
          stockQty: newQty,
          costPrice: Math.round(newWeightedCost * 100) / 100,
        };

        newMovements.push({
          id: generateId('sm'),
          productId: prod.id,
          productName: prod.nameAr,
          type: 'PURCHASE',
          referenceNumber: invoiceNum,
          date: newInvoice.date,
          quantityChange: addedQty,
          unitCost: Math.round(itemUnitPriceBase * 100) / 100,
          totalCost: Math.round(addedQty * itemUnitPriceBase * 100) / 100,
          balanceAfter: newQty,
          notes: `توريد مشتريات فاتورة رقم ${invoiceNum} (${selectedCurr} ${item.unitPrice})`,
          createdAt: new Date().toISOString(),
        });
      }
    });

    let updatedContacts = [...contacts];
    if (data.partyId && remaining > 0) {
      const remainingBase = Math.round(remaining * rate * 100) / 100;
      updatedContacts = updatedContacts.map((c) =>
        c.id === data.partyId ? { ...c, balance: (c.balance || 0) + remainingBase } : c
      );
    }

    const journalEntry = generatePurchaseInvoiceJournal(newInvoice, accounts, settings);
    newInvoice.journalEntryId = journalEntry.id;

    const updatedJournalEntries = [journalEntry, ...journalEntries];
    const updatedAccounts = recalculateAllAccountBalances(accounts, updatedJournalEntries);

    setProducts(updatedProducts);
    setStockMovements((prev) => [...newMovements, ...prev]);
    setContacts(updatedContacts);
    setJournalEntries(updatedJournalEntries);
    setAccounts(updatedAccounts);
    setInvoices((prev) => [newInvoice, ...prev]);

    return newInvoice;
  };

  /**
   * Action: Create Return Invoice (مردودات مبيعات أو مشتريات)
   */
  const createReturnInvoice = (data: {
    type: 'SALES_RETURN' | 'PURCHASE_RETURN';
    originalInvoiceNumber?: string;
    partyId: string;
    partyName: string;
    branchId?: string;
    currency?: string;
    exchangeRate?: number;
    items: {
      productId: string;
      productName: string;
      quantity: number;
      unitPrice: number;
      costPrice: number;
      discount?: number;
      taxRate?: number;
    }[];
    paymentMethod: PaymentMethod;
    reason: string;
  }): ReturnInvoice => {
    const prefix = data.type === 'SALES_RETURN' ? 'SRET' : 'PRET';
    const retNum = `${prefix}-${new Date().getFullYear()}-${String(returnInvoices.length + 1).padStart(4, '0')}`;

    const items = data.items.map((it) => ({
      id: generateId('item'),
      productId: it.productId,
      productName: it.productName,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      costPrice: it.costPrice,
      discount: it.discount || 0,
      taxRate: it.taxRate ?? settings.defaultTaxRate,
      taxAmount: 0,
      total: 0,
    }));

    const totals = calculateInvoiceTotals(items, 0);
    const selectedCurr = data.currency || settings.baseCurrency;
    const rate = data.exchangeRate ?? (currencies.find((c) => c.code === selectedCurr)?.rate || 1.0);

    const newReturn: ReturnInvoice = {
      id: generateId('ret'),
      returnNumber: retNum,
      type: data.type,
      originalInvoiceNumber: data.originalInvoiceNumber,
      date: new Date().toISOString().split('T')[0],
      branchId: data.branchId || selectedBranchId,
      partyId: data.partyId,
      partyName: data.partyName,
      items,
      subtotal: totals.subtotal,
      taxTotal: totals.taxTotal,
      grandTotal: totals.grandTotal,
      currency: selectedCurr,
      exchangeRate: rate,
      paymentMethod: data.paymentMethod,
      reason: data.reason,
      createdAt: new Date().toISOString(),
    };

    // Update stock & movements
    const updatedProducts = [...products];
    const newMovements: StockMovement[] = [];

    data.items.forEach((item) => {
      const pIdx = updatedProducts.findIndex((p) => p.id === item.productId);
      if (pIdx !== -1) {
        const prod = updatedProducts[pIdx];
        const isSalesReturn = data.type === 'SALES_RETURN';
        // Sales return adds back to stock; Purchase return deducts from stock
        const delta = isSalesReturn ? item.quantity : -item.quantity;
        const newBalance = prod.stockQty + delta;

        updatedProducts[pIdx] = { ...prod, stockQty: newBalance };

        newMovements.push({
          id: generateId('sm'),
          productId: prod.id,
          productName: prod.nameAr,
          type: isSalesReturn ? 'SALES_RETURN' : 'PURCHASE_RETURN',
          referenceNumber: retNum,
          date: newReturn.date,
          quantityChange: delta,
          unitCost: item.costPrice,
          totalCost: item.quantity * item.costPrice,
          balanceAfter: newBalance,
          notes: `${isSalesReturn ? 'مردود مبيعات' : 'مردود مشتريات'}: ${data.reason}`,
          createdAt: new Date().toISOString(),
        });
      }
    });

    // Update Contact Balance if credit (converted to base currency)
    let updatedContacts = [...contacts];
    if (data.partyId) {
      const grandTotalBase = Math.round(totals.grandTotal * rate * 100) / 100;
      updatedContacts = updatedContacts.map((c) => {
        if (c.id === data.partyId) {
          const delta = -grandTotalBase;
          return { ...c, balance: Math.max(0, c.balance + delta) };
        }
        return c;
      });
    }

    // Automated Double-entry Posting
    let je: JournalEntry;
    if (data.type === 'SALES_RETURN') {
      je = generateSalesReturnJournal(newReturn, accounts, settings);
    } else {
      je = generatePurchaseReturnJournal(newReturn, accounts, settings);
    }

    newReturn.journalEntryId = je.id;
    const updatedJournal = [je, ...journalEntries];
    const updatedAccounts = recalculateAllAccountBalances(accounts, updatedJournal);

    setProducts(updatedProducts);
    setStockMovements((prev) => [...newMovements, ...prev]);
    setContacts(updatedContacts);
    setJournalEntries(updatedJournal);
    setAccounts(updatedAccounts);
    setReturnInvoices((prev) => [newReturn, ...prev]);

    return newReturn;
  };

  /**
   * Action: Create Quotation (عروض أسعار)
   */
  const createQuotation = (data: {
    partyId: string;
    partyName: string;
    validUntil?: string;
    branchId?: string;
    currency?: string;
    exchangeRate?: number;
    items: {
      productId: string;
      productName: string;
      quantity: number;
      unitPrice: number;
      costPrice: number;
      discount?: number;
      taxRate?: number;
    }[];
    notes?: string;
  }): Quotation => {
    const quoteNum = `QT-${new Date().getFullYear()}-${String(quotations.length + 1).padStart(4, '0')}`;
    const items = data.items.map((it) => ({
      id: generateId('item'),
      productId: it.productId,
      productName: it.productName,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      costPrice: it.costPrice,
      discount: it.discount || 0,
      taxRate: it.taxRate ?? settings.defaultTaxRate,
      taxAmount: 0,
      total: 0,
    }));

    const totals = calculateInvoiceTotals(items, 0);
    const selectedCurr = data.currency || settings.baseCurrency;
    const rate = data.exchangeRate ?? (currencies.find((c) => c.code === selectedCurr)?.rate || 1.0);

    const newQuote: Quotation = {
      id: generateId('qt'),
      quoteNumber: quoteNum,
      date: new Date().toISOString().split('T')[0],
      validUntil:
        data.validUntil ||
        new Date(Date.now() + 86400000 * 15).toISOString().split('T')[0],
      branchId: data.branchId || selectedBranchId,
      partyId: data.partyId,
      partyName: data.partyName,
      items,
      subtotal: totals.subtotal,
      taxTotal: totals.taxTotal,
      grandTotal: totals.grandTotal,
      currency: selectedCurr,
      exchangeRate: rate,
      status: 'SENT',
      notes: data.notes,
      createdAt: new Date().toISOString(),
    };

    setQuotations((prev) => [newQuote, ...prev]);
    return newQuote;
  };

  /**
   * Action: Convert Quotation to Real Sales Invoice (تحويل عرض السعر لفاتورة مبيعات)
   */
  const convertQuoteToInvoice = (quoteId: string): Invoice | null => {
    const quote = quotations.find((q) => q.id === quoteId);
    if (!quote) return null;

    const newInvoice = createSalesInvoice({
      partyId: quote.partyId,
      partyName: quote.partyName,
      branchId: quote.branchId,
      currency: quote.currency,
      exchangeRate: quote.exchangeRate,
      items: quote.items.map((it) => ({
        productId: it.productId,
        productName: it.productName,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        costPrice: it.costPrice,
        discount: it.discount,
        taxRate: it.taxRate,
      })),
      paymentMethod: 'CASH',
      notes: `فاتورة محولة تلقائياً من عرض السعر رقم ${quote.quoteNumber}`,
    });

    setQuotations((prev) =>
      prev.map((q) =>
        q.id === quoteId ? { ...q, status: 'CONVERTED', convertedInvoiceId: newInvoice.id } : q
      )
    );

    return newInvoice;
  };

  /**
   * Action: Inter-Warehouse / Inter-Branch Stock Transfer (التحويلات المخزنية)
   */
  const createStockTransfer = (data: {
    fromBranchId: string;
    toBranchId: string;
    fromWarehouseId: string;
    toWarehouseId: string;
    items: {
      productId: string;
      quantity: number;
    }[];
    notes?: string;
  }): StockTransfer => {
    const transferNum = `TRF-${new Date().getFullYear()}-${String(stockTransfers.length + 1).padStart(4, '0')}`;

    const enrichedItems = data.items.map((it) => {
      const prod = products.find((p) => p.id === it.productId);
      return {
        productId: it.productId,
        productName: prod?.nameAr || 'صنف',
        quantity: it.quantity,
        unitCost: prod?.costPrice || 0,
      };
    });

    const newTransfer: StockTransfer = {
      id: generateId('trf'),
      transferNumber: transferNum,
      date: new Date().toISOString().split('T')[0],
      fromBranchId: data.fromBranchId,
      toBranchId: data.toBranchId,
      fromWarehouseId: data.fromWarehouseId,
      toWarehouseId: data.toWarehouseId,
      items: enrichedItems,
      notes: data.notes,
      status: 'COMPLETED',
      createdAt: new Date().toISOString(),
    };

    // Log movements for audit
    const newMovements: StockMovement[] = enrichedItems.map((item) => {
      const prod = products.find((p) => p.id === item.productId);
      return {
        id: generateId('sm-trf'),
        productId: item.productId,
        productName: item.productName,
        type: 'STOCK_ADJUSTMENT_IN',
        referenceNumber: transferNum,
        date: newTransfer.date,
        quantityChange: item.quantity,
        unitCost: item.unitCost,
        totalCost: item.quantity * item.unitCost,
        balanceAfter: prod ? prod.stockQty : item.quantity,
        notes: `تحويل مخزني: ${data.notes || 'بين المستودعات'}`,
        createdAt: new Date().toISOString(),
      };
    });

    setStockMovements((prev) => [...newMovements, ...prev]);
    setStockTransfers((prev) => [newTransfer, ...prev]);

    return newTransfer;
  };

  /**
   * Action: Goods Receipt / Delivery Note (سندات استلام وإخراج البضاعة)
   */
  const createStockReceiptNote = (data: {
    type: 'IN' | 'OUT';
    branchId: string;
    warehouseId: string;
    reason: string;
    items: {
      productId: string;
      quantity: number;
      unitCost?: number;
    }[];
    notes?: string;
  }): StockReceiptNote => {
    const prefix = data.type === 'IN' ? 'GRN' : 'GDN';
    const receiptNum = `${prefix}-${new Date().getFullYear()}-${String(stockReceiptNotes.length + 1).padStart(4, '0')}`;

    const enrichedItems = data.items.map((it) => {
      const prod = products.find((p) => p.id === it.productId);
      return {
        productId: it.productId,
        productName: prod?.nameAr || 'صنف',
        quantity: it.quantity,
        unitCost: it.unitCost || prod?.costPrice || 0,
      };
    });

    const newReceipt: StockReceiptNote = {
      id: generateId('rec'),
      receiptNumber: receiptNum,
      type: data.type,
      date: new Date().toISOString().split('T')[0],
      branchId: data.branchId,
      warehouseId: data.warehouseId,
      reason: data.reason,
      items: enrichedItems,
      notes: data.notes,
      createdAt: new Date().toISOString(),
    };

    // Update quantities
    const updatedProducts = [...products];
    const newMovements: StockMovement[] = [];

    enrichedItems.forEach((item) => {
      const pIdx = updatedProducts.findIndex((p) => p.id === item.productId);
      if (pIdx !== -1) {
        const prod = updatedProducts[pIdx];
        const delta = data.type === 'IN' ? item.quantity : -item.quantity;
        const newBalance = prod.stockQty + delta;
        updatedProducts[pIdx] = { ...prod, stockQty: newBalance };

        newMovements.push({
          id: generateId('sm-grn'),
          productId: prod.id,
          productName: prod.nameAr,
          type: data.type === 'IN' ? 'STOCK_ADJUSTMENT_IN' : 'STOCK_ADJUSTMENT_OUT',
          referenceNumber: receiptNum,
          date: newReceipt.date,
          quantityChange: delta,
          unitCost: item.unitCost,
          totalCost: item.quantity * item.unitCost,
          balanceAfter: newBalance,
          notes: `${data.type === 'IN' ? 'سند إدخال مخزني' : 'سند إخراج مخزني'}: ${data.reason}`,
          createdAt: new Date().toISOString(),
        });
      }
    });

    setProducts(updatedProducts);
    setStockMovements((prev) => [...newMovements, ...prev]);
    setStockReceiptNotes((prev) => [newReceipt, ...prev]);

    return newReceipt;
  };

  /**
   * Action: Create Voucher
   */
  const createVoucher = (data: {
    type: 'RECEIPT' | 'PAYMENT';
    accountId: string;
    partyAccountId: string;
    amount: number;
    currency?: string;
    exchangeRate?: number;
    paymentMethod: PaymentMethod;
    referenceNumber?: string;
    description: string;
    contactId?: string;
    branchId?: string;
  }): Voucher => {
    const count = vouchers.filter((v) => v.type === data.type).length + 1;
    const prefix = data.type === 'RECEIPT' ? 'RCV' : 'PAY';
    const voucherNum = `${prefix}-${String(count).padStart(4, '0')}`;

    const cashAcc = accounts.find((a) => a.id === data.accountId);
    const partyAcc = accounts.find((a) => a.id === data.partyAccountId);

    const selectedCurr = data.currency || settings.baseCurrency;
    const rate = data.exchangeRate ?? (currencies.find((c) => c.code === selectedCurr)?.rate || 1.0);
    const amountBase = Math.round(data.amount * rate * 100) / 100;

    const newVoucher: Voucher = {
      id: generateId('vouch'),
      voucherNumber: voucherNum,
      type: data.type,
      date: new Date().toISOString().split('T')[0],
      branchId: data.branchId || selectedBranchId,
      accountId: data.accountId,
      accountName: cashAcc?.nameAr || 'الصندوق الرئيسي',
      partyAccountId: data.partyAccountId,
      partyAccountName: partyAcc?.nameAr || 'الطرف الآخر',
      amount: data.amount,
      currency: selectedCurr,
      exchangeRate: rate,
      amountBase,
      paymentMethod: data.paymentMethod,
      referenceNumber: data.referenceNumber,
      description: data.description,
      createdAt: new Date().toISOString(),
    };

    let updatedContacts = [...contacts];
    if (data.contactId) {
      updatedContacts = updatedContacts.map((c) => {
        if (c.id === data.contactId) {
          const delta = -amountBase;
          return { ...c, balance: Math.max(0, c.balance + delta) };
        }
        return c;
      });
    }

    const journalEntry = generateVoucherJournal(newVoucher, accounts);
    newVoucher.journalEntryId = journalEntry.id;

    const updatedJournalEntries = [journalEntry, ...journalEntries];
    const updatedAccounts = recalculateAllAccountBalances(accounts, updatedJournalEntries);

    setVouchers((prev) => [newVoucher, ...prev]);
    setContacts(updatedContacts);
    setJournalEntries(updatedJournalEntries);
    setAccounts(updatedAccounts);

    return newVoucher;
  };

  /**
   * Action: Stock Adjustment
   */
  const recordStockAdjustment = (data: {
    productId: string;
    actualQty: number;
    reason: string;
  }): StockAdjustment => {
    const prod = products.find((p) => p.id === data.productId);
    if (!prod) throw new Error('الصنف غير موجود');

    const systemQty = prod.stockQty;
    const diff = data.actualQty - systemQty;
    const totalDiffCost = Math.abs(diff) * prod.costPrice;
    const adjNum = `ADJ-${new Date().getFullYear()}-${String(stockAdjustments.length + 1).padStart(3, '0')}`;

    const adjustment: StockAdjustment = {
      id: generateId('adj'),
      adjustmentNumber: adjNum,
      date: new Date().toISOString().split('T')[0],
      productId: prod.id,
      productName: prod.nameAr,
      systemQty,
      actualQty: data.actualQty,
      differenceQty: diff,
      unitCost: prod.costPrice,
      totalDifferenceCost: Math.round(totalDiffCost * 100) / 100,
      reason: data.reason,
      createdAt: new Date().toISOString(),
    };

    const updatedProducts = products.map((p) =>
      p.id === prod.id ? { ...p, stockQty: data.actualQty } : p
    );

    const movement: StockMovement = {
      id: generateId('sm'),
      productId: prod.id,
      productName: prod.nameAr,
      type: diff >= 0 ? 'STOCK_ADJUSTMENT_IN' : 'STOCK_ADJUSTMENT_OUT',
      referenceNumber: adjNum,
      date: adjustment.date,
      quantityChange: diff,
      unitCost: prod.costPrice,
      totalCost: totalDiffCost,
      balanceAfter: data.actualQty,
      notes: `تسوية جردية: ${data.reason}`,
      createdAt: new Date().toISOString(),
    };

    setProducts(updatedProducts);
    setStockMovements((prev) => [movement, ...prev]);
    setStockAdjustments((prev) => [adjustment, ...prev]);

    return adjustment;
  };

  /**
   * Action: Manual Journal Entry
   */
  const createManualJournalEntry = (data: {
    date: string;
    description: string;
    branchId?: string;
    lines: {
      accountId: string;
      debit: number;
      credit: number;
      memo?: string;
    }[];
  }) => {
    const totalDebit = data.lines.reduce((s, l) => s + (Number(l.debit) || 0), 0);
    const totalCredit = data.lines.reduce((s, l) => s + (Number(l.credit) || 0), 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return {
        success: false,
        message: `القيد غير متوازن! إجمالي المدين (${totalDebit}) لا يساوي إجمالي الدائن (${totalCredit})`,
      };
    }

    const entryNum = `JV-M-${new Date().getFullYear()}-${String(journalEntries.length + 1).padStart(4, '0')}`;

    const journalLines = data.lines.map((l) => {
      const acc = accounts.find((a) => a.id === l.accountId);
      return {
        id: generateId('line'),
        accountId: l.accountId,
        accountCode: acc?.code || '',
        accountName: acc?.nameAr || '',
        debit: Number(l.debit) || 0,
        credit: Number(l.credit) || 0,
        memo: l.memo || data.description,
      };
    });

    const newEntry: JournalEntry = {
      id: generateId('je-manual'),
      entryNumber: entryNum,
      date: data.date,
      description: data.description,
      sourceType: 'MANUAL',
      branchId: data.branchId || selectedBranchId,
      lines: journalLines,
      totalDebit: Math.round(totalDebit * 100) / 100,
      totalCredit: Math.round(totalCredit * 100) / 100,
      isBalanced: true,
      isPosted: true,
      createdAt: new Date().toISOString(),
    };

    const updatedJournal = [newEntry, ...journalEntries];
    const updatedAccounts = recalculateAllAccountBalances(accounts, updatedJournal);

    setJournalEntries(updatedJournal);
    setAccounts(updatedAccounts);

    return { success: true, message: 'تم ترحيل وحفظ القيد اليومي بنجاح!' };
  };

  // ==================== UNIVERSAL DELETIONS & CRUD ====================
  const deleteInvoice = (invoiceId: string): boolean => {
    const inv = invoices.find((i) => i.id === invoiceId);
    if (!inv) return false;

    // 1. Revert Stock Quantities
    const updatedProducts = [...products];
    const newMovements: StockMovement[] = [];

    inv.items.forEach((item) => {
      const pIdx = updatedProducts.findIndex((p) => p.id === item.productId);
      if (pIdx !== -1) {
        const prod = updatedProducts[pIdx];
        // Sales: was -qty, so deleting restores +qty. Purchase: was +qty, so deleting deducts -qty
        const qtyChange = inv.type === 'SALES' ? item.quantity : -item.quantity;
        const newBalance = prod.stockQty + qtyChange;
        updatedProducts[pIdx] = { ...prod, stockQty: newBalance };

        newMovements.push({
          id: generateId('sm-del'),
          productId: prod.id,
          productName: prod.nameAr,
          type: inv.type === 'SALES' ? 'STOCK_ADJUSTMENT_IN' : 'STOCK_ADJUSTMENT_OUT',
          referenceNumber: `DEL-${inv.invoiceNumber}`,
          date: new Date().toISOString().split('T')[0],
          quantityChange: qtyChange,
          unitCost: item.costPrice || prod.costPrice,
          totalCost: Math.abs(qtyChange) * (item.costPrice || prod.costPrice),
          balanceAfter: newBalance,
          notes: `إلغاء وحذف فاتورة ${inv.type === 'SALES' ? 'المبيعات' : 'المشتريات'} رقم ${inv.invoiceNumber}`,
          createdAt: new Date().toISOString(),
        });
      }
    });

    // 2. Revert Contact Balance (if there was remaining debt/credit)
    let updatedContacts = [...contacts];
    if (inv.partyId && inv.remainingAmount > 0) {
      const rate = inv.exchangeRate || 1.0;
      const remainingBase = Math.round(inv.remainingAmount * rate * 100) / 100;
      updatedContacts = updatedContacts.map((c) =>
        c.id === inv.partyId
          ? {
              ...c,
              balance: Math.max(0, (c.balance || 0) - remainingBase),
            }
          : c
      );
    }

    // 3. Remove Associated Journal Entry & Recalculate
    const updatedJournal = journalEntries.filter(
      (je) => je.id !== inv.journalEntryId && je.entryNumber !== `JV-${inv.invoiceNumber}`
    );
    const updatedAccounts = recalculateAllAccountBalances(accounts, updatedJournal);

    setProducts(updatedProducts);
    setStockMovements((prev) => [
      ...newMovements,
      ...prev.filter((m) => m.referenceNumber !== inv.invoiceNumber),
    ]);
    setContacts(updatedContacts);
    setJournalEntries(updatedJournal);
    setAccounts(updatedAccounts);
    setInvoices((prev) => prev.filter((i) => i.id !== invoiceId));

    return true;
  };

  const deleteQuotation = (quoteId: string): boolean => {
    setQuotations((prev) => prev.filter((q) => q.id !== quoteId));
    return true;
  };

  const deleteReturnInvoice = (returnId: string): boolean => {
    const ret = returnInvoices.find((r) => r.id === returnId);
    if (!ret) return false;

    // 1. Revert Stock
    const updatedProducts = [...products];
    ret.items.forEach((item) => {
      const pIdx = updatedProducts.findIndex((p) => p.id === item.productId);
      if (pIdx !== -1) {
        const prod = updatedProducts[pIdx];
        // Sales return added stock -> deleting it deducts stock
        // Purchase return deducted stock -> deleting it adds stock back
        const delta = ret.type === 'SALES_RETURN' ? -item.quantity : item.quantity;
        updatedProducts[pIdx] = { ...prod, stockQty: prod.stockQty + delta };
      }
    });

    // 2. Revert Contact Balance
    let updatedContacts = [...contacts];
    if (ret.partyId) {
      const rate = ret.exchangeRate || 1.0;
      const baseGrand = Math.round(ret.grandTotal * rate * 100) / 100;
      updatedContacts = updatedContacts.map((c) =>
        c.id === ret.partyId ? { ...c, balance: (c.balance || 0) + baseGrand } : c
      );
    }

    // 3. Remove Journal Entry
    const updatedJournal = journalEntries.filter(
      (je) => je.id !== ret.journalEntryId && je.entryNumber !== `JV-${ret.returnNumber}`
    );
    const updatedAccounts = recalculateAllAccountBalances(accounts, updatedJournal);

    setProducts(updatedProducts);
    setContacts(updatedContacts);
    setJournalEntries(updatedJournal);
    setAccounts(updatedAccounts);
    setReturnInvoices((prev) => prev.filter((r) => r.id !== returnId));

    return true;
  };

  const deleteVoucher = (voucherId: string): boolean => {
    const v = vouchers.find((item) => item.id === voucherId);
    if (!v) return false;

    // 1. Revert Party Balance
    let updatedContacts = [...contacts];
    const targetContact = updatedContacts.find(
      (c) => c.accountId === v.partyAccountId || c.id === v.partyAccountId
    );
    if (targetContact) {
      updatedContacts = updatedContacts.map((c) =>
        c.id === targetContact.id ? { ...c, balance: (c.balance || 0) + v.amountBase } : c
      );
    }

    // 2. Remove Associated Journal Entry
    const updatedJournal = journalEntries.filter(
      (je) => je.id !== v.journalEntryId && je.entryNumber !== `JV-${v.voucherNumber}`
    );
    const updatedAccounts = recalculateAllAccountBalances(accounts, updatedJournal);

    setContacts(updatedContacts);
    setJournalEntries(updatedJournal);
    setAccounts(updatedAccounts);
    setVouchers((prev) => prev.filter((item) => item.id !== voucherId));

    return true;
  };

  const deleteJournalEntry = (entryId: string): boolean => {
    const updatedJournal = journalEntries.filter((je) => je.id !== entryId);
    const updatedAccounts = recalculateAllAccountBalances(accounts, updatedJournal);
    setJournalEntries(updatedJournal);
    setAccounts(updatedAccounts);
    return true;
  };

  const deleteStockTransfer = (transferId: string): boolean => {
    setStockTransfers((prev) => prev.filter((st) => st.id !== transferId));
    return true;
  };

  const deleteStockReceiptNote = (receiptId: string): boolean => {
    const rec = stockReceiptNotes.find((r) => r.id === receiptId);
    if (rec) {
      const updatedProducts = [...products];
      rec.items.forEach((item) => {
        const pIdx = updatedProducts.findIndex((p) => p.id === item.productId);
        if (pIdx !== -1) {
          const delta = rec.type === 'IN' ? -item.quantity : item.quantity;
          updatedProducts[pIdx] = {
            ...updatedProducts[pIdx],
            stockQty: updatedProducts[pIdx].stockQty + delta,
          };
        }
      });
      setProducts(updatedProducts);
    }
    setStockReceiptNotes((prev) => prev.filter((r) => r.id !== receiptId));
    return true;
  };

  const deleteStockAdjustment = (adjustmentId: string): boolean => {
    setStockAdjustments((prev) => prev.filter((sa) => sa.id !== adjustmentId));
    return true;
  };

  const deleteCurrency = (code: string): boolean => {
    const curr = currencies.find((c) => c.code === code);
    if (!curr || curr.isBase) return false;
    setCurrencies((prev) => prev.filter((c) => c.code !== code));
    return true;
  };

  const deleteBranch = (branchId: string): boolean => {
    const b = branches.find((item) => item.id === branchId);
    if (!b) return false;
    setBranches((prev) => prev.filter((item) => item.id !== branchId));
    setSelectedBranchId((prevId) => {
      if (prevId === branchId) {
        const remaining = branches.filter((item) => item.id !== branchId);
        return remaining[0]?.id || '';
      }
      return prevId;
    });
    return true;
  };

  const deleteWarehouse = (warehouseId: string): boolean => {
    const w = warehouses.find((item) => item.id === warehouseId);
    if (!w) return false;
    setWarehouses((prev) => prev.filter((item) => item.id !== warehouseId));
    return true;
  };

  // CRUD
  const addProduct = (p: Omit<Product, 'id'>): Product => {
    const newProd: Product = { ...p, id: generateId('prod') };
    setProducts((prev) => [...prev, newProd]);
    return newProd;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const addContact = (c: Omit<Contact, 'id' | 'balance'>): Contact => {
    const newContact: Contact = { ...c, id: generateId('cont'), balance: 0 };
    setContacts((prev) => [...prev, newContact]);
    return newContact;
  };

  const updateContact = (id: string, updates: Partial<Contact>) => {
    setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const deleteContact = (id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  const addBranch = (b: Omit<Branch, 'id'>): Branch => {
    const newBranch: Branch = { ...b, id: generateId('br') };
    setBranches((prev) => [...prev, newBranch]);
    return newBranch;
  };

  const addWarehouse = (w: Omit<Warehouse, 'id'>): Warehouse => {
    const newWarehouse: Warehouse = { ...w, id: generateId('wh') };
    setWarehouses((prev) => [...prev, newWarehouse]);
    return newWarehouse;
  };

  const addCostCenter = (cc: Omit<CostCenter, 'id'>): CostCenter => {
    const newCc: CostCenter = { ...cc, id: generateId('cc') };
    setCostCenters((prev) => [...prev, newCc]);
    return newCc;
  };

  const updateSettings = (updates: Partial<SystemSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  const updateCurrencyRate = (code: string, newRate: number) => {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    setCurrencies((prev) =>
      prev.map((c) => {
        if (c.code === code) {
          const oldRate = c.rate;
          const changePercent = oldRate > 0 ? ((newRate - oldRate) / oldRate) * 100 : 0;
          return {
            ...c,
            rate: newRate,
            lastUpdated: nowStr,
            change24h: Number(changePercent.toFixed(2)),
          };
        }
        return c;
      })
    );
  };

  const addCurrency = (curr: CurrencyConfig) => {
    setCurrencies((prev) => {
      const exists = prev.some((c) => c.code === curr.code);
      if (exists) {
        return prev.map((c) => (c.code === curr.code ? curr : c));
      }
      return [...prev, curr];
    });
  };

  const autoFetchExchangeRates = () => {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    setCurrencies((prev) =>
      prev.map((curr) => {
        if (curr.isBase) return curr;
        // Minor realistic fluctuation between -0.45% and +0.45%
        const deltaPercent = Math.random() * 0.9 - 0.45;
        const newRate = Math.max(0.0001, Number((curr.rate * (1 + deltaPercent / 100)).toFixed(4)));
        const roundedChange = Number(deltaPercent.toFixed(2));
        return {
          ...curr,
          rate: newRate,
          lastUpdated: nowStr,
          change24h: roundedChange,
        };
      })
    );
  };

  const performCurrencyRevaluation = (
    accountId: string,
    accountCode: string,
    accountName: string,
    varianceAmountBase: number,
    currency: string,
    newRate: number
  ) => {
    const journalEntry = generateCurrencyRevaluationJournal(
      accountId,
      accountCode,
      accountName,
      varianceAmountBase,
      currency,
      newRate
    );

    const updatedJournalEntries = [journalEntry, ...journalEntries];
    setJournalEntries(updatedJournalEntries);

    const updatedAccounts = recalculateAllAccountBalances(accounts, updatedJournalEntries);
    setAccounts(updatedAccounts);
  };

  /**
   * Radical Complete Reset (تصفير جذري شامل لجميع البيانات)
   */
  const radicalFactoryReset = () => {
    localStorage.clear();
    setSettings(INITIAL_SETTINGS);
    setCurrencies(INITIAL_CURRENCIES);
    setBranches(INITIAL_BRANCHES);
    setWarehouses(INITIAL_WAREHOUSES);
    setCostCenters(INITIAL_COST_CENTERS);
    setAccounts(INITIAL_ACCOUNTS.map((a) => ({ ...a, balance: 0 })));
    setProducts([]);
    setContacts([]);
    setInvoices([]);
    setQuotations([]);
    setReturnInvoices([]);
    setStockTransfers([]);
    setStockReceiptNotes([]);
    setVouchers([]);
    setJournalEntries([]);
    setStockMovements([]);
    setStockAdjustments([]);
    window.location.reload();
  };

  /**
   * Quick Seed Demo Data (زر اختياري للمعاينة والتجربة الفورية)
   */
  const deleteCostCenter = (id: string): boolean => {
    setCostCenters((prev) => prev.filter((cc) => cc.id !== id));
    return true;
  };

  const deleteAllProducts = () => {
    setProducts([]);
    setStockMovements([]);
    setStockAdjustments([]);
  };

  const addAccount = (accountData: Omit<Account, 'id' | 'balance'>): Account => {
    const newAccount: Account = {
      ...accountData,
      id: generateId('acc'),
      balance: 0,
      isSystemAccount: false,
    };
    setAccounts((prev) => [...prev, newAccount].sort((a, b) => a.code.localeCompare(b.code)));
    return newAccount;
  };

  const deleteAccount = (id: string): boolean => {
    const acc = accounts.find((a) => a.id === id);
    if (!acc) return false;
    if (acc.isSystemAccount) {
      showToast('لا يمكن حذف الحسابات النظامية الأساسية للدليل المحاسبي.', 'error');
      return false;
    }
    if (acc.balance !== 0) {
      showToast('لا يمكن حذف حساب لديه رصيد مالي غير مساوٍ للصفر.', 'error');
      return false;
    }
    setAccounts((prev) => prev.filter((a) => a.id !== id));
    showToast(`تم حذف الحساب ${acc.nameAr} بنجاح ✓`, 'success');
    return true;
  };

  const exportDatabaseJson = () => {
    const backup = {
      version: '3.0',
      exportedAt: new Date().toISOString(),
      settings,
      currencies,
      branches,
      warehouses,
      costCenters,
      accounts,
      products,
      contacts,
      invoices,
      quotations,
      returnInvoices,
      stockTransfers,
      stockReceiptNotes,
      vouchers,
      journalEntries,
      stockMovements,
      stockAdjustments,
    };
    return JSON.stringify(backup, null, 2);
  };

  const importDatabaseJson = (json: string): boolean => {
    try {
      const data = JSON.parse(json);
      if (data.accounts) {
        if (data.settings) setSettings(data.settings);
        if (data.currencies) setCurrencies(data.currencies);
        if (data.branches) setBranches(data.branches);
        if (data.warehouses) setWarehouses(data.warehouses);
        if (data.costCenters) setCostCenters(data.costCenters);
        if (data.accounts) setAccounts(data.accounts);
        if (data.products) setProducts(data.products);
        if (data.contacts) setContacts(data.contacts);
        if (data.invoices) setInvoices(data.invoices);
        if (data.quotations) setQuotations(data.quotations);
        if (data.returnInvoices) setReturnInvoices(data.returnInvoices);
        if (data.stockTransfers) setStockTransfers(data.stockTransfers);
        if (data.stockReceiptNotes) setStockReceiptNotes(data.stockReceiptNotes);
        if (data.vouchers) setVouchers(data.vouchers);
        if (data.journalEntries) setJournalEntries(data.journalEntries);
        if (data.stockMovements) setStockMovements(data.stockMovements);
        if (data.stockAdjustments) setStockAdjustments(data.stockAdjustments);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  };

  return (
    <AccountingContext.Provider
      value={{
        accounts,
        products,
        contacts,
        invoices,
        vouchers,
        journalEntries,
        stockMovements,
        stockAdjustments,
        branches,
        warehouses,
        quotations,
        returnInvoices,
        stockTransfers,
        stockReceiptNotes,
        costCenters,
        settings,
        currencies,
        activeView,
        setActiveView,
        selectedBranchId,
        setSelectedBranchId,
        updateCurrencyRate,
        addCurrency,
        autoFetchExchangeRates,
        performCurrencyRevaluation,
        createSalesInvoice,
        createPurchaseInvoice,
        createReturnInvoice,
        createQuotation,
        convertQuoteToInvoice,
        createStockTransfer,
        createStockReceiptNote,
        createVoucher,
        createManualJournalEntry,
        recordStockAdjustment,
        addProduct,
        updateProduct,
        deleteProduct,
        addContact,
        updateContact,
        deleteContact,
        addBranch,
        addWarehouse,
        addCostCenter,
        updateSettings,
        radicalFactoryReset,
        exportDatabaseJson,
        importDatabaseJson,
        deleteInvoice,
        deleteQuotation,
        deleteReturnInvoice,
        deleteVoucher,
        deleteJournalEntry,
        deleteStockTransfer,
        deleteStockReceiptNote,
        deleteStockAdjustment,
        deleteCurrency,
        deleteBranch,
        deleteWarehouse,
        deleteCostCenter,
        deleteAllProducts,
        addAccount,
        deleteAccount,
        inventorySummary,
        lowStockItems,
        toast,
        showToast,
        deleteConfirm,
        openDeleteConfirm,
        closeDeleteConfirm,
        branchActionModal,
        setBranchActionModal,
      }}
    >
      {children}

      {/* Global In-App Delete Confirmation Modal (100% reliable, never suppressed) */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden p-6 text-right space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-11 h-11 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-500 shrink-0">
                <Trash2 className="w-5 h-5 animate-pulse" />
              </div>
              <div className="flex-1">
                <h3 className="font-black text-base text-white">{deleteConfirm.title}</h3>
                <p className="text-xs text-red-400/90 font-medium mt-0.5">عملية حذف وتراجع نظامية</p>
              </div>
              <button
                type="button"
                onClick={closeDeleteConfirm}
                className="p-1 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-2">
              <div className="text-sm font-bold text-white">
                {deleteConfirm.itemName}
              </div>
              {deleteConfirm.message && (
                <div className="text-xs text-slate-300 leading-relaxed">
                  {deleteConfirm.message}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={closeDeleteConfirm}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
              >
                إلغاء الأمر
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteConfirm.onConfirm();
                  closeDeleteConfirm();
                  showToast('تمت عملية الحذف بنجاح ✓', 'success');
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs shadow-lg shadow-red-600/30 transition-all cursor-pointer active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
                {deleteConfirm.confirmLabel || 'نعم، تأكيد الحذف الآن'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global In-App Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 left-6 z-[9999] flex items-center gap-3 px-5 py-3 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl text-white text-xs font-bold backdrop-blur-md transition-all animate-in slide-in-from-bottom duration-200">
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
          {toast.type === 'error' && <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />}
          {toast.type === 'info' && <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />}
          <span>{toast.message}</span>
        </div>
      )}
    </AccountingContext.Provider>
  );
};

export const useAccounting = () => {
  const context = useContext(AccountingContext);
  if (!context) {
    throw new Error('useAccounting must be used within an AccountingProvider');
  }
  return context;
};
