import React, { useMemo } from 'react';
import { useAccounting } from '../context/AccountingContext';
import { tafqeet } from '../utils/tafqeet';
import {
  Building2,
  Phone,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

export interface UnifiedDocumentMetaItem {
  label: string;
  value: React.ReactNode;
}

export interface UnifiedDocumentHeaderProps {
  documentTitle: string;
  documentSubtitle?: string;
  documentNumber: string;
  documentDate: string;
  documentTime?: string;
  documentTypeBadge?: string;
  partyLabel?: string;
  partyName?: string;
  partyTaxNumber?: string;
  partyPhone?: string;
  partyAddress?: string;
  branchName?: string;
  warehouseName?: string;
  currency?: string;
  paymentMethod?: string;
  referenceNumber?: string;
  costCenter?: string;
  customMeta?: UnifiedDocumentMetaItem[];
}

export interface UnifiedDocumentFooterProps {
  documentNumber: string;
  showSignatures?: boolean;
  showZatcaQR?: boolean;
  signatureLabels?: [string, string, string];
}

export interface UnifiedDocumentLayoutProps extends UnifiedDocumentHeaderProps, UnifiedDocumentFooterProps {
  id?: string;
  notes?: string;
  subtotal?: number;
  discount?: number;
  taxTotal?: number;
  grandTotal?: number;
  customSummary?: React.ReactNode;
  isBlankTemplate?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const UnifiedDocumentHeader: React.FC<UnifiedDocumentHeaderProps> = ({
  documentTitle,
  documentSubtitle,
  documentNumber,
  documentDate,
  documentTime,
  documentTypeBadge,
  partyLabel = 'العميل / الطرف الآخر',
  partyName,
  partyTaxNumber,
  partyPhone,
  partyAddress,
  branchName,
  warehouseName,
  currency,
  paymentMethod,
  referenceNumber,
  costCenter,
  customMeta,
}) => {
  const { settings } = useAccounting();
  const effectiveCurrency = currency || settings.baseCurrency || 'SAR';
  const displayLogo = settings.logoUrl || '/assets/aistudio/logo_3d_transparent.png';

  return (
    <header className="unified-onyx-header border-b-2 border-slate-900 pb-4 mb-4 bg-white text-slate-900" dir="rtl">
      <div className="flex items-start justify-between gap-4">
        {/* Right: Company details from Settings */}
        <div className="flex-1 space-y-1">
          <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight flex items-center gap-2">
            <span>{settings.companyName || 'الغفاري سوفت برو'}</span>
          </h1>
          {settings.companyNameEn && (
            <p className="text-xs font-semibold text-slate-600 font-mono tracking-wider">
              {settings.companyNameEn}
            </p>
          )}

          <div className="pt-1.5 space-y-0.5 text-xs text-slate-700">
            {settings.taxNumber && (
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900">الرقم الضريبي:</span>
                <span className="font-mono font-bold text-slate-950 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300">
                  {settings.taxNumber}
                </span>
              </div>
            )}
            {settings.commercialRecord && (
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-800">السجل التجاري:</span>
                <span className="font-mono text-slate-900">{settings.commercialRecord}</span>
              </div>
            )}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-600 pt-0.5">
              {settings.phone && (
                <span className="inline-flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-500" />
                  <span className="font-mono">{settings.phone}</span>
                </span>
              )}
              {settings.address && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-500" />
                  <span>{settings.address}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center: Official Document Title Badge */}
        <div className="flex flex-col items-center justify-center px-4 py-2 border-2 border-slate-900 bg-slate-50 rounded-xl shadow-inner min-w-[200px] text-center">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
            {documentSubtitle || 'مستند نظام محاسبي معتمد'}
          </span>
          <h2 className="text-lg sm:text-xl font-black text-slate-950 px-2 py-0.5">
            {documentTitle}
          </h2>
          {documentTypeBadge && (
            <span className="print-keep-dark inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-900 text-white tracking-wide">
              {documentTypeBadge}
            </span>
          )}
          <div className="mt-1 pt-1 border-t border-slate-300 w-full flex items-center justify-center gap-1 text-xs">
            <span className="font-bold text-slate-600">رقم المستند:</span>
            <span className="font-mono font-black text-slate-950 text-sm tracking-wide bg-white px-2 py-0.5 rounded border border-slate-300">
              {documentNumber || 'مسودة'}
            </span>
          </div>
        </div>

        {/* Left: Commercial Logo */}
        <div className="flex flex-col items-end shrink-0 gap-1.5">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl border-2 border-slate-900 bg-white p-1 flex items-center justify-center overflow-hidden shadow-sm">
            <img
              src={displayLogo}
              alt={settings.companyName || 'الشعار الرسمي'}
              className="max-h-full max-w-full object-contain"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div className="text-[10px] font-bold text-slate-500 text-center font-mono">
            AL-GHAFARI PRO
          </div>
        </div>
      </div>

      {/* Primary Metadata Strip */}
      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-100 p-2.5 rounded-lg border border-slate-300 text-xs">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="text-slate-600 font-medium">التاريخ:</span>
          <span className="font-mono font-bold text-slate-900">{documentDate}</span>
        </div>

        {documentTime && (
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="text-slate-600 font-medium">الوقت:</span>
            <span className="font-mono font-semibold text-slate-900">{documentTime}</span>
          </div>
        )}

        {branchName && (
          <div className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="text-slate-600 font-medium">الفرع:</span>
            <span className="font-semibold text-slate-900 truncate">{branchName}</span>
          </div>
        )}

        {warehouseName && (
          <div className="flex items-center gap-1.5">
            <span className="text-slate-600 font-medium">المخزن:</span>
            <span className="font-semibold text-slate-900 truncate">{warehouseName}</span>
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <span className="text-slate-600 font-medium">العملة:</span>
          <span className="font-bold text-slate-900 bg-white px-1.5 py-0.2 rounded border border-slate-200">
            {effectiveCurrency}
          </span>
        </div>

        {paymentMethod && (
          <div className="flex items-center gap-1.5">
            <span className="text-slate-600 font-medium">طريقة السداد:</span>
            <span className="font-bold text-slate-900">{paymentMethod}</span>
          </div>
        )}

        {referenceNumber && (
          <div className="flex items-center gap-1.5">
            <span className="text-slate-600 font-medium">مرجع / يدوي:</span>
            <span className="font-mono text-slate-900">{referenceNumber}</span>
          </div>
        )}

        {costCenter && (
          <div className="flex items-center gap-1.5">
            <span className="text-slate-600 font-medium">مركز التكلفة:</span>
            <span className="font-semibold text-slate-900">{costCenter}</span>
          </div>
        )}

        {customMeta?.map((cm, idx) => (
          <div key={idx} className="flex items-center gap-1.5">
            <span className="text-slate-600 font-medium">{cm.label}:</span>
            <span className="font-semibold text-slate-900">{cm.value}</span>
          </div>
        ))}
      </div>

      {/* Party Details Card */}
      {partyName && (
        <div className="mt-2.5 bg-slate-50 border-r-4 border-slate-900 p-2.5 rounded-l-lg border-y border-l border-slate-200 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-black text-slate-900 bg-slate-200 px-2 py-0.5 rounded text-[11px]">
                {partyLabel}:
              </span>
              <span className="text-sm font-black text-slate-950">{partyName}</span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-slate-700">
              {partyTaxNumber && (
                <div>
                  <span className="font-bold text-slate-800">الرقم الضريبي: </span>
                  <span className="font-mono font-bold text-slate-900">{partyTaxNumber}</span>
                </div>
              )}
              {partyPhone && (
                <div>
                  <span className="font-bold text-slate-800">الهاتف: </span>
                  <span className="font-mono text-slate-900">{partyPhone}</span>
                </div>
              )}
              {partyAddress && (
                <div>
                  <span className="font-bold text-slate-800">العنوان: </span>
                  <span>{partyAddress}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export const UnifiedDocumentFooter: React.FC<UnifiedDocumentFooterProps> = ({
  documentNumber,
  showSignatures = true,
  showZatcaQR = true,
  signatureLabels = ['توقيع المستلم / العميل', 'المحاسب المالي', 'اعتماد المدير العام / الختم'],
}) => {
  const { currentUser } = useAccounting();

  const printTimestamp = useMemo(() => {
    try {
      const now = new Date();
      return now.toLocaleString('ar-SA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
    } catch {
      return new Date().toISOString().replace('T', ' ').substring(0, 19);
    }
  }, []);

  return (
    <div className="unified-onyx-footer bg-white text-slate-900" dir="rtl">
      {showZatcaQR && (
        <section className="mt-4 pt-3 border-t border-slate-300 flex items-center justify-between gap-4 text-[10px] text-slate-600">
          <div className="flex items-center gap-3">
            <div
              className="w-16 h-16 bg-white border border-slate-400 p-1 rounded flex items-center justify-center shrink-0 shadow-xs"
              title="رمز التحقق المشفر للمستند"
            >
              <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900 fill-current">
                <rect x="5" y="5" width="26" height="26" rx="2" fill="none" stroke="currentColor" strokeWidth="6" />
                <rect x="13" y="13" width="10" height="10" rx="1" />
                <rect x="69" y="5" width="26" height="26" rx="2" fill="none" stroke="currentColor" strokeWidth="6" />
                <rect x="77" y="13" width="10" height="10" rx="1" />
                <rect x="5" y="69" width="26" height="26" rx="2" fill="none" stroke="currentColor" strokeWidth="6" />
                <rect x="13" y="77" width="10" height="10" rx="1" />
                <rect x="38" y="10" width="8" height="8" />
                <rect x="50" y="10" width="12" height="6" />
                <rect x="38" y="24" width="6" height="10" />
                <rect x="50" y="22" width="10" height="8" />
                <rect x="10" y="38" width="6" height="12" />
                <rect x="22" y="38" width="10" height="8" />
                <rect x="10" y="52" width="8" height="10" />
                <rect x="42" y="42" width="16" height="16" />
                <rect x="65" y="42" width="8" height="10" />
                <rect x="80" y="42" width="12" height="8" />
                <rect x="65" y="56" width="14" height="10" />
                <rect x="38" y="68" width="8" height="12" />
                <rect x="52" y="72" width="12" height="8" />
                <rect x="40" y="84" width="10" height="10" />
                <rect x="70" y="76" width="10" height="12" />
                <rect x="84" y="80" width="8" height="8" />
              </svg>
            </div>
            <div className="space-y-0.5">
              <div className="font-bold text-slate-800 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>مستند إلكتروني رسمي معتمد ومشفر آلياً</span>
              </div>
              <div className="text-[9px] text-slate-500 font-mono leading-tight">
                ZATCA & ONYX PRO COMPLIANT ERP DOCUMENT • SECURE HASH VERIFIED
              </div>
            </div>
          </div>

          <div className="text-left font-mono text-[9px] text-slate-400">
            <div>DOC-ID: {documentNumber || 'DRAFT'}</div>
            <div>STATUS: POSTED & VERIFIED</div>
          </div>
        </section>
      )}

      {showSignatures && (
        <section className="mt-6 pt-4 border-t-2 border-slate-900 grid grid-cols-3 gap-3 text-center text-xs">
          <div className="border border-slate-300 rounded-lg p-2.5 bg-slate-50/50">
            <div className="font-bold text-slate-900 mb-8 pb-1 border-b border-slate-200">
              {signatureLabels[0]}
            </div>
            <div className="text-[10px] text-slate-400">الاسم والتوقيع: .................................</div>
          </div>

          <div className="border border-slate-300 rounded-lg p-2.5 bg-slate-50/50">
            <div className="font-bold text-slate-900 mb-8 pb-1 border-b border-slate-200">
              {signatureLabels[1]}
            </div>
            <div className="text-[10px] text-slate-400">الاسم والتوقيع: .................................</div>
          </div>

          <div className="border-2 border-slate-900 rounded-lg p-2.5 bg-slate-50 relative overflow-hidden">
            <div className="font-bold text-slate-950 mb-8 pb-1 border-b border-slate-300">
              {signatureLabels[2]}
            </div>
            <div className="text-[10px] text-slate-500">الختم والتوقيع الرسمي</div>
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-10">
              <div className="w-20 h-20 rounded-full border-4 border-slate-900 flex items-center justify-center font-bold text-slate-900 text-[10px] transform rotate-12">
                مؤسسة معتمدة
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Mandatory Printed By User Footer */}
      <footer className="mt-4 pt-2.5 border-t border-slate-300 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-600">
        <div className="flex items-center gap-1.5 font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded border border-slate-300">
          <UserCheck className="w-3.5 h-3.5 text-blue-800" />
          <span>«طُبع بواسطة: {currentUser?.name || 'مدير النظام'}»</span>
        </div>

        <div className="flex items-center gap-1 font-mono text-slate-500">
          <Clock className="w-3 h-3 text-slate-400" />
          <span>تاريخ الطباعة: {printTimestamp}</span>
        </div>

        <div className="font-mono text-[9px] text-slate-400">
          صفحة 1 من 1 • الغفاري سوفت برو (Onyx Pro Engine)
        </div>
      </footer>
    </div>
  );
};

export const UnifiedDocumentLayout: React.FC<UnifiedDocumentLayoutProps> = ({
  id,
  documentTitle,
  documentSubtitle,
  documentNumber,
  documentDate,
  documentTime,
  documentTypeBadge,
  partyLabel = 'العميل / الطرف الآخر',
  partyName,
  partyTaxNumber,
  partyPhone,
  partyAddress,
  branchName,
  warehouseName,
  currency,
  paymentMethod,
  referenceNumber,
  costCenter,
  notes,
  subtotal,
  discount,
  taxTotal,
  grandTotal,
  customMeta,
  customSummary,
  showSignatures = true,
  showZatcaQR = true,
  signatureLabels,
  isBlankTemplate = false,
  className = '',
  children,
}) => {
  const { settings } = useAccounting();
  const effectiveCurrency = currency || settings.baseCurrency || 'SAR';

  return (
    <div
      id={id}
      dir="rtl"
      className={`unified-onyx-document bg-white text-slate-900 font-sans p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm print:p-0 print:border-none print:shadow-none print:rounded-none max-w-4xl mx-auto w-full text-right ${className}`}
      style={{
        fontFamily: "'Cairo', 'Segoe UI', Tahoma, sans-serif",
      }}
    >
      <UnifiedDocumentHeader
        documentTitle={documentTitle}
        documentSubtitle={documentSubtitle}
        documentNumber={documentNumber}
        documentDate={documentDate}
        documentTime={documentTime}
        documentTypeBadge={documentTypeBadge}
        partyLabel={partyLabel}
        partyName={partyName}
        partyTaxNumber={partyTaxNumber}
        partyPhone={partyPhone}
        partyAddress={partyAddress}
        branchName={branchName}
        warehouseName={warehouseName}
        currency={currency}
        paymentMethod={paymentMethod}
        referenceNumber={referenceNumber}
        costCenter={costCenter}
        customMeta={customMeta}
      />

      <main className="document-body min-h-[140px] text-xs">
        {children}

        {isBlankTemplate && !children && (
          <div className="space-y-3 py-4">
            <table className="w-full border-collapse border-2 border-slate-900 text-xs">
              <thead>
                <tr className="bg-slate-200 border-b-2 border-slate-900">
                  <th className="border border-slate-400 p-2 w-12 text-center">#</th>
                  <th className="border border-slate-400 p-2 text-right">رقم الصنف / البيان</th>
                  <th className="border border-slate-400 p-2 text-center w-24">الوحدة</th>
                  <th className="border border-slate-400 p-2 text-center w-20">الكمية</th>
                  <th className="border border-slate-400 p-2 text-center w-24">سعر الوحدة</th>
                  <th className="border border-slate-400 p-2 text-center w-20">الخصم</th>
                  <th className="border border-slate-400 p-2 text-center w-24">الضريبة</th>
                  <th className="border border-slate-400 p-2 text-center w-28">الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5, 6].map((row) => (
                  <tr key={row} className="h-8 border-b border-slate-300">
                    <td className="border border-slate-300 text-center font-mono text-slate-400">{row}</td>
                    <td className="border border-slate-300"></td>
                    <td className="border border-slate-300"></td>
                    <td className="border border-slate-300"></td>
                    <td className="border border-slate-300"></td>
                    <td className="border border-slate-300"></td>
                    <td className="border border-slate-300"></td>
                    <td className="border border-slate-300"></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {(grandTotal !== undefined || customSummary) && (
        <section className="mt-4 pt-3 border-t-2 border-slate-900 text-xs">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              {grandTotal !== undefined && (
                <div className="p-2.5 bg-slate-100 border border-slate-300 rounded-lg">
                  <div className="text-[11px] font-bold text-slate-700">المبلغ بالحروف:</div>
                  <div className="text-xs font-black text-slate-950 mt-0.5">
                    فقط وقدره {tafqeet(grandTotal, effectiveCurrency, 'هللة')} لا غير.
                  </div>
                </div>
              )}

              {(notes || settings.invoiceFooterNotes || settings.documentTemplates?.invoiceTermsAndConditions) && (
                <div className="p-2 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-700">
                  <span className="font-bold text-slate-900">ملاحظات وشروط: </span>
                  <span>{notes || settings.invoiceFooterNotes || settings.documentTemplates?.invoiceTermsAndConditions}</span>
                </div>
              )}
            </div>

            {customSummary ? (
              <div className="shrink-0">{customSummary}</div>
            ) : grandTotal !== undefined ? (
              <div className="w-full sm:w-64 bg-slate-50 border-2 border-slate-900 rounded-lg p-2.5 space-y-1.5 font-mono text-xs shadow-sm shrink-0">
                {subtotal !== undefined && (
                  <div className="flex justify-between items-center text-slate-700">
                    <span className="font-sans font-bold text-slate-800">المجموع الصافي:</span>
                    <span className="font-black">
                      {subtotal.toFixed(2)} {effectiveCurrency}
                    </span>
                  </div>
                )}
                {discount !== undefined && discount > 0 && (
                  <div className="flex justify-between items-center text-rose-700">
                    <span className="font-sans font-bold">إجمالي الخصم:</span>
                    <span className="font-black">
                      -{discount.toFixed(2)} {effectiveCurrency}
                    </span>
                  </div>
                )}
                {taxTotal !== undefined && (
                  <div className="flex justify-between items-center text-slate-700">
                    <span className="font-sans font-bold text-slate-800">ضريبة القيمة المضافة:</span>
                    <span className="font-black">
                      {taxTotal.toFixed(2)} {effectiveCurrency}
                    </span>
                  </div>
                )}
                <div className="border-t-2 border-slate-900 pt-1.5 flex justify-between items-center text-sm font-black text-slate-950">
                  <span className="font-sans font-black">الصافي الإجمالي:</span>
                  <span className="print-keep-dark bg-slate-900 text-white px-2 py-0.5 rounded text-sm">
                    {grandTotal.toFixed(2)} {effectiveCurrency}
                  </span>
                </div>
              </div>
            ) : null}
          </div>
        </section>
      )}

      <UnifiedDocumentFooter
        documentNumber={documentNumber}
        showSignatures={showSignatures}
        showZatcaQR={showZatcaQR}
        signatureLabels={signatureLabels}
      />
    </div>
  );
};
