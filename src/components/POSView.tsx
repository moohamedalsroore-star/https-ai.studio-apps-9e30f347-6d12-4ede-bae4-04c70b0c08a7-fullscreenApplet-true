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
} from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import { Invoice, PaymentMethod, Product } from '../types/accounting';
import { tafqeet } from '../utils/tafqeet';

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
  const [printedInvoice, setPrintedInvoice] = useState<Invoice | null>(null);

  const categories = ['ALL', ...Array.from(new Set(products.map((p) => p.category)))];

  // Filter products for the POS catalog
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.includes(searchQuery) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Add to cart
  const addToCart = (product: Product) => {
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
          unitPrice: product.salePrice,
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)]">
      {/* Left Column: Product Grid & Quick Selection (8 cols) */}
      <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-4 overflow-hidden">
        {/* Search & Categories */}
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-lg">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ابحث بالاسم أو امسح الباركود..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-3 pr-9 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {cat === 'ALL' ? 'الكل' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 pr-1">
          {filteredProducts.map((p) => {
            const isOut = p.stockQty <= 0;
            const isLow = p.stockQty <= p.minStockAlert && !isOut;

            return (
              <button
                key={p.id}
                disabled={isOut}
                onClick={() => addToCart(p)}
                className={`p-3 rounded-2xl text-right transition-all flex flex-col justify-between border cursor-pointer group relative ${
                  isOut
                    ? 'bg-slate-900/40 border-slate-800 opacity-60 cursor-not-allowed'
                    : 'bg-slate-900 border-slate-800 hover:border-emerald-500/60 hover:shadow-lg hover:shadow-emerald-950/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono-num">
                    <span>{p.code}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded font-bold ${
                        isOut
                          ? 'bg-red-500/20 text-red-400'
                          : isLow
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-emerald-500/20 text-emerald-400'
                      }`}
                    >
                      {p.stockQty} {p.unit}
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-xs mt-1.5 line-clamp-2 leading-relaxed">
                    {p.nameAr}
                  </h4>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="font-mono-num font-extrabold text-sm text-emerald-400">
                    {p.salePrice.toFixed(2)}{' '}
                    <span className="text-[10px] font-normal text-slate-400">{settings.baseCurrency}</span>
                  </div>
                  <div className="w-6 h-6 rounded-lg bg-emerald-600/10 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Column: Active Cart & Checkout (4 cols) */}
      <div className="lg:col-span-5 xl:col-span-4 flex flex-col bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Cart Header */}
        <div className="p-4 bg-slate-800/70 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-base">سلة الكاشير</h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400">
              {cart.reduce((s, i) => s + i.quantity, 0)} قطعة
            </span>
          </div>

          {cart.length > 0 && (
            <button
              onClick={() => setCart([])}
              className="text-xs text-red-400 hover:text-red-300 font-semibold cursor-pointer flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              تفريغ السلة
            </button>
          )}
        </div>

        {/* Customer Selector */}
        <div className="p-3 bg-slate-950/40 border-b border-slate-800/80">
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
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center p-6">
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
                    onClick={() => updateQuantity(item.product.id, -1)}
                    className="w-5 h-5 rounded flex items-center justify-center text-slate-300 hover:bg-slate-800 cursor-pointer"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="font-mono-num font-bold text-xs text-white px-1.5">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.product.id, 1)}
                    className="w-5 h-5 rounded flex items-center justify-center text-slate-300 hover:bg-slate-800 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <button
                  onClick={() => removeFromCart(item.product.id)}
                  className="p-1 rounded text-red-400 hover:bg-red-950/40 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Checkout Calculations & Method */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 space-y-3">
          {/* Summary Row */}
          <div className="space-y-1.5 text-xs text-slate-400">
            <div className="flex justify-between">
              <span>المجموع قبل الضريبة:</span>
              <span className="font-mono-num text-slate-200">
                {subtotal.toFixed(2)} {settings.baseCurrency}
              </span>
            </div>
            <div className="flex justify-between">
              <span>ضريبة القيمة المضافة (15%):</span>
              <span className="font-mono-num text-slate-200">
                {taxTotal.toFixed(2)} {settings.baseCurrency}
              </span>
            </div>
            <div className="flex justify-between text-base font-black text-white pt-1 border-t border-slate-800">
              <span className="text-emerald-400">الإجمالي النهائي المطلوب:</span>
              <span className="font-mono-num text-emerald-400 text-lg">
                {grandTotal.toFixed(2)} {settings.baseCurrency}
              </span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            <button
              onClick={() => setPaymentMethod('CASH')}
              className={`py-2 px-1 rounded-xl font-bold text-xs flex flex-col items-center gap-1 transition-all cursor-pointer ${
                paymentMethod === 'CASH'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Banknote className="w-4 h-4" />
              <span>نقداً</span>
            </button>

            <button
              onClick={() => setPaymentMethod('BANK')}
              className={`py-2 px-1 rounded-xl font-bold text-xs flex flex-col items-center gap-1 transition-all cursor-pointer ${
                paymentMethod === 'BANK'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>شبكة / مدى</span>
            </button>

            <button
              onClick={() => setPaymentMethod('CREDIT')}
              className={`py-2 px-1 rounded-xl font-bold text-xs flex flex-col items-center gap-1 transition-all cursor-pointer ${
                paymentMethod === 'CREDIT'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>آجل (ذمة)</span>
            </button>
          </div>

          {/* Cash Tendered & Change calculator (if Cash) */}
          {paymentMethod === 'CASH' && (
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">المبلغ المدفوع:</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder={grandTotal.toFixed(2)}
                  value={tenderedCash || ''}
                  onChange={(e) => setTenderedCash(parseFloat(e.target.value) || 0)}
                  className="w-24 px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono-num font-bold text-xs"
                />
              </div>

              {changeDue > 0 && (
                <div className="text-emerald-400 font-bold font-mono-num">
                  المتبقي للعميل: {changeDue.toFixed(2)} {settings.baseCurrency}
                </div>
              )}
            </div>
          )}

          {/* Checkout Button */}
          <button
            disabled={cart.length === 0}
            onClick={handleCheckout}
            className={`w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xl ${
              cart.length === 0
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-emerald-600/30 active:scale-[0.99]'
            }`}
          >
            <CheckCircle className="w-5 h-5" />
            <span>حفظ الفاتورة والترحيل الآلي للقيود والمخزون</span>
          </button>
        </div>
      </div>

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
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-600/30"
                >
                  <Printer className="w-4 h-4" />
                  طباعة / حفظ PDF
                </button>
                <button
                  onClick={() => setPrintedInvoice(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Official Tax Invoice Document */}
            <div className="p-8 text-right printable-card text-xs space-y-5">
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
