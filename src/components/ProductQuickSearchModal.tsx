import React, { useState, useMemo } from 'react';
import {
  Search,
  Package,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Plus,
  Barcode,
  Building2,
  DollarSign,
  Boxes,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import { Product, PriceTier } from '../types/accounting';
import { useBackHandler } from '../hooks/useBackHandler';

interface ProductQuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product, quantity: number, unitPrice: number) => void;
  priceTier?: PriceTier;
  title?: string;
  excludeProductIds?: string[];
}

export const ProductQuickSearchModal: React.FC<ProductQuickSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
  priceTier = 'RETAIL',
  title = 'البحث المتقدم واختيار الأصناف (نظام أونكس برو)',
  excludeProductIds = [],
}) => {
  const { products, warehouses, settings } = useAccounting();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'>('ALL');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('ALL');
  const [selectedQtyMap, setSelectedQtyMap] = useState<Record<string, number>>({});

  useBackHandler({
    isOpen,
    onClose,
    stateKey: 'productQuickSearchModal',
  });

  const categories = useMemo(() => {
    return ['ALL', ...Array.from(new Set(products.map((p) => p.category)))];
  }, [products]);

  const getPrice = (prod: Product): number => {
    if (priceTier === 'SUPER_WHOLESALE') {
      return prod.specialPrice || prod.wholesalePrice || prod.salePrice;
    }
    if (priceTier === 'WHOLESALE') {
      return prod.wholesalePrice || prod.salePrice;
    }
    return prod.salePrice;
  };

  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      // Search by Name, Code, Barcode
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        prod.nameAr.toLowerCase().includes(term) ||
        prod.code.toLowerCase().includes(term) ||
        prod.barcode.includes(term) ||
        (prod.category && prod.category.toLowerCase().includes(term));

      // Category filter
      const matchesCategory = selectedCategory === 'ALL' || prod.category === selectedCategory;

      // Stock filter
      let matchesStock = true;
      if (stockFilter === 'IN_STOCK') {
        matchesStock = prod.stockQty > prod.minStockAlert;
      } else if (stockFilter === 'LOW_STOCK') {
        matchesStock = prod.stockQty > 0 && prod.stockQty <= prod.minStockAlert;
      } else if (stockFilter === 'OUT_OF_STOCK') {
        matchesStock = prod.stockQty <= 0;
      }

      // Warehouse filter
      let matchesWarehouse = true;
      if (selectedWarehouseId !== 'ALL' && prod.warehouseStocks) {
        const whStock = prod.warehouseStocks[selectedWarehouseId] ?? 0;
        matchesWarehouse = whStock > 0;
      }

      return matchesSearch && matchesCategory && matchesStock && matchesWarehouse;
    });
  }, [products, searchTerm, selectedCategory, stockFilter, selectedWarehouseId]);

  if (!isOpen) return null;

  const handleQtyChange = (prodId: string, val: number) => {
    setSelectedQtyMap((prev) => ({
      ...prev,
      [prodId]: Math.max(1, val || 1),
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-800/95 border-b border-slate-700 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">{title}</h3>
              <p className="text-xs text-slate-400">
                البحث السريع بالاسم، الكود، أو الباركود مع معرفة الكميات المتوفرة وأسعار البيع
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold border border-slate-700 cursor-pointer transition-all active:scale-95"
            >
              <ArrowRight className="w-4 h-4 text-emerald-400" />
              <span>رجوع</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white text-2xl font-bold p-1 cursor-pointer"
            >
              ×
            </button>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="p-4 bg-slate-950/70 border-b border-slate-800 space-y-3 shrink-0">
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              placeholder="اكتب اسم الصنف أو الكود (PRD-...) أو الباركود (628...)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-11 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-inner"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-bold bg-slate-800 px-2 py-0.5 rounded cursor-pointer"
              >
                مسح
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2.5 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              {/* Category */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-slate-300 rounded-lg px-2.5 py-1.5 focus:border-emerald-500 focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c === 'ALL' ? 'جميع التصنيفات' : c}
                  </option>
                ))}
              </select>

              {/* Stock Status Filter */}
              <div className="inline-flex rounded-lg bg-slate-900 p-0.5 border border-slate-700">
                <button
                  type="button"
                  onClick={() => setStockFilter('ALL')}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition-all ${
                    stockFilter === 'ALL' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  الكل ({products.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStockFilter('IN_STOCK')}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition-all ${
                    stockFilter === 'IN_STOCK' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  متوفر فقط
                </button>
                <button
                  type="button"
                  onClick={() => setStockFilter('LOW_STOCK')}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition-all ${
                    stockFilter === 'LOW_STOCK' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  قارب على النفاد
                </button>
                <button
                  type="button"
                  onClick={() => setStockFilter('OUT_OF_STOCK')}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition-all ${
                    stockFilter === 'OUT_OF_STOCK' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  نفد من المخزون
                </button>
              </div>

              {/* Warehouse selector if warehouses exist */}
              {warehouses.length > 0 && (
                <select
                  value={selectedWarehouseId}
                  onChange={(e) => setSelectedWarehouseId(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-slate-300 rounded-lg px-2.5 py-1.5 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="ALL">جميع المستودعات</option>
                  {warehouses.map((wh) => (
                    <option key={wh.id} value={wh.id}>
                      {wh.nameAr} {wh.isMain ? '(رئيسي)' : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <span className="text-slate-400 font-mono-num">
              الأصناف المطابقة: <strong className="text-white">{filteredProducts.length}</strong>
            </span>
          </div>
        </div>

        {/* Results List / Table */}
        <div className="overflow-y-auto flex-1 p-3 sm:p-4 space-y-2.5">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 rounded-2xl bg-slate-950/50 border border-slate-800 text-slate-400">
              <Package className="w-12 h-12 text-slate-600 mx-auto mb-2" />
              <p className="font-bold text-white text-base">لا توجد أصناف مطابقة للبحث</p>
              <p className="text-xs text-slate-500 mt-1">جرب البحث بكلمات أخرى أو تغيير تصنيف المخزون.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80 rounded-2xl border border-slate-800 bg-slate-950/40 overflow-hidden">
              {filteredProducts.map((prod) => {
                const isOutOfStock = prod.stockQty <= 0;
                const isLowStock = prod.stockQty > 0 && prod.stockQty <= prod.minStockAlert;
                const price = getPrice(prod);
                const isAlreadyInDoc = excludeProductIds.includes(prod.id);
                const currentQty = selectedQtyMap[prod.id] || 1;

                return (
                  <div
                    key={prod.id}
                    className={`p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                      isAlreadyInDoc
                        ? 'bg-amber-950/20'
                        : isOutOfStock
                        ? 'hover:bg-slate-900/60'
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    {/* Item details */}
                    <div className="flex-1 min-w-[220px]">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono-num font-bold text-xs text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                          {prod.code}
                        </span>
                        {prod.barcode && (
                          <span className="font-mono-num text-[11px] text-slate-400 flex items-center gap-1">
                            <Barcode className="w-3.5 h-3.5 text-slate-500" />
                            {prod.barcode}
                          </span>
                        )}
                        <span className="text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                          {prod.category}
                        </span>
                        {isAlreadyInDoc && (
                          <span className="text-[11px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                            مضاف مسبقاً في المستند
                          </span>
                        )}
                        {prod.isComposite && (
                          <span className="text-[11px] font-bold text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/30">
                            صنف مركب (BOM)
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-white text-base mt-1">{prod.nameAr}</h4>

                      {/* Stock availability indicator */}
                      <div className="flex items-center gap-4 text-xs mt-1.5 flex-wrap font-mono-num">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400">الرصيد المتوفر:</span>
                          <span
                            className={`font-black ${
                              isOutOfStock
                                ? 'text-red-400'
                                : isLowStock
                                ? 'text-amber-400'
                                : 'text-emerald-400'
                            }`}
                          >
                            {prod.stockQty} {prod.unit}
                          </span>
                          {isOutOfStock ? (
                            <span className="text-[10px] text-red-400 font-bold bg-red-950/60 px-1.5 py-0.5 rounded border border-red-500/30">
                              نفد
                            </span>
                          ) : isLowStock ? (
                            <span className="text-[10px] text-amber-400 font-bold bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/30">
                              حد الطلب
                            </span>
                          ) : (
                            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                              متوفر
                            </span>
                          )}
                        </div>

                        {prod.reservedQty ? (
                          <div className="text-slate-400">
                            محجوز: <span className="text-amber-300 font-bold">{prod.reservedQty}</span>
                          </div>
                        ) : null}

                        <div className="text-slate-400">
                          المتاح للبيع:{' '}
                          <span className="text-white font-bold">
                            {Math.max(0, prod.stockQty - (prod.reservedQty || 0))} {prod.unit}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Price & Action */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                      <div className="text-left sm:text-right font-mono-num">
                        <div className="text-xs text-slate-400">السعر ({priceTier})</div>
                        <div className="text-base font-black text-emerald-400">
                          {price.toFixed(2)}{' '}
                          <span className="text-xs font-normal text-slate-400">{settings.baseCurrency}</span>
                        </div>
                      </div>

                      {/* Quantity input */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">
                          <button
                            type="button"
                            onClick={() => handleQtyChange(prod.id, currentQty - 1)}
                            className="px-2 py-1 text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer font-bold text-sm"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={currentQty}
                            onChange={(e) => handleQtyChange(prod.id, parseInt(e.target.value) || 1)}
                            className="w-12 text-center py-1 bg-transparent text-white font-mono-num font-bold text-xs focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleQtyChange(prod.id, currentQty + 1)}
                            className="px-2 py-1 text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer font-bold text-sm"
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            onSelectProduct(prod, currentQty, price);
                            onClose();
                          }}
                          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer ${
                            isAlreadyInDoc
                              ? 'bg-amber-600 hover:bg-amber-500 text-slate-950'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                          }`}
                        >
                          <Plus className="w-4 h-4" />
                          <span>{isAlreadyInDoc ? 'دمج / إضافة' : 'اختيار وإضافة'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-800/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div>💡 يمكنك الضغط على الصنف لإضافته مباشرة مع تحديد الكمية المطلوبة.</div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold cursor-pointer"
          >
            إغلاق النافذة
          </button>
        </div>
      </div>
    </div>
  );
};
