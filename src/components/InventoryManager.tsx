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
  Coins,
  Tag,
  DollarSign,
  ArrowRight,
  Boxes,
  FileSpreadsheet,
  Layers3,
  Filter,
  Calendar,
  Building2,
  Sparkles,
} from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import { Product, ProductUnit, ProductComponent } from '../types/accounting';
import { FreeNumberInput } from './FreeNumberInput';
import { useBackHandler } from '../hooks/useBackHandler';
import { DocumentActionsBar } from './DocumentActionsBar';
import { exportProductsToExcel, exportStockMovementsToExcel } from '../utils/excelExport';
import { ProductQuickSearchModal } from './ProductQuickSearchModal';

export const InventoryManager: React.FC = () => {
  const {
    products,
    warehouses,
    branches,
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
    assembleProduct,
    disassembleProduct,
    setActiveView,
    openDeleteConfirm,
    showToast,
  } = useAccounting();

  const [activeTab, setActiveTab] = useState<'items' | 'alerts' | 'movements' | 'adjustments'>('items');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'IN_STOCK' | 'LOW' | 'OUT' | 'GTE' | 'LTE'>('ALL');
  const [filterWarehouse, setFilterWarehouse] = useState<string>('ALL');
  const [filterQtyThreshold, setFilterQtyThreshold] = useState<number>(10);
  const [showQuickSearchModal, setShowQuickSearchModal] = useState(false);

  // Standalone Item Movement Card filters
  const [cardFromDate, setCardFromDate] = useState<string>('');
  const [cardToDate, setCardToDate] = useState<string>('');
  const [cardMovementType, setCardMovementType] = useState<string>('ALL');
  const [cardSearchRef, setCardSearchRef] = useState<string>('');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [selectedProductCard, setSelectedProductCard] = useState<Product | null>(null);
  const [assemblyProduct, setAssemblyProduct] = useState<Product | null>(null);
  const [assemblyQty, setAssemblyQty] = useState<number>(1);
  const [assemblyMode, setAssemblyMode] = useState<'ASSEMBLE' | 'DISASSEMBLE'>('ASSEMBLE');

  // Android back button and swipe gestures
  useBackHandler({
    isOpen: Boolean(assemblyProduct),
    onClose: () => setAssemblyProduct(null),
    stateKey: 'invAssemblyModal',
  });
  useBackHandler({
    isOpen: showAddModal,
    onClose: () => setShowAddModal(false),
    stateKey: 'invAddModal',
  });

  useBackHandler({
    isOpen: Boolean(adjustingProduct),
    onClose: () => setAdjustingProduct(null),
    stateKey: 'invAdjModal',
  });

  useBackHandler({
    isOpen: Boolean(selectedProductCard),
    onClose: () => setSelectedProductCard(null),
    stateKey: 'invCardModal',
  });

  // New/Edit product form state
  const [formData, setFormData] = useState({
    code: '',
    barcode: '',
    nameAr: '',
    category: 'عام',
    unit: 'حبة',
    costPrice: 0,
    salePrice: 0,
    wholesalePrice: 0,
    specialPrice: 0,
    stockQty: 0,
    reservedQty: 0,
    minStockAlert: 5,
    taxRate: 0.15,
    units: [] as ProductUnit[],
    isComposite: false,
    components: [] as ProductComponent[],
  });

  // Stock Adjustment form state
  const [adjForm, setAdjForm] = useState({
    actualQty: 0,
    reason: 'جرد دوري للمستودع وتصحيح الفروقات',
  });

  const categories = ['ALL', ...Array.from(new Set(products.map((p) => p.category)))];

  // Advanced Filter products (Onyx Pro)
  const filteredProducts = products.filter((p) => {
    const term = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !term ||
      p.nameAr.toLowerCase().includes(term) ||
      p.code.toLowerCase().includes(term) ||
      p.barcode.toLowerCase().includes(term) ||
      (p.category && p.category.toLowerCase().includes(term));

    const matchesCategory = filterCategory === 'ALL' || p.category === filterCategory;

    let matchesStatus = true;
    if (filterStatus === 'OUT') matchesStatus = p.stockQty <= 0;
    else if (filterStatus === 'LOW') matchesStatus = p.stockQty > 0 && p.stockQty <= p.minStockAlert;
    else if (filterStatus === 'IN_STOCK') matchesStatus = p.stockQty > p.minStockAlert;
    else if (filterStatus === 'GTE') matchesStatus = p.stockQty >= filterQtyThreshold;
    else if (filterStatus === 'LTE') matchesStatus = p.stockQty <= filterQtyThreshold;

    let matchesWarehouse = true;
    if (filterWarehouse !== 'ALL') {
      const whQty = p.warehouseStocks?.[filterWarehouse] ?? 0;
      matchesWarehouse = whQty > 0;
    }

    return matchesSearch && matchesCategory && matchesStatus && matchesWarehouse;
  });

  // Filtered Summary Metrics for Header/Bar
  const filteredTotalUnits = filteredProducts.reduce((sum, p) => sum + p.stockQty, 0);
  const filteredTotalCost = filteredProducts.reduce((sum, p) => sum + (p.stockQty * p.costPrice), 0);
  const filteredTotalSalesVal = filteredProducts.reduce((sum, p) => sum + (p.stockQty * p.salePrice), 0);

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
      wholesalePrice: 0,
      specialPrice: 0,
      stockQty: 0,
      reservedQty: 0,
      minStockAlert: 5,
      taxRate: settings.defaultTaxRate,
      units: [],
      isComposite: false,
      components: [],
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
      wholesalePrice: p.wholesalePrice ?? p.salePrice,
      specialPrice: p.specialPrice ?? p.wholesalePrice ?? p.salePrice,
      stockQty: p.stockQty,
      reservedQty: p.reservedQty || 0,
      minStockAlert: p.minStockAlert,
      taxRate: p.taxRate,
      units: p.units ? [...p.units] : [],
      isComposite: Boolean(p.isComposite),
      components: p.components ? [...p.components] : [],
    });
    setShowAddModal(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nameAr.trim()) return;

    const costNum = Number(formData.costPrice) || 0;
    const saleNum = Number(formData.salePrice) || 0;
    const wholesaleNum = Number(formData.wholesalePrice) || saleNum;
    const specialNum = Number(formData.specialPrice) || wholesaleNum || saleNum;

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        ...formData,
        costPrice: costNum,
        salePrice: saleNum,
        wholesalePrice: wholesaleNum,
        specialPrice: specialNum,
        stockQty: Number(formData.stockQty),
        reservedQty: Number(formData.reservedQty || 0),
        minStockAlert: Number(formData.minStockAlert),
      });
    } else {
      addProduct({
        ...formData,
        costPrice: costNum,
        salePrice: saleNum,
        wholesalePrice: wholesaleNum,
        specialPrice: specialNum,
        stockQty: Number(formData.stockQty),
        reservedQty: Number(formData.reservedQty || 0),
        minStockAlert: Number(formData.minStockAlert),
      });
    }

    setShowAddModal(false);
  };

  const handleAssembleDisassemble = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assemblyProduct || assemblyQty <= 0) return;
    if (assemblyMode === 'ASSEMBLE') {
      const res = assembleProduct(assemblyProduct.id, assemblyQty);
      if (!res.success) {
        showToast(res.message, 'error');
        return;
      }
    } else {
      const res = disassembleProduct(assemblyProduct.id, assemblyQty);
      if (!res.success) {
        showToast(res.message, 'error');
        return;
      }
    }
    setAssemblyProduct(null);
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
    <div className="space-y-6 pb-28 sm:pb-12">
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

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => exportProductsToExcel(products, settings.baseCurrency)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs cursor-pointer transition-all shadow-sm"
              title="تصدير جدول المخزون بالكامل إلى ملف Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>تصدير Excel</span>
            </button>
            <button
              onClick={() => setActiveView('stock_operations')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs cursor-pointer transition-all shadow-sm"
              title="التحويلات المخزنية وأذون الإدخال والإخراج"
            >
              <Truck className="w-4 h-4 text-cyan-400" />
              <span>التحويلات والأذون</span>
            </button>
            <DocumentActionsBar
              targetElementId="inventory-report-content"
              filename={`تقرير_المخزون_وتقييم_البضاعة_${settings.companyName}`}
              documentTitle="تقرير تقييم المخزون وبضاعة آخر المدة وتكلفة المبيعات"
              hasData={products.length > 0}
            />
            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              إضافة صنف جديد
            </button>
          </div>
        </div>
      </div>

      <div id="inventory-report-content" className="space-y-6 printable-card">
        {/* Printable Inventory Valuation Header */}
        <div className="hidden print:block text-center border-b-2 border-slate-900 pb-4 text-black">
          <h2 className="text-2xl font-black">{settings.companyName}</h2>
          <div className="text-xs font-mono-num mt-1">الرقم الضريبي: {settings.taxNumber} | س.ت: {settings.commercialRecord}</div>
          <h3 className="text-lg font-bold mt-2">تقرير تقييم المخزون وبضاعة آخر المدة وتكلفة المبيعات (COGS)</h3>
          <div className="text-xs text-slate-600 font-mono-num mt-1">
            التاريخ: {new Date().toISOString().split('T')[0]} | عدد الأصناف: {products.length} صنف | العملة: {settings.baseCurrency}
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
        <div className="space-y-3">
          {/* Advanced Search & Filters Bar (Onyx Pro) */}
          <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 shadow-lg space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 flex-1 min-w-[280px]">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="بحث متقدم بالاسم، الكود (PRD-...)، أو الباركود..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-3 pr-9 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-inner"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-bold bg-slate-800 px-1.5 py-0.5 rounded cursor-pointer"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Category Filter */}
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c === 'ALL' ? 'جميع التصنيفات' : c}
                    </option>
                  ))}
                </select>

                {/* Warehouse Filter */}
                {warehouses.length > 0 && (
                  <select
                    value={filterWarehouse}
                    onChange={(e) => setFilterWarehouse(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="ALL">جميع المستودعات</option>
                    {warehouses.map((wh) => (
                      <option key={wh.id} value={wh.id}>
                        مستودع: {wh.nameAr}
                      </option>
                    ))}
                  </select>
                )}

                {/* Stock Status & Quantity Operators */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
                >
                  <option value="ALL">جميع حالات المخزون</option>
                  <option value="IN_STOCK">متوفر بكمية جيدة</option>
                  <option value="LOW">قارب على النفاد (حد الطلب)</option>
                  <option value="OUT">نفد من المخزون (0)</option>
                  <option value="GTE">الكمية أكبر أو تساوي (&gt;=)</option>
                  <option value="LTE">الكمية أقل أو تساوي (&lt;=)</option>
                </select>

                {(filterStatus === 'GTE' || filterStatus === 'LTE') && (
                  <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-xl px-2 py-1">
                    <span className="text-[11px] text-slate-400">الحد:</span>
                    <input
                      type="number"
                      min="0"
                      value={filterQtyThreshold}
                      onChange={(e) => setFilterQtyThreshold(parseInt(e.target.value) || 0)}
                      className="w-14 bg-transparent text-white font-mono-num font-bold text-xs focus:outline-none text-center"
                    />
                  </div>
                )}
              </div>

              {/* Quick Search Modal Opener */}
              <button
                type="button"
                onClick={() => setShowQuickSearchModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-950/60 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-900/60 border border-emerald-500/40 text-xs font-bold cursor-pointer transition-all shadow-sm shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>نافذة البحث السريع (أونكس برو)</span>
              </button>
            </div>

            {/* Filtered Dynamic Metrics Strip */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-slate-700/60 text-xs">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-slate-400">
                  الأصناف المعروضة: <strong className="text-white font-mono-num font-bold">{filteredProducts.length}</strong> من إجمالي {products.length}
                </span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-400">
                  إجمالي الوحدات المتوفرة: <strong className="text-cyan-400 font-mono-num font-bold">{filteredTotalUnits.toLocaleString()}</strong> وحدة
                </span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-400">
                  القيمة بالتكلفة: <strong className="text-emerald-400 font-mono-num font-bold">{filteredTotalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong> {settings.baseCurrency}
                </span>
              </div>

              {(searchQuery || filterCategory !== 'ALL' || filterStatus !== 'ALL' || filterWarehouse !== 'ALL') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setFilterCategory('ALL');
                    setFilterStatus('ALL');
                    setFilterWarehouse('ALL');
                  }}
                  className="text-amber-400 hover:text-amber-300 text-[11px] font-bold cursor-pointer underline"
                >
                  إعادة تعيين الفلاتر
                </button>
              )}
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
                  <th className="py-3 px-4 text-center min-w-[150px]">أسعار البيع (تجزئة / جملة)</th>
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
                      <td className="py-3.5 px-4 text-center font-mono-num">
                        <div className="font-black text-emerald-400 text-sm">
                          {p.salePrice.toFixed(2)} <span className="text-[10px] text-slate-400">{settings.baseCurrency}</span>
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-1 mt-1 text-[10px]">
                          <span className="px-1.5 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 font-bold" title="سعر الجملة">
                            جملة: {(p.wholesalePrice ?? p.salePrice).toFixed(2)}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-500/30 font-bold" title="سعر جملة الجملة">
                            جملة الجملة: {(p.specialPrice ?? p.wholesalePrice ?? p.salePrice).toFixed(2)}
                          </span>
                        </div>
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
                        <div className="text-[10px] text-slate-400 mt-1 font-mono-num">
                          متاح للبيع: <span className="text-emerald-400 font-bold">{Math.max(0, p.stockQty - (p.reservedQty || 0))}</span>
                        </div>
                        {(p.reservedQty || 0) > 0 && (
                          <div className="text-[10px] text-amber-400 font-mono-num">
                            محجوز: {p.reservedQty}
                          </div>
                        )}
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
                          {p.isComposite && (
                            <button
                              onClick={() => {
                                setAssemblyProduct(p);
                                setAssemblyQty(1);
                                setAssemblyMode('ASSEMBLE');
                              }}
                              title="تجميع / تفكيك الصنف المركب (BOM)"
                              className="p-1.5 rounded-lg bg-purple-950/50 text-purple-300 hover:bg-purple-900 border border-purple-500/40 transition-colors cursor-pointer"
                            >
                              <Boxes className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedProductCard(p)}
                            title="كارت الصنف والحركة التفصيلية"
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
      </div>

      {/* MODAL 1: Add / Edit Product */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex flex-col justify-start sm:justify-center items-center bg-black/80 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto overscroll-contain touch-pan-y">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[92dvh] my-auto overscroll-contain overflow-hidden">
            <div className="p-4 bg-slate-800/95 backdrop-blur-sm border-b border-slate-700 flex items-center justify-between shrink-0">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-400" />
                {editingProduct ? 'تعديل بيانات الصنف' : 'إضافة صنف جديد إلى المخزون'}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold border border-slate-700 cursor-pointer transition-all active:scale-95 shadow-sm"
                  title="الرجوع إلى الخلف"
                >
                  <ArrowRight className="w-4 h-4 text-emerald-400" />
                  <span>رجوع للخلف</span>
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-400 hover:text-white text-xl font-bold p-1 cursor-pointer"
                >
                  ×
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveProduct} className="p-4 sm:p-5 space-y-4 overflow-y-auto overscroll-contain flex-1 pb-52 sm:pb-6 touch-pan-y">
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

              {/* Pricing Tiers Box (سعر التكلفة، سعر التجزئة، سعر الجملة، سعر جملة الجملة) */}
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    <span>أسعار الصنف ({settings.baseCurrency})</span>
                  </span>
                  <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/30">
                    تجزئة • جملة • جملة الجملة
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      سعر التكلفة ({settings.baseCurrency})
                    </label>
                    <FreeNumberInput
                      value={formData.costPrice}
                      onChange={(val) => setFormData({ ...formData, costPrice: val })}
                      placeholder="0.00"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-emerald-400 mb-1">
                      سعر البيع (مفرق / تجزئة)
                    </label>
                    <FreeNumberInput
                      value={formData.salePrice}
                      onChange={(val) => {
                        setFormData({
                          ...formData,
                          salePrice: val,
                          wholesalePrice: formData.wholesalePrice === 0 ? val : formData.wholesalePrice,
                          specialPrice: formData.specialPrice === 0 ? val : formData.specialPrice,
                        });
                      }}
                      placeholder="0.00"
                      className="w-full px-3 py-2 bg-slate-800 border border-emerald-500/60 focus:border-emerald-400 rounded-lg text-sm text-emerald-400 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-700/60">
                  <div>
                    <label className="block text-xs font-bold text-cyan-400 mb-1 flex items-center justify-between">
                      <span>سعر الجملة</span>
                      <span className="text-[10px] text-slate-400 font-normal">Wholesale</span>
                    </label>
                    <FreeNumberInput
                      value={formData.wholesalePrice}
                      onChange={(val) => setFormData({ ...formData, wholesalePrice: val })}
                      placeholder="0.00"
                      className="w-full px-3 py-2 bg-slate-800 border border-cyan-500/40 focus:border-cyan-400 rounded-lg text-sm text-cyan-300 font-bold"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      سعر البيع للعملاء التجاريين والموزعين
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-amber-400 mb-1 flex items-center justify-between">
                      <span>سعر جملة الجملة</span>
                      <span className="text-[10px] text-slate-400 font-normal">Super Wholesale</span>
                    </label>
                    <FreeNumberInput
                      value={formData.specialPrice}
                      onChange={(val) => setFormData({ ...formData, specialPrice: val })}
                      placeholder="0.00"
                      className="w-full px-3 py-2 bg-slate-800 border border-amber-500/40 focus:border-amber-400 rounded-lg text-sm text-amber-300 font-bold"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      سعر خاص لكبار التجار والكميات الضخمة
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    الرصيد الافتتاحي بالمستودع
                  </label>
                  <FreeNumberInput
                    value={formData.stockQty}
                    onChange={(val) => setFormData({ ...formData, stockQty: val })}
                    allowDecimals={false}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-amber-400 mb-1">
                    حد التنبيه (إعادة الطلب)
                  </label>
                  <FreeNumberInput
                    value={formData.minStockAlert}
                    onChange={(val) => setFormData({ ...formData, minStockAlert: val || 1 })}
                    allowDecimals={false}
                    placeholder="5"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white"
                  />
                </div>
              </div>
              {/* Multi-Units of Measure Box (وحدات القياس المتعددة ومعاملات التحويل) */}
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Layers3 className="w-4 h-4 text-cyan-400" />
                    <span>وحدات القياس المتعددة للصنف (حبة، كرتون، علبة...)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        units: [
                          ...formData.units,
                          {
                            id: `unit-${Date.now()}`,
                            name: 'كرتون',
                            factor: 12,
                            salePrice: (formData.salePrice || 0) * 12,
                            barcode: '',
                          },
                        ],
                      });
                    }}
                    className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 bg-cyan-950/60 px-2 py-1 rounded-lg border border-cyan-500/30 cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    إضافة وحدة جديدة
                  </button>
                </div>

                {formData.units.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    الوحدة الأساسية الحالية: <span className="text-emerald-400 font-bold">{formData.unit}</span>. يمكنك إضافة وحدات كبرى أو صغرى (كرتون = 12 حبة، إلخ).
                  </p>
                ) : (
                  <div className="space-y-2">
                    {formData.units.map((u, idx) => (
                      <div key={u.id} className="grid grid-cols-4 gap-2 items-center bg-slate-900/60 p-2 rounded-lg border border-slate-700/50 text-xs">
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">اسم الوحدة</label>
                          <input
                            type="text"
                            value={u.name}
                            onChange={(e) => {
                              const updated = [...formData.units];
                              updated[idx].name = e.target.value;
                              setFormData({ ...formData, units: updated });
                            }}
                            className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">معامل التحويل (كم {formData.unit})</label>
                          <input
                            type="number"
                            min="1"
                            value={u.factor}
                            onChange={(e) => {
                              const updated = [...formData.units];
                              updated[idx].factor = parseFloat(e.target.value) || 1;
                              setFormData({ ...formData, units: updated });
                            }}
                            className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-white font-mono-num font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">سعر بيع الوحدة</label>
                          <input
                            type="number"
                            value={u.salePrice || 0}
                            onChange={(e) => {
                              const updated = [...formData.units];
                              updated[idx].salePrice = parseFloat(e.target.value) || 0;
                              setFormData({ ...formData, units: updated });
                            }}
                            className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-emerald-400 font-mono-num font-bold"
                          />
                        </div>
                        <div className="flex items-end gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                units: formData.units.filter((_, i) => i !== idx),
                              });
                            }}
                            className="p-1 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded cursor-pointer mt-3"
                            title="حذف الوحدة"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Composite Item & BOM Box (الأصناف المركبة والتجميع والتفكيك) */}
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-white">
                    <input
                      type="checkbox"
                      checked={formData.isComposite}
                      onChange={(e) => setFormData({ ...formData, isComposite: e.target.checked })}
                      className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 bg-slate-900 border-slate-700"
                    />
                    <span className="flex items-center gap-1.5">
                      <Boxes className="w-4 h-4 text-purple-400" />
                      <span>صنف مركب يتم تجميعه من أصناف أخرى (BOM)</span>
                    </span>
                  </label>

                  {formData.isComposite && (
                    <button
                      type="button"
                      onClick={() => {
                        const availableRaw = products.filter((p) => p.id !== editingProduct?.id);
                        if (availableRaw.length > 0) {
                          setFormData({
                            ...formData,
                            components: [
                              ...formData.components,
                              {
                                productId: availableRaw[0].id,
                                productName: availableRaw[0].nameAr,
                                quantity: 1,
                                unit: availableRaw[0].unit,
                              },
                            ],
                          });
                        }
                      }}
                      className="text-[11px] font-bold text-purple-400 hover:text-purple-300 bg-purple-950/60 px-2 py-1 rounded-lg border border-purple-500/30 cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      إضافة مكون للصنف
                    </button>
                  )}
                </div>

                {formData.isComposite && (
                  <div className="space-y-2 pt-2 border-t border-slate-700/60">
                    {formData.components.length === 0 ? (
                      <p className="text-xs text-slate-400">
                        لم يتم تحديد مكونات بعد. انقر على "إضافة مكون للصنف" لاختيار المواد المكونة.
                      </p>
                    ) : (
                      formData.components.map((c, idx) => (
                        <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-slate-900/60 p-2 rounded-lg border border-slate-700/50 text-xs">
                          <div className="col-span-7">
                            <label className="text-[10px] text-slate-400 block mb-0.5">الصنف المكون</label>
                            <select
                              value={c.productId}
                              onChange={(e) => {
                                const selected = products.find((p) => p.id === e.target.value);
                                const updated = [...formData.components];
                                updated[idx] = {
                                  ...updated[idx],
                                  productId: e.target.value,
                                  productName: selected?.nameAr || '',
                                  unit: selected?.unit || 'حبة',
                                };
                                setFormData({ ...formData, components: updated });
                              }}
                              className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-white"
                            >
                              {products
                                .filter((p) => p.id !== editingProduct?.id)
                                .map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {p.nameAr} (متوفر: {p.stockQty} {p.unit})
                                  </option>
                                ))}
                            </select>
                          </div>
                          <div className="col-span-4">
                            <label className="text-[10px] text-slate-400 block mb-0.5">الكمية المطلوبة للوحدة</label>
                            <input
                              type="number"
                              min="0.01"
                              step="0.01"
                              value={c.quantity}
                              onChange={(e) => {
                                const updated = [...formData.components];
                                updated[idx].quantity = parseFloat(e.target.value) || 1;
                                setFormData({ ...formData, components: updated });
                              }}
                              className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-white font-mono-num font-bold"
                            />
                          </div>
                          <div className="col-span-1 flex items-end justify-center">
                            <button
                              type="button"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  components: formData.components.filter((_, i) => i !== idx),
                                });
                              }}
                              className="p-1 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded cursor-pointer mt-3"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
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

      {/* MODAL: BOM Assembly / Disassembly (تجميع وتفكيك الأصناف المركبة) */}
      {assemblyProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-purple-500/40 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-4 bg-purple-950/50 border-b border-purple-500/30 flex items-center justify-between">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Boxes className="w-5 h-5 text-purple-400" />
                تجميع وتفكيك الصنف المركب: {assemblyProduct.nameAr}
              </h3>
              <button
                onClick={() => setAssemblyProduct(null)}
                className="text-slate-400 hover:text-white text-xl font-bold p-1 cursor-pointer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAssembleDisassemble} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setAssemblyMode('ASSEMBLE')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    assemblyMode === 'ASSEMBLE'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  تجميع وحدات جديدة (إضافة للمخزون)
                </button>
                <button
                  type="button"
                  onClick={() => setAssemblyMode('DISASSEMBLE')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    assemblyMode === 'DISASSEMBLE'
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  تفكيك وإرجاع المكونات للمستودع
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  الكمية المراد {assemblyMode === 'ASSEMBLE' ? 'تجميعها' : 'تفكيكها'} ({assemblyProduct.unit})
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={assemblyQty}
                  onChange={(e) => setAssemblyQty(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-slate-800 border border-purple-500/50 rounded-lg text-lg font-bold text-white font-mono-num"
                />
              </div>

              {/* Bill of materials preview */}
              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
                <span className="text-xs font-bold text-purple-300 block mb-1">
                  المكونات المطلوبة لحركة {assemblyMode === 'ASSEMBLE' ? 'التجميع' : 'التفكيك'}:
                </span>
                <div className="space-y-1.5">
                  {assemblyProduct.components?.map((comp, idx) => {
                    const compProd = products.find((p) => p.id === comp.productId);
                    const needed = comp.quantity * assemblyQty;
                    const hasEnough = (compProd?.stockQty || 0) >= needed;
                    return (
                      <div key={idx} className="flex justify-between items-center text-xs bg-slate-900/60 p-2 rounded-lg">
                        <span className="text-slate-200">{comp.productName || compProd?.nameAr}</span>
                        <div className="text-left font-mono-num">
                          <span className="text-slate-300 font-bold">{needed} {compProd?.unit || 'وحدة'}</span>
                          <span className="text-[10px] text-slate-500 mr-2">
                            (المتوفر: {compProd?.stockQty || 0})
                          </span>
                          {assemblyMode === 'ASSEMBLE' && !hasEnough && (
                            <span className="text-[10px] text-red-400 font-bold block">مخزون غير كافٍ!</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setAssemblyProduct(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm cursor-pointer shadow-lg shadow-purple-600/30"
                >
                  تأكيد {assemblyMode === 'ASSEMBLE' ? 'التجميع والترحيل' : 'التفكيك والترحيل'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Item Card (شاشة كارت حركة الصنف المستقلة وفق نظام أونكس برو) */}
      {selectedProductCard && (() => {
        const allProductMovements = stockMovements.filter((m) => m.productId === selectedProductCard.id);
        const sortedMovements = [...allProductMovements].sort((a, b) => (a.date > b.date ? 1 : -1));

        // Calculate opening balance before cardFromDate
        let openingBalance = 0;
        if (cardFromDate) {
          const priorMovements = sortedMovements.filter((m) => m.date < cardFromDate);
          if (priorMovements.length > 0) {
            openingBalance = priorMovements[priorMovements.length - 1].balanceAfter;
          }
        } else if (sortedMovements.length > 0) {
          openingBalance = sortedMovements[0].type === 'INITIAL' ? sortedMovements[0].quantityChange : 0;
        }

        // Filter movements
        const filteredCardMovements = sortedMovements.filter((m) => {
          if (cardFromDate && m.date < cardFromDate) return false;
          if (cardToDate && m.date > cardToDate) return false;
          if (cardMovementType !== 'ALL' && m.type !== cardMovementType) return false;
          if (cardSearchRef) {
            const q = cardSearchRef.toLowerCase();
            const matchRef = m.referenceNumber.toLowerCase().includes(q);
            const matchNote = (m.notes || '').toLowerCase().includes(q);
            if (!matchRef && !matchNote) return false;
          }
          return true;
        });

        const totalIn = filteredCardMovements
          .filter((m) => m.quantityChange > 0)
          .reduce((sum, m) => sum + m.quantityChange, 0);

        const totalOut = filteredCardMovements
          .filter((m) => m.quantityChange < 0)
          .reduce((sum, m) => sum + Math.abs(m.quantityChange), 0);

        const netChange = totalIn - totalOut;
        const closingBalance = filteredCardMovements.length > 0
          ? filteredCardMovements[filteredCardMovements.length - 1].balanceAfter
          : openingBalance;

        // Date Presets helper
        const setPreset = (preset: 'TODAY' | 'WEEK' | 'MONTH' | 'ALL') => {
          const now = new Date();
          const toStr = now.toISOString().split('T')[0];
          if (preset === 'ALL') {
            setCardFromDate('');
            setCardToDate('');
          } else if (preset === 'TODAY') {
            setCardFromDate(toStr);
            setCardToDate(toStr);
          } else if (preset === 'WEEK') {
            const d = new Date();
            d.setDate(d.getDate() - 7);
            setCardFromDate(d.toISOString().split('T')[0]);
            setCardToDate(toStr);
          } else if (preset === 'MONTH') {
            const d = new Date();
            d.setDate(1);
            setCardFromDate(d.toISOString().split('T')[0]);
            setCardToDate(toStr);
          }
        };

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden max-h-[94vh] flex flex-col">
              {/* Header */}
              <div className="p-4 bg-slate-800/95 border-b border-slate-700 flex flex-wrap items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <History className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base flex items-center gap-2">
                      كارت حركة الصنف: {selectedProductCard.nameAr}
                      <span className="text-xs font-mono-num text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                        {selectedProductCard.code}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 font-mono-num mt-0.5">
                      باركود: {selectedProductCard.barcode || '-'} | الوحدة: {selectedProductCard.unit} | التصنيف: {selectedProductCard.category}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      exportStockMovementsToExcel(filteredCardMovements, selectedProductCard.nameAr);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600 text-xs font-bold cursor-pointer transition-all shadow-sm"
                    title="تصدير كارت حركة الصنف المفلترة إلى Excel"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    <span>تصدير Excel</span>
                  </button>

                  <DocumentActionsBar
                    targetElementId="product-card-print-area"
                    filename={`كارت_حركة_${selectedProductCard.nameAr}`}
                    documentTitle={`كارت حركة الصنف التفصيلي: ${selectedProductCard.nameAr}`}
                    hasData={filteredCardMovements.length > 0}
                  />

                  <button
                    type="button"
                    onClick={() => setSelectedProductCard(null)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold border border-slate-600 cursor-pointer transition-all active:scale-95"
                  >
                    <ArrowRight className="w-4 h-4 text-emerald-400" />
                    <span>إغلاق</span>
                  </button>
                </div>
              </div>

              {/* Filter Controls Bar (Date Range, Presets, Movement Type) */}
              <div className="p-3.5 bg-slate-950/80 border-b border-slate-800 space-y-2.5 shrink-0 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-slate-400 font-bold flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                      الفترة:
                    </span>
                    <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1">
                      <span className="text-[10px] text-slate-400">من:</span>
                      <input
                        type="date"
                        value={cardFromDate}
                        onChange={(e) => setCardFromDate(e.target.value)}
                        className="bg-transparent text-white text-xs focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1">
                      <span className="text-[10px] text-slate-400">إلى:</span>
                      <input
                        type="date"
                        value={cardToDate}
                        onChange={(e) => setCardToDate(e.target.value)}
                        className="bg-transparent text-white text-xs focus:outline-none"
                      />
                    </div>

                    {/* Presets */}
                    <div className="inline-flex rounded-lg bg-slate-900 p-0.5 border border-slate-700">
                      <button
                        type="button"
                        onClick={() => setPreset('TODAY')}
                        className="px-2 py-1 rounded text-[11px] font-bold text-slate-300 hover:text-white cursor-pointer"
                      >
                        اليوم
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreset('WEEK')}
                        className="px-2 py-1 rounded text-[11px] font-bold text-slate-300 hover:text-white cursor-pointer"
                      >
                        آخر 7 أيام
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreset('MONTH')}
                        className="px-2 py-1 rounded text-[11px] font-bold text-slate-300 hover:text-white cursor-pointer"
                      >
                        هذا الشهر
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreset('ALL')}
                        className="px-2 py-1 rounded text-[11px] font-bold text-emerald-400 hover:text-emerald-300 cursor-pointer"
                      >
                        كافة الفترات
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Movement Type Filter */}
                    <select
                      value={cardMovementType}
                      onChange={(e) => setCardMovementType(e.target.value)}
                      className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-emerald-500"
                    >
                      <option value="ALL">جميع أنواع الحركات</option>
                      <option value="INITIAL">رصيد افتتاحي</option>
                      <option value="PURCHASE">وارد مشتريات</option>
                      <option value="SALE">منصرف مبيعات</option>
                      <option value="SALES_RETURN">مردود مبيعات</option>
                      <option value="PURCHASE_RETURN">مردود مشتريات</option>
                      <option value="ADJUSTMENT">تسوية جردية</option>
                      <option value="TRANSFER_IN">تحويل وارد</option>
                      <option value="TRANSFER_OUT">تحويل صادر</option>
                      <option value="ASSEMBLY_IN">تجميع صنف (BOM)</option>
                      <option value="ASSEMBLY_OUT">استهلاك تجميع</option>
                    </select>

                    {/* Search ref */}
                    <input
                      type="text"
                      placeholder="بحث برقم السند أو البيان..."
                      value={cardSearchRef}
                      onChange={(e) => setCardSearchRef(e.target.value)}
                      className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-emerald-500 w-44"
                    />
                  </div>
                </div>
              </div>

              {/* Printable Body Content */}
              <div id="product-card-print-area" className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
                {/* Printable Header Info */}
                <div className="hidden print:block text-center border-b pb-3 mb-3 text-black">
                  <h2 className="text-xl font-bold">{settings.companyName}</h2>
                  <h3 className="text-base font-bold mt-1">كارت حركة الصنف: {selectedProductCard.nameAr} ({selectedProductCard.code})</h3>
                  <div className="text-xs text-slate-600 font-mono-num mt-1">
                    الوحدة: {selectedProductCard.unit} | التكلفة: {selectedProductCard.costPrice.toFixed(2)} | البيع: {selectedProductCard.salePrice.toFixed(2)}
                  </div>
                </div>

                {/* Stock Balances & Status Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5 text-center">
                  <div className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700">
                    <div className="text-[11px] text-slate-400">سعر التكلفة</div>
                    <div className="font-mono-num font-bold text-white text-sm mt-1">
                      {selectedProductCard.costPrice.toFixed(2)} {settings.baseCurrency}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-800/70 border border-emerald-500/30">
                    <div className="text-[11px] text-emerald-400">سعر التجزئة</div>
                    <div className="font-mono-num font-bold text-emerald-400 text-sm mt-1">
                      {selectedProductCard.salePrice.toFixed(2)} {settings.baseCurrency}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-800/70 border border-cyan-500/30">
                    <div className="text-[11px] text-cyan-400">سعر الجملة</div>
                    <div className="font-mono-num font-bold text-cyan-300 text-sm mt-1">
                      {(selectedProductCard.wholesalePrice ?? selectedProductCard.salePrice).toFixed(2)} {settings.baseCurrency}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700">
                    <div className="text-[11px] text-slate-400">الرصيد الفعلي الحالي</div>
                    <div className="font-mono-num font-extrabold text-cyan-400 text-sm mt-1">
                      {selectedProductCard.stockQty} {selectedProductCard.unit}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-800/70 border border-emerald-500/40">
                    <div className="text-[11px] text-emerald-400">المتاح للبيع</div>
                    <div className="font-mono-num font-extrabold text-emerald-300 text-sm mt-1">
                      {Math.max(0, selectedProductCard.stockQty - (selectedProductCard.reservedQty || 0))} {selectedProductCard.unit}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-800/70 border border-amber-500/40">
                    <div className="text-[11px] text-amber-400">الكمية المحجوزة</div>
                    <div className="font-mono-num font-bold text-amber-300 text-sm mt-1">
                      {selectedProductCard.reservedQty || 0} {selectedProductCard.unit}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700">
                    <div className="text-[11px] text-slate-400">إجمالي التقييم</div>
                    <div className="font-mono-num font-bold text-white text-sm mt-1">
                      {(selectedProductCard.stockQty * selectedProductCard.costPrice).toFixed(2)} {settings.baseCurrency}
                    </div>
                  </div>
                </div>

                {/* Period Movement Statistics Card (أونكس برو: ملخص حركة الفترة) */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-800/90 to-slate-900 border border-slate-700/80 shadow-md">
                  <div className="text-xs font-bold text-slate-300 mb-2 flex items-center justify-between">
                    <span>ملخص حركة الصنف خلال الفترة المحددة:</span>
                    <span className="text-slate-400 font-mono-num">
                      عدد العمليات: <strong className="text-white">{filteredCardMovements.length}</strong> حركة
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs font-mono-num">
                    <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block mb-0.5">رصيد بداية الفترة</span>
                      <strong className="text-white text-sm font-bold">{openingBalance} {selectedProductCard.unit}</strong>
                    </div>
                    <div className="bg-slate-900/80 p-2 rounded-xl border border-emerald-500/30">
                      <span className="text-[10px] text-emerald-400 block mb-0.5">إجمالي الوارد (+)</span>
                      <strong className="text-emerald-400 text-sm font-bold">+{totalIn} {selectedProductCard.unit}</strong>
                    </div>
                    <div className="bg-slate-900/80 p-2 rounded-xl border border-red-500/30">
                      <span className="text-[10px] text-red-400 block mb-0.5">إجمالي المنصرف (-)</span>
                      <strong className="text-red-400 text-sm font-bold">-{totalOut} {selectedProductCard.unit}</strong>
                    </div>
                    <div className="bg-slate-900/80 p-2 rounded-xl border border-purple-500/30">
                      <span className="text-[10px] text-purple-300 block mb-0.5">صافي حركة الفترة</span>
                      <strong className={`text-sm font-bold ${netChange >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                        {netChange >= 0 ? `+${netChange}` : netChange} {selectedProductCard.unit}
                      </strong>
                    </div>
                    <div className="bg-slate-900/80 p-2 rounded-xl border border-cyan-500/30">
                      <span className="text-[10px] text-cyan-300 block mb-0.5">رصيد نهاية الفترة</span>
                      <strong className="text-cyan-300 text-sm font-bold">{closingBalance} {selectedProductCard.unit}</strong>
                    </div>
                  </div>
                </div>

                {/* Multi-Warehouse Stock Breakdown (تفصيل أرصدة الصنف في المستودعات) */}
                {warehouses.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                    <div className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-emerald-400" />
                      <span>توزيع رصيد الصنف عبر المستودعات والفروع (نظام أونكس برو):</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {warehouses.map((wh) => {
                        const whQty = selectedProductCard.warehouseStocks?.[wh.id] ?? (wh.isMain ? selectedProductCard.stockQty : 0);
                        return (
                          <div
                            key={wh.id}
                            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                          >
                            <div>
                              <div className="font-bold text-white flex items-center gap-1">
                                {wh.nameAr}
                                {wh.isMain && (
                                  <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1 py-0.2 rounded font-normal">
                                    رئيسي
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-500 mt-0.5">كود: {wh.code}</div>
                            </div>
                            <div className="text-left font-mono-num">
                              <span className={`font-black text-sm ${whQty > 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                                {whQty}
                              </span>{' '}
                              <span className="text-[10px] text-slate-400">{selectedProductCard.unit}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Running Stock Movement Ledger Table */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      <History className="w-4 h-4 text-emerald-400" />
                      <span>جدول الحركات التفصيلي (تاريخ، سند، وارد، منصرف، رصيد بعد الحركة)</span>
                    </h4>
                    <span className="text-xs text-slate-400 font-mono-num">
                      حركات معروضة: {filteredCardMovements.length}
                    </span>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-800">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-slate-800 text-slate-300 font-bold uppercase">
                        <tr>
                          <th className="py-2.5 px-3">التاريخ</th>
                          <th className="py-2.5 px-3">رقم المرجع</th>
                          <th className="py-2.5 px-3">نوع الحركة</th>
                          <th className="py-2.5 px-3 text-center text-emerald-400">وارد (+)</th>
                          <th className="py-2.5 px-3 text-center text-red-400">منصرف (-)</th>
                          <th className="py-2.5 px-3 text-center text-cyan-300">الرصيد بعدها</th>
                          <th className="py-2.5 px-3 text-center">تكلفة الوحدة</th>
                          <th className="py-2.5 px-3">البيان والشرح</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80">
                        {filteredCardMovements.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="py-8 text-center text-slate-500">
                              لا توجد حركات مسجلة لهذا الصنف خلال الفترة المحددة.
                            </td>
                          </tr>
                        ) : (
                          filteredCardMovements.map((m) => {
                            const isPositive = m.quantityChange > 0;
                            return (
                              <tr key={m.id} className="hover:bg-slate-800/40">
                                <td className="py-2.5 px-3 font-mono-num text-slate-400">{m.date}</td>
                                <td className="py-2.5 px-3 font-mono-num font-bold text-white">{m.referenceNumber}</td>
                                <td className="py-2.5 px-3">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    isPositive
                                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                      : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                  }`}>
                                    {m.type === 'INITIAL' ? 'رصيد افتتاحي' :
                                     m.type === 'PURCHASE' ? 'وارد مشتريات' :
                                     m.type === 'SALE' ? 'منصرف مبيعات' :
                                     m.type === 'SALES_RETURN' ? 'مردود مبيعات' :
                                     m.type === 'PURCHASE_RETURN' ? 'مردود مشتريات' :
                                     m.type === 'ASSEMBLY_IN' ? 'تجميع صنف' :
                                     m.type === 'ASSEMBLY_OUT' ? 'استهلاك تجميع' :
                                     m.type === 'TRANSFER_IN' ? 'تحويل وارد' :
                                     m.type === 'TRANSFER_OUT' ? 'تحويل صادر' : 'تسوية جردية'}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 text-center font-mono-num font-bold text-emerald-400">
                                  {isPositive ? `+${m.quantityChange}` : '-'}
                                </td>
                                <td className="py-2.5 px-3 text-center font-mono-num font-bold text-red-400">
                                  {!isPositive ? Math.abs(m.quantityChange) : '-'}
                                </td>
                                <td className="py-2.5 px-3 text-center font-mono-num font-extrabold text-cyan-300">
                                  {m.balanceAfter}
                                </td>
                                <td className="py-2.5 px-3 text-center font-mono-num text-slate-300">
                                  {m.unitCost.toFixed(2)}
                                </td>
                                <td className="py-2.5 px-3 text-slate-400">{m.notes || '-'}</td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL 4: Quick Search Modal (نافذة البحث السريع المتقدم للأصناف) */}
      <ProductQuickSearchModal
        isOpen={showQuickSearchModal}
        onClose={() => setShowQuickSearchModal(false)}
        onSelectProduct={(prod) => {
          setSelectedProductCard(prod);
        }}
        title="البحث المتقدم واختيار الأصناف (نظام أونكس برو)"
      />
    </div>
  );
};
