import React, { useState } from 'react';
import {
  Info,
  FileText,
  Download,
  Eye,
  EyeOff,
  Calculator,
  Package,
  BarChart3,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Building2,
  Store,
  Wrench,
  Phone,
  Mail,
  Award,
  Layers,
  Zap,
} from 'lucide-react';

const PDF_ASSET_PATH = '/assets/aistudio/___________________________________PRO_d6b49aa0.pdf';

export const AboutAppTab: React.FC = () => {
  const [showEmbeddedPdf, setShowEmbeddedPdf] = useState(false);

  return (
    <div className="space-y-6 text-right animate-in fade-in duration-200">
      {/* Top Action Header Bar for the Official PDF Document */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <Info className="w-5 h-5 text-amber-400" />
            <span>نبذة عن التطبيق — دليل التعريف والمميزات (PDF)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            الوثيقة الرسمية التعريفية لنظام الغفاري سوفت PRO المحاسبي والإداري المتكامل
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowEmbeddedPdf((prev) => !prev)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all cursor-pointer active:scale-95"
          >
            {showEmbeddedPdf ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{showEmbeddedPdf ? 'إخفاء عارض PDF المدمج' : 'عرض ملف PDF الأصلي'}</span>
          </button>

          <a
            href={PDF_ASSET_PATH}
            download="الغفاري_سوفت_PRO_نبذة_عن_التطبيق.pdf"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>تنزيل ملف PDF الرسمي</span>
          </a>
        </div>
      </div>

      {/* Optional Embedded Original PDF Viewer */}
      {showEmbeddedPdf && (
        <div className="rounded-2xl border-2 border-amber-500/40 bg-slate-950 overflow-hidden shadow-2xl animate-in fade-in duration-200">
          <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
            <span className="font-bold text-amber-300 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              معاينة المستند الأصلي (الغفاري سوفت PRO — صفحتان)
            </span>
            <a
              href={PDF_ASSET_PATH}
              download="الغفاري_سوفت_PRO_نبذة_عن_التطبيق.pdf"
              className="text-emerald-400 hover:text-emerald-300 font-bold underline"
            >
              حفظ النسخة على الجهاز
            </a>
          </div>
          <div className="w-full h-[540px] bg-slate-900">
            <object
              data={PDF_ASSET_PATH}
              type="application/pdf"
              className="w-full h-full"
            >
              <iframe
                src={PDF_ASSET_PATH}
                title="نبذة عن تطبيق الغفاري سوفت PRO"
                className="w-full h-full border-0"
              />
            </object>
          </div>
        </div>
      )}

      {/* Official Document Presentation Card (Full High-Clarity Arabic Content from the PDF) */}
      <div className="rounded-3xl bg-gradient-to-b from-slate-900 via-[#0c1220] to-slate-950 border-2 border-amber-500/30 p-5 sm:p-8 shadow-2xl space-y-7">
        {/* Document Hero Header */}
        <div className="text-center border-b-2 border-amber-500/30 pb-6 space-y-3">
          <div className="w-20 h-20 mx-auto rounded-2xl border-2 border-amber-400/60 bg-slate-950 p-1.5 shadow-xl shadow-amber-500/10 flex items-center justify-center">
            <img
              src="/assets/aistudio/1787182612810_5ba9faf5.png"
              alt="شعار الغفاري سوفت PRO"
              className="w-full h-full object-contain rounded-xl"
            />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              الغفاري سوفت <span className="text-amber-400">PRO</span>
            </h2>
            <p className="text-sm sm:text-base font-bold text-cyan-300 mt-1">
              النظام المحاسبي المتكامل لإدارة الأنشطة التجارية والمالية
            </p>
            <div className="mt-2.5 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>إصدار احترافي متطور</span>
            </div>
          </div>
        </div>

        {/* 1. About the App (عن التطبيق) */}
        <section className="space-y-2.5">
          <h4 className="text-base sm:text-lg font-black text-white border-r-4 border-amber-400 pr-3">
            عن التطبيق
          </h4>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-900/70 p-4 rounded-2xl border border-slate-800">
            يُعد تطبيق <strong className="text-amber-300">الغفاري سوفت PRO</strong> حلاً محاسبياً وإدارياً متكاملاً صُمّم خصيصاً ليلبي احتياجات المنشآت التجارية، والشركات، والمحلات، والأعمال التجارية المختلفة. يدمج التطبيق بين السهولة المطلقة في الاستخدام والقوة المتناهية في معالجة البيانات المالية، مما يمنح أصحاب الأعمال الرؤية الدقيقة والسيطرة الكاملة على كافة العمليات المالية والمخزنية.
          </p>
        </section>

        {/* 2. Core System Pillars (الركائز الأساسية للنظام) */}
        <section className="space-y-3">
          <h4 className="text-base sm:text-lg font-black text-white border-r-4 border-cyan-400 pr-3">
            الركائز الأساسية للنظام
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
              <div className="flex items-center gap-2 text-amber-400 font-black text-sm">
                <Calculator className="w-4 h-4 shrink-0" />
                <span>1. إدارة الحسابات والمالية</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>دليل حسابات شجري مرن ومتعدد المستويات.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>تسجيل القيود اليومية، وسندات القبض والدفع بمرونة عالية.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>إدارة القيود الآلية الناتجة عن المبيعات والمشتريات.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>دعم التعامل بعدة عملات مع تقييم فروق العملة.</span>
                </li>
              </ul>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
              <div className="flex items-center gap-2 text-cyan-400 font-black text-sm">
                <Package className="w-4 h-4 shrink-0" />
                <span>2. إدارة المخزون والمبيعات</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>متابعة حركة الأصناف والمخازن أولاً بأول.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>نظام نقط البيع (POS) المباشر والسريع.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>إصدار فواتير المبيعات، المشتريات، والمردودات.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>دعم نظام الباركود وتتبع تواريخ الصلاحية والكميات.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* 3. Comparison Table (مقارنة بين الحلول التقليدية والنظام الاحترافي) */}
        <section className="space-y-3">
          <h4 className="text-base sm:text-lg font-black text-white border-r-4 border-emerald-400 pr-3">
            مقارنة بين الحلول التقليدية والنظام الاحترافي
          </h4>
          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-right text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 text-amber-300 border-b border-slate-800">
                  <th className="py-3 px-4 font-black">المعيار</th>
                  <th className="py-3 px-4 font-bold text-slate-300">المعاملات التقليدية / اليدوية</th>
                  <th className="py-3 px-4 font-black text-emerald-400">تطبيق الغفاري سوفت PRO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900/60">
                <tr>
                  <td className="py-3 px-4 font-bold text-white">سرعة معالجة البيانات</td>
                  <td className="py-3 px-4 text-slate-400">بطيئة وعرضة للأخطاء البشرية</td>
                  <td className="py-3 px-4 text-emerald-300 font-bold">فورية، دقيقة، ومعالجة تلقائية للقيود</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-white">الرقابة المخزنية</td>
                  <td className="py-3 px-4 text-slate-400">صعوبة في جرد الكميات وتتبع التالف</td>
                  <td className="py-3 px-4 text-emerald-300 font-bold">متابعة فورية للكميات وتنبيهات بحد الطلب</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-white">التقارير المالية</td>
                  <td className="py-3 px-4 text-slate-400">تستغرق أياماً لإعدادها نهاية الشهر</td>
                  <td className="py-3 px-4 text-emerald-300 font-bold">تقارير فورية بنقرة زر وفي أي وقت</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 4. Advanced Technical & Functional Features (ميزات تقنية ووظيفية متقدمة) */}
        <section className="space-y-3">
          <h4 className="text-base sm:text-lg font-black text-white border-r-4 border-purple-400 pr-3">
            ميزات تقنية ووظيفية متقدمة
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
              <div className="flex items-center gap-2 text-purple-400 font-black text-sm">
                <BarChart3 className="w-4 h-4 shrink-0" />
                <span>التقارير الشاملة والتحليلات</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold">•</span>
                  <span>تقارير ميزان المراجعة، الأرباح والخسائر، وقائمة المركز المالي.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold">•</span>
                  <span>كشوفات حساب تفصيلية للعملاء والموردين.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold">•</span>
                  <span>تقارير تحليل المبيعات والأصناف الأكثر حركة وربحية.</span>
                </li>
              </ul>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-400 font-black text-sm">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>الأمان والنسخ الاحتياطي</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>نظام صلاحيات مستخدمين دقيق لحماية البيانات من الوصول غير المصرح.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>نسخ احتياطي تلقائي ويدوي للبيانات لتجنب أي فقدان.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>سجل عمليات شامل لمعرفة كافة التعديلات المدخلة.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* 5. Why Choose Al-Ghafari Soft PRO (لماذا تختار الغفاري سوفت PRO؟) */}
        <section className="space-y-3">
          <h4 className="text-base sm:text-lg font-black text-white border-r-4 border-amber-400 pr-3">
            لماذا تختار &quot;الغفاري سوفت PRO&quot;؟
          </h4>
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-900/80 to-slate-900/80 border border-cyan-500/30 space-y-3 text-xs sm:text-sm text-slate-200 leading-relaxed">
            <div className="flex items-start gap-2.5">
              <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-1" />
              <p>
                <strong className="text-amber-300">واجهة مستخدم حديثة وسلسة:</strong> صُمّمت الواجهات بعناية لتناسب كلاً من المحاسبين المحترفين وأصحاب الأعمال، حيث تمتاز بسهولة التصفح وسرعة إدخال البيانات وتوفير الوقت أثناء ضغط العمل.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <Layers className="w-4 h-4 text-cyan-400 shrink-0 mt-1" />
              <p>
                <strong className="text-cyan-300">الربط والتكامل:</strong> إمكانية العمل على شبكات محلية أو الربط السحابي لإدارة الفروع المتعددة ومتابعة النشاط من أي مكان وفي أي وقت.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <Award className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
              <p>
                <strong className="text-emerald-300">الدعم الفني والتحديثات:</strong> مواكبة مستمرة للتطورات والتشريعات المحاسبية والضريبية مع توفير دعم فني متواصل لضمان استقرار العمل.
              </p>
            </div>
          </div>
        </section>

        {/* 6. Target Sectors (مجالات الاستخدام المستهدفة) */}
        <section className="space-y-3">
          <h4 className="text-base sm:text-lg font-black text-white border-r-4 border-cyan-400 pr-3">
            مجالات الاستخدام المستهدفة
          </h4>
          <p className="text-xs text-slate-400">
            يناسب تطبيق الغفاري سوفت PRO مختلف القطاعات الاقتصادية والتجارية، بما في ذلك:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 font-black text-amber-300">
                <Building2 className="w-4 h-4" />
                <span>الشركات والمؤسسات التجارية</span>
              </div>
              <p className="text-slate-400">تجارة الجملة والتجزئة والخدمات.</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 font-black text-cyan-300">
                <Store className="w-4 h-4" />
                <span>المعارض والمحلات التجارية</span>
              </div>
              <p className="text-slate-400">السوبرماركت، محلات الملابس، الإلكترونيات، ومواد البناء.</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 font-black text-emerald-300">
                <Wrench className="w-4 h-4" />
                <span>الورش والأنشطة الخدمية</span>
              </div>
              <p className="text-slate-400">إمكانية إصدار الفواتير ومتابعة التكاليف والعملاء بكل سهولة.</p>
            </div>
          </div>
        </section>

        {/* 7. Developer & Contact Footer */}
        <div className="pt-5 border-t border-slate-800 text-center space-y-2.5">
          <div className="text-xs sm:text-sm font-black text-amber-300">
            إعداد وتنفيذ: م / محمد عبد الغفار السروري | تحت إشراف: م / محمد عبد الغفار السروري
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-300">
            <a
              href="tel:775587939"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 font-mono text-emerald-300 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>للتواصل والاستفسار: 775587939</span>
            </a>
            <a
              href="mailto:moohamedalsroore@gmail.com"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 font-mono text-cyan-300 transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>moohamedalsroore@gmail.com</span>
            </a>
          </div>
          <div className="text-[11px] text-slate-500 pt-1">
            تطبيق الغفاري سوفت PRO — دليل التعريف والمميزات
          </div>
        </div>
      </div>
    </div>
  );
};
