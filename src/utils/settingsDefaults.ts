import {
  PrintSettings,
  DocumentTemplateSettings,
  AccountingSettings,
  InventorySettings,
  ReportSettings,
  AppearanceAndNotificationsSettings,
  SystemMaintenanceInfo,
  AppUser,
} from '../types/settings';

export const DEFAULT_PRINT_SETTINGS: PrintSettings = {
  printerName: 'طابعة النظام الافتراضية',
  paperSize: 'A4',
  orientation: 'PORTRAIT',
  margin: 'NORMAL',
  fontSize: 'MEDIUM',
  showLogo: true,
  copiesCount: 1,
  autoShowPreview: true,
  defaultAction: 'PDF_DOWNLOAD',
  headerNote: 'شكراً لتعاملكم مع مؤسستنا - نعتز بثقتكم',
  footerNote: 'البضاعة المباعة ترد وتستبدل حسب الشروط والأنظمة التجارية المعتمدة',
};

export const DEFAULT_DOCUMENT_TEMPLATES: DocumentTemplateSettings = {
  salesInvoicePrefix: 'INV-',
  salesInvoiceStartNumber: 1001,
  purchaseInvoicePrefix: 'PUR-',
  purchaseInvoiceStartNumber: 2001,
  returnInvoicePrefix: 'RET-',
  returnInvoiceStartNumber: 3001,
  receiptVoucherPrefix: 'REC-',
  receiptVoucherStartNumber: 4001,
  paymentVoucherPrefix: 'PAY-',
  paymentVoucherStartNumber: 5001,
  quotationPrefix: 'QUO-',
  quotationStartNumber: 6001,

  showItemBarcode: true,
  showItemUnit: true,
  showTaxPerItem: true,
  showDiscountPerItem: true,
  showItemDescription: true,
  showCommercialRecord: true,
  showTaxNumber: true,
  showDigitalSeal: true,
  showSignatureSection: true,
  digitalSealUrl: '',
  invoiceTermsAndConditions: '1. الأسعار تشمل ضريبة القيمة المضافة ما لم يذكر خلاف ذلك.\n2. ضمان الأجهزة والمنتجات سارٍ مع إحضار أصل هذه الفاتورة.\n3. يحق للعميل الاسترجاع خلال 3 أيام والاستبدال خلال 7 أيام من تاريخ الشراء.',
};

export const DEFAULT_ACCOUNTING_CONFIG: AccountingSettings = {
  defaultCashAccountId: 'acc-1101', // الصندوق الرئيسي
  defaultBankAccountId: 'acc-1103', // البنك الرئيسي
  defaultReceivableAccountId: 'acc-1105', // العملاء (ذمم مدينة)
  defaultPayableAccountId: 'acc-2101', // الموردون (ذمم دائنة)
  defaultSalesRevenueAccountId: 'acc-4101', // إيرادات المبيعات
  defaultCostOfGoodsSoldAccountId: 'acc-5101', // تكلفة المبيعات
  defaultInventoryAccountId: 'acc-1106', // المخزون
  defaultTaxPayableAccountId: 'acc-2102', // ضريبة المخرجات
  defaultTaxReceivableAccountId: 'acc-1107', // ضريبة المدخلات
  defaultDiscountAllowedAccountId: 'acc-4103', // الخصم المسموح به
  defaultDiscountReceivedAccountId: 'acc-5103', // الخصم المكتسب

  defaultPaymentMethod: 'CASH',
  enableDiscounts: true,
  roundingPolicy: 'NONE',
  autoPostJournalEntries: true,
};

export const DEFAULT_INVENTORY_CONFIG: InventorySettings = {
  defaultWarehouseId: 'wh-main',
  costingMethod: 'WEIGHTED_AVERAGE',
  defaultLowStockThreshold: 5,
  outOfStockPolicy: 'ALLOW_WITH_WARNING',
  enableStockAlerts: true,
};

export const DEFAULT_REPORT_CONFIG: ReportSettings = {
  defaultDateRange: 'THIS_MONTH',
  showZeroBalanceAccounts: false,
  showAccountCode: true,
  showAccountCurrency: true,
  defaultExportFormat: 'PDF',
  includeHeaderLogo: true,
  reportSignatures: true,
  preparedByTitle: 'المحاسب المسؤول',
  approvedByTitle: 'المدير المالي / المدير العام',
};

export const DEFAULT_APPEARANCE_CONFIG: AppearanceAndNotificationsSettings = {
  themeMode: 'DARK_GOLD',
  fontSize: 'NORMAL',
  dateFormat: 'YYYY-MM-DD',
  enableDuePaymentAlerts: true,
  debtAlertDays: 30,
  enableLowStockNotifications: true,
  enableSoundEffects: true,
};

export const INITIAL_APP_USERS: AppUser[] = [
  {
    id: 'user-admin',
    username: 'admin',
    fullName: 'المدير العام (الأدمن الرئيسي)',
    role: 'ADMIN',
    pinCode: '1234',
    isActive: true,
    permissions: {
      canView: true,
      canAdd: true,
      canEdit: true,
      canDelete: true,
      canPrint: true,
      canViewReports: true,
      canManageSettings: true,
      canResetDatabase: true,
    },
    createdAt: '2026-01-01',
    lastLogin: '2026-10-29 15:30',
  },
  {
    id: 'user-accountant',
    username: 'accountant',
    fullName: 'المحاسب القانوني',
    role: 'ACCOUNTANT',
    pinCode: '2026',
    isActive: true,
    permissions: {
      canView: true,
      canAdd: true,
      canEdit: true,
      canDelete: false,
      canPrint: true,
      canViewReports: true,
      canManageSettings: false,
      canResetDatabase: false,
    },
    createdAt: '2026-01-05',
    lastLogin: '2026-10-29 12:15',
  },
  {
    id: 'user-cashier',
    username: 'cashier',
    fullName: 'كاشير نقطة البيع',
    role: 'CASHIER',
    pinCode: '0000',
    isActive: true,
    permissions: {
      canView: true,
      canAdd: true,
      canEdit: false,
      canDelete: false,
      canPrint: true,
      canViewReports: false,
      canManageSettings: false,
      canResetDatabase: false,
    },
    createdAt: '2026-01-10',
    lastLogin: '2026-10-29 14:00',
  },
];

export const DEFAULT_MAINTENANCE_INFO: SystemMaintenanceInfo = {
  version: '3.5.0 PRO (النسخة الذهبية المستقرة)',
  releaseDate: '2026-10-29',
  licenseType: 'ترخيص رسمي دائم - غير محدود الصلاحية (Offline & Lifetime)',
  developer: 'م / محمد عبد الغفار السروري',
  supportPhone: '+967 777 000 000',
  supportEmail: 'support@alghafari-soft.pro',
  supportWhatsApp: '+967777000000',
};
