export type AccountCategory = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';

export interface Account {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  category: AccountCategory;
  parentCode?: string;
  level: number;
  balance: number;
  currency: string;
  isDebitNormal: boolean;
  isSystemAccount?: boolean;
  description?: string;
}

export interface JournalLine {
  id: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  memo?: string;
  costCenterId?: string;
  currency?: string;
  exchangeRate?: number;
  foreignAmount?: number;
}

export type JournalSourceType = 
  | 'MANUAL'
  | 'SALES_INVOICE'
  | 'PURCHASE_INVOICE'
  | 'SALES_RETURN'
  | 'PURCHASE_RETURN'
  | 'RECEIPT_VOUCHER'
  | 'PAYMENT_VOUCHER'
  | 'STOCK_RECEIPT'
  | 'STOCK_ADJUSTMENT'
  | 'CURRENCY_REVALUATION'
  | 'PERIOD_CLOSING';

export interface JournalEntry {
  id: string;
  entryNumber: string;
  date: string;
  description: string;
  sourceType: JournalSourceType;
  sourceId?: string;
  lines: JournalLine[];
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
  isPosted: boolean;
  branchId?: string;
  currency?: string;
  exchangeRate?: number;
  createdAt: string;
}

export interface Branch {
  id: string;
  code: string;
  nameAr: string;
  address: string;
  phone: string;
  isMain: boolean;
}

export interface Warehouse {
  id: string;
  branchId: string;
  code: string;
  nameAr: string;
  location: string;
  isMain: boolean;
}

export type PriceTier = 'RETAIL' | 'WHOLESALE' | 'SUPER_WHOLESALE';

export interface ProductUnit {
  id: string;
  name: string; // e.g. كرتون، حبة، علبة، درزن
  factor: number; // معامل التحويل مقارنة بالوحدة الأساسية
  barcode?: string;
  salePrice?: number;
  costPrice?: number;
}

export interface ProductComponent {
  productId: string;
  productName: string;
  quantity: number;
  unit?: string;
}

export interface Product {
  id: string;
  code: string;
  barcode: string;
  nameAr: string;
  category: string;
  unit: string;
  costPrice: number;
  salePrice: number;
  wholesalePrice?: number; // سعر الجملة
  specialPrice?: number; // سعر جملة الجملة
  stockQty: number;
  reservedQty?: number; // كمية محجوزة
  minStockAlert: number;
  taxRate: number;
  units?: ProductUnit[]; // وحدات القياس المتعددة
  isComposite?: boolean; // صنف مركب
  components?: ProductComponent[]; // مكونات الصنف المركب (BOM)
  warehouseStocks?: Record<string, number>;
}

export interface InvoiceItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  costPrice: number;
  discount: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  unitName?: string;
  unitFactor?: number;
}

export type PaymentMethod = 'CASH' | 'CREDIT' | 'BANK' | 'SPLIT';
export type InvoiceType = 'SALES' | 'PURCHASE';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  type: InvoiceType;
  date: string;
  dueDate?: string;
  branchId: string;
  partyId: string;
  partyName: string;
  items: InvoiceItem[];
  subtotal: number;
  discountTotal: number;
  invoiceDiscount?: number; // خصم إضافي على إجمالي الفاتورة
  taxTotal: number;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  paidAmount: number;
  remainingAmount: number;
  cashAccountId?: string;
  notes?: string;
  status: 'PAID' | 'PARTIAL' | 'UNPAID';
  workflowStatus?: 'DRAFT' | 'APPROVED' | 'POSTED' | 'VOID'; // دورة اعتماد المستند وفق أونكس برو
  journalEntryId?: string;
  currency: string;
  exchangeRate: number;
  grandTotalBase: number;
  createdAt: string;
}

export interface Quotation {
  id: string;
  quoteNumber: string;
  date: string;
  validUntil: string;
  branchId: string;
  partyId: string;
  partyName: string;
  items: InvoiceItem[];
  subtotal: number;
  taxTotal: number;
  grandTotal: number;
  notes?: string;
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'CONVERTED' | 'CANCELLED';
  convertedInvoiceId?: string;
  currency: string;
  exchangeRate: number;
  createdAt: string;
}

export interface ReturnInvoice {
  id: string;
  returnNumber: string;
  type: 'SALES_RETURN' | 'PURCHASE_RETURN';
  originalInvoiceNumber?: string;
  date: string;
  branchId: string;
  partyId: string;
  partyName: string;
  items: InvoiceItem[];
  subtotal: number;
  taxTotal: number;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  reason: string;
  journalEntryId?: string;
  currency: string;
  exchangeRate: number;
  createdAt: string;
}

export interface StockTransfer {
  id: string;
  transferNumber: string;
  date: string;
  fromBranchId: string;
  toBranchId: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    unitCost: number;
  }[];
  notes?: string;
  status: 'COMPLETED';
  createdAt: string;
}

export interface StockReceiptNote {
  id: string;
  receiptNumber: string;
  type: 'IN' | 'OUT';
  date: string;
  branchId: string;
  warehouseId: string;
  reason: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    unitCost: number;
  }[];
  notes?: string;
  journalEntryId?: string;
  createdAt: string;
}

export type VoucherType = 'RECEIPT' | 'PAYMENT' | 'TRANSFER';

export interface Voucher {
  id: string;
  voucherNumber: string;
  type: VoucherType;
  date: string;
  branchId: string;
  accountId: string;
  accountName: string;
  partyAccountId: string;
  partyAccountName: string;
  toAccountId?: string; // للحساب المحول إليه في سند التحويل
  toAccountName?: string;
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  description: string;
  currency: string;
  exchangeRate: number;
  amountBase: number;
  journalEntryId?: string;
  createdAt: string;
}

export type UserRole = 'ADMIN' | 'ACCOUNTANT' | 'CASHIER' | 'STOREKEEPER';

export interface SystemUser {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  phone?: string;
  active: boolean;
  branchId?: string;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userName: string;
  userRole: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'POST' | 'VOID' | 'TRANSFER' | 'ASSEMBLE' | 'DISASSEMBLE' | 'RECONCILE' | 'EXPORT';
  module: string;
  entityId?: string;
  entityNumber?: string;
  details: string;
}

export interface BankReconciliationRecord {
  id: string;
  accountId: string;
  statementDate: string;
  statementBalance: number;
  bookBalance: number;
  difference: number;
  isReconciled: boolean;
  notes?: string;
  createdAt: string;
}

export interface Contact {
  id: string;
  code: string;
  name: string;
  type: 'CUSTOMER' | 'SUPPLIER';
  phone: string;
  email?: string;
  taxNumber?: string;
  address?: string;
  accountId: string;
  balance: number;
  creditLimit?: number;
  preferredCurrency?: string;
}

export interface CostCenter {
  id: string;
  code: string;
  nameAr: string;
  description?: string;
}

export interface CurrencyConfig {
  code: string;
  name: string;
  symbol: string;
  rate: number; // 1 Foreign Currency = rate Base Currency (or base rate)
  isBase: boolean;
  lastUpdated?: string;
  change24h?: number; // e.g. +0.12%
}

export type BusinessSector = 
  | 'GENERAL' 
  | 'RETAIL' 
  | 'WHOLESALE' 
  | 'SERVICES' 
  | 'RESTAURANT' 
  | 'CONTRACTING' 
  | 'PERSONAL' 
  | 'PHARMACY';

import type {
  PrintSettings,
  DocumentTemplateSettings,
  AccountingSettings,
  InventorySettings,
  ReportSettings,
  AppearanceAndNotificationsSettings,
} from './settings';

export interface SystemSettings {
  companyName: string;
  companyNameEn: string;
  businessSector?: BusinessSector;
  taxNumber: string;
  commercialRecord: string;
  phone: string;
  address: string;
  logoUrl?: string;
  baseCurrency: string;
  defaultTaxRate: number;
  taxEnabled?: boolean;
  autoPostJournal: boolean;
  fiscalYear: string;
  closingDate?: string;
  invoiceFooterNotes?: string;
  decimalPlaces?: number;

  // Comprehensive Settings Center modules
  printSettings?: PrintSettings;
  documentTemplates?: DocumentTemplateSettings;
  accountingConfig?: AccountingSettings;
  inventoryConfig?: InventorySettings;
  reportConfig?: ReportSettings;
  appearanceConfig?: AppearanceAndNotificationsSettings;
}

