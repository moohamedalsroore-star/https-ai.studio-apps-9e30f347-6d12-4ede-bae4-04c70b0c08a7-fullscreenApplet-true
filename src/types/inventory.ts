export type StockMovementType = 
  | 'INITIAL'             // رصيد افتتاحي
  | 'PURCHASE'            // وارد مشتريات
  | 'SALE'                // منصرف مبيعات
  | 'SALES_RETURN'        // مردود مبيعات
  | 'PURCHASE_RETURN'     // مردود مشتريات
  | 'STOCK_ADJUSTMENT_IN' // تسوية جردية - زيادة
  | 'STOCK_ADJUSTMENT_OUT';// تسوية جردية - عجز

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: StockMovementType;
  referenceNumber: string;
  date: string;
  quantityChange: number; // Positive for IN, Negative for OUT
  unitCost: number;
  totalCost: number;
  balanceAfter: number;
  notes?: string;
  createdAt: string;
}

export interface StockAdjustment {
  id: string;
  adjustmentNumber: string;
  date: string;
  productId: string;
  productName: string;
  systemQty: number;
  actualQty: number;
  differenceQty: number; // actual - system
  unitCost: number;
  totalDifferenceCost: number;
  reason: string;
  journalEntryId?: string;
  createdAt: string;
}

export interface InventoryValuationSummary {
  totalItemsCount: number;
  totalUnitsInStock: number;
  totalCostValue: number;
  totalRetailValue: number;
  potentialProfit: number;
  potentialMarginPercent: number;
  lowStockItemsCount: number;
  outOfStockItemsCount: number;
  periodCogsTotal: number;
}
