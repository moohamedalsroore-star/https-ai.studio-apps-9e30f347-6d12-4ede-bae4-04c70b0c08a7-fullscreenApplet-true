import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import { Trash2, AlertTriangle, CheckCircle2, X } from 'lucide-react';
import {
  doc,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import {
  Account,
  AuditLogEntry,
  BankReconciliationRecord,
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
  SystemUser,
  Voucher,
  VoucherType,
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
import { useAuth } from './AuthContext';
import { db, logFirestoreError, OperationType } from '../lib/firebase';
import {
  provisionOrLoadWorkspace,
  syncWorkspaceRootToFirestore,
  syncCollectionDiffToFirestore,
  syncAuditSnapshotToFirestore,
  subscribeSubcollection,
  formatAccountDoc,
  formatProductDoc,
  formatContactDoc,
  formatInvoiceDoc,
  formatQuotationDoc,
  formatReturnInvoiceDoc,
  formatVoucherDoc,
  formatJournalEntryDoc,
  formatStockMovementDoc,
  formatStockAdjustmentDoc,
  formatStockTransferDoc,
  formatStockReceiptNoteDoc,
  formatReconciliationDoc,
  formatAuditLogDoc,
} from '../lib/firestoreSync';

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
    type: VoucherType;
    accountId: string;
    partyAccountId: string;
    toAccountId?: string;
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

  // Onyx Pro Enhanced Financial & Inventory Operations
  createTransferVoucher: (data: {
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    currency?: string;
    exchangeRate?: number;
    description: string;
    referenceNumber?: string;
    branchId?: string;
  }) => Voucher;

  assembleProduct: (productId: string, quantity: number, notes?: string) => { success: boolean; message: string };
  disassembleProduct: (productId: string, quantity: number, notes?: string) => { success: boolean; message: string };

  cloneInvoice: (invoiceId: string) => Invoice | null;
  cloneQuotation: (quoteId: string) => Quotation | null;
  voidInvoice: (invoiceId: string, reason: string) => boolean;

  // Security, Users & Roles
  users: SystemUser[];
  currentUser: SystemUser;
  setCurrentUser: (user: SystemUser) => void;
  addUser: (user: Omit<SystemUser, 'id' | 'createdAt'>) => SystemUser;
  updateUser: (id: string, updates: Partial<SystemUser>) => void;

  // Audit Trail Log
  auditLogs: AuditLogEntry[];
  addAuditLog: (action: AuditLogEntry['action'], module: string, details: string, entityId?: string, entityNumber?: string) => void;

  // Bank & Cash Reconciliation
  reconciliations: BankReconciliationRecord[];
  addReconciliation: (record: Omit<BankReconciliationRecord, 'id' | 'createdAt'>) => BankReconciliationRecord;

  // Branch & Warehouse Direct Creation State from Header
  branchActionModal: 'BRANCH' | 'WAREHOUSE' | 'MENU' | null;
  setBranchActionModal: (action: 'BRANCH' | 'WAREHOUSE' | 'MENU' | null) => void;
}

const AccountingContext = createContext<AccountingContextType | undefined>(undefined);

const DEFAULT_STAFF_USERS: SystemUser[] = [
  {
    id: 'usr-admin',
    name: 'مدير الحساب',
    username: 'owner',
    role: 'ADMIN',
    phone: '',
    active: true,
    createdAt: new Date().toISOString(),
  },
];

function getTenantStoragePrefix(uid: string | null | undefined): string {
  return uid ? `alghafari_tenant_${uid}` : 'alghafari_guest_ephemeral';
}

function readTenantJson<T>(prefix: string, suffix: string, fallback: T): T {
  if (prefix === 'alghafari_guest_ephemeral') return fallback;
  try {
    const raw = localStorage.getItem(`${prefix}_${suffix}`);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function filterCleanBranches(list: Branch[]): Branch[] {
  return (list || []).filter(
    (b) =>
      b.nameAr !== 'الفرع الرئيسي (الإدارة العامة)' &&
      b.id !== 'br-main' &&
      !b.nameAr.includes('الفرع الرئيسي')
  );
}

function filterCleanAccounts(list: Account[]): Account[] {
  return (list || []).filter(
    (a) =>
      !a.nameAr.includes('الراجحي') &&
      !a.nameAr.includes('الأهلي') &&
      !a.nameAr.includes('الاهلي') &&
      a.code !== '1103' &&
      a.code !== '1104'
  );
}

function mergeSettingsWithDefaults(parsed?: Partial<SystemSettings>): SystemSettings {
  if (!parsed) return INITIAL_SETTINGS;
  const normalized = { ...parsed };
  if (normalized.companyName === 'مؤسسة التجارة والخدمات العامة' || !normalized.companyName) {
    normalized.companyName = 'الغفاري سوفت برو';
    normalized.companyNameEn = 'Al-Ghafari Soft Pro';
  }
  return {
    ...INITIAL_SETTINGS,
    ...normalized,
    printSettings: { ...INITIAL_SETTINGS.printSettings!, ...(normalized.printSettings || {}) } as SystemSettings['printSettings'],
    documentTemplates: { ...INITIAL_SETTINGS.documentTemplates!, ...(normalized.documentTemplates || {}) } as SystemSettings['documentTemplates'],
    accountingConfig: { ...INITIAL_SETTINGS.accountingConfig!, ...(normalized.accountingConfig || {}) } as SystemSettings['accountingConfig'],
    inventoryConfig: { ...INITIAL_SETTINGS.inventoryConfig!, ...(normalized.inventoryConfig || {}) } as SystemSettings['inventoryConfig'],
    reportConfig: { ...INITIAL_SETTINGS.reportConfig!, ...(normalized.reportConfig || {}) } as SystemSettings['reportConfig'],
    appearanceConfig: { ...INITIAL_SETTINGS.appearanceConfig!, ...(normalized.appearanceConfig || {}) } as SystemSettings['appearanceConfig'],
  };
}

export const AccountingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { authUser, userProfile, isAuthReady, tenantCode, updateProfileCompanyName } = useAuth();
  const activeUid = authUser?.uid && userProfile?.status === 'ACTIVE' ? authUser.uid : null;
  const tenantPrefix = getTenantStoragePrefix(activeUid);

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

  const [settings, setSettings] = useState<SystemSettings>(INITIAL_SETTINGS);
  const [branches, setBranches] = useState<Branch[]>(() => filterCleanBranches(INITIAL_BRANCHES));
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [warehouses, setWarehouses] = useState<Warehouse[]>(INITIAL_WAREHOUSES);
  const [costCenters, setCostCenters] = useState<CostCenter[]>(INITIAL_COST_CENTERS);
  const [accounts, setAccounts] = useState<Account[]>(() => filterCleanAccounts(INITIAL_ACCOUNTS));
  const [products, setProducts] = useState<Product[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [returnInvoices, setReturnInvoices] = useState<ReturnInvoice[]>([]);
  const [stockTransfers, setStockTransfers] = useState<StockTransfer[]>([]);
  const [stockReceiptNotes, setStockReceiptNotes] = useState<StockReceiptNote[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [stockAdjustments, setStockAdjustments] = useState<StockAdjustment[]>([]);
  const [currencies, setCurrencies] = useState<CurrencyConfig[]>(INITIAL_CURRENCIES);
  const [users, setUsers] = useState<SystemUser[]>(DEFAULT_STAFF_USERS);
  const [currentUser, setCurrentUser] = useState<SystemUser>(DEFAULT_STAFF_USERS[0]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [reconciliations, setReconciliations] = useState<BankReconciliationRecord[]>([]);

  // Refs controlling Firestore real-time diff syncing per authenticated user
  const syncedUidRef = useRef<string | null>(null);
  const cloudHydratedRef = useRef<boolean>(false);
  const remoteApplyingRef = useRef<boolean>(false);
  const prevSyncStateRef = useRef<Record<string, unknown>>({});
  const prevSyncedArrayRefs = useRef<Record<string, unknown>>({});
  const hydratedCollectionsRef = useRef<Set<string>>(new Set());
  const syncedMapsRef = useRef<Record<string, Map<string, string>>>({});
  const lastWorkspaceHashRef = useRef<string>('');
  const lastSnapshotHashRef = useRef<string>('');

  // Reset all in-memory accounting state immediately on logout or account switch (Strict Zero-Leak Guarantee)
  useEffect(() => {
    if (!activeUid) {
      syncedUidRef.current = null;
      cloudHydratedRef.current = false;
      syncedMapsRef.current = {};
      lastWorkspaceHashRef.current = '';
      lastSnapshotHashRef.current = '';
      prevSyncStateRef.current = {};
      prevSyncedArrayRefs.current = {};
      hydratedCollectionsRef.current = new Set();

      setActiveView('dashboard');
      setSettings(INITIAL_SETTINGS);
      setBranches(filterCleanBranches(INITIAL_BRANCHES));
      setSelectedBranchId('');
      setWarehouses(INITIAL_WAREHOUSES);
      setCostCenters(INITIAL_COST_CENTERS);
      setAccounts(filterCleanAccounts(INITIAL_ACCOUNTS).map((a) => ({ ...a, balance: 0 })));
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
      setCurrencies(INITIAL_CURRENCIES);
      setUsers(DEFAULT_STAFF_USERS);
      setCurrentUser(DEFAULT_STAFF_USERS[0]);
      setAuditLogs([]);
      setReconciliations([]);
      return;
    }

    // Hydrate from UID-scoped offline cache immediately while live Firestore listeners connect
    const prefix = getTenantStoragePrefix(activeUid);
    const ownerName = userProfile?.displayName || authUser?.displayName || authUser?.email?.split('@')[0] || 'مستخدم النظام';
    const initialOwnerStaff: SystemUser = {
      id: 'usr-admin',
      name: ownerName,
      username: authUser?.email?.split('@')[0] || 'owner',
      role: 'ADMIN',
      phone: '',
      active: true,
      createdAt: new Date().toISOString(),
    };

    const cachedSettings = mergeSettingsWithDefaults(readTenantJson<Partial<SystemSettings>>(prefix, 'settings', INITIAL_SETTINGS));
    const cachedBranches = filterCleanBranches(readTenantJson<Branch[]>(prefix, 'branches', INITIAL_BRANCHES));
    const cachedWarehouses = readTenantJson<Warehouse[]>(prefix, 'warehouses', INITIAL_WAREHOUSES);
    const cachedCostCenters = readTenantJson<CostCenter[]>(prefix, 'cost_centers', INITIAL_COST_CENTERS);
    const cachedAccounts = filterCleanAccounts(readTenantJson<Account[]>(prefix, 'accounts', INITIAL_ACCOUNTS));
    const cachedProducts = readTenantJson<Product[]>(prefix, 'products', []);
    const cachedContacts = readTenantJson<Contact[]>(prefix, 'contacts', []);
    const cachedInvoices = readTenantJson<Invoice[]>(prefix, 'invoices', []);
    const cachedQuotations = readTenantJson<Quotation[]>(prefix, 'quotations', []);
    const cachedReturns = readTenantJson<ReturnInvoice[]>(prefix, 'returns', []);
    const cachedTransfers = readTenantJson<StockTransfer[]>(prefix, 'transfers', []);
    const cachedReceipts = readTenantJson<StockReceiptNote[]>(prefix, 'receipt_notes', []);
    const cachedVouchers = readTenantJson<Voucher[]>(prefix, 'vouchers', []);
    const cachedJournal = readTenantJson<JournalEntry[]>(prefix, 'journal', []);
    const cachedMovements = readTenantJson<StockMovement[]>(prefix, 'stock_movements', []);
    const cachedAdjustments = readTenantJson<StockAdjustment[]>(prefix, 'stock_adjustments', []);
    const cachedCurrencies = readTenantJson<CurrencyConfig[]>(prefix, 'currencies', INITIAL_CURRENCIES);
    const cachedUsers = readTenantJson<SystemUser[]>(prefix, 'users', [initialOwnerStaff]);
    const cachedAuditLogs = readTenantJson<AuditLogEntry[]>(prefix, 'audit_logs', []);
    const cachedReconciliations = readTenantJson<BankReconciliationRecord[]>(prefix, 'reconciliations', []);

    setSettings(cachedSettings);
    setBranches(cachedBranches);
    setSelectedBranchId(cachedBranches[0]?.id || '');
    setWarehouses(cachedWarehouses);
    setCostCenters(cachedCostCenters);
    setAccounts(cachedAccounts);
    setProducts(cachedProducts);
    setContacts(cachedContacts);
    setInvoices(cachedInvoices);
    setQuotations(cachedQuotations);
    setReturnInvoices(cachedReturns);
    setStockTransfers(cachedTransfers);
    setStockReceiptNotes(cachedReceipts);
    setVouchers(cachedVouchers);
    setJournalEntries(cachedJournal);
    setStockMovements(cachedMovements);
    setStockAdjustments(cachedAdjustments);
    setCurrencies(cachedCurrencies);
    const resolvedUsers = cachedUsers.length > 0 ? cachedUsers : [initialOwnerStaff];
    setUsers(resolvedUsers);
    setCurrentUser({ ...resolvedUsers[0], name: ownerName });
    setAuditLogs(cachedAuditLogs);
    setReconciliations(cachedReconciliations);

    // Mount isolated Firestore workspace listeners for activeUid
    if (!isAuthReady || !authUser?.emailVerified) return;

    let cancelled = false;
    const unsubs: Unsubscribe[] = [];
    cloudHydratedRef.current = false;
    syncedUidRef.current = activeUid;
    syncedMapsRef.current = {};
    hydratedCollectionsRef.current = new Set();

    const startSync = async () => {
      try {
        const cleanInitialAccounts = filterCleanAccounts(INITIAL_ACCOUNTS);
        const existingWs = await provisionOrLoadWorkspace({
          uid: activeUid,
          tenantCode: tenantCode || `AG-${activeUid.slice(0, 6).toUpperCase()}`,
          companyName: cachedSettings.companyName || 'الغفاري سوفت برو',
          settings: cachedSettings,
          currencies: cachedCurrencies,
          branches: cachedBranches,
          warehouses: cachedWarehouses,
          costCenters: cachedCostCenters,
          staffUsers: resolvedUsers,
          currentStaffUserId: initialOwnerStaff.id,
          initialAccounts: cleanInitialAccounts,
        });

        if (cancelled) return;

        if (existingWs) {
          remoteApplyingRef.current = true;
          const wsSettings = mergeSettingsWithDefaults(existingWs.settings);
          const wsBranches = filterCleanBranches(existingWs.branches);
          setSettings(wsSettings);
          setCurrencies(existingWs.currencies.length ? existingWs.currencies : INITIAL_CURRENCIES);
          setBranches(wsBranches);
          setSelectedBranchId((prev) => prev || wsBranches[0]?.id || '');
          setWarehouses(existingWs.warehouses.length ? existingWs.warehouses : INITIAL_WAREHOUSES);
          setCostCenters(existingWs.costCenters.length ? existingWs.costCenters : INITIAL_COST_CENTERS);
          const staff = existingWs.staffUsers?.length ? existingWs.staffUsers : [initialOwnerStaff];
          setUsers(staff);
          setCurrentUser({ ...(staff.find((u) => u.id === existingWs.currentStaffUserId) || staff[0]), name: ownerName });
          lastWorkspaceHashRef.current = JSON.stringify({
            companyName: wsSettings.companyName,
            settings: wsSettings,
            currencies: existingWs.currencies,
            branches: wsBranches,
            warehouses: existingWs.warehouses,
            costCenters: existingWs.costCenters,
            staffUsers: staff,
            currentStaffUserId: existingWs.currentStaffUserId || staff[0]?.id,
          });
          setTimeout(() => {
            remoteApplyingRef.current = false;
          }, 50);
        }

        // Subscribe to Workspace Master Root doc
        unsubs.push(
          onSnapshot(
            doc(db, 'workspaces', activeUid),
            (snap) => {
              if (!snap.exists() || cancelled) return;
              const d = snap.data();
              const nextSettings = mergeSettingsWithDefaults(d.settings);
              const nextBranches = filterCleanBranches(d.branches || []);
              const nextCurrencies = d.currencies || INITIAL_CURRENCIES;
              const nextWarehouses = d.warehouses || INITIAL_WAREHOUSES;
              const nextCostCenters = d.costCenters || INITIAL_COST_CENTERS;
              const nextStaff: SystemUser[] = d.staffUsers?.length ? d.staffUsers : [initialOwnerStaff];
              const nextHash = JSON.stringify({
                companyName: nextSettings.companyName,
                settings: nextSettings,
                currencies: nextCurrencies,
                branches: nextBranches,
                warehouses: nextWarehouses,
                costCenters: nextCostCenters,
                staffUsers: nextStaff,
                currentStaffUserId: d.currentStaffUserId || nextStaff[0]?.id,
              });
              if (nextHash !== lastWorkspaceHashRef.current) {
                lastWorkspaceHashRef.current = nextHash;
                remoteApplyingRef.current = true;
                setSettings(nextSettings);
                setCurrencies(nextCurrencies);
                setBranches(nextBranches);
                setWarehouses(nextWarehouses);
                setCostCenters(nextCostCenters);
                setUsers(nextStaff);
                setCurrentUser((curr) => ({ ...(nextStaff.find((u) => u.id === d.currentStaffUserId) || curr), name: ownerName }));
                setTimeout(() => {
                  remoteApplyingRef.current = false;
                }, 40);
              }
            },
            (err) => {
              logFirestoreError(err, OperationType.GET, `workspaces/${activeUid}`);
            }
          )
        );

        // Subscribe to all 14 isolated tenant subcollections
        const applyRemote = <T,>(
          key: string,
          setter: React.Dispatch<React.SetStateAction<T[]>>,
          sortFn?: (a: T, b: T) => number
        ) => {
          return (items: T[], syncedMap: Map<string, string>) => {
            if (cancelled) return;
            syncedMapsRef.current[key] = syncedMap;
            hydratedCollectionsRef.current.add(key);
            remoteApplyingRef.current = true;
            const ordered = sortFn ? [...items].sort(sortFn) : items;
            prevSyncedArrayRefs.current[key] = ordered;
            setter(ordered);
            setTimeout(() => {
              remoteApplyingRef.current = false;
            }, 40);
          };
        };

        const sortNewestFirst = <T extends { createdAt?: string }>(a: T, b: T) =>
          String(b.createdAt || '').localeCompare(String(a.createdAt || ''));

        unsubs.push(
          subscribeSubcollection<Account>(
            activeUid,
            'accounts',
            applyRemote('accounts', setAccounts, (a, b) => a.code.localeCompare(b.code)),
            formatAccountDoc
          ),
          subscribeSubcollection<Product>(
            activeUid,
            'products',
            applyRemote('products', setProducts, (a, b) => a.nameAr.localeCompare(b.nameAr)),
            formatProductDoc
          ),
          subscribeSubcollection<Contact>(
            activeUid,
            'contacts',
            applyRemote('contacts', setContacts, (a, b) => a.name.localeCompare(b.name)),
            formatContactDoc
          ),
          subscribeSubcollection<Invoice>(
            activeUid,
            'invoices',
            applyRemote('invoices', setInvoices, sortNewestFirst),
            formatInvoiceDoc
          ),
          subscribeSubcollection<Quotation>(
            activeUid,
            'quotations',
            applyRemote('quotations', setQuotations, sortNewestFirst),
            formatQuotationDoc
          ),
          subscribeSubcollection<ReturnInvoice>(
            activeUid,
            'returnInvoices',
            applyRemote('returnInvoices', setReturnInvoices, sortNewestFirst),
            formatReturnInvoiceDoc
          ),
          subscribeSubcollection<Voucher>(
            activeUid,
            'vouchers',
            applyRemote('vouchers', setVouchers, sortNewestFirst),
            formatVoucherDoc
          ),
          subscribeSubcollection<JournalEntry>(
            activeUid,
            'journalEntries',
            applyRemote('journalEntries', setJournalEntries, sortNewestFirst),
            formatJournalEntryDoc
          ),
          subscribeSubcollection<StockMovement>(
            activeUid,
            'stockMovements',
            applyRemote('stockMovements', setStockMovements, sortNewestFirst),
            formatStockMovementDoc
          ),
          subscribeSubcollection<StockAdjustment>(
            activeUid,
            'stockAdjustments',
            applyRemote('stockAdjustments', setStockAdjustments, sortNewestFirst),
            formatStockAdjustmentDoc
          ),
          subscribeSubcollection<StockTransfer>(
            activeUid,
            'stockTransfers',
            applyRemote('stockTransfers', setStockTransfers, sortNewestFirst),
            formatStockTransferDoc
          ),
          subscribeSubcollection<StockReceiptNote>(
            activeUid,
            'stockReceiptNotes',
            applyRemote('stockReceiptNotes', setStockReceiptNotes, sortNewestFirst),
            formatStockReceiptNoteDoc
          ),
          subscribeSubcollection<BankReconciliationRecord>(
            activeUid,
            'reconciliations',
            applyRemote('reconciliations', setReconciliations, sortNewestFirst),
            formatReconciliationDoc
          ),
          subscribeSubcollection<AuditLogEntry>(
            activeUid,
            'auditLogs',
            applyRemote('auditLogs', setAuditLogs, (a, b) => String(b.timestamp).localeCompare(String(a.timestamp))),
            formatAuditLogDoc
          )
        );

        cloudHydratedRef.current = true;
      } catch (err) {
        console.error('Workspace cloud sync initialization error:', err);
      }
    };

    void startSync();

    return () => {
      cancelled = true;
      unsubs.forEach((u) => u());
    };
  }, [activeUid, isAuthReady, authUser?.emailVerified, tenantCode]);

  // UID-Scoped Offline Cache + Real-time Cloud Diff Sync
  useEffect(() => {
    if (!activeUid) return;

    const timer = setTimeout(() => {
      try {
        const prev = prevSyncStateRef.current;
        const syncLocal = (refKey: string, suffix: string, value: unknown) => {
          if (prev[refKey] !== value) {
            localStorage.setItem(`${tenantPrefix}_${suffix}`, JSON.stringify(value));
            prev[refKey] = value;
          }
        };

        syncLocal('settings', 'settings', settings);
        syncLocal('currencies', 'currencies', currencies);
        syncLocal('branches', 'branches', branches);
        syncLocal('warehouses', 'warehouses', warehouses);
        syncLocal('costCenters', 'cost_centers', costCenters);
        syncLocal('accounts', 'accounts', accounts);
        syncLocal('products', 'products', products);
        syncLocal('contacts', 'contacts', contacts);
        syncLocal('invoices', 'invoices', invoices);
        syncLocal('quotations', 'quotations', quotations);
        syncLocal('returnInvoices', 'returns', returnInvoices);
        syncLocal('stockTransfers', 'transfers', stockTransfers);
        syncLocal('stockReceiptNotes', 'receipt_notes', stockReceiptNotes);
        syncLocal('vouchers', 'vouchers', vouchers);
        syncLocal('journalEntries', 'journal', journalEntries);
        syncLocal('stockMovements', 'stock_movements', stockMovements);
        syncLocal('stockAdjustments', 'stock_adjustments', stockAdjustments);
        syncLocal('users', 'users', users);
        syncLocal('auditLogs', 'audit_logs', auditLogs);
        syncLocal('reconciliations', 'reconciliations', reconciliations);
      } catch (err) {
        console.warn('Tenant offline cache sync warning:', err);
      }

      if (!cloudHydratedRef.current || remoteApplyingRef.current || syncedUidRef.current !== activeUid) {
        return;
      }

      // 1. Sync Workspace Root (settings, currencies, branches, warehouses, costCenters, staffUsers)
      const wsPayload = {
        companyName: settings.companyName || 'الغفاري سوفت برو',
        settings,
        currencies,
        branches,
        warehouses,
        costCenters,
        staffUsers: users,
        currentStaffUserId: currentUser?.id || 'usr-admin',
      };
      const wsHash = JSON.stringify(wsPayload);
      if (wsHash !== lastWorkspaceHashRef.current) {
        lastWorkspaceHashRef.current = wsHash;
        void syncWorkspaceRootToFirestore(activeUid, wsPayload);
      }

      // 2. Diff-sync only subcollections whose array reference changed to avoid redundant serialization
      const syncCol = async <T extends { id: string }>(
        colName: Parameters<typeof syncCollectionDiffToFirestore>[1],
        items: T[],
        formatter: (item: T, uid: string) => Record<string, unknown>
      ) => {
        if (!hydratedCollectionsRef.current.has(colName)) return;
        if (prevSyncedArrayRefs.current[colName] === items) return;
        prevSyncedArrayRefs.current[colName] = items;
        const prevMap = syncedMapsRef.current[colName] || new Map<string, string>();
        const nextMap = await syncCollectionDiffToFirestore(activeUid, colName, items, prevMap, formatter);
        syncedMapsRef.current[colName] = nextMap;
      };

      void Promise.all([
        syncCol('accounts', accounts, formatAccountDoc),
        syncCol('products', products, formatProductDoc),
        syncCol('contacts', contacts, formatContactDoc),
        syncCol('invoices', invoices, formatInvoiceDoc),
        syncCol('quotations', quotations, formatQuotationDoc),
        syncCol('returnInvoices', returnInvoices, formatReturnInvoiceDoc),
        syncCol('vouchers', vouchers, formatVoucherDoc),
        syncCol('journalEntries', journalEntries, formatJournalEntryDoc),
        syncCol('stockMovements', stockMovements, formatStockMovementDoc),
        syncCol('stockAdjustments', stockAdjustments, formatStockAdjustmentDoc),
        syncCol('stockTransfers', stockTransfers, formatStockTransferDoc),
        syncCol('stockReceiptNotes', stockReceiptNotes, formatStockReceiptNoteDoc),
        syncCol('reconciliations', reconciliations, formatReconciliationDoc),
        syncCol('auditLogs', auditLogs, formatAuditLogDoc),
      ]).catch((err) => {
        console.error('Firestore collection sync error:', err);
      });

      // 3. Keep isolated auditSummary KPI doc updated (only readable by Admin when owner authorizes)
      const totalSalesBase = invoices
        .filter((inv) => inv.type === 'SALES' && inv.workflowStatus !== 'VOID')
        .reduce((sum, inv) => sum + (inv.grandTotalBase || inv.grandTotal || 0), 0);
      const snapshotPayload = {
        companyName: settings.companyName || 'الغفاري سوفت برو',
        baseCurrency: settings.baseCurrency || 'SAR',
        invoicesCount: invoices.length,
        vouchersCount: vouchers.length,
        productsCount: products.length,
        contactsCount: contacts.length,
        journalEntriesCount: journalEntries.length,
        totalSalesBase: Math.round(totalSalesBase * 100) / 100,
      };
      const snapHash = JSON.stringify(snapshotPayload);
      if (snapHash !== lastSnapshotHashRef.current) {
        lastSnapshotHashRef.current = snapHash;
        void syncAuditSnapshotToFirestore(activeUid, snapshotPayload);
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [
    activeUid,
    tenantPrefix,
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
    users,
    currentUser,
    auditLogs,
    reconciliations,
  ]);

  // Inventory & COGS Summary - Optimized with Single-Pass useMemo for Instant Response
  const lowStockItems = useMemo(
    () => products.filter((p) => p.stockQty <= p.minStockAlert),
    [products]
  );

  const inventorySummary: InventoryValuationSummary = useMemo(() => {
    const totalItemsCount = products.length;
    let totalUnitsInStock = 0;
    let totalCostValue = 0;
    let totalRetailValue = 0;
    let outOfStockItemsCount = 0;

    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      totalUnitsInStock += p.stockQty;
      totalCostValue += p.stockQty * p.costPrice;
      totalRetailValue += p.stockQty * p.salePrice;
      if (p.stockQty <= 0) outOfStockItemsCount++;
    }

    const potentialProfit = totalRetailValue - totalCostValue;
    const potentialMarginPercent =
      totalRetailValue > 0 ? (potentialProfit / totalRetailValue) * 100 : 0;

    let periodCogsTotal = 0;
    for (let j = 0; j < stockMovements.length; j++) {
      const m = stockMovements[j];
      if (m.type === 'SALE') {
        periodCogsTotal += Math.abs(m.quantityChange) * m.unitCost;
      }
    }

    return {
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
  }, [products, stockMovements, lowStockItems.length]);

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
    type: VoucherType;
    accountId: string;
    partyAccountId: string;
    toAccountId?: string;
    amount: number;
    currency?: string;
    exchangeRate?: number;
    paymentMethod: PaymentMethod;
    referenceNumber?: string;
    description: string;
    contactId?: string;
    branchId?: string;
  }): Voucher => {
    if (data.type === 'TRANSFER') {
      return createTransferVoucher({
        fromAccountId: data.accountId,
        toAccountId: data.toAccountId || data.partyAccountId,
        amount: data.amount,
        currency: data.currency,
        exchangeRate: data.exchangeRate,
        description: data.description,
        referenceNumber: data.referenceNumber,
        branchId: data.branchId,
      });
    }

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
   * Action: Audit Log helper
   */
  const addAuditLog = (
    action: AuditLogEntry['action'],
    module: string,
    details: string,
    entityId?: string,
    entityNumber?: string
  ) => {
    const newEntry: AuditLogEntry = {
      id: generateId('audit'),
      timestamp: new Date().toISOString(),
      userName: currentUser?.name || 'مدير النظام',
      userRole: currentUser?.role || 'ADMIN',
      action,
      module,
      entityId,
      entityNumber,
      details,
    };
    setAuditLogs((prev) => [newEntry, ...prev.slice(0, 999)]);
  };

  /**
   * Action: Add & Update User
   */
  const addUser = (userData: Omit<SystemUser, 'id' | 'createdAt'>): SystemUser => {
    const newUser: SystemUser = {
      id: generateId('usr'),
      ...userData,
      createdAt: new Date().toISOString(),
    };
    setUsers((prev) => [...prev, newUser]);
    addAuditLog('CREATE', 'إدارة المستخدمين', `إضافة مستخدم جديد: ${newUser.name} (${newUser.role})`);
    showToast(`تمت إضافة المستخدم "${newUser.name}" بنجاح`, 'success');
    return newUser;
  };

  const updateUser = (id: string, updates: Partial<SystemUser>) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const updated = { ...u, ...updates };
          if (currentUser?.id === id) setCurrentUser(updated);
          return updated;
        }
        return u;
      })
    );
    addAuditLog('UPDATE', 'إدارة المستخدمين', `تحديث بيانات المستخدم ID: ${id}`);
    showToast('تم تحديث بيانات المستخدم بنجاح', 'success');
  };

  /**
   * Action: Bank & Cash Reconciliation
   */
  const addReconciliation = (recordData: Omit<BankReconciliationRecord, 'id' | 'createdAt'>): BankReconciliationRecord => {
    const newRec: BankReconciliationRecord = {
      id: generateId('rec'),
      ...recordData,
      createdAt: new Date().toISOString(),
    };
    setReconciliations((prev) => [newRec, ...prev]);
    addAuditLog('RECONCILE', 'الخزينة والبنوك', `تسوية بنكية للحساب: ${newRec.accountId} بفارق: ${newRec.difference.toFixed(2)}`);
    showToast('تم حفظ التسوية البنكية بنجاح', 'success');
    return newRec;
  };

  /**
   * Action: Create Inter-Account Transfer Voucher (سند تحويل بين الحسابات والصناديق)
   */
  const createTransferVoucher = (data: {
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    currency?: string;
    exchangeRate?: number;
    description: string;
    referenceNumber?: string;
    branchId?: string;
  }): Voucher => {
    const count = vouchers.filter((v) => v.type === 'TRANSFER').length + 1;
    const voucherNum = `TRF-${String(count).padStart(4, '0')}`;
    const fromAcc = accounts.find((a) => a.id === data.fromAccountId);
    const toAcc = accounts.find((a) => a.id === data.toAccountId);

    const selectedCurr = data.currency || settings.baseCurrency;
    const rate = data.exchangeRate ?? (currencies.find((c) => c.code === selectedCurr)?.rate || 1.0);
    const amountBase = Math.round(data.amount * rate * 100) / 100;

    const newVoucher: Voucher = {
      id: generateId('vouch'),
      voucherNumber: voucherNum,
      type: 'TRANSFER',
      date: new Date().toISOString().split('T')[0],
      branchId: data.branchId || selectedBranchId,
      accountId: data.fromAccountId,
      accountName: fromAcc?.nameAr || 'الحساب المحول منه',
      partyAccountId: data.toAccountId,
      partyAccountName: toAcc?.nameAr || 'الحساب المحول إليه',
      toAccountId: data.toAccountId,
      toAccountName: toAcc?.nameAr || 'الحساب المحول إليه',
      amount: data.amount,
      currency: selectedCurr,
      exchangeRate: rate,
      amountBase,
      paymentMethod: 'CASH',
      referenceNumber: data.referenceNumber,
      description: data.description || `تحويل مالي بين الحسابات من ${fromAcc?.nameAr} إلى ${toAcc?.nameAr}`,
      createdAt: new Date().toISOString(),
    };

    const journalEntry = generateVoucherJournal(newVoucher, accounts);
    newVoucher.journalEntryId = journalEntry.id;

    const updatedJournalEntries = [journalEntry, ...journalEntries];
    const updatedAccounts = recalculateAllAccountBalances(accounts, updatedJournalEntries);

    setVouchers((prev) => [newVoucher, ...prev]);
    setJournalEntries(updatedJournalEntries);
    setAccounts(updatedAccounts);

    addAuditLog('TRANSFER', 'الخزينة والبنوك', `سند تحويل ${voucherNum} بمبلغ ${data.amount} من ${fromAcc?.nameAr} إلى ${toAcc?.nameAr}`, newVoucher.id, voucherNum);
    showToast(`تم إنشاء سند التحويل ${voucherNum} وترحيل القيد بنجاح ✓`, 'success');

    return newVoucher;
  };

  /**
   * Action: BOM Assembly (تجميع صنف مركب)
   */
  const assembleProduct = (productId: string, quantity: number, notes?: string): { success: boolean; message: string } => {
    if (quantity <= 0) return { success: false, message: 'الكمية يجب أن تكون أكبر من صفر' };
    const compositeProd = products.find((p) => p.id === productId);
    if (!compositeProd) return { success: false, message: 'الصنف غير موجود' };
    if (!compositeProd.isComposite || !compositeProd.components || compositeProd.components.length === 0) {
      return { success: false, message: 'هذا الصنف ليس صنفاً مركباً أو لا توجد له مكونات محددة' };
    }

    for (const comp of compositeProd.components) {
      const compProd = products.find((p) => p.id === comp.productId);
      const neededQty = comp.quantity * quantity;
      if (!compProd || compProd.stockQty < neededQty) {
        return {
          success: false,
          message: `المخزون غير كافٍ للمكون: ${comp.productName || compProd?.nameAr || comp.productId}. المطلوب: ${neededQty} والمتوفر: ${compProd?.stockQty || 0}`,
        };
      }
    }

    let updatedProducts = [...products];
    const newMovements: StockMovement[] = [];
    const dateNow = new Date().toISOString().split('T')[0];
    const refNum = `ASM-${Date.now().toString().slice(-6)}`;

    compositeProd.components.forEach((comp) => {
      const pIdx = updatedProducts.findIndex((p) => p.id === comp.productId);
      if (pIdx !== -1) {
        const prod = updatedProducts[pIdx];
        const consumed = comp.quantity * quantity;
        const newBalance = prod.stockQty - consumed;
        updatedProducts[pIdx] = { ...prod, stockQty: newBalance };

        newMovements.push({
          id: generateId('sm'),
          productId: prod.id,
          productName: prod.nameAr,
          type: 'ASSEMBLY_OUT',
          referenceNumber: refNum,
          date: dateNow,
          quantityChange: -consumed,
          unitCost: prod.costPrice,
          totalCost: consumed * prod.costPrice,
          balanceAfter: newBalance,
          notes: `استهلاك مكونات لتجميع الصنف المركب ${compositeProd.nameAr} (عدد ${quantity})`,
          createdAt: new Date().toISOString(),
        });
      }
    });

    const cIdx = updatedProducts.findIndex((p) => p.id === compositeProd.id);
    if (cIdx !== -1) {
      const prod = updatedProducts[cIdx];
      const newBalance = prod.stockQty + quantity;
      updatedProducts[cIdx] = { ...prod, stockQty: newBalance };

      newMovements.push({
        id: generateId('sm'),
        productId: prod.id,
        productName: prod.nameAr,
        type: 'ASSEMBLY_IN',
        referenceNumber: refNum,
        date: dateNow,
        quantityChange: quantity,
        unitCost: prod.costPrice,
        totalCost: quantity * prod.costPrice,
        balanceAfter: newBalance,
        notes: `تجميع صنف مركب: ${compositeProd.nameAr} (عدد ${quantity}) ${notes ? ` - ${notes}` : ''}`,
        createdAt: new Date().toISOString(),
      });
    }

    setProducts(updatedProducts);
    setStockMovements((prev) => [...newMovements, ...prev]);

    addAuditLog('ASSEMBLE', 'إدارة المخزون', `تجميع ${quantity} وحدة من الصنف المركب: ${compositeProd.nameAr}`, compositeProd.id, refNum);
    showToast(`تم تجميع ${quantity} وحدة من "${compositeProd.nameAr}" وترحيل المخزون بنجاح ✓`, 'success');

    return { success: true, message: `تم تجميع عدد ${quantity} من "${compositeProd.nameAr}" بنجاح` };
  };

  /**
   * Action: BOM Disassembly (تفكيك صنف مركب)
   */
  const disassembleProduct = (productId: string, quantity: number, notes?: string): { success: boolean; message: string } => {
    if (quantity <= 0) return { success: false, message: 'الكمية يجب أن تكون أكبر من صفر' };
    const compositeProd = products.find((p) => p.id === productId);
    if (!compositeProd) return { success: false, message: 'الصنف غير موجود' };
    if (compositeProd.stockQty < quantity) {
      return { success: false, message: `رصيد الصنف المركب غير كافٍ للتفكيك. المتوفر: ${compositeProd.stockQty}` };
    }
    if (!compositeProd.components || compositeProd.components.length === 0) {
      return { success: false, message: 'لا توجد مكونات مسجلة لهذا الصنف' };
    }

    let updatedProducts = [...products];
    const newMovements: StockMovement[] = [];
    const dateNow = new Date().toISOString().split('T')[0];
    const refNum = `DIS-${Date.now().toString().slice(-6)}`;

    const cIdx = updatedProducts.findIndex((p) => p.id === compositeProd.id);
    if (cIdx !== -1) {
      const prod = updatedProducts[cIdx];
      const newBalance = prod.stockQty - quantity;
      updatedProducts[cIdx] = { ...prod, stockQty: newBalance };

      newMovements.push({
        id: generateId('sm'),
        productId: prod.id,
        productName: prod.nameAr,
        type: 'ASSEMBLY_OUT',
        referenceNumber: refNum,
        date: dateNow,
        quantityChange: -quantity,
        unitCost: prod.costPrice,
        totalCost: quantity * prod.costPrice,
        balanceAfter: newBalance,
        notes: `تفكيك صنف مركب: ${compositeProd.nameAr} (عدد ${quantity})`,
        createdAt: new Date().toISOString(),
      });
    }

    compositeProd.components.forEach((comp) => {
      const pIdx = updatedProducts.findIndex((p) => p.id === comp.productId);
      if (pIdx !== -1) {
        const prod = updatedProducts[pIdx];
        const recovered = comp.quantity * quantity;
        const newBalance = prod.stockQty + recovered;
        updatedProducts[pIdx] = { ...prod, stockQty: newBalance };

        newMovements.push({
          id: generateId('sm'),
          productId: prod.id,
          productName: prod.nameAr,
          type: 'ASSEMBLY_IN',
          referenceNumber: refNum,
          date: dateNow,
          quantityChange: recovered,
          unitCost: prod.costPrice,
          totalCost: recovered * prod.costPrice,
          balanceAfter: newBalance,
          notes: `إرجاع مكونات من تفكيك ${compositeProd.nameAr} (عدد ${quantity})`,
          createdAt: new Date().toISOString(),
        });
      }
    });

    setProducts(updatedProducts);
    setStockMovements((prev) => [...newMovements, ...prev]);

    addAuditLog('DISASSEMBLE', 'إدارة المخزون', `تفكيك ${quantity} وحدة من الصنف المركب: ${compositeProd.nameAr}`, compositeProd.id, refNum);
    showToast(`تم تفكيك ${quantity} وحدة وإرجاع المكونات للمخزون بنجاح ✓`, 'success');

    return { success: true, message: `تم تفكيك ${quantity} وحدة بنجاح` };
  };

  /**
   * Action: Clone Invoice (نسخ الفاتورة)
   */
  const cloneInvoice = (invoiceId: string): Invoice | null => {
    const original = invoices.find((inv) => inv.id === invoiceId);
    if (!original) return null;
    const isSales = original.type === 'SALES';
    const prefix = isSales ? 'INV' : 'PUR';
    const newNum = `${prefix}-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(4, '0')}`;
    const cloned: Invoice = {
      ...original,
      id: generateId('inv'),
      invoiceNumber: newNum,
      date: new Date().toISOString().split('T')[0],
      workflowStatus: 'DRAFT',
      journalEntryId: undefined,
      createdAt: new Date().toISOString(),
    };
    setInvoices((prev) => [cloned, ...prev]);
    addAuditLog('CREATE', 'الفواتير', `نسخ الفاتورة ${original.invoiceNumber} إلى الفاتورة الجديدة ${newNum}`, cloned.id, newNum);
    showToast(`تم إنشاء نسخة جديدة من الفاتورة برقم ${newNum} كمسودة ✓`, 'success');
    return cloned;
  };

  /**
   * Action: Clone Quotation (نسخ عرض السعر)
   */
  const cloneQuotation = (quoteId: string): Quotation | null => {
    const original = quotations.find((q) => q.id === quoteId);
    if (!original) return null;
    const newNum = `QUO-${new Date().getFullYear()}-${String(quotations.length + 1).padStart(4, '0')}`;
    const cloned: Quotation = {
      ...original,
      id: generateId('quote'),
      quoteNumber: newNum,
      date: new Date().toISOString().split('T')[0],
      status: 'DRAFT',
      convertedInvoiceId: undefined,
      createdAt: new Date().toISOString(),
    };
    setQuotations((prev) => [cloned, ...prev]);
    addAuditLog('CREATE', 'عروض الأسعار', `نسخ عرض السعر ${original.quoteNumber} إلى ${newNum}`, cloned.id, newNum);
    showToast(`تم نسخ عرض السعر برقم ${newNum} كمسودة بنجاح ✓`, 'success');
    return cloned;
  };

  /**
   * Action: Void Invoice (إلغاء الفاتورة بقيد عكسي وإعادة المخزون وفق أونكس برو)
   */
  const voidInvoice = (invoiceId: string, reason: string): boolean => {
    const invoice = invoices.find((inv) => inv.id === invoiceId);
    if (!invoice) return false;
    if (invoice.workflowStatus === 'VOID') {
      showToast('هذه الفاتورة ملغية بالفعل', 'error');
      return false;
    }

    const updatedInvoices = invoices.map((inv) =>
      inv.id === invoiceId ? { ...inv, workflowStatus: 'VOID' as const, notes: `${inv.notes || ''} [ملغية: ${reason}]` } : inv
    );

    const updatedProducts = [...products];
    const reversingMovements: StockMovement[] = [];
    const dateNow = new Date().toISOString().split('T')[0];

    invoice.items.forEach((item) => {
      const pIdx = updatedProducts.findIndex((p) => p.id === item.productId);
      if (pIdx !== -1) {
        const prod = updatedProducts[pIdx];
        const reverseDelta = invoice.type === 'SALES' ? item.quantity : -item.quantity;
        const newBalance = prod.stockQty + reverseDelta;
        updatedProducts[pIdx] = { ...prod, stockQty: newBalance };

        reversingMovements.push({
          id: generateId('sm'),
          productId: prod.id,
          productName: prod.nameAr,
          type: invoice.type === 'SALES' ? 'SALES_RETURN' : 'PURCHASE_RETURN',
          referenceNumber: `VOID-${invoice.invoiceNumber}`,
          date: dateNow,
          quantityChange: reverseDelta,
          unitCost: item.costPrice,
          totalCost: Math.abs(reverseDelta) * item.costPrice,
          balanceAfter: newBalance,
          notes: `إلغاء قيد فاتورة ${invoice.invoiceNumber}: ${reason}`,
          createdAt: new Date().toISOString(),
        });
      }
    });

    let updatedJournalEntries = [...journalEntries];
    if (invoice.journalEntryId) {
      const originalEntry = journalEntries.find((j) => j.id === invoice.journalEntryId);
      if (originalEntry) {
        const reversedLines = originalEntry.lines.map((l) => ({
          ...l,
          id: generateId('line'),
          debit: l.credit,
          credit: l.debit,
          memo: `عكس قيد: ${l.memo || ''}`,
        }));
        const reversingEntry: JournalEntry = {
          id: generateId('je'),
          entryNumber: `REV-${originalEntry.entryNumber}`,
          date: dateNow,
          description: `قيد عكسي لإلغاء الفاتورة ${invoice.invoiceNumber} - ${reason}`,
          sourceType: 'PERIOD_CLOSING',
          sourceId: invoice.id,
          lines: reversedLines,
          totalDebit: originalEntry.totalCredit,
          totalCredit: originalEntry.totalDebit,
          isBalanced: true,
          isPosted: true,
          branchId: invoice.branchId,
          currency: invoice.currency,
          exchangeRate: invoice.exchangeRate,
          createdAt: new Date().toISOString(),
        };
        updatedJournalEntries = [reversingEntry, ...updatedJournalEntries];
      }
    }

    const updatedAccounts = recalculateAllAccountBalances(accounts, updatedJournalEntries);

    setInvoices(updatedInvoices);
    setProducts(updatedProducts);
    setStockMovements((prev) => [...reversingMovements, ...prev]);
    setJournalEntries(updatedJournalEntries);
    setAccounts(updatedAccounts);

    addAuditLog('VOID', 'الفواتير', `إلغاء الفاتورة ${invoice.invoiceNumber} مع إنشاء قيد عكسي: ${reason}`, invoice.id, invoice.invoiceNumber);
    showToast(`تم إلغاء الفاتورة ${invoice.invoiceNumber} وإنشاء القيد العكسي بنجاح ✓`, 'success');

    return true;
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
    const isFirst = branches.length === 0;
    const newBranch: Branch = {
      ...b,
      id: generateId('br'),
      isMain: isFirst ? true : (b.isMain ?? false),
      nameAr: b.nameAr?.trim() || (isFirst ? 'المركز الرئيسي' : `فرع ${branches.length + 1}`),
    };
    setBranches((prev) => [...prev, newBranch]);
    setSelectedBranchId(newBranch.id);
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
    setSettings((prev) => {
      const next = { ...prev, ...updates };
      if (updates.companyName && updates.companyName !== prev.companyName) {
        void updateProfileCompanyName(updates.companyName);
      }
      return next;
    });
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
   * Radical Complete Reset (تصفير جذري شامل لجميع بيانات هذا الحساب المستقل فقط)
   */
  const radicalFactoryReset = () => {
    if (activeUid) {
      const prefix = `${tenantPrefix}_`;
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(prefix)) keysToRemove.push(k);
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    }
    setSettings(INITIAL_SETTINGS);
    setCurrencies(INITIAL_CURRENCIES);
    setBranches(filterCleanBranches(INITIAL_BRANCHES));
    setWarehouses(INITIAL_WAREHOUSES);
    setCostCenters(INITIAL_COST_CENTERS);
    setAccounts(filterCleanAccounts(INITIAL_ACCOUNTS).map((a) => ({ ...a, balance: 0 })));
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
    setReconciliations([]);
    setAuditLogs([]);
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
      version: '4.0-isolated',
      ownerUid: activeUid || '',
      tenantCode: tenantCode || '',
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
      reconciliations,
    };
    return JSON.stringify(backup, null, 2);
  };

  const importDatabaseJson = (json: string): boolean => {
    try {
      const data = JSON.parse(json);
      if (data.accounts) {
        if (data.settings) setSettings(mergeSettingsWithDefaults(data.settings));
        if (data.currencies) setCurrencies(data.currencies);
        if (data.branches) setBranches(filterCleanBranches(data.branches));
        if (data.warehouses) setWarehouses(data.warehouses);
        if (data.costCenters) setCostCenters(data.costCenters);
        if (data.accounts) setAccounts(filterCleanAccounts(data.accounts));
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
        if (data.reconciliations) setReconciliations(data.reconciliations);
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
        createTransferVoucher,
        assembleProduct,
        disassembleProduct,
        cloneInvoice,
        cloneQuotation,
        voidInvoice,
        users,
        currentUser,
        setCurrentUser,
        addUser,
        updateUser,
        auditLogs,
        addAuditLog,
        reconciliations,
        addReconciliation,
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
