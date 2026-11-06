import * as XLSX from 'xlsx';
import { Account, Contact, Invoice, Product } from '../types/accounting';

/**
 * Exports data to a genuine Microsoft Excel (.xlsx) file
 */
export function exportToExcel(data: any[], filename: string, sheetName: string = 'البيانات') {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`);
}

/**
 * Export chart of accounts to Excel
 */
export function exportAccountsToExcel(accounts: Account[], currency: string = 'SAR') {
  const data = accounts.map((acc, index) => ({
    '#': index + 1,
    'رمز الحساب': acc.code,
    'اسم الحساب بالعربي': acc.nameAr,
    'اسم الحساب بالإنجليزي': acc.nameEn,
    'التصنيف المحاسبي': acc.category === 'ASSET' ? 'أصول' : acc.category === 'LIABILITY' ? 'خصوم' : acc.category === 'EQUITY' ? 'حقوق ملكية' : acc.category === 'REVENUE' ? 'إيرادات' : 'مصروفات',
    'المستوى': acc.level,
    'الرصيد الحالي': acc.balance,
    'العملة': acc.currency || currency,
    'طبيعة الحساب': acc.isDebitNormal ? 'مدين' : 'دائن',
  }));

  exportToExcel(data, `دليل_الحسابات_${new Date().toISOString().split('T')[0]}.xlsx`, 'دليل الحسابات');
}

/**
 * Export products and inventory to Excel
 */
export function exportProductsToExcel(products: Product[], currency: string = 'SAR') {
  const data = products.map((p, index) => ({
    '#': index + 1,
    'كود الصنف': p.code,
    'الباركود': p.barcode || '-',
    'اسم الصنف': p.nameAr,
    'التصنيف': p.category || 'عام',
    'الوحدة': p.unit,
    'سعر التكلفة': p.costPrice,
    'سعر البيع (تجزئة)': p.salePrice,
    'سعر الجملة': p.wholesalePrice || p.salePrice,
    'سعر جملة الجملة': p.specialPrice || p.wholesalePrice || p.salePrice,
    'الكمية المتوفرة': p.stockQty,
    'إجمالي القيمة بسعر التكلفة': p.stockQty * p.costPrice,
    'حد التنبيه': p.minStockAlert,
    'العملة': currency,
  }));

  exportToExcel(data, `تقرير_المخزون_${new Date().toISOString().split('T')[0]}.xlsx`, 'المخزون');
}

/**
 * Export contacts (customers and suppliers) to Excel
 */
export function exportContactsToExcel(contacts: Contact[], currency: string = 'SAR') {
  const data = contacts.map((c, index) => ({
    '#': index + 1,
    'الكود': c.code,
    'الاسم': c.name,
    'النوع': c.type === 'CUSTOMER' ? 'عميل' : 'مورد',
    'الهاتف': c.phone,
    'البريد الإلكتروني': c.email || '-',
    'الرقم الضريبي': c.taxNumber || '-',
    'العنوان': c.address || '-',
    'الرصيد الحالي': c.balance,
    'العملة': c.preferredCurrency || currency,
  }));

  exportToExcel(data, `قائمة_العملاء_والموردين_${new Date().toISOString().split('T')[0]}.xlsx`, 'العملاء والموردون');
}

/**
 * Export invoices to Excel
 */
export function exportInvoicesToExcel(invoices: Invoice[], currency: string = 'SAR') {
  const data = invoices.map((inv, index) => ({
    '#': index + 1,
    'رقم الفاتورة': inv.invoiceNumber,
    'النوع': inv.type === 'SALES' ? 'فاتورة مبيعات' : 'فاتورة مشتريات',
    'التاريخ': inv.date,
    'الطرف / العميل': inv.partyName,
    'طريقة السداد': inv.paymentMethod === 'CASH' ? 'نقدي' : inv.paymentMethod === 'BANK' ? 'بنكي / شبكة' : inv.paymentMethod === 'SPLIT' ? 'دفع مجزأ' : 'آجل',
    'الإجمالي قبل الضريبة': inv.subtotal,
    'الضريبة': inv.taxTotal,
    'الخصم': inv.discountTotal || 0,
    'الصافي النهائي': inv.grandTotal,
    'الحالة': inv.status === 'PAID' ? 'مسددة' : inv.status === 'PARTIAL' ? 'سداد جزئي' : 'غير مسددة',
    'العملة': inv.currency || currency,
  }));

  exportToExcel(data, `سجل_الفواتير_${new Date().toISOString().split('T')[0]}.xlsx`, 'الفواتير');
}

/**
 * Export Stock Movements (كارت حركة الصنف)
 */
export function exportStockMovementsToExcel(movements: any[], productName: string = 'الصنف') {
  const data = movements.map((m, idx) => ({
    '#': idx + 1,
    'التاريخ': m.date,
    'نوع الحركة': m.type === 'INITIAL' ? 'رصيد افتتاحي' :
                 m.type === 'PURCHASE' ? 'وارد مشتريات' :
                 m.type === 'SALE' ? 'منصرف مبيعات' :
                 m.type === 'SALES_RETURN' ? 'مردود مبيعات' :
                 m.type === 'PURCHASE_RETURN' ? 'مردود مشتريات' :
                 m.type === 'ASSEMBLY_IN' ? 'تجميع صنف مركب' :
                 m.type === 'ASSEMBLY_OUT' ? 'استهلاك مكونات' :
                 m.type === 'TRANSFER_IN' ? 'تحويل وارد' :
                 m.type === 'TRANSFER_OUT' ? 'تحويل صادر' : 'تسوية مخزنية',
    'رقم المرجع': m.referenceNumber,
    'الوارد': m.quantityChange > 0 ? m.quantityChange : 0,
    'المنصرف': m.quantityChange < 0 ? Math.abs(m.quantityChange) : 0,
    'الرصيد بعد الحركة': m.balanceAfter,
    'تكلفة الوحدة': m.unitCost,
    'إجمالي القيمة': Math.abs(m.totalCost || m.quantityChange * m.unitCost),
    'البيان': m.notes || '-',
  }));

  exportToExcel(data, `كارت_حركة_${productName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`, 'كارت حركة الصنف');
}

/**
 * Export Debt Aging Report (أعمار الديون)
 */
export function exportDebtAgingToExcel(agingRows: any[], companyName?: string, currency?: string) {
  const data = agingRows.map((r, idx) => ({
    '#': idx + 1,
    'كود الطرف': r.code || '-',
    'اسم الطرف': r.name || r.partyName || '-',
    'نوع الطرف': r.type === 'CUSTOMER' ? 'عميل' : 'مورد',
    'الهاتف': r.phone || '-',
    'الرصيد الإجمالي': r.totalBalance,
    '1 - 30 يوم (جاري)': r.current0to30 ?? r.days1_30 ?? 0,
    '31 - 60 يوم': r.days31to60 ?? r.days31_60 ?? 0,
    '61 - 90 يوم': r.days61to90 ?? r.days61_90 ?? 0,
    'أكثر من 90 يوم (متعثر)': r.daysOver90 ?? r.days90Plus ?? 0,
    'السقف الائتماني': r.creditLimit || 'غير محدد',
    'العملة': currency || 'ر.س',
  }));

  const prefix = companyName ? `${companyName}_` : '';
  exportToExcel(data, `${prefix}تقرير_أعمار_الديون_${new Date().toISOString().split('T')[0]}.xlsx`, 'أعمار الديون');
}

/**
 * Export Fast / Slow moving report
 */
export function exportProductVelocityToExcel(velocityRows: any[], companyName?: string) {
  const data = velocityRows.map((r, idx) => ({
    '#': idx + 1,
    'كود الصنف': r.code,
    'اسم الصنف': r.name || r.nameAr,
    'التصنيف': r.category || 'عام',
    'الوحدة': r.unit || 'حبة',
    'الرصيد المخزني الحالي': r.stockQty ?? r.currentStock ?? 0,
    'الكمية المباعة': r.soldQty ?? 0,
    'إجمالي قيمة المبيعات': r.totalSalesValue ?? r.salesRevenue ?? 0,
    'تاريخ آخر حركة بيع': r.lastSaleDate || 'لا توجد مبيعات',
    'تصنيف الحركة (أونكس برو)':
      r.velocityCategory === 'FAST'
        ? 'سريع الحركة'
        : r.velocityCategory === 'MEDIUM'
        ? 'حركة متوسطة'
        : r.velocityCategory === 'SLOW'
        ? 'بطيء الحركة'
        : r.velocityStatus || 'راكد',
  }));

  const prefix = companyName ? `${companyName}_` : '';
  exportToExcel(data, `${prefix}تقرير_حركة_وركود_الأصناف_${new Date().toISOString().split('T')[0]}.xlsx`, 'حركة الأصناف');
}

