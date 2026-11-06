// Professional Settings Center Types for Al-Ghafari Soft PRO
// Covers 10 distinct modules with full RTL Arabic support & Black/Gold theme

// 1. Printing Settings (إعدادات الطباعة)
export type PaperSize = 'A4' | 'A5' | 'THERMAL_80MM' | 'THERMAL_58MM';
export type PageOrientation = 'PORTRAIT' | 'LANDSCAPE';
export type MarginSize = 'NONE' | 'NARROW' | 'NORMAL' | 'WIDE';
export type PrintFontSize = 'SMALL' | 'MEDIUM' | 'LARGE';

export interface PrintSettings {
  printerName: string;
  paperSize: PaperSize;
  orientation: PageOrientation;
  margin: MarginSize;
  fontSize: PrintFontSize;
  showLogo: boolean;
  copiesCount: number;
  autoShowPreview: boolean;
  defaultAction: 'PRINT' | 'PDF_DOWNLOAD' | 'PREVIEW';
  headerNote?: string;
  footerNote?: string;
}

// 2. Document & Numbering Settings (إعدادات المستندات والترقيم)
export interface DocumentTemplateSettings {
  salesInvoicePrefix: string;
  salesInvoiceStartNumber: number;
  purchaseInvoicePrefix: string;
  purchaseInvoiceStartNumber: number;
  returnInvoicePrefix: string;
  returnInvoiceStartNumber: number;
  receiptVoucherPrefix: string;
  receiptVoucherStartNumber: number;
  paymentVoucherPrefix: string;
  paymentVoucherStartNumber: number;
  quotationPrefix: string;
  quotationStartNumber: number;

  showItemBarcode: boolean;
  showItemUnit: boolean;
  showTaxPerItem: boolean;
  showDiscountPerItem: boolean;
  showItemDescription: boolean;
  showCommercialRecord: boolean;
  showTaxNumber: boolean;
  showDigitalSeal: boolean;
  showSignatureSection: boolean;
  digitalSealUrl?: string;
  invoiceTermsAndConditions: string;
}

// 4. Accounting Settings (إعدادات المحاسبة والحسابات الافتراضية)
export type RoundingPolicy = 'NONE' | 'NEAREST_0_05' | 'NEAREST_0_25' | 'NEAREST_0_50' | 'NEAREST_1_00';

export interface AccountingSettings {
  defaultCashAccountId: string;
  defaultBankAccountId: string;
  defaultReceivableAccountId: string;
  defaultPayableAccountId: string;
  defaultSalesRevenueAccountId: string;
  defaultCostOfGoodsSoldAccountId: string;
  defaultInventoryAccountId: string;
  defaultTaxPayableAccountId: string;
  defaultTaxReceivableAccountId: string;
  defaultDiscountAllowedAccountId: string;
  defaultDiscountReceivedAccountId: string;

  defaultPaymentMethod: 'CASH' | 'CARD' | 'TRANSFER' | 'CREDIT';
  enableDiscounts: boolean;
  roundingPolicy: RoundingPolicy;
  autoPostJournalEntries: boolean;
}

// 5. Inventory Settings (إعدادات المخزون)
export type InventoryCostingMethod = 'FIFO' | 'WEIGHTED_AVERAGE' | 'LATEST_PURCHASE';
export type OutOfStockPolicy = 'PREVENT_SALE' | 'ALLOW_WITH_WARNING' | 'ALLOW_SILENTLY';

export interface InventorySettings {
  defaultWarehouseId: string;
  costingMethod: InventoryCostingMethod;
  defaultLowStockThreshold: number;
  outOfStockPolicy: OutOfStockPolicy;
  enableStockAlerts: boolean;
}

// 6. Users & Permissions (المستخدمون والصلاحيات)
export type UserRole = 'ADMIN' | 'ACCOUNTANT' | 'CASHIER' | 'WAREHOUSE_MANAGER';

export interface UserPermission {
  canView: boolean;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canPrint: boolean;
  canViewReports: boolean;
  canManageSettings: boolean;
  canResetDatabase: boolean;
}

export interface AppUser {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  pinCode?: string;
  isActive: boolean;
  permissions: UserPermission;
  createdAt: string;
  lastLogin?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
}

// 8. Reports Settings (إعدادات التقارير)
export type DefaultDateRange = 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'THIS_QUARTER' | 'THIS_YEAR';

export interface ReportSettings {
  defaultDateRange: DefaultDateRange;
  showZeroBalanceAccounts: boolean;
  showAccountCode: boolean;
  showAccountCurrency: boolean;
  defaultExportFormat: 'PDF' | 'EXCEL';
  includeHeaderLogo: boolean;
  reportSignatures: boolean;
  preparedByTitle: string;
  approvedByTitle: string;
}

// 9. Appearance & Notifications (المظهر والتنبيهات)
export type ThemeMode = 'DARK_GOLD' | 'LIGHT';
export type AppFontSize = 'NORMAL' | 'LARGE' | 'XLARGE';
export type DateFormat = 'YYYY-MM-DD' | 'DD/MM/YYYY';

export interface AppearanceAndNotificationsSettings {
  themeMode: ThemeMode;
  fontSize: AppFontSize;
  dateFormat: DateFormat;
  enableDuePaymentAlerts: boolean;
  debtAlertDays: number;
  enableLowStockNotifications: boolean;
  enableSoundEffects: boolean;
}

// 10. System & Maintenance (النظام والصيانة)
export interface SystemMaintenanceInfo {
  version: string;
  releaseDate: string;
  licenseType: string;
  developer: string;
  supportPhone: string;
  supportEmail: string;
  supportWhatsApp: string;
}

// Full Settings Bundle State
export interface ComprehensiveSettingsState {
  printSettings: PrintSettings;
  documentTemplates: DocumentTemplateSettings;
  accountingConfig: AccountingSettings;
  inventoryConfig: InventorySettings;
  reportConfig: ReportSettings;
  appearanceConfig: AppearanceAndNotificationsSettings;
  decimalPlaces: number;
}
