import React, { useState } from 'react';
import {
  Package,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Search,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  ClipboardCheck,
  History,
  Barcode,
  Layers,
  Edit2,
  Trash2,
  CheckCircle,
  Truck,
} from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import { Product } from '../types/accounting';

export const InventoryManager: React.FC = () => {
  const {
    products,
    inventorySummary,
    lowStockItems,
    stockMovements,
    stockAdjustments,
    settings,
    addProduct,
    updateProduct,
    deleteProduct,
    deleteAllProducts,
    recordStockAdjustment,
    deleteStockAdjustment,
    setActiveView,
    openDeleteConfirm,
  } = useAccounting();

  const [activeTab, setActiveTab] = useState<'items' | 'alerts' | 'movements' | 'adjustments'>('items');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'IN_STOCK' | 'LOW' | 'OUT'>('ALL');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [selectedProductCard, setSelectedProductCard] = useState<Product | null>(null);

  // New/Edit product form state
  const [formData, setFormData] = useState({
    code: '',
    barcode: '',
    nameAr: '',
    category: 'إلكترونيات ومعدات',
    unit: 'حبة',
    costPrice: 0,
    salePrice: 0,
    stockQty: 0,
    minStockAlert: 5,
    taxRate: 0.15,
  });

  // Stock Adjustment form state
  const [adjForm, setAdjForm] = useState({
    actualQty: 0,
    reason: 'جرد دوري للمستودع وتصحيح الفروقات',
  });

  const categories = ['ALL', ...Array.from(new Set(products.map((p) => p.category)))];

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.includes(searchQuery);

    const matchesCategory = filterCategory === 'ALL' || p.category === filterCategory;

    let matchesStatus = true;
    if (filterStatus === 'OUT') matchesStatus = p.stockQty <= 0;
    else if (filterStatus === 'LOW') matchesStatus = p.stockQty > 0 && p.stockQty <= p.minStockAlert;
    else if (filterStatus === 'IN_STOCK') matchesStatus = p.stockQty > p.minStockAlert;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      code: `PRD-${String(products.length + 101).padStart(3, '0')}`,
      barcode: `628${Math.floor(100000000 + Math.random() * 900000000)}`,
      nameAr: '',
      category: 'عام',
      unit: 'حبة',
      costPrice: 0,
      salePrice: 0,
      stockQty: 0,
      minStockAlert: 5,
      taxRate: settings.defaultTaxRate,
    });
    setShowAddModal(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      code: p.code,
      barcode: p.barcode,
      nameAr: p.nameAr,
      category: p.category,
      unit: p.unit,
      costPrice: p.costPrice,
      salePrice: p.salePrice,
      stockQty: p.stockQty,
      minStockAlert: p.minStockAlert,
      taxRate: p.taxRate,
    });
    setShowAddModal(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nameAr.trim()) return;

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        ...formData,
        costPrice: Number(formData.costPrice),
        salePrice: Number(formData.salePrice),
        stockQty: Number(formData.stockQty),
        minStockAlert: Number(formData.minStockAlert),
      });
    } else {
      addProduct({
        ...formData,
        costPrice: Number(formData.costPrice),
        salePrice: Number(formData.salePrice),
        stockQty: Number(formData.stockQty),
        minStockAlert: Number(formData.minStockAlert),
      });
    }

    setShowAddModal(false);
  };

  const handleOpenAdjustment = (p: Product) => {
    setAdjustingProduct(p);
    setAdjForm({
      actualQty: p.stockQty,
      reason: 'جرد دوري ومطابقة فعلية للمستودع',
    });
  };

  const handleSaveAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingProduct) return;

    recordStockAdjustment({
      productId: adjustingProduct.id,
      actualQty: Number(adjForm.actualQty),
      reason: adjForm.reason,
    });

    setAdjustingProduct(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Package className="w-7 h-7 text-emerald-400" />
            نظام إدارة المخزون وتكلفة المبيعات (COGS)
          </h2>
          <p className="text-sm text-slate-400">
            متابعة مستمرة ودقيقة للأرصدة، تقييم البضاعة، احتساب تكلفة المبيعات آلياً، وتنبيهات إعادة الطلب
          </p>
        </div>

        <div className="flex items-center gap-3">
          {products.length > 0 && (
            <button
              onClick={() => {
                openDeleteConfirm({
                  title: 'تأكيد تصفير وحذف كافة الأصناف',
                  itemName: `حذف جميع الأصناف المسجلة (${products.length} صنف)`,
                  message: 'تحذير شديد: سيتم حذف كافة الأصناف المسجلة وتصفير أرصدة المخزون بالكامل.',
                  confirmLabel: 'تأكيد تصفير كافة الأصناف',
                  onConfirm: () => deleteAllProducts(),
                });
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-950/40 text-red-400 hover:text-red-300 hover:bg-red-900/60 border border-red-500/30 font-bold text-xs cursor-pointer transition-all"
              title="حذف وتصفير كافة الأصناف المسجلة"
            >
              <Trash2 className="w-4 h-4" />
              حذف كافة الأصناف
            </button>
          )}

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            إضافة صنف جديد
          </button>
        </div>
      </div>

      {/* 4 Inventory & COGS KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Cost Valuation */}
        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">إجمالي قيمة المخزون (بالتكلفة)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-mono-num text-2xl font-black text-white">
              {inventorySummary.totalCostValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}{' '}
              <span className="text-xs font-normal text-emerald-400">{settings.baseCurrency}</span>
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <span>القيمة البيعية المتوقعة:</span>
              <span className="font-mono-num font-semibold text-slate-200">
                {inventorySummary.totalRetailValue.toLocaleString('en-US')} {settings.baseCurrency}
              </span>
            </div>
          </div>
        </div>

        {/* Period COGS */}
        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">تكلفة البضاعة المباعة (COGS)</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-mono-num text-2xl font-black text-cyan-300">
              {inventorySummary.periodCogsTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}{' '}
              <span className="text-xs font-normal text-cyan-400">{settings.baseCurrency}</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              يتم قيدها آلياً في الحساب 5101 عند كل فاتورة مبيعات
            </div>
          </div>
        </div>

        {/* Potential Margin & Profit */}
        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">هامش الربح التقديري للمخزون</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-mono-num text-2xl font-black text-purple-300">
              %{inventorySummary.potentialMarginPercent}{' '}
              <span className="text-sm font-semibold text-slate-300">
                (+{inventorySummary.potentialProfit.toLocaleString('en-US')} {settings.baseCurrency})
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              إجمالي {inventorySummary.totalUnitsInStock} وحدة عبر {inventorySummary.totalItemsCount} صنف
            </div>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className={`p-4 rounded-2xl border relative overflow-hidden shadow-lg transition-all ${
          inventorySummary.lowStockItemsCount > 0
            ? 'bg-amber-950/20 border-amber-500/40'
            : 'bg-slate-800/80 border-slate-700/80'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">تنبيهات نواقص المخزون</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-mono-num text-2xl font-black text-amber-400">
              {inventorySummary.lowStockItemsCount}{' '}
              <span className="text-xs font-normal text-slate-400">صنف بحاجة للطلب</span>
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center justify-between">
              <span>منها أصناف منعدمة:</span>
              <span className="font-bold text-red-400 font-mono-num">{inventorySummary.outOfStockItemsCount} صنف</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-800 space-x-reverse space-x-2">
        <button
          onClick={() => setActiveTab('items')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'items'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          مستويات المخزون والأصناف ({products.length})
        </button>

        <button
          onClick={() => setActiveTab('alerts')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'alerts'
              ? 'border-amber-500 text-amber-400 bg-amber-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          تنبيهات إعادة الطلب ({lowStockItems.length})
        </button>

        <button
          onClick={() => setActiveTab('movements')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'movements'
              ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="w-4 h-4" />
          سجل حركة المخزون وتكلفة COGS ({stockMovements.length})
        </button>

        <button
          onClick={() => setActiveTab('adjustments')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'adjustments'
              ? 'border-purple-500 text-purple-400 bg-purple-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ClipboardCheck className="w-4 h-4" />
          الجرد والتسويات المخزنية ({stockAdjustments.length})
        </button>
      </div>

      {/* TAB 1: Products & Stock Levels Table */}
      {activeTab === 'items' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700">
            <div className="flex items-center gap-3 flex-1 min-w-[260px]">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ابحث باسم الصنف، الباركود، أو الكود..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-3 pr-9 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Category Filter */}
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-emerald-500"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c === 'ALL' ? 'جميع التصنيفات' : c}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">جميع حالات المخزون</option>
                <option value="IN_STOCK">متوفر بكمية جيدة</option>
                <option value="LOW">قارب على النفاد (منخفض)</option>
                <option value="OUT">نفد من المستودع (0)</option>
              </select>
            </div>

            <div className="text-xs text-slate-400">
              إجمالي الأصناف المعروضة: <span className="font-bold text-white">{filteredProducts.length}</span>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900 shadow-xl">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-800/90 text-slate-300 font-bold text-xs uppercase tracking-wider border-b border-slate-700">
                <tr>
                  <th className="py-3 px-4">كود الصنف / الباركود</th>
                  <th className="py-3 px-4">اسم الصنف والتصنيف</th>
                  <th className="py-3 px-4 text-center">الوحدة</th>
                  <th className="py-3 px-4 text-center">سعر التكلفة</th>
                  <th className="py-3 px-4 text-center">سعر البيع</th>
                  <th className="py-3 px-4 text-center">هامش الربح</th>
                  <th className="py-3 px-4 text-center">الرصيد الفعلي</th>
                  <th className="py-3 px-4 text-center">حالة المخزون</th>
                  <th className="py-3 px-4 text-center">إجمالي القيمة</th>
                  <th className="py-3 px-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredProducts.map((p) => {
                  const margin = p.salePrice - p.costPrice;
                  const marginPercent = p.salePrice > 0 ? (margin / p.salePrice) * 100 : 0;
                  const totalValuation = p.stockQty * p.costPrice;
                  const isLow = p.stockQty <= p.minStockAlert && p.stockQty > 0;
                  const isOut = p.stockQty <= 0;

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-mono-num font-bold text-emerald-400 text-xs">
                          {p.code}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 font-mono-num">
                          <Barcode className="w-3 h-3" />
                          {p.barcode}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{p.nameAr}</div>
                        <div className="text-xs text-slate-400">{p.category}</div>
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-300 text-xs">{p.unit}</td>
                      <td className="py-3.5 px-4 text-center font-mono-num text-slate-300">
                        {p.costPrice.toFixed(2)} {settings.baseCurrency}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono-num font-bold text-emerald-400">
                        {p.salePrice.toFixed(2)} {settings.baseCurrency}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono-num text-xs">
                        <span className="text-purple-400 font-bold">%{marginPercent.toFixed(1)}</span>
                        <div className="text-[10px] text-slate-500">+{margin.toFixed(2)}</div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`font-mono-num font-extrabold text-base px-2 py-0.5 rounded-lg ${
                            isOut
                              ? 'text-red-400 bg-red-950/40 border border-red-500/30'
                              : isLow
                              ? 'text-amber-400 bg-amber-950/40 border border-amber-500/30'
                              : 'text-emerald-400 bg-emerald-950/30'
                          }`}
                        >
                          {p.stockQty}
                        </span>
                        <div className="text-[10px] text-slate-500 mt-0.5">حد الطلب: {p.minStockAlert}</div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {isOut ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                            نفد من المخزون
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <AlertTriangle className="w-3 h-3" />
                            قارب على النفاد
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle className="w-3 h-3" />
                            متوفر
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono-num font-semibold text-slate-200">
                        {totalValuation.toLocaleString('en-US', { minimumFractionDigits: 2 })}{' '}
                        <span className="text-[10px] text-slate-400">{settings.baseCurrency}</span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedProductCard(p)}
                            title="كارت الصنف والحركة"
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                          >
                            <History className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenAdjustment(p)}
                            title="تسوية جردية سريعة"
                            className="p-1.5 rounded-lg bg-slate-800 text-purple-400 hover:bg-purple-950/50 hover:text-purple-300 transition-colors cursor-pointer"
                          >
                            <ClipboardCheck className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            title="تعديل الصنف"
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              openDeleteConfirm({
                                title: 'تأكيد حذف صنف من المخزن',
                                itemName: `الصنف: ${p.nameAr} (${p.code})`,
                                message: `هل أنت متأكد من حذف هذا الصنف من المستودع؟ الرصيد المتوفر حالياً: ${p.stockQty} ${p.unit}.`,
                                onConfirm: () => deleteProduct(p.id),
                              });
                            }}
                            title="حذف الصنف من المخزن"
                            className="p-1.5 rounded-lg bg-slate-800 text-red-400 hover:bg-red-950/50 hover:text-red-300 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Low-Stock & Reorder Alerts Center */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">مركز إدارة نواقص المخزون وإعادة الطلب</h3>
                <p className="text-xs text-slate-300">
                  الأصناف التي وصل رصيدها إلى حد التنبيه أو أقل. يمكنك النقر لطلب التوريد فوراً.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveView('purchases')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors cursor-pointer"
            >
              <Truck className="w-4 h-4" />
              الانتقال إلى فواتير الشراء والتوريد
            </button>
          </div>

          {lowStockItems.length === 0 ? (
            <div className="text-center py-12 rounded-xl bg-slate-900 border border-slate-800 text-slate-400">
              <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <p className="text-base font-bold text-white">المخزون في وضع ممتاز!</p>
              <p className="text-xs text-slate-400 mt-1">لا توجد أصناف تحت حد الطلب حالياً.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lowStockItems.map((p) => {
                const isOut = p.stockQty <= 0;
                const suggestedOrderQty = Math.max(10, p.minStockAlert * 3 - p.stockQty);
                const estimatedCost = suggestedOrderQty * p.costPrice;

                return (
                  <div
                    key={p.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isOut
                        ? 'bg-red-950/20 border-red-500/40 shadow-lg shadow-red-950/20'
                        : 'bg-slate-900 border-amber-500/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-mono-num text-emerald-400">{p.code}</span>
                        <h4 className="font-bold text-white text-sm mt-0.5">{p.nameAr}</h4>
                        <span className="text-xs text-slate-400">{p.category}</span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          isOut ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {isOut ? 'نفد (0)' : 'منخفض'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-4 p-2.5 rounded-lg bg-slate-800/80 text-xs">
                      <div>
                        <span className="text-slate-400">الرصيد الحالي:</span>
                        <span className="font-mono-num font-bold text-white mr-1.5">{p.stockQty} {p.unit}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">حد التنبيه:</span>
                        <span className="font-mono-num font-bold text-amber-400 mr-1.5">{p.minStockAlert} {p.unit}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">سعر الشراء:</span>
                        <span className="font-mono-num text-slate-200 mr-1.5">{p.costPrice} {settings.baseCurrency}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">الكمية المقترحة:</span>
                        <span className="font-mono-num font-bold text-emerald-400 mr-1.5">+{suggestedOrderQty} {p.unit}</span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-2">
                      <div className="text-[11px] text-slate-400">
                        التكلفة التقديرية للطلب: <span className="font-bold text-white font-mono-num">{estimatedCost.toFixed(2)} {settings.baseCurrency}</span>
                      </div>
                      <button
                        onClick={() => setActiveView('purchases')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        طلب توريد
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Stock Movement Ledger (حركة المخزون وتكلفة COGS) */}
      {activeTab === 'movements' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-base">سجل حركة المخزون المستمر (Perpetual Inventory Audit Log)</h3>
              <p className="text-xs text-slate-300">
                تسجيل آلي لجميع حركات الإدخال والإخراج مع تحديث تكلفة المبيعات (COGS) والرصيد اللحظي بعد كل عملية
              </p>
            </div>
            <div className="text-xs text-cyan-300 font-mono-num font-bold bg-cyan-950/60 px-3 py-1.5 rounded-lg border border-cyan-500/30">
              إجمالي الحركات المسجلة: {stockMovements.length}
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900 shadow-xl">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-800/90 text-slate-300 font-bold text-xs uppercase tracking-wider border-b border-slate-700">
                <tr>
                  <th className="py-3 px-4">التاريخ</th>
                  <th className="py-3 px-4">نوع الحركة</th>
                  <th className="py-3 px-4">المرجع / الفاتورة</th>
                  <th className="py-3 px-4">الصنف</th>
                  <th className="py-3 px-4 text-center">الكمية (+ / -)</th>
                  <th className="py-3 px-4 text-center">تكلفة الوحدة</th>
                  <th className="py-3 px-4 text-center">إجمالي التكلفة (COGS)</th>
                  <th className="py-3 px-4 text-center">الرصيد بعد الحركة</th>
                  <th className="py-3 px-4">ملاحظات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {stockMovements.map((m) => {
                  const isOut = m.quantityChange < 0;
                  return (
                    <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono-num text-xs text-slate-400">{m.date}</td>
                      <td className="py-3 px-4">
                        {m.type === 'SALE' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            <ArrowUpRight className="w-3 h-3" />
                            مبيعات (منصرف)
                          </span>
                        )}
                        {m.type === 'PURCHASE' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <ArrowDownLeft className="w-3 h-3" />
                            مشتريات (وارد)
                          </span>
                        )}
                        {m.type === 'INITIAL' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                            رصيد افتتاحي
                          </span>
                        )}
                        {m.type === 'STOCK_ADJUSTMENT_OUT' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                            تسوية جرد - عجز
                          </span>
                        )}
                        {m.type === 'STOCK_ADJUSTMENT_IN' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-teal-500/10 text-teal-400 border border-teal-500/20">
                            تسوية جرد - زيادة
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono-num text-xs font-bold text-slate-200">
                        {m.referenceNumber}
                      </td>
                      <td className="py-3 px-4 font-semibold text-white">{m.productName}</td>
                      <td className="py-3 px-4 text-center font-mono-num font-bold">
                        <span className={isOut ? 'text-red-400' : 'text-emerald-400'}>
                          {m.quantityChange > 0 ? `+${m.quantityChange}` : m.quantityChange}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono-num text-slate-300 text-xs">
                        {m.unitCost.toFixed(2)} {settings.baseCurrency}
                      </td>
                      <td className="py-3 px-4 text-center font-mono-num font-bold text-white text-xs">
                        {m.totalCost.toFixed(2)} {settings.baseCurrency}
                      </td>
                      <td className="py-3 px-4 text-center font-mono-num font-extrabold text-emerald-400">
                        {m.balanceAfter}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-400">{m.notes}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Physical Count & Stock Adjustments (الجرد والتسويات) */}
      {activeTab === 'adjustments' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-base">جرد المستودعات والتسويات المحاسبية الآلية</h3>
              <p className="text-xs text-slate-300">
                تسجيل نتائج الجرد الفعلي، واحتساب الفروقات، وإنشاء قيود تسوية العجز أو الزيادة آلياً في دفتر اليومية
              </p>
            </div>
            <button
              onClick={() => {
                if (products.length > 0) handleOpenAdjustment(products[0]);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              <ClipboardCheck className="w-4 h-4" />
              بدء تسوية جرد جديدة
            </button>
          </div>

          {stockAdjustments.length === 0 ? (
            <div className="text-center py-12 rounded-xl bg-slate-900 border border-slate-800 text-slate-400">
              <ClipboardCheck className="w-12 h-12 text-purple-400 mx-auto mb-3" />
              <p className="text-base font-bold text-white">لم يتم تسجيل تسويات جرد حتى الآن</p>
              <p className="text-xs text-slate-400 mt-1">
                استخدم زر "بدء تسوية جرد" لمطابقة رصيد المستودع الفعلي مع الرصيد الدفتري للنظام.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900 shadow-xl">
              <table className="w-full text-right text-sm">
                <thead className="bg-slate-800/90 text-slate-300 font-bold text-xs uppercase tracking-wider border-b border-slate-700">
                  <tr>
                    <th className="py-3 px-4">رقم التسوية</th>
                    <th className="py-3 px-4">التاريخ</th>
                    <th className="py-3 px-4">الصنف</th>
                    <th className="py-3 px-4 text-center">الرصيد الدفتري</th>
                    <th className="py-3 px-4 text-center">الرصيد الفعلي</th>
                    <th className="py-3 px-4 text-center">فرق الجرد</th>
                    <th className="py-3 px-4 text-center">تكلفة الفارق</th>
                    <th className="py-3 px-4">سبب التسوية</th>
                    <th className="py-3 px-4 text-center">القيد المحاسبي المرتبط</th>
                    <th className="py-3 px-4 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {stockAdjustments.map((adj) => {
                    const isDeficit = adj.differenceQty < 0;
                    return (
                      <tr key={adj.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-mono-num font-bold text-purple-400 text-xs">
                          {adj.adjustmentNumber}
                        </td>
                        <td className="py-3 px-4 font-mono-num text-xs text-slate-400">{adj.date}</td>
                        <td className="py-3 px-4 font-semibold text-white">{adj.productName}</td>
                        <td className="py-3 px-4 text-center font-mono-num text-slate-300">{adj.systemQty}</td>
                        <td className="py-3 px-4 text-center font-mono-num font-bold text-white">{adj.actualQty}</td>
                        <td className="py-3 px-4 text-center font-mono-num font-bold">
                          <span className={isDeficit ? 'text-red-400' : 'text-emerald-400'}>
                            {adj.differenceQty > 0 ? `+${adj.differenceQty}` : adj.differenceQty}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono-num font-bold text-white text-xs">
                          {adj.totalDifferenceCost.toFixed(2)} {settings.baseCurrency}
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-300">{adj.reason}</td>
                        <td className="py-3 px-4 text-center font-mono-num text-xs text-emerald-400">
                          {adj.journalEntryId ? 'مرحّل آلياً بالدفتر' : '-'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => {
                              openDeleteConfirm({
                                title: 'تأكيد حذف تسوية جردية',
                                itemName: `حركة التسوية: ${adj.adjustmentNumber}`,
                                message: `سبب التسوية: ${adj.reason}`,
                                onConfirm: () => deleteStockAdjustment(adj.id),
                              });
                            }}
                            title="حذف حركة التسوية الجردية"
                            className="p-1.5 rounded-lg bg-red-950/40 text-red-400 hover:text-red-300 hover:bg-red-900/60 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: Add / Edit Product */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-4 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-400" />
                {editingProduct ? 'تعديل بيانات الصنف' : 'إضافة صنف جديد إلى المخزون'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-xl font-bold p-1 cursor-pointer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">كود الصنف</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-mono-num"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">الباركود</label>
                  <input
                    type="text"
                    required
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-mono-num"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">اسم الصنف (بالعربية)</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: شاشة سامسونج 55 بوصة"
                  value={formData.nameAr}
                  onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">التصنيف</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">الوحدة</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    سعر التكلفة ({settings.baseCurrency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-mono-num"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-emerald-400 mb-1">
                    سعر البيع ({settings.baseCurrency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.salePrice}
                    onChange={(e) => setFormData({ ...formData, salePrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-emerald-400 font-mono-num font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    الرصيد الافتتاحي بالمستودع
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stockQty}
                    onChange={(e) => setFormData({ ...formData, stockQty: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-mono-num"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-amber-400 mb-1">
                    حد التنبيه (إعادة الطلب)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.minStockAlert}
                    onChange={(e) => setFormData({ ...formData, minStockAlert: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-mono-num"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm cursor-pointer shadow-lg shadow-emerald-600/30"
                >
                  {editingProduct ? 'حفظ التعديلات' : 'إضافة الصنف'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Stock Adjustment (تسوية جردية مع قيد آلي) */}
      {adjustingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-purple-500/30 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-4 bg-purple-950/40 border-b border-purple-500/30 flex items-center justify-between">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-purple-400" />
                تسوية جردية لصنف: {adjustingProduct.nameAr}
              </h3>
              <button
                onClick={() => setAdjustingProduct(null)}
                className="text-slate-400 hover:text-white text-xl font-bold p-1 cursor-pointer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveAdjustment} className="p-5 space-y-4">
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">الرصيد الدفتري الحالي:</span>
                  <span className="font-mono-num font-bold text-white text-sm">
                    {adjustingProduct.stockQty} {adjustingProduct.unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">سعر التكلفة للوحدة:</span>
                  <span className="font-mono-num text-slate-200">
                    {adjustingProduct.costPrice.toFixed(2)} {settings.baseCurrency}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-purple-400 mb-1">
                  الرصيد الفعلي بعد الجرد في المستودع
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={adjForm.actualQty}
                  onChange={(e) => setAdjForm({ ...adjForm, actualQty: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-base font-bold text-white font-mono-num"
                />
              </div>

              {/* Dynamic Discrepancy Preview */}
              {(() => {
                const diff = adjForm.actualQty - adjustingProduct.stockQty;
                const cost = Math.abs(diff) * adjustingProduct.costPrice;
                return (
                  <div
                    className={`p-3 rounded-xl border text-xs ${
                      diff < 0
                        ? 'bg-red-950/30 border-red-500/30 text-red-300'
                        : diff > 0
                        ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400'
                    }`}
                  >
                    <div className="font-bold">
                      {diff < 0 && `عجز مخزني قدره ${Math.abs(diff)} وحدة (بقيمة ${cost.toFixed(2)} ${settings.baseCurrency})`}
                      {diff > 0 && `زيادة مخزنية قدرها +${diff} وحدة (بقيمة ${cost.toFixed(2)} ${settings.baseCurrency})`}
                      {diff === 0 && 'الرصيد مطابق تماماً للدفتري، لا يوجد فارق جرد'}
                    </div>
                    {diff !== 0 && (
                      <div className="text-[11px] mt-1 text-slate-300">
                        سيقوم النظام تلقائياً بإنشاء قيد محاسبي متوازن لمعالجة الفارق في حسابات المخزون والتسوية.
                      </div>
                    )}
                  </div>
                );
              })()}

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">سبب التسوية / ملاحظات الجرد</label>
                <input
                  type="text"
                  required
                  value={adjForm.reason}
                  onChange={(e) => setAdjForm({ ...adjForm, reason: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setAdjustingProduct(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm cursor-pointer shadow-lg shadow-purple-600/30"
                >
                  تأكيد وترحيل التسوية
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Item Card (كارت الصنف التفصيلي) */}
      {selectedProductCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base">كارت الصنف: {selectedProductCard.nameAr}</h3>
                <span className="text-xs font-mono-num text-emerald-400">
                  {selectedProductCard.code} | باركود: {selectedProductCard.barcode}
                </span>
              </div>
              <button
                onClick={() => setSelectedProductCard(null)}
                className="text-slate-400 hover:text-white text-xl font-bold p-1 cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700">
                  <div className="text-[11px] text-slate-400">سعر التكلفة</div>
                  <div className="font-mono-num font-bold text-white text-sm mt-1">
                    {selectedProductCard.costPrice.toFixed(2)} {settings.baseCurrency}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700">
                  <div className="text-[11px] text-slate-400">سعر البيع</div>
                  <div className="font-mono-num font-bold text-emerald-400 text-sm mt-1">
                    {selectedProductCard.salePrice.toFixed(2)} {settings.baseCurrency}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700">
                  <div className="text-[11px] text-slate-400">الرصيد الفعلي</div>
                  <div className="font-mono-num font-extrabold text-cyan-400 text-sm mt-1">
                    {selectedProductCard.stockQty} {selectedProductCard.unit}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700">
                  <div className="text-[11px] text-slate-400">إجمالي التقييم</div>
                  <div className="font-mono-num font-bold text-white text-sm mt-1">
                    {(selectedProductCard.stockQty * selectedProductCard.costPrice).toFixed(2)} {settings.baseCurrency}
                  </div>
                </div>
              </div>

              <h4 className="font-bold text-white text-sm border-b border-slate-800 pb-2">
                سجل الحركات التفصيلية للصنف
              </h4>

              <div className="space-y-2">
                {stockMovements
                  .filter((m) => m.productId === selectedProductCard.id)
                  .map((m) => (
                    <div
                      key={m.id}
                      className="p-3 rounded-xl bg-slate-800/50 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-mono-num text-[11px] text-slate-400">{m.date} - {m.referenceNumber}</div>
                        <div className="font-semibold text-white mt-0.5">{m.notes}</div>
                      </div>
                      <div className="text-left font-mono-num">
                        <div className={`font-bold ${m.quantityChange > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {m.quantityChange > 0 ? `+${m.quantityChange}` : m.quantityChange} {selectedProductCard.unit}
                        </div>
                        <div className="text-slate-400 text-[10px]">الرصيد بعدها: {m.balanceAfter}</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
