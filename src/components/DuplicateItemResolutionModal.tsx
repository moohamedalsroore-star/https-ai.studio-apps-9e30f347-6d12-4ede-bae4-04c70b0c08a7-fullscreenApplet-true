import React, { useState } from 'react';
import { AlertCircle, PlusCircle, CheckCircle, Trash2, ArrowRight, Layers, DollarSign } from 'lucide-react';
import { useBackHandler } from '../hooks/useBackHandler';

export interface DuplicateItemInfo {
  productId: string;
  productName: string;
  productCode?: string;
  unit?: string;
  existingQuantity: number;
  existingUnitPrice: number;
  addedQuantity: number;
  addedUnitPrice: number;
  taxRate?: number;
  rowIndex?: number;
}

interface DuplicateItemResolutionModalProps {
  isOpen: boolean;
  itemInfo: DuplicateItemInfo | null;
  onClose: () => void;
  /**
   * Called when user resolves the duplicate
   * action: 'MERGE' (add quantities together), 'REPLACE' (overwrite quantity/price), 'REMOVE' (delete row)
   */
  onResolve: (action: 'MERGE' | 'REPLACE' | 'REMOVE', resolvedQuantity: number, resolvedUnitPrice: number) => void;
  currency?: string;
}

export const DuplicateItemResolutionModal: React.FC<DuplicateItemResolutionModalProps> = ({
  isOpen,
  itemInfo,
  onClose,
  onResolve,
  currency = 'SAR',
}) => {
  useBackHandler({
    isOpen,
    onClose,
    stateKey: 'duplicateItemModal',
  });

  if (!isOpen || !itemInfo) return null;

  const mergedQty = itemInfo.existingQuantity + itemInfo.addedQuantity;
  const mergedTotal = mergedQty * itemInfo.existingUnitPrice;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 bg-amber-950/40 border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">تنبيه: الصنف موجود مسبقاً في المستند</h3>
              <p className="text-xs text-amber-300/80">منع تكرار الأصناف ودمج الكميات (نظام أونكس برو)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl font-bold p-1 cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* Item Info Box */}
        <div className="p-5 space-y-4">
          <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono-num font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                  {itemInfo.productCode || 'PRD'}
                </span>
                <h4 className="font-bold text-white text-base mt-1">{itemInfo.productName}</h4>
              </div>
              <span className="text-xs text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-700">
                الوحدة: {itemInfo.unit || 'حبة'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-700/60 text-xs">
              <div className="bg-slate-900/70 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-1">الكمية المسجلة حالياً:</span>
                <span className="font-mono-num font-bold text-white text-sm">
                  {itemInfo.existingQuantity} {itemInfo.unit || 'حبة'}
                </span>
                <span className="text-slate-400 block text-[11px] mt-0.5">
                  بسعر {itemInfo.existingUnitPrice.toFixed(2)} {currency}
                </span>
              </div>
              <div className="bg-slate-900/70 p-2.5 rounded-xl border border-amber-500/30">
                <span className="text-amber-400 block mb-1 font-bold">الكمية الجديدة المضافة:</span>
                <span className="font-mono-num font-bold text-amber-300 text-sm">
                  +{itemInfo.addedQuantity} {itemInfo.unit || 'حبة'}
                </span>
                <span className="text-slate-400 block text-[11px] mt-0.5">
                  بسعر {itemInfo.addedUnitPrice.toFixed(2)} {currency}
                </span>
              </div>
            </div>
          </div>

          {/* Action Choice 1 (Recommended): Merge Quantities */}
          <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 relative">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-sm">
                  <PlusCircle className="w-4 h-4" />
                  <span>دمج وإضافة الكمية الجديدة للسطر الحالي (مستحسن)</span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  سيصبح إجمالي الكمية:{' '}
                  <strong className="text-emerald-300 font-mono-num font-bold text-sm">
                    {mergedQty} {itemInfo.unit || 'حبة'}
                  </strong>
                  {' '}(بإجمالي {mergedTotal.toFixed(2)} {currency})
                </p>
              </div>
              <button
                type="button"
                onClick={() => onResolve('MERGE', mergedQty, itemInfo.existingUnitPrice)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 cursor-pointer shrink-0"
              >
                تأكيد الدمج
              </button>
            </div>
          </div>

          {/* Action Choice 2: Overwrite with New Quantity */}
          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/80">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-sm">
                  <Layers className="w-4 h-4" />
                  <span>استبدال الكمية بالكمية الجديدة فقط</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  تعديل سطر الصنف ليصبح:{' '}
                  <strong className="text-white font-mono-num font-bold">
                    {itemInfo.addedQuantity} {itemInfo.unit || 'حبة'}
                  </strong>
                  {' '}بسعر {itemInfo.addedUnitPrice.toFixed(2)} {currency}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onResolve('REPLACE', itemInfo.addedQuantity, itemInfo.addedUnitPrice)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-cyan-300 font-bold text-xs border border-slate-600 cursor-pointer shrink-0"
              >
                تحديث بالجديد
              </button>
            </div>
          </div>

          {/* Action Choice 3: Cancel or Remove */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => onResolve('REMOVE', 0, 0)}
              className="text-red-400 hover:text-red-300 font-bold flex items-center gap-1 cursor-pointer p-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>حذف الصنف نهائياً من المستند</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
            >
              إلغاء الإضافة والإبقاء كما هو
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
