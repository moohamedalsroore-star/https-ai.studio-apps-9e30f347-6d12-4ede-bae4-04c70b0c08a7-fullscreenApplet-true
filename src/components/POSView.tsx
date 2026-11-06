import React, { useState, useId } from 'react';
import {
  ShoppingCart,
  Barcode,
  Search,
  Trash2,
  Plus,
  Minus,
  CheckCircle,
  CreditCard,
  Banknote,
  Printer,
  X,
  AlertTriangle,
  Tag,
  Sparkles,
  Package,
} from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import { Invoice, PaymentMethod, Product, PriceTier } from '../types/accounting';
import { tafqeet } from '../utils/tafqeet';
import { DocumentActionsBar } from './DocumentActionsBar';

interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  discount: number;
}

export const POSView: React.FC = () => {
  const {
    products,
    contacts,
    settings,
    createSalesInvoice,
    openDeleteConfirm,
    showToast,
  } = useAccounting();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('cust-3'); // General Cash Customer
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [tenderedCash, setTenderedCash] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedPriceTier, setSelectedPriceTier] = useState<PriceTier>('RETAIL');
  const [printedInvoice, setPrintedInvoice] = useState<Invoice | null>(null);
  const [mobileTab, setMobileTab] = useState<'PRODUCTS' | 'CART'>('PRODUCTS');

  const categories = ['ALL', ...Array.from(new Set(products.map((p) => p.category)))];

  // Helper to get unit price according to active tier
  const getProductPriceForTier = (product: Product, tier: PriceTier): number => {
    if (tier === 'WHOLESALE') return product.wholesalePrice || product.salePrice;
    if (tier === 'SUPER_WHOLESALE') return product.specialPrice || product.wholesalePrice || product.salePrice;
    return product.salePrice;
  };

  const handlePriceTierChange = (newTier: PriceTier) => {
    setSelectedPriceTier(newTier);
    if (cart.length > 0) {
      setCart((prev) =>
        prev.map((item) => ({
          ...item,
          unitPrice: getProductPriceForTier(item.product, newTier),
        }))
      );
      showToast(`تم تطبيق أسعار: ${newTier === 'RETAIL' ? 'التجزئة' : newTier === 'WHOLESALE' ? 'الجملة' : 'جملة الجملة'} على السلة`, 'info');
    }
  };

  // Filter products for the POS catalog
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.includes(searchQuery) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Add to cart with tier price
  const addToCart = (product: Product) => {
    const unitPrice = getProductPriceForTier(product, selectedPriceTier);
    const existing = cart.find((item) => item.product.id === product.id);
    if (existing) {
      if (existing.quantity >= product.stockQty) {
        showToast(`تنبيه: الكمية المطلوبة تتجاوز الرصيد المتوفر في المستودع (${product.stockQty} ${product.unit})`, 'error');
        return;
      }
      setCart(
        cart.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      if (product.stockQty <= 0) {
        showToast(`تنبيه: هذا الصنف نفد من المخزون تماماً!`, 'error');
        return;
      }
      setCart([
        ...cart,
        {
          product,
          quantity: 1,
          unitPrice,
          discount: 0,
        },
      ]);
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty > item.product.stockQty) {
              showToast(`الكمية تتجاوز الرصيد المتوفر (${item.product.stockQty})`, 'error');
              return item;
            }
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const taxRate = settings.defaultTaxRate;
  const taxTotal = subtotal * taxRate;
  const grandTotal = subtotal + taxTotal;
  const changeDue = tenderedCash > grandTotal ? tenderedCash - grandTotal : 0;

  // Checkout & Auto Posting
  const handleCheckout = () => {
    if (cart.length === 0) return;

    const customer =
      contacts.find((c) => c.id === selectedCustomerId) ||
      contacts[0] || {
        id: 'cash-customer',
        name: 'عميل نقدي عام / المعرض',
        balance: 0,
        creditLimit: 0,
      };

    // Check Credit Limit if CREDIT
    if (paymentMethod === 'CREDIT' && customer.creditLimit && customer.creditLimit > 0) {
      if (customer.balance + grandTotal > customer.creditLimit) {
        showToast(
          `تنبيه ائتماني: العميل ${customer.name} تجاوز الحد الائتماني المسموح (${customer.creditLimit} ${settings.baseCurrency})`,
          'info'
        );
      }
    }

    const newInvoice = createSalesInvoice({
      partyId: customer.id,
      partyName: customer.name,
      paymentMethod,
      paidAmount: paymentMethod === 'CASH' || paymentMethod === 'BANK' ? grandTotal : 0,
      notes: 'فاتورة نقطة بيع كاشير سريعة (POS)',
      items: cart.map((item) => ({
        productId: item.product.id,
        productName: item.product.nameAr,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        costPrice: item.product.costPrice,
        discount: item.discount,
        taxRate: settings.defaultTaxRate,
      })),
    });

    setPrintedInvoice(newInvoice);
    setCart([]);
    setTenderedCash(0);
  };

  return (
    <div className="space-y-4 pb-24 lg:pb-8">
      {/* Mobile Tab Switcher (الأصناف مقابل سلة الكاشير) - Fully visible on phones */}
      <div className="lg:hidden flex items-center gap-2 p-1.5 bg-[#040C2E]/95 border border-blue-500/30 rounded-2xl shadow-xl sticky top-2 z-30 backdrop-blur-md">
        <button
          type="button"
          onClick={() => setMobileTab('PRODUCTS')}
          className={`flex-1 py-3 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
            mobileTab === 'PRODUCTS'
              ? 'bg-gradient-to-r from-[#075BFF] to-[#00C8FF] text-white shadow-md shadow-blue-500/40 ring-1 ring-cyan-400'
              : 'text-slate-400 hover:text-white bg-[#06123a]'
          }`}
        >
          <Package className="w-4 h-4 text-cyan-200" />
          <span>الأصناف والمنتجات ({filteredProducts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileTab('CART')}
          className={`flex-1 py-3 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer relative ${
            mobileTab === 'CART'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-700/40 ring-1 ring-emerald-400'
              : 'text-slate-400 hover:text-white bg-[#06123a]'
          }`}
        >
          <ShoppingCart className="w-4 h-4 text-emerald-200" />
          <span>سلة الكاشير</span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 font-mono font-extrabold text-xs">
            {cart.reduce((s, i) => s + i.quantity, 0)}
          </span>
          {grandTotal > 0 && (
            <span className="font-mono text-amber-300 font-black text-xs mr-1">
              ({grandTotal.toFixed(2)})
            </span>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:h-[calc(100vh-140px)] min-h-0">
        {/* Left Column: Product Grid & Quick Selection (8 cols) */}
        <div className={`lg:col-span-7 xl:col-span-8 flex flex-col gap-4 overflow-hidden ${
          mobileTab === 'CART' ? 'hidden lg:flex' : 'flex'
        }`}>
          {/* Search, Categories & Price Tier Selector */}
          <div className="p-3.5 bg-[#040C2E]/90 border border-blue-500/25 rounded-2xl flex flex-col gap-2.5 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-4 h-4 text-[#00C8FF] absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ابحث بالاسم أو امسح الباركود..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-3 pr-9 py-2 bg-[#06123d] border border-blue-500/30 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-[#00C8FF] shadow-inner"
                />
              </div>

              {/* Price Tier Selector (تجزئة / جملة / جملة الجملة) */}
              <div className="inline-flex rounded-xl bg-slate-950 p-1 border border-slate-800 shrink-0">
                <button
                  type="button"
                  onClick={() => handlePriceTierChange('RETAIL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedPriceTier === 'RETAIL'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  مفرق / تجزئة
                </button>
                <button
                  type="button"
                  onClick={() => handlePriceTierChange('WHOLESALE')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedPriceTier === 'WHOLESALE'
                      ? 'bg-cyan-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  سعر جملة
                </button>
                <button
                  type="button"
                  onClick={() => handlePriceTierChange('SUPER_WHOLESALE')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedPriceTier === 'SUPER_WHOLESALE'
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  جملة الجملة
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1 border-t border-slate-800/80 pt-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-slate-700 text-white font-extrabold shadow-sm'
                      : 'bg-slate-800/70 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {cat === 'ALL' ? 'جميع التصنيفات' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 pr-1 pb-16 lg:pb-2">
            {filteredProducts.map((p) => {
              const isOut = p.stockQty <= 0;
              const isLow = p.stockQty <= p.minStockAlert && !isOut;
              const activePrice = getProductPriceForTier(p, selectedPriceTier);

              return (
                <button
                  key={p.id}
                  disabled={isOut}
                  onClick={() => addToCart(p)}
                  className={`p-3 rounded-2xl text-right transition-all flex flex-col justify-between border cursor-pointer group relative ${
                    isOut
                      ? 'bg-[#02071d]/50 border-slate-800/60 opacity-60 cursor-not-allowed'
                      : 'bg-[#040C2E]/90 border-blue-500/20 hover:border-[#00C8FF]/70 hover:shadow-[0_0_20px_rgba(0,200,255,0.25)]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span className="text-cyan-300 font-semibold">{p.code}</span>
                      <span
                        className={`px-1.5 py-0.2 rounded font-bold ${
                          isOut
                            ? 'bg-red-500/20 text-red-400'
                            : isLow
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-emerald-500/20 text-[#00D99A]'
                        }`}
                      >
                        {p.stockQty} {p.unit}
                      </span>
                    </div>
                    <h4 className="font-bold text-white text-xs mt-1.5 line-clamp-2 leading-relaxed">
                      {p.nameAr}
                    </h4>
                  </div>

                  <div className="mt-3 pt-2 border-t border-blue-500/20 flex items-center justify-between">
                    <div>
                      <div className={`font-mono font-extrabold text-sm ${
                        selectedPriceTier === 'WHOLESALE' ? 'text-[#00C8FF]' : selectedPriceTier === 'SUPER_WHOLESALE' ? 'text-amber-400' : 'text-[#00D99A]'
                      }`}>
                        {activePrice.toFixed(2)}{' '}
                        <span className="text-[10px] font-normal text-slate-400">{settings.baseCurrency}</span>
                      </div>
                      {selectedPriceTier !== 'RETAIL' && (
                        <span className="text-[9px] text-slate-400 block">
                          {selectedPriceTier === 'WHOLESALE' ? 'سعر جملة' : 'جملة الجملة'}
                        </span>
                      )}
                    </div>
                    <div className="w-6 h-6 rounded-lg bg-[#00C8FF]/15 text-[#00C8FF] flex items-center justify-center group-hover:bg-[#00C8FF] group-hover:text-slate-950 transition-colors shadow-sm">
                      <Plus className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Cart & Checkout (4 cols) */}
        <div className={`lg:col-span-5 xl:col-span-4 flex flex-col bg-[#040C2E]/95 border border-blue-500/30 rounded-3xl shadow-2xl overflow-y-auto lg:overflow-hidden ${
          mobileTab === 'PRODUCTS' ? 'hidden lg:flex' : 'flex'
        }`}>
          {/* Cart Header */}
          <div className="p-4 bg-[#07133D]/90 border-b border-blue-500/30 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-[#00D99A]" />
              <h3 className="font-bold text-white text-base">سلة الكاشير</h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/20 text-[#00D99A] border border-emerald-500/40">
                {cart.reduce((s, i) => s + i.quantity, 0)} قطعة
              </span>
            </div>

            {cart.length > 0 && (
              <button
                type="button"
                onClick={() => setCart([])}
                className="text-xs text-red-400 hover:text-red-300 font-bold cursor-pointer flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-950/40 border border-red-500/20"
              >
                <Trash2 className="w-3.5 h-3.5" />
                تفريغ السلة
              </button>
            )}
          </div>

          {/* Customer Selector */}
          <div className="p-3 bg-slate-950/40 border-b border-slate-800/80 shrink-0">
            <label className="block text-[11px] font-bold text-slate-400 mb-1">العميل المستفيد</label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              {contacts.filter((c) => c.type === 'CUSTOMER').length > 0 ? (
                contacts
                  .filter((c) => c.type === 'CUSTOMER')
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.balance > 0 ? `(عليه: ${c.balance.toFixed(2)} ${settings.baseCurrency})` : ''}
                    </option>
                  ))
              ) : (
                <option value="cash-customer">عميل نقدي عام / المعرض</option>
              )}
            </select>
          </div>

          {/* Cart Items List */}
          <div className="max-h-56 sm:max-h-64 lg:flex-1 overflow-y-auto p-3 space-y-2 shrink-0">
            {cart.length === 0 ? (
              <div className="h-40 lg:h-full flex flex-col items-center justify-center text-slate-500 text-center p-6">
                <ShoppingCart className="w-12 h-12 text-slate-700 mb-2" />
                <p className="text-sm font-bold text-slate-400">السلة فارغة حالياً</p>
                <p className="text-xs text-slate-600 mt-1">انقر على الأصناف من القائمة لإضافتها فوراً</p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.product.id}
                  className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-800 flex items-center justify-between gap-2"
                >
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-white text-xs truncate">{item.product.nameAr}</h5>
                    <div className="font-mono-num text-[11px] text-emerald-400 mt-0.5">
                      {item.unitPrice.toFixed(2)} {settings.baseCurrency} × {item.quantity} ={' '}
                      <span className="font-bold">{(item.quantity * item.unitPrice).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 bg-slate-900 rounded-lg p-1 border border-slate-800">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product.id, -1)}
                      className="w-6 h-6 rounded flex items-center justify-center text-slate-300 hover:bg-slate-800 cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-mono-num font-bold text-xs text-white px-2">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product.id, 1)}
                      className="w-6 h-6 rounded flex items-center justify-center text-slate-300 hover:bg-slate-800 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-1.5 rounded text-red-400 hover:bg-red-950/40 cursor-pointer"
                    title="حذف من السلة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Checkout Calculations & Method (Spacious, fully revealed with free space) */}
          <div className="p-4 sm:p-5 bg-[#020824]/95 border-t border-blue-500/25 space-y-3.5 pb-20 sm:pb-12">
            {/* Summary Box matching user screenshot 1, 2, 3 */}
            <div className="space-y-2.5 text-xs sm:text-sm text-slate-300 bg-[#040C2E]/95 p-4 rounded-2xl border border-blue-500/30 shadow-2xl">
              <div className="flex justify-between items-center">
                <span className="font-mono text-slate-200 text-sm font-bold tracking-wider">
                  {settings.baseCurrency} {subtotal.toFixed(2)}
                </span>
                <span className="text-slate-300 font-medium text-xs sm:text-sm">المجموع قبل الضريبة:</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-mono text-slate-200 text-sm font-bold tracking-wider">
                  {settings.baseCurrency} {taxTotal.toFixed(2)}
                </span>
                <span className="text-slate-300 font-medium text-xs sm:text-sm">
                  ضريبة القيمة المضافة ({Math.round(settings.defaultTaxRate * 100)}%):
                </span>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-blue-500/30">
                <span className="font-mono text-[#00D99A] font-black text-xl sm:text-2xl tracking-wider glow-emerald">
                  {settings.baseCurrency} {grandTotal.toFixed(2)}
                </span>
                <span className="text-[#00D99A] font-black text-base sm:text-lg">
                  الإجمالي النهائي المطلوب:
                </span>
              </div>

              {/* Exact 3 Icon Tabs from user screenshot 1, 2, 3: Cart, Card, Cash */}
              <div className="pt-3 border-t border-blue-500/25 flex items-center justify-around gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CREDIT')}
                  className={`flex-1 py-2.5 flex items-center justify-center rounded-xl transition-all cursor-pointer ${
                    paymentMethod === 'CREDIT'
                      ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30 ring-1 ring-amber-400'
                      : 'bg-[#09153a] text-slate-400 hover:text-white border border-blue-500/20'
                  }`}
                  title="آجل (ذمة)"
                >
                  <ShoppingCart className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('BANK')}
                  className={`flex-1 py-2.5 flex items-center justify-center rounded-xl transition-all cursor-pointer ${
                    paymentMethod === 'BANK'
                      ? 'bg-[#075BFF] text-white shadow-lg shadow-blue-600/40 ring-1 ring-[#00C8FF]'
                      : 'bg-[#09153a] text-slate-400 hover:text-white border border-blue-500/20'
                  }`}
                  title="شبكة / مدى"
                >
                  <CreditCard className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('CASH')}
                  className={`flex-1 py-2.5 flex items-center justify-center rounded-xl transition-all cursor-pointer ${
                    paymentMethod === 'CASH'
                      ? 'bg-[#00D99A] text-slate-950 shadow-[0_0_15px_rgba(0,217,154,0.45)] font-bold ring-1 ring-emerald-300'
                      : 'bg-[#09153a] text-slate-400 hover:text-white border border-blue-500/20'
                  }`}
                  title="نقداً (كاش)"
                >
                  <Banknote className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Payment Method Selector Badges */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">طريقة السداد المعتمدة:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CASH')}
                  className={`py-2.5 px-2 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    paymentMethod === 'CASH'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/40 ring-2 ring-emerald-400'
                      : 'bg-[#0a1740] text-slate-300 hover:bg-[#10235e] border border-blue-500/20'
                  }`}
                >
                  <Banknote className="w-4 h-4 text-emerald-300" />
                  <span>نقداً</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('BANK')}
                  className={`py-2.5 px-2 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    paymentMethod === 'BANK'
                      ? 'bg-gradient-to-r from-[#075BFF] to-[#00C8FF] text-white shadow-lg shadow-blue-600/40 ring-2 ring-cyan-400'
                      : 'bg-[#0a1740] text-slate-300 hover:bg-[#10235e] border border-blue-500/20'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-cyan-200" />
                  <span>شبكة / مدى</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('CREDIT')}
                  className={`py-2.5 px-2 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    paymentMethod === 'CREDIT'
                      ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-lg shadow-amber-600/40 ring-2 ring-amber-400'
                      : 'bg-[#0a1740] text-slate-300 hover:bg-[#10235e] border border-blue-500/20'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4 text-amber-200" />
                  <span>آجل (ذمة)</span>
                </button>
              </div>
            </div>

            {/* Cash Tendered & Change calculator (if Cash) */}
            {paymentMethod === 'CASH' && (
              <div className="p-3 rounded-2xl bg-[#030a27] border border-blue-500/20 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-300 font-bold">المبلغ المدفوع:</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder={grandTotal.toFixed(2)}
                    value={tenderedCash || ''}
                    onChange={(e) => setTenderedCash(parseFloat(e.target.value) || 0)}
                    className="w-28 px-3 py-1.5 bg-[#09153d] border border-blue-500/30 rounded-xl text-white font-mono font-bold text-xs focus:outline-none focus:border-[#00C8FF]"
                  />
                </div>

                {changeDue > 0 && (
                  <div className="text-[#00D99A] font-bold font-mono bg-emerald-950/40 px-2.5 py-1 rounded-xl border border-emerald-500/30">
                    المتبقي للعميل: {changeDue.toFixed(2)} {settings.baseCurrency}
                  </div>
                )}
              </div>
            )}

            {/* Checkout Button */}
            <button
              type="button"
              disabled={cart.length === 0}
              onClick={handleCheckout}
              className={`w-full py-4 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-xl ${
                cart.length === 0
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-gradient-to-r from-[#00D99A] via-[#00c58b] to-[#075BFF] hover:brightness-110 text-slate-950 font-black shadow-[0_0_25px_rgba(0,217,154,0.4)] active:scale-[0.99] border border-emerald-300/40'
              }`}
            >
              <CheckCircle className="w-5 h-5 text-slate-950" />
              <span>حفظ الفاتورة والترحيل الآلي للقيود والمخزون</span>
            </button>

            {/* Extra Free Space at the very bottom to ensure total clearance */}
            <div className="h-6" />
          </div>
        </div>
      </div>

      {/* Floating Bottom Bar on Mobile when on Products tab and Cart has items */}
      {mobileTab === 'PRODUCTS' && cart.length > 0 && (
        <div className="lg:hidden fixed bottom-6 left-3 right-3 z-40 bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-600 text-white p-3.5 rounded-2xl shadow-2xl flex items-center justify-between border border-emerald-400/40 animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-bold">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-100">
                السلة: {cart.reduce((s, i) => s + i.quantity, 0)} قطعة
              </div>
              <div className="font-mono-num font-black text-base text-white">
                {grandTotal.toFixed(2)} {settings.baseCurrency}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileTab('CART')}
            className="px-4 py-2.5 rounded-xl bg-white text-emerald-950 font-black text-xs shadow-md cursor-pointer active:scale-95 hover:bg-emerald-50"
          >
            إتمام الدفع والفاتورة ←
          </button>
        </div>
      )}

      {/* PRINTABLE OFFICIAL TAX INVOICE MODAL */}
      {printedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto no-print-bg">
          <div className="bg-white text-slate-900 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden print-only-wrapper">
            {/* Top Toolbar (no-print) */}
            <div className="p-4 bg-slate-800 text-white flex items-center justify-between no-print">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-sm">تم إصدار وترحيل الفاتورة بنجاح!</span>
                <span className="text-[10px] text-emerald-300 hidden sm:inline">💡 اختر "حفظ بتنسيق PDF"</span>
              </div>
              <div className="flex items-center gap-2">
                <DocumentActionsBar
                  targetElementId="pos-receipt-print-content"
                  filename={`فاتورة_كاشير_${printedInvoice.invoiceNumber}`}
                  documentTitle={`فاتورة نقاط البيع رقم ${printedInvoice.invoiceNumber}`}
                  hasData={Boolean(printedInvoice)}
                />
                <button
                  type="button"
                  onClick={() => setPrintedInvoice(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Official Tax Invoice Document */}
            <div id="pos-receipt-print-content" className="p-8 text-right printable-card text-xs space-y-5">
              {/* Header */}
              <div className="text-center border-b-2 border-slate-900 pb-4">
                <h2 className="text-xl font-black text-slate-900">{settings.companyName}</h2>
                <div className="text-[11px] text-slate-600 mt-1">{settings.companyNameEn}</div>
                <div className="text-xs font-semibold text-slate-700 mt-1">
                  الرقم الضريبي: {settings.taxNumber} | س.ت: {settings.commercialRecord}
                </div>
                <div className="text-xs text-slate-600">{settings.address} - هاتف: {settings.phone}</div>

                <div className="inline-block mt-3 px-4 py-1 rounded-full bg-slate-900 text-white font-extrabold text-sm tracking-wider">
                  فاتورة ضريبية مبسطة (Tax Invoice)
                </div>
              </div>

              {/* Invoice Meta */}
              <div className="grid grid-cols-2 gap-4 bg-slate-100 p-3 rounded-xl">
                <div>
                  <div><span className="font-bold">رقم الفاتورة:</span> {printedInvoice.invoiceNumber}</div>
                  <div><span className="font-bold">تاريخ الإصدار:</span> {printedInvoice.date}</div>
                  <div><span className="font-bold">طريقة الدفع:</span> {printedInvoice.paymentMethod}</div>
                </div>
                <div>
                  <div><span className="font-bold">العميل:</span> {printedInvoice.partyName}</div>
                  <div><span className="font-bold">الرقم الضريبي للعميل:</span> غير مسجل</div>
                  <div><span className="font-bold">حالة السداد:</span> {printedInvoice.status === 'PAID' ? 'مسددة بالكامل' : 'آجلة'}</div>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="border-b-2 border-slate-900 bg-slate-200">
                    <th className="py-2 px-2">م</th>
                    <th className="py-2 px-2">الصنف والوصف</th>
                    <th className="py-2 px-2 text-center">الكمية</th>
                    <th className="py-2 px-2 text-center">السعر</th>
                    <th className="py-2 px-2 text-center">الضريبة</th>
                    <th className="py-2 px-2 text-center">الإجمالي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  {printedInvoice.items.map((item, idx) => (
                    <tr key={item.id}>
                      <td className="py-2 px-2 font-mono-num">{idx + 1}</td>
                      <td className="py-2 px-2 font-bold">{item.productName}</td>
                      <td className="py-2 px-2 text-center font-mono-num">{item.quantity}</td>
                      <td className="py-2 px-2 text-center font-mono-num">{item.unitPrice.toFixed(2)}</td>
                      <td className="py-2 px-2 text-center font-mono-num">{item.taxAmount.toFixed(2)}</td>
                      <td className="py-2 px-2 text-center font-mono-num font-bold">{item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals Summary */}
              <div className="border-t-2 border-slate-900 pt-3 flex justify-between items-start">
                {/* QR Code Placeholder for ZATCA standard */}
                <div className="w-24 h-24 border-2 border-slate-900 flex flex-col items-center justify-center p-1 bg-slate-50 text-[9px] text-center font-mono-num">
                  <div className="w-16 h-16 bg-slate-900 text-white flex items-center justify-center font-bold text-xs mb-1">
                    QR-ZATCA
                  </div>
                  معتمد هيئة الزكاة
                </div>

                <div className="w-64 space-y-1 font-mono-num text-xs">
                  <div className="flex justify-between">
                    <span>المجموع قبل الضريبة:</span>
                    <span className="font-bold">{printedInvoice.subtotal.toFixed(2)} {settings.baseCurrency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ضريبة القيمة المضافة 15%:</span>
                    <span className="font-bold">{printedInvoice.taxTotal.toFixed(2)} {settings.baseCurrency}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black border-t border-slate-400 pt-1 text-slate-900">
                    <span>الإجمالي الشامل (Grand Total):</span>
                    <span>{printedInvoice.grandTotal.toFixed(2)} {settings.baseCurrency}</span>
                  </div>
                </div>
              </div>

              {/* Arabic Tafqeet */}
              <div className="p-2.5 rounded-lg bg-slate-100 border border-slate-300 text-xs font-semibold text-slate-800">
                <span className="font-bold">المبلغ كتابة:</span>{' '}
                {tafqeet(printedInvoice.grandTotal, settings.baseCurrency, 'هللة')}
              </div>

              {/* Footer */}
              <div className="text-center text-[10px] text-slate-500 pt-2 border-t border-slate-200">
                شكراً لتعاملكم معنا | البضاعة المباعة ترد وتستبدل خلال 7 أيام بموجب أصل الفاتورة
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
