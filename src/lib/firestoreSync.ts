import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  writeBatch,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  Unsubscribe,
} from 'firebase/firestore';
import {
  db,
  handleFirestoreError,
  logFirestoreError,
  OperationType,
  sanitizeFirestoreId,
  clampString,
  stripUndefinedDeep,
  normalizeTimestampToIso,
} from './firebase';
import type {
  Account,
  AuditLogEntry,
  BankReconciliationRecord,
  Branch,
  Contact,
  CostCenter,
  CurrencyConfig,
  Invoice,
  JournalEntry,
  Product,
  Quotation,
  ReturnInvoice,
  StockReceiptNote,
  StockTransfer,
  SystemSettings,
  SystemUser,
  Voucher,
  Warehouse,
} from '../types/accounting';
import type { StockAdjustment, StockMovement } from '../types/inventory';

export const WORKSPACE_SUBCOLLECTIONS = [
  'accounts',
  'products',
  'contacts',
  'invoices',
  'quotations',
  'returnInvoices',
  'vouchers',
  'journalEntries',
  'stockMovements',
  'stockAdjustments',
  'stockTransfers',
  'stockReceiptNotes',
  'reconciliations',
  'auditLogs',
] as const;

export type WorkspaceSubcollectionName = (typeof WORKSPACE_SUBCOLLECTIONS)[number];

export interface WorkspaceRootData {
  id: string;
  ownerId: string;
  tenantCode: string;
  companyName: string;
  status: 'ACTIVE' | 'SUSPENDED';
  adminAuditAuthorized: boolean;
  settings: SystemSettings;
  currencies: CurrencyConfig[];
  branches: Branch[];
  warehouses: Warehouse[];
  costCenters: CostCenter[];
  staffUsers: SystemUser[];
  currentStaffUserId?: string;
}

// ==================== FORMATTERS MATCHING BLUEPRINT & RULES ====================

export function formatAccountDoc(item: Account, uid: string) {
  const id = sanitizeFirestoreId(item.id);
  return stripUndefinedDeep({
    id,
    ownerId: uid,
    code: clampString(item.code || '0000', 40),
    nameAr: clampString(item.nameAr || 'حساب', 200),
    nameEn: clampString(item.nameEn || '', 200),
    category: item.category,
    parentCode: item.parentCode ? clampString(item.parentCode, 40) : undefined,
    level: Number(item.level || 1),
    balance: Number(item.balance || 0),
    currency: clampString(item.currency || 'SAR', 12),
    isDebitNormal: Boolean(item.isDebitNormal),
    isSystemAccount: item.isSystemAccount !== undefined ? Boolean(item.isSystemAccount) : false,
    description: item.description ? clampString(item.description, 500) : undefined,
  });
}

export function formatProductDoc(item: Product, uid: string) {
  const id = sanitizeFirestoreId(item.id);
  return stripUndefinedDeep({
    id,
    ownerId: uid,
    code: clampString(item.code || '', 64),
    barcode: item.barcode ? clampString(item.barcode, 128) : undefined,
    nameAr: clampString(item.nameAr || 'صنف', 250),
    category: clampString(item.category || 'عام', 100),
    unit: clampString(item.unit || 'حبة', 50),
    costPrice: Number(item.costPrice || 0),
    salePrice: Number(item.salePrice || 0),
    wholesalePrice: item.wholesalePrice !== undefined ? Number(item.wholesalePrice) : undefined,
    specialPrice: item.specialPrice !== undefined ? Number(item.specialPrice) : undefined,
    stockQty: Number(item.stockQty || 0),
    reservedQty: item.reservedQty !== undefined ? Number(item.reservedQty) : undefined,
    minStockAlert: Number(item.minStockAlert || 0),
    taxRate: Number(item.taxRate ?? 15),
    units: Array.isArray(item.units) ? item.units.slice(0, 30) : undefined,
    isComposite: item.isComposite !== undefined ? Boolean(item.isComposite) : undefined,
    components: Array.isArray(item.components) ? item.components.slice(0, 50) : undefined,
    warehouseStocks: item.warehouseStocks && typeof item.warehouseStocks === 'object' ? item.warehouseStocks : undefined,
  });
}

export function formatContactDoc(item: Contact, uid: string) {
  const id = sanitizeFirestoreId(item.id);
  return stripUndefinedDeep({
    id,
    ownerId: uid,
    code: clampString(item.code || '', 64),
    name: clampString(item.name || 'جهة', 200),
    type: item.type,
    phone: item.phone ? clampString(item.phone, 50) : undefined,
    email: item.email ? clampString(item.email, 150) : undefined,
    taxNumber: item.taxNumber ? clampString(item.taxNumber, 60) : undefined,
    address: item.address ? clampString(item.address, 300) : undefined,
    accountId: clampString(item.accountId || 'acc-ar', 128),
    balance: Number(item.balance || 0),
    creditLimit: item.creditLimit !== undefined ? Number(item.creditLimit) : undefined,
    preferredCurrency: item.preferredCurrency ? clampString(item.preferredCurrency, 12) : undefined,
  });
}

export function formatInvoiceDoc(item: Invoice, uid: string) {
  const id = sanitizeFirestoreId(item.id);
  return stripUndefinedDeep({
    id,
    ownerId: uid,
    invoiceNumber: clampString(item.invoiceNumber || 'INV-0001', 80),
    type: item.type,
    date: clampString(item.date || new Date().toISOString().split('T')[0], 32),
    dueDate: item.dueDate ? clampString(item.dueDate, 32) : undefined,
    branchId: item.branchId ? clampString(item.branchId, 128) : undefined,
    partyId: item.partyId ? clampString(item.partyId, 128) : undefined,
    partyName: clampString(item.partyName || 'نقدي', 200),
    items: Array.isArray(item.items) ? item.items.slice(0, 250) : [],
    subtotal: Number(item.subtotal || 0),
    discountTotal: item.discountTotal !== undefined ? Number(item.discountTotal) : 0,
    invoiceDiscount: item.invoiceDiscount !== undefined ? Number(item.invoiceDiscount) : undefined,
    taxTotal: Number(item.taxTotal || 0),
    grandTotal: Number(item.grandTotal || 0),
    paymentMethod: item.paymentMethod,
    paidAmount: Number(item.paidAmount || 0),
    remainingAmount: Number(item.remainingAmount || 0),
    cashAccountId: item.cashAccountId ? clampString(item.cashAccountId, 128) : undefined,
    notes: item.notes ? clampString(item.notes, 1000) : undefined,
    status: item.status,
    workflowStatus: item.workflowStatus || 'POSTED',
    journalEntryId: item.journalEntryId ? clampString(item.journalEntryId, 128) : undefined,
    currency: clampString(item.currency || 'SAR', 12),
    exchangeRate: Number(item.exchangeRate || 1),
    grandTotalBase: Number(item.grandTotalBase || item.grandTotal || 0),
    clientCreatedAt: item.createdAt ? clampString(item.createdAt, 64) : undefined,
  });
}

export function formatQuotationDoc(item: Quotation, uid: string) {
  const id = sanitizeFirestoreId(item.id);
  return stripUndefinedDeep({
    id,
    ownerId: uid,
    quoteNumber: clampString(item.quoteNumber || 'QT-0001', 80),
    date: clampString(item.date || new Date().toISOString().split('T')[0], 32),
    validUntil: item.validUntil ? clampString(item.validUntil, 32) : undefined,
    branchId: item.branchId ? clampString(item.branchId, 128) : undefined,
    partyId: item.partyId ? clampString(item.partyId, 128) : undefined,
    partyName: clampString(item.partyName || 'عميل', 200),
    items: Array.isArray(item.items) ? item.items.slice(0, 250) : [],
    subtotal: item.subtotal !== undefined ? Number(item.subtotal) : 0,
    taxTotal: item.taxTotal !== undefined ? Number(item.taxTotal) : 0,
    grandTotal: Number(item.grandTotal || 0),
    notes: item.notes ? clampString(item.notes, 1000) : undefined,
    status: item.status || 'SENT',
    convertedInvoiceId: item.convertedInvoiceId ? clampString(item.convertedInvoiceId, 128) : undefined,
    currency: clampString(item.currency || 'SAR', 12),
    exchangeRate: Number(item.exchangeRate || 1),
    clientCreatedAt: item.createdAt ? clampString(item.createdAt, 64) : undefined,
  });
}

export function formatReturnInvoiceDoc(item: ReturnInvoice, uid: string) {
  const id = sanitizeFirestoreId(item.id);
  return stripUndefinedDeep({
    id,
    ownerId: uid,
    returnNumber: clampString(item.returnNumber || 'RET-0001', 80),
    type: item.type,
    originalInvoiceNumber: item.originalInvoiceNumber ? clampString(item.originalInvoiceNumber, 80) : undefined,
    date: clampString(item.date || new Date().toISOString().split('T')[0], 32),
    branchId: item.branchId ? clampString(item.branchId, 128) : undefined,
    partyId: item.partyId ? clampString(item.partyId, 128) : undefined,
    partyName: clampString(item.partyName || 'عميل', 200),
    items: Array.isArray(item.items) ? item.items.slice(0, 250) : [],
    subtotal: item.subtotal !== undefined ? Number(item.subtotal) : 0,
    taxTotal: item.taxTotal !== undefined ? Number(item.taxTotal) : 0,
    grandTotal: Number(item.grandTotal || 0),
    paymentMethod: item.paymentMethod,
    reason: clampString(item.reason || 'مرتجع', 500),
    journalEntryId: item.journalEntryId ? clampString(item.journalEntryId, 128) : undefined,
    currency: clampString(item.currency || 'SAR', 12),
    exchangeRate: Number(item.exchangeRate || 1),
    clientCreatedAt: item.createdAt ? clampString(item.createdAt, 64) : undefined,
  });
}

export function formatVoucherDoc(item: Voucher, uid: string) {
  const id = sanitizeFirestoreId(item.id);
  return stripUndefinedDeep({
    id,
    ownerId: uid,
    voucherNumber: clampString(item.voucherNumber || 'VCH-0001', 80),
    type: item.type,
    date: clampString(item.date || new Date().toISOString().split('T')[0], 32),
    branchId: item.branchId ? clampString(item.branchId, 128) : undefined,
    accountId: clampString(item.accountId || 'acc-cash', 128),
    accountName: clampString(item.accountName || 'الصندوق', 200),
    partyAccountId: clampString(item.partyAccountId || 'acc-ar', 128),
    partyAccountName: clampString(item.partyAccountName || 'الطرف الآخر', 200),
    toAccountId: item.toAccountId ? clampString(item.toAccountId, 128) : undefined,
    toAccountName: item.toAccountName ? clampString(item.toAccountName, 200) : undefined,
    amount: Number(item.amount || 0),
    paymentMethod: item.paymentMethod,
    referenceNumber: item.referenceNumber ? clampString(item.referenceNumber, 128) : undefined,
    description: clampString(item.description || 'سند مالي', 500),
    currency: clampString(item.currency || 'SAR', 12),
    exchangeRate: Number(item.exchangeRate || 1),
    amountBase: Number(item.amountBase || item.amount || 0),
    journalEntryId: item.journalEntryId ? clampString(item.journalEntryId, 128) : undefined,
    clientCreatedAt: item.createdAt ? clampString(item.createdAt, 64) : undefined,
  });
}

export function formatJournalEntryDoc(item: JournalEntry, uid: string) {
  const id = sanitizeFirestoreId(item.id);
  return stripUndefinedDeep({
    id,
    ownerId: uid,
    entryNumber: clampString(item.entryNumber || 'JV-0001', 80),
    date: clampString(item.date || new Date().toISOString().split('T')[0], 32),
    description: clampString(item.description || 'قيد يومي', 500),
    sourceType: clampString(item.sourceType || 'MANUAL', 50),
    sourceId: item.sourceId ? clampString(item.sourceId, 128) : undefined,
    lines: Array.isArray(item.lines) ? item.lines.slice(0, 150) : [],
    totalDebit: Number(item.totalDebit || 0),
    totalCredit: Number(item.totalCredit || 0),
    isBalanced: Boolean(item.isBalanced),
    isPosted: Boolean(item.isPosted),
    branchId: item.branchId ? clampString(item.branchId, 128) : undefined,
    currency: item.currency ? clampString(item.currency, 12) : undefined,
    exchangeRate: item.exchangeRate !== undefined ? Number(item.exchangeRate) : undefined,
    clientCreatedAt: item.createdAt ? clampString(item.createdAt, 64) : undefined,
  });
}

export function formatStockMovementDoc(item: StockMovement, uid: string) {
  const id = sanitizeFirestoreId(item.id);
  return stripUndefinedDeep({
    id,
    ownerId: uid,
    productId: clampString(item.productId || 'prod', 128),
    productName: clampString(item.productName || 'صنف', 250),
    type: clampString(item.type || 'ADJUSTMENT', 50),
    referenceNumber: clampString(item.referenceNumber || '', 80),
    date: clampString(item.date || new Date().toISOString().split('T')[0], 32),
    quantityChange: Number(item.quantityChange || 0),
    unitCost: Number(item.unitCost || 0),
    totalCost: Number(item.totalCost || 0),
    balanceAfter: Number(item.balanceAfter || 0),
    notes: item.notes ? clampString(item.notes, 500) : undefined,
    clientCreatedAt: item.createdAt ? clampString(item.createdAt, 64) : undefined,
  });
}

export function formatStockAdjustmentDoc(item: StockAdjustment, uid: string) {
  const id = sanitizeFirestoreId(item.id);
  return stripUndefinedDeep({
    id,
    ownerId: uid,
    adjustmentNumber: clampString(item.adjustmentNumber || 'ADJ-001', 80),
    date: clampString(item.date || new Date().toISOString().split('T')[0], 32),
    productId: clampString(item.productId || 'prod', 128),
    productName: clampString(item.productName || 'صنف', 250),
    systemQty: Number(item.systemQty || 0),
    actualQty: Number(item.actualQty || 0),
    differenceQty: Number(item.differenceQty || 0),
    unitCost: Number(item.unitCost || 0),
    totalDifferenceCost: Number(item.totalDifferenceCost || 0),
    reason: clampString(item.reason || 'تسوية جردية', 500),
    clientCreatedAt: item.createdAt ? clampString(item.createdAt, 64) : undefined,
  });
}

export function formatStockTransferDoc(item: StockTransfer, uid: string) {
  const id = sanitizeFirestoreId(item.id);
  return stripUndefinedDeep({
    id,
    ownerId: uid,
    transferNumber: clampString(item.transferNumber || 'TRF-0001', 80),
    date: clampString(item.date || new Date().toISOString().split('T')[0], 32),
    fromBranchId: item.fromBranchId ? clampString(item.fromBranchId, 128) : undefined,
    toBranchId: item.toBranchId ? clampString(item.toBranchId, 128) : undefined,
    fromWarehouseId: clampString(item.fromWarehouseId || 'wh-main', 128),
    toWarehouseId: clampString(item.toWarehouseId || 'wh-main', 128),
    items: Array.isArray(item.items) ? item.items.slice(0, 200) : [],
    notes: item.notes ? clampString(item.notes, 500) : undefined,
    status: item.status || 'COMPLETED',
    clientCreatedAt: item.createdAt ? clampString(item.createdAt, 64) : undefined,
  });
}

export function formatStockReceiptNoteDoc(item: StockReceiptNote, uid: string) {
  const id = sanitizeFirestoreId(item.id);
  return stripUndefinedDeep({
    id,
    ownerId: uid,
    receiptNumber: clampString(item.receiptNumber || 'GRN-0001', 80),
    type: item.type,
    date: clampString(item.date || new Date().toISOString().split('T')[0], 32),
    branchId: item.branchId ? clampString(item.branchId, 128) : undefined,
    warehouseId: clampString(item.warehouseId || 'wh-main', 128),
    reason: clampString(item.reason || 'إذن مخزني', 500),
    items: Array.isArray(item.items) ? item.items.slice(0, 200) : [],
    notes: item.notes ? clampString(item.notes, 500) : undefined,
    journalEntryId: item.journalEntryId ? clampString(item.journalEntryId, 128) : undefined,
    clientCreatedAt: item.createdAt ? clampString(item.createdAt, 64) : undefined,
  });
}

export function formatReconciliationDoc(item: BankReconciliationRecord, uid: string) {
  const id = sanitizeFirestoreId(item.id);
  return stripUndefinedDeep({
    id,
    ownerId: uid,
    accountId: clampString(item.accountId || 'acc-bank', 128),
    statementDate: clampString(item.statementDate || new Date().toISOString().split('T')[0], 32),
    statementBalance: Number(item.statementBalance || 0),
    bookBalance: Number(item.bookBalance || 0),
    difference: Number(item.difference || 0),
    isReconciled: Boolean(item.isReconciled),
    notes: item.notes ? clampString(item.notes, 500) : undefined,
    clientCreatedAt: item.createdAt ? clampString(item.createdAt, 64) : undefined,
  });
}

export function formatAuditLogDoc(item: AuditLogEntry, uid: string) {
  const id = sanitizeFirestoreId(item.id);
  return stripUndefinedDeep({
    id,
    ownerId: uid,
    timestamp: clampString(item.timestamp || new Date().toISOString(), 64),
    userName: clampString(item.userName || 'المستخدم', 150),
    userRole: clampString(item.userRole || 'ADMIN', 40),
    action: clampString(item.action || 'CREATE', 32),
    module: clampString(item.module || 'النظام', 100),
    entityId: item.entityId ? clampString(item.entityId, 128) : undefined,
    entityNumber: item.entityNumber ? clampString(item.entityNumber, 80) : undefined,
    details: clampString(item.details || '', 500),
  });
}

// Mutable field lists strictly matching affectedKeys().hasOnly(...) in firestore.rules
export const MUTABLE_FIELDS: Record<WorkspaceSubcollectionName, readonly string[]> = {
  accounts: ['code', 'nameAr', 'nameEn', 'category', 'parentCode', 'level', 'balance', 'currency', 'isDebitNormal', 'isSystemAccount', 'description'],
  products: ['code', 'barcode', 'nameAr', 'category', 'unit', 'costPrice', 'salePrice', 'wholesalePrice', 'specialPrice', 'stockQty', 'reservedQty', 'minStockAlert', 'taxRate', 'units', 'isComposite', 'components', 'warehouseStocks'],
  contacts: ['code', 'name', 'type', 'phone', 'email', 'taxNumber', 'address', 'accountId', 'balance', 'creditLimit', 'preferredCurrency'],
  invoices: ['dueDate', 'items', 'subtotal', 'discountTotal', 'invoiceDiscount', 'taxTotal', 'grandTotal', 'paymentMethod', 'paidAmount', 'remainingAmount', 'cashAccountId', 'notes', 'status', 'workflowStatus', 'journalEntryId', 'currency', 'exchangeRate', 'grandTotalBase'],
  quotations: ['validUntil', 'items', 'subtotal', 'taxTotal', 'grandTotal', 'notes', 'status', 'convertedInvoiceId', 'currency', 'exchangeRate'],
  returnInvoices: ['reason', 'journalEntryId'],
  vouchers: ['referenceNumber', 'description', 'journalEntryId'],
  journalEntries: ['description', 'isPosted'],
  stockMovements: ['notes'],
  stockAdjustments: ['reason'],
  stockTransfers: ['notes'],
  stockReceiptNotes: ['notes', 'journalEntryId'],
  reconciliations: ['notes', 'isReconciled'],
  auditLogs: [], // auditLogs are immutable in rules (allow update: if false)
};

// ==================== PROVISIONING & SYNC ====================

export async function provisionOrLoadWorkspace(params: {
  uid: string;
  tenantCode: string;
  companyName: string;
  settings: SystemSettings;
  currencies: CurrencyConfig[];
  branches: Branch[];
  warehouses: Warehouse[];
  costCenters: CostCenter[];
  staffUsers: SystemUser[];
  currentStaffUserId: string;
  initialAccounts: Account[];
}): Promise<WorkspaceRootData | null> {
  const { uid } = params;
  const wsRef = doc(db, 'workspaces', uid);

  let snap;
  try {
    snap = await getDoc(wsRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `workspaces/${uid}`);
  }

  if (snap.exists()) {
    const d = snap.data();
    return {
      id: d.id,
      ownerId: d.ownerId,
      tenantCode: d.tenantCode,
      companyName: d.companyName,
      status: d.status,
      adminAuditAuthorized: Boolean(d.adminAuditAuthorized),
      settings: d.settings,
      currencies: d.currencies || [],
      branches: d.branches || [],
      warehouses: d.warehouses || [],
      costCenters: d.costCenters || [],
      staffUsers: d.staffUsers || [],
      currentStaffUserId: d.currentStaffUserId,
    };
  }

  // Create Master Gate Workspace document first so subsequent subcollection creates pass exists()/get()
  const wsPayload = stripUndefinedDeep({
    id: uid,
    ownerId: uid,
    tenantCode: clampString(params.tenantCode, 32),
    companyName: clampString(params.companyName || 'الغفاري سوفت برو', 200),
    status: 'ACTIVE' as const,
    adminAuditAuthorized: false,
    settings: params.settings,
    currencies: params.currencies.slice(0, 50),
    branches: params.branches.slice(0, 50),
    warehouses: params.warehouses.slice(0, 50),
    costCenters: params.costCenters.slice(0, 50),
    staffUsers: params.staffUsers.slice(0, 50),
    currentStaffUserId: clampString(params.currentStaffUserId || 'usr-admin', 128),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  try {
    await setDoc(wsRef, wsPayload);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `workspaces/${uid}`);
  }

  // Batch-seed the user's isolated chart of accounts
  const batch = writeBatch(db);
  for (const acc of params.initialAccounts) {
    const formatted = formatAccountDoc({ ...acc, balance: 0 }, uid);
    const accRef = doc(db, 'workspaces', uid, 'accounts', formatted.id);
    batch.set(accRef, {
      ...formatted,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  // Create initial auditSummary doc
  const snapshotRef = doc(db, 'workspaces', uid, 'auditSnapshot', 'summary');
  batch.set(snapshotRef, {
    id: 'summary',
    ownerId: uid,
    companyName: clampString(params.companyName || 'الغفاري سوفت برو', 200),
    baseCurrency: clampString(params.settings.baseCurrency || 'SAR', 12),
    invoicesCount: 0,
    vouchersCount: 0,
    productsCount: 0,
    contactsCount: 0,
    journalEntriesCount: 0,
    totalSalesBase: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  try {
    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `workspaces/${uid}/accounts`);
  }

  return null;
}

export async function syncWorkspaceRootToFirestore(
  uid: string,
  payload: {
    companyName: string;
    settings: SystemSettings;
    currencies: CurrencyConfig[];
    branches: Branch[];
    warehouses: Warehouse[];
    costCenters: CostCenter[];
    staffUsers: SystemUser[];
    currentStaffUserId?: string;
  }
): Promise<void> {
  const wsRef = doc(db, 'workspaces', uid);
  const clean = stripUndefinedDeep({
    companyName: clampString(payload.companyName || 'الغفاري سوفت برو', 200),
    settings: payload.settings,
    currencies: payload.currencies.slice(0, 50),
    branches: payload.branches.slice(0, 50),
    warehouses: payload.warehouses.slice(0, 50),
    costCenters: payload.costCenters.slice(0, 50),
    staffUsers: payload.staffUsers.slice(0, 50),
    currentStaffUserId: payload.currentStaffUserId ? clampString(payload.currentStaffUserId, 128) : undefined,
    updatedAt: serverTimestamp(),
  });

  try {
    await updateDoc(wsRef, clean);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `workspaces/${uid}`);
  }
}

export async function syncAuditSnapshotToFirestore(
  uid: string,
  summary: {
    companyName: string;
    baseCurrency: string;
    invoicesCount: number;
    vouchersCount: number;
    productsCount: number;
    contactsCount: number;
    journalEntriesCount: number;
    totalSalesBase: number;
  }
): Promise<void> {
  const ref = doc(db, 'workspaces', uid, 'auditSnapshot', 'summary');
  const payload = {
    companyName: clampString(summary.companyName || 'الغفاري سوفت برو', 200),
    baseCurrency: clampString(summary.baseCurrency || 'SAR', 12),
    invoicesCount: Number(summary.invoicesCount || 0),
    vouchersCount: Number(summary.vouchersCount || 0),
    productsCount: Number(summary.productsCount || 0),
    contactsCount: Number(summary.contactsCount || 0),
    journalEntriesCount: Number(summary.journalEntriesCount || 0),
    totalSalesBase: Number(summary.totalSalesBase || 0),
    updatedAt: serverTimestamp(),
  };

  try {
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        id: 'summary',
        ownerId: uid,
        ...payload,
        createdAt: serverTimestamp(),
      });
    } else {
      await updateDoc(ref, payload);
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `workspaces/${uid}/auditSnapshot/summary`);
  }
}

export async function syncCollectionDiffToFirestore<T extends { id: string }>(
  uid: string,
  collectionName: WorkspaceSubcollectionName,
  items: T[],
  prevSyncedMap: Map<string, string>,
  formatter: (item: T, uid: string) => Record<string, unknown>
): Promise<Map<string, string>> {
  const nextMap = new Map<string, string>();
  const ops: Array<
    | { kind: 'create'; id: string; data: Record<string, unknown> }
    | { kind: 'update'; id: string; patch: Record<string, unknown> }
    | { kind: 'delete'; id: string }
  > = [];

  for (const item of items) {
    const clean = formatter(item, uid);
    const id = String(clean.id);
    const serialized = JSON.stringify(clean);
    nextMap.set(id, serialized);

    const prevSerialized = prevSyncedMap.get(id);
    if (!prevSerialized) {
      ops.push({
        kind: 'create',
        id,
        data: {
          ...clean,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
      });
    } else if (prevSerialized !== serialized) {
      const mutableKeys = MUTABLE_FIELDS[collectionName];
      if (mutableKeys.length > 0) {
        const prevObj = JSON.parse(prevSerialized) as Record<string, unknown>;
        const patch: Record<string, unknown> = {};
        let hasPatch = false;
        for (const key of mutableKeys) {
          if (JSON.stringify(prevObj[key]) !== JSON.stringify(clean[key]) && clean[key] !== undefined) {
            patch[key] = clean[key];
            hasPatch = true;
          }
        }
        if (hasPatch) {
          patch.updatedAt = serverTimestamp();
          ops.push({ kind: 'update', id, patch });
        }
      }
    }
  }

  for (const prevId of prevSyncedMap.keys()) {
    if (!nextMap.has(prevId)) {
      ops.push({ kind: 'delete', id: prevId });
    }
  }

  if (ops.length === 0) {
    return nextMap;
  }

  // Commit in safe batches of 400
  for (let i = 0; i < ops.length; i += 400) {
    const chunk = ops.slice(i, i + 400);
    const batch = writeBatch(db);
    for (const op of chunk) {
      const ref = doc(db, 'workspaces', uid, collectionName, op.id);
      if (op.kind === 'create') {
        batch.set(ref, op.data);
      } else if (op.kind === 'update') {
        batch.update(ref, op.patch);
      } else {
        batch.delete(ref);
      }
    }
    try {
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `workspaces/${uid}/${collectionName}`);
    }
  }

  return nextMap;
}

export function subscribeSubcollection<T>(
  uid: string,
  collectionName: WorkspaceSubcollectionName,
  onData: (items: T[], syncedMap: Map<string, string>) => void,
  formatter: (item: T, uid: string) => Record<string, unknown>
): Unsubscribe {
  const path = `workspaces/${uid}/${collectionName}`;
  const q = query(collection(db, 'workspaces', uid, collectionName), where('ownerId', '==', uid));

  return onSnapshot(
    q,
    (snapshot) => {
      const result: T[] = [];
      const syncedMap = new Map<string, string>();
      snapshot.forEach((docSnap) => {
        const raw = docSnap.data() as Record<string, unknown>;
        const normalizedCreatedAt = normalizeTimestampToIso(
          raw.createdAt,
          typeof raw.clientCreatedAt === 'string' ? raw.clientCreatedAt : undefined
        );
        const domainItem = {
          ...raw,
          createdAt: normalizedCreatedAt,
        } as unknown as T;
        result.push(domainItem);
        const formatted = formatter(domainItem, uid);
        syncedMap.set(String(formatted.id), JSON.stringify(formatted));
      });
      onData(result, syncedMap);
    },
    (error) => {
      logFirestoreError(error, OperationType.LIST, path);
    }
  );
}
