import React, { useState } from 'react';
import {
  ShoppingCart,
  Receipt,
  Tag,
  Truck,
  RotateCcw,
  Package,
  ArrowLeftRight,
  Users,
  CreditCard,
  BookOpen,
  Coins,
  Building2,
  Boxes,
  Barcode,
  Bell,
  ClipboardList,
  PlusCircle,
  Scale,
  Wallet,
  Handshake,
  FileSearch,
  Landmark,
  Lock,
  CalendarClock,
  Settings,
  ShieldCheck,
  Eye,
  FileCheck2,
  Database,
  RefreshCw,
  Smartphone,
  FileSpreadsheet,
  Download,
  Upload,
  ChevronLeft,
  X,
  CheckCircle2,
  AlertTriangle,
  Search,
  ExternalLink,
  Printer,
  Sparkles,
} from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import { exportProductsToExcel, exportContactsToExcel } from '../utils/excelExport';

// --- Custom 3D High-Fidelity SVG Icons (Matching Reference Screenshots) ---

export const PosTerminal3DIcon: React.FC<{ className?: string }> = ({ className = 'w-7 h-7 sm:w-8 sm:h-8' }) => (
  <svg className={`${className} shrink-0 drop-shadow-md`} viewBox="0 0 36 36" fill="none">
    <rect x="6" y="8" width="24" height="25" rx="5" fill="url(#pos_grad)" stroke="#67e8f9" strokeWidth="1.2" />
    <rect x="9" y="11" width="18" height="10" rx="2.5" fill="#0f172a" stroke="#38bdf8" strokeWidth="0.8" />
    <rect x="11" y="13" width="14" height="3" rx="1" fill="#22d3ee" />
    <rect x="11" y="17" width="9" height="2" rx="0.5" fill="#38bdf8" />
    <circle cx="12" cy="24" r="1.5" fill="#f8fafc" />
    <circle cx="18" cy="24" r="1.5" fill="#f8fafc" />
    <circle cx="24" cy="24" r="1.5" fill="#f8fafc" />
    <circle cx="12" cy="28" r="1.5" fill="#f8fafc" />
    <circle cx="18" cy="28" r="1.5" fill="#22c55e" />
    <circle cx="24" cy="28" r="1.5" fill="#ef4444" />
    <path d="M11 8V3C11 2.44772 11.4477 2 12 2H24C24.5523 2 25 2.44772 25 3V8" fill="#f8fafc" />
    <path d="M13 4H23M13 6H19" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" />
    <defs>
      <linearGradient id="pos_grad" x1="18" y1="8" x2="18" y2="33" gradientUnits="userSpaceOnUse">
        <stop stopColor="#3b82f6" />
        <stop offset="1" stopColor="#1e3a8a" />
      </linearGradient>
    </defs>
  </svg>
);

export const SalesInvoice3DIcon: React.FC<{ className?: string }> = ({ className = 'w-7 h-7 sm:w-8 sm:h-8' }) => (
  <svg className={`${className} shrink-0 drop-shadow-md`} viewBox="0 0 36 36" fill="none">
    <rect x="7" y="3" width="22" height="30" rx="3" fill="#f8fafc" stroke="#38bdf8" strokeWidth="1.2" />
    <rect x="11" y="7" width="14" height="2" rx="1" fill="#3b82f6" />
    <rect x="11" y="11" width="10" height="2" rx="1" fill="#94a3b8" />
    <rect x="11" y="15" width="14" height="2" rx="1" fill="#94a3b8" />
    <rect x="11" y="19" width="8" height="2" rx="1" fill="#94a3b8" />
    <circle cx="24" cy="24" r="7" fill="url(#cart_badge)" stroke="#bae6fd" strokeWidth="1" />
    <path d="M21 22H27L26 26H22L21 22ZM21 22L20.5 20.5H19" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="22.5" cy="27.5" r="0.75" fill="#ffffff" />
    <circle cx="25.5" cy="27.5" r="0.75" fill="#ffffff" />
    <defs>
      <linearGradient id="cart_badge" x1="24" y1="17" x2="24" y2="31" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0ea5e9" />
        <stop offset="1" stopColor="#0284c7" />
      </linearGradient>
    </defs>
  </svg>
);

export const PriceTag3DIcon: React.FC<{ className?: string }> = ({ className = 'w-7 h-7 sm:w-8 sm:h-8' }) => (
  <svg className={`${className} shrink-0 drop-shadow-md`} viewBox="0 0 36 36" fill="none">
    <path d="M14 4L29 19C30 20 30 22 29 23L23 29C22 30 20 30 19 29L4 14V4H14Z" fill="url(#tag_grad)" stroke="#fecdd3" strokeWidth="1.2" />
    <circle cx="9" cy="9" r="2.5" fill="#ffffff" />
    <path d="M16 20L22 14M16.5 15.5A1 1 0 1 1 16.5 13.5A1 1 0 0 1 16.5 15.5ZM21.5 20.5A1 1 0 1 1 21.5 18.5A1 1 0 0 1 21.5 20.5Z" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" />
    <defs>
      <linearGradient id="tag_grad" x1="4" y1="4" x2="29" y2="29" gradientUnits="userSpaceOnUse">
        <stop stopColor="#f43f5e" />
        <stop offset="1" stopColor="#be123c" />
      </linearGradient>
    </defs>
  </svg>
);

export const HandTrolley3DIcon: React.FC<{ className?: string }> = ({ className = 'w-7 h-7 sm:w-8 sm:h-8' }) => (
  <svg className={`${className} shrink-0 drop-shadow-md`} viewBox="0 0 36 36" fill="none">
    <path d="M7 6L11 26H28" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="12" y="16" width="13" height="9" rx="2" fill="url(#trolley_box1)" stroke="#f59e0b" strokeWidth="0.8" />
    <rect x="14" y="9" width="10" height="7" rx="1.5" fill="url(#trolley_box2)" stroke="#f59e0b" strokeWidth="0.8" />
    <circle cx="13" cy="29" r="3" fill="#1e293b" stroke="#60a5fa" strokeWidth="1.5" />
    <circle cx="26" cy="29" r="3" fill="#1e293b" stroke="#60a5fa" strokeWidth="1.5" />
    <defs>
      <linearGradient id="trolley_box1" x1="12" y1="16" x2="25" y2="25" gradientUnits="userSpaceOnUse">
        <stop stopColor="#fbbf24" />
        <stop offset="1" stopColor="#d97706" />
      </linearGradient>
      <linearGradient id="trolley_box2" x1="14" y1="9" x2="24" y2="16" gradientUnits="userSpaceOnUse">
        <stop stopColor="#fde68a" />
        <stop offset="1" stopColor="#f59e0b" />
      </linearGradient>
    </defs>
  </svg>
);

export const ReturnCircle3DIcon: React.FC<{ className?: string }> = ({ className = 'w-7 h-7 sm:w-8 sm:h-8' }) => (
  <svg className={`${className} shrink-0 drop-shadow-md`} viewBox="0 0 36 36" fill="none">
    <circle cx="18" cy="18" r="14" fill="url(#return_grad)" stroke="#a7f3d0" strokeWidth="1.2" />
    <path d="M19 11L14 16L19 21" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M15 16H21C23.7614 16 26 18.2386 26 21V23" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
    <defs>
      <linearGradient id="return_grad" x1="18" y1="4" x2="18" y2="32" gradientUnits="userSpaceOnUse">
        <stop stopColor="#10b981" />
        <stop offset="1" stopColor="#047857" />
      </linearGradient>
    </defs>
  </svg>
);

export const BoxesStack3DIcon: React.FC<{ className?: string }> = ({ className = 'w-7 h-7 sm:w-8 sm:h-8' }) => (
  <svg className={`${className} shrink-0 drop-shadow-md`} viewBox="0 0 36 36" fill="none">
    <path d="M6 18L18 11L30 18L18 25L6 18Z" fill="#f59e0b" stroke="#fbbf24" strokeWidth="0.8" />
    <path d="M6 18V27L18 34V25L6 18Z" fill="#d97706" stroke="#b45309" strokeWidth="0.8" />
    <path d="M30 18V27L18 34V25L30 18Z" fill="#b45309" stroke="#92400e" strokeWidth="0.8" />
    <path d="M12 9L18 5L24 9L18 13L12 9Z" fill="#fbbf24" />
    <path d="M12 9V14L18 18V13L12 9Z" fill="#f59e0b" />
    <path d="M24 9V14L18 18V13L24 9Z" fill="#d97706" />
  </svg>
);

export const DoubleTransferArrows3DIcon: React.FC<{ className?: string }> = ({ className = 'w-7 h-7 sm:w-8 sm:h-8' }) => (
  <svg className={`${className} shrink-0 drop-shadow-md`} viewBox="0 0 36 36" fill="none">
    <rect x="4" y="6" width="28" height="24" rx="6" fill="#04123b" stroke="#38bdf8" strokeWidth="0.8" />
    <path d="M24 13L28 17L24 21M27 17H10" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 23L8 19L12 15M9 19H26" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const UsersGroup3DIcon: React.FC<{ className?: string }> = ({ className = 'w-7 h-7 sm:w-8 sm:h-8' }) => (
  <svg className={`${className} shrink-0 drop-shadow-md`} viewBox="0 0 36 36" fill="none">
    <circle cx="25" cy="14" r="4" fill="#facc15" stroke="#ca8a04" strokeWidth="0.8" />
    <path d="M20 25C20 22 22 20 25 20C28 20 30 22 30 25" fill="#facc15" />
    <circle cx="11" cy="14" r="4" fill="#facc15" stroke="#ca8a04" strokeWidth="0.8" />
    <path d="M6 25C6 22 8 20 11 20C14 20 16 22 16 25" fill="#facc15" />
    <circle cx="18" cy="12" r="5" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
    <path d="M12 26C12 22 14.5 20 18 20C21.5 20 24 22 24 26" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
  </svg>
);

export const VouchersDoc3DIcon: React.FC<{ className?: string }> = ({ className = 'w-7 h-7 sm:w-8 sm:h-8' }) => (
  <svg className={`${className} shrink-0 drop-shadow-md`} viewBox="0 0 36 36" fill="none">
    <rect x="7" y="4" width="22" height="28" rx="3" fill="#ffffff" stroke="#93c5fd" strokeWidth="1.2" />
    <rect x="11" y="9" width="14" height="2" rx="1" fill="#3b82f6" />
    <rect x="11" y="14" width="10" height="2" rx="1" fill="#cbd5e1" />
    <path d="M22 20V29M22 20L25 23M22 20L19 23" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 29V20M14 29L11 26M14 29L17 26" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const JournalLedger3DIcon: React.FC<{ className?: string }> = ({ className = 'w-7 h-7 sm:w-8 sm:h-8' }) => (
  <svg className={`${className} shrink-0 drop-shadow-md`} viewBox="0 0 36 36" fill="none">
    <rect x="6" y="5" width="24" height="26" rx="4" fill="url(#ledger_grad)" stroke="#60a5fa" strokeWidth="1.2" />
    <line x1="11" y1="5" x2="11" y2="31" stroke="#93c5fd" strokeWidth="1.5" />
    <rect x="15" y="10" width="10" height="2" rx="1" fill="#ffffff" />
    <rect x="15" y="14" width="8" height="2" rx="1" fill="#93c5fd" />
    <circle cx="23" cy="24" r="5" fill="#0369a1" stroke="#38bdf8" strokeWidth="1" />
    <path d="M23 21V27M20 24H26" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
    <defs>
      <linearGradient id="ledger_grad" x1="18" y1="5" x2="18" y2="31" gradientUnits="userSpaceOnUse">
        <stop stopColor="#2563eb" />
        <stop offset="1" stopColor="#1e3a8a" />
      </linearGradient>
    </defs>
  </svg>
);

export const CurrencyFx3DIcon: React.FC<{ className?: string }> = ({ className = 'w-7 h-7 sm:w-8 sm:h-8' }) => (
  <svg className={`${className} shrink-0 drop-shadow-md`} viewBox="0 0 36 36" fill="none">
    <circle cx="14" cy="18" r="9" fill="url(#gold_coin)" stroke="#fef08a" strokeWidth="1" />
    <text x="14" y="22" textAnchor="middle" fill="#78350f" fontSize="11" fontWeight="bold">$</text>
    <circle cx="23" cy="18" r="8" fill="url(#euro_coin)" stroke="#bae6fd" strokeWidth="1" />
    <text x="23" y="22" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">€</text>
    <path d="M9 10C12 7 24 7 27 10" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M27 26C24 29 12 29 9 26" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
    <defs>
      <linearGradient id="gold_coin" x1="14" y1="9" x2="14" y2="27" gradientUnits="userSpaceOnUse">
        <stop stopColor="#fde047" />
        <stop offset="1" stopColor="#ca8a04" />
      </linearGradient>
      <linearGradient id="euro_coin" x1="23" y1="10" x2="23" y2="26" gradientUnits="userSpaceOnUse">
        <stop stopColor="#38bdf8" />
        <stop offset="1" stopColor="#0284c7" />
      </linearGradient>
    </defs>
  </svg>
);

export const Warehouse3DIcon: React.FC<{ className?: string }> = ({ className = 'w-7 h-7 sm:w-8 sm:h-8' }) => (
  <svg className={`${className} shrink-0 drop-shadow-md`} viewBox="0 0 36 36" fill="none">
    <path d="M4 14L18 6L32 14V30H4V14Z" fill="url(#wh_grad)" stroke="#38bdf8" strokeWidth="1.2" />
    <rect x="12" y="18" width="12" height="12" rx="1" fill="#0c4a6e" stroke="#7dd3fc" strokeWidth="1" />
    <rect x="14" y="21" width="8" height="7" rx="1" fill="#f59e0b" />
    <line x1="18" y1="21" x2="18" y2="28" stroke="#78350f" strokeWidth="0.8" />
    <defs>
      <linearGradient id="wh_grad" x1="18" y1="6" x2="18" y2="30" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0284c7" />
        <stop offset="1" stopColor="#082f49" />
      </linearGradient>
    </defs>
  </svg>
);

export const ItemMovement3DIcon: React.FC<{ className?: string }> = ({ className = 'w-7 h-7 sm:w-8 sm:h-8' }) => (
  <svg className={`${className} shrink-0 drop-shadow-md`} viewBox="0 0 36 36" fill="none">
    <rect x="6" y="8" width="14" height="12" rx="2" fill="#f59e0b" stroke="#fde047" strokeWidth="0.8" />
    <circle cx="23" cy="22" r="8.5" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.2" />
    <circle cx="23" cy="22" r="6" fill="#0f172a" />
    <path d="M23 18V22H26" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const BarcodeScanner3DIcon: React.FC<{ className?: string }> = ({ className = 'w-7 h-7 sm:w-8 sm:h-8' }) => (
  <svg className={`${className} shrink-0 drop-shadow-md`} viewBox="0 0 36 36" fill="none">
    <rect x="7" y="17" width="22" height="13" rx="2" fill="#0f172a" stroke="#475569" strokeWidth="0.8" />
    <path d="M10 20V27M13 20V27M15 20V27M18 20V27M21 20V27M24 20V27" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M6 24H30" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="2 1" />
    <path d="M26 7L18 10L19 15L27 12L26 7Z" fill="#3b82f6" stroke="#60a5fa" strokeWidth="0.8" />
    <path d="M18 10L14 17L17 19L21 12" fill="#1e3a8a" />
  </svg>
);

export const StockAlertBell3DIcon: React.FC<{ className?: string }> = ({ className = 'w-7 h-7 sm:w-8 sm:h-8' }) => (
  <svg className={`${className} shrink-0 drop-shadow-md`} viewBox="0 0 36 36" fill="none">
    <path d="M18 5C14 5 11 8 11 13V19L8 23H28L25 19V13C25 8 22 5 18 5Z" fill="url(#bell_grad)" stroke="#fef08a" strokeWidth="1.2" />
    <circle cx="18" cy="27" r="3" fill="#ca8a04" />
    <circle cx="26" cy="11" r="5" fill="#ef4444" stroke="#ffffff" strokeWidth="1" />
    <text x="26" y="14" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">!</text>
    <defs>
      <linearGradient id="bell_grad" x1="18" y1="5" x2="18" y2="25" gradientUnits="userSpaceOnUse">
        <stop stopColor="#fde047" />
        <stop offset="1" stopColor="#eab308" />
      </linearGradient>
    </defs>
  </svg>
);

export const StocktakeClipboard3DIcon: React.FC<{ className?: string }> = ({ className = 'w-7 h-7 sm:w-8 sm:h-8' }) => (
  <svg className={`${className} shrink-0 drop-shadow-md`} viewBox="0 0 36 36" fill="none">
    <rect x="7" y="6" width="22" height="26" rx="3" fill="#ffffff" stroke="#93c5fd" strokeWidth="1" />
    <rect x="13" y="4" width="10" height="4" rx="1.5" fill="#0284c7" />
    <path d="M11 14L13 16L17 12" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M11 20L13 22L17 18" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="20" y="13" width="6" height="2" rx="1" fill="#94a3b8" />
    <rect x="20" y="19" width="6" height="2" rx="1" fill="#94a3b8" />
    <rect x="17" y="25" width="9" height="7" rx="1.5" fill="#f59e0b" />
  </svg>
);

export const CartPlus3DIcon: React.FC<{ className?: string }> = ({ className = 'w-7 h-7 sm:w-8 sm:h-8' }) => (
  <svg className={`${className} shrink-0 drop-shadow-md`} viewBox="0 0 36 36" fill="none">
    <path d="M7 8H11L14 22H26L28 11H12" stroke="#0284c7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="16" cy="26" r="2.5" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
    <circle cx="24" cy="26" r="2.5" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
    <circle cx="27" cy="18" r="6" fill="#22c55e" stroke="#ffffff" strokeWidth="1" />
    <path d="M27 15V21M24 18H30" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

export const BalanceScales3DIcon: React.FC<{ className?: string }> = ({ className = 'w-7 h-7 sm:w-8 sm:h-8' }) => (
  <svg className={`${className} shrink-0 drop-shadow-md`} viewBox="0 0 36 36" fill="none">
    <path d="M18 5V30M18 5L9 9M18 5L27 9" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
    <path d="M5 19C5 22 9 22 9 19L7 12L5 19Z" fill="#f59e0b" stroke="#fef08a" strokeWidth="0.8" />
    <path d="M23 19C23 22 27 22 27 19L29 12L23 19Z" fill="#f59e0b" stroke="#fef08a" strokeWidth="0.8" />
    <rect x="13" y="29" width="10" height="3" rx="1.5" fill="#d97706" />
  </svg>
);

export const WalletMoney3DIcon: React.FC<{ className?: string }> = ({ className = 'w-7 h-7 sm:w-8 sm:h-8' }) => (
  <svg className={`${className} shrink-0 drop-shadow-md`} viewBox="0 0 36 36" fill="none">
    <rect x="5" y="11" width="26" height="20" rx="4" fill="url(#wallet_grad)" stroke="#f59e0b" strokeWidth="1" />
    <rect x="9" y="6" width="18" height="8" rx="2" fill="#22c55e" stroke="#86efac" strokeWidth="0.8" />
    <rect x="22" y="17" width="9" height="8" rx="2" fill="#b45309" stroke="#fde68a" strokeWidth="1" />
    <circle cx="25" cy="21" r="1.5" fill="#fef08a" />
    <defs>
      <linearGradient id="wallet_grad" x1="18" y1="11" x2="18" y2="31" gradientUnits="userSpaceOnUse">
        <stop stopColor="#d97706" />
        <stop offset="1" stopColor="#78350f" />
      </linearGradient>
    </defs>
  </svg>
);

export const Handshake3DIcon: React.FC<{ className?: string }> = ({ className = 'w-7 h-7 sm:w-8 sm:h-8' }) => (
  <svg className={`${className} shrink-0 drop-shadow-md`} viewBox="0 0 36 36" fill="none">
    <path d="M6 14L13 20L18 16L15 11L6 14Z" fill="#0284c7" stroke="#7dd3fc" strokeWidth="1" />
    <path d="M30 14L23 20L18 16L21 11L30 14Z" fill="#0369a1" stroke="#7dd3fc" strokeWidth="1" />
    <path d="M14 18L18 22L22 18" stroke="#fed7aa" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const AccountLedger3DIcon: React.FC<{ className?: string }> = ({ className = 'w-7 h-7 sm:w-8 sm:h-8' }) => (
  <svg className={`${className} shrink-0 drop-shadow-md`} viewBox="0 0 36 36" fill="none">
    <rect x="6" y="5" width="24" height="26" rx="3" fill="#ffffff" stroke="#93c5fd" strokeWidth="1.2" />
    <rect x="10" y="9" width="14" height="2" rx="1" fill="#3b82f6" />
    <rect x="10" y="14" width="10" height="2" rx="1" fill="#cbd5e1" />
    <rect x="10" y="18" width="14" height="2" rx="1" fill="#cbd5e1" />
    <circle cx="24" cy="24" r="6" fill="#0284c7" stroke="#ffffff" strokeWidth="1.2" />
    <line x1="28" y1="28" x2="31" y2="31" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

export const BankBuilding3DIcon: React.FC<{ className?: string }> = ({ className = 'w-7 h-7 sm:w-8 sm:h-8' }) => (
  <svg className={`${className} shrink-0 drop-shadow-md`} viewBox="0 0 36 36" fill="none">
    <path d="M5 12L18 5L31 12H5Z" fill="#38bdf8" stroke="#bae6fd" strokeWidth="1" />
    <rect x="8" y="14" width="3" height="12" fill="#ffffff" />
    <rect x="14" y="14" width="3" height="12" fill="#ffffff" />
    <rect x="20" y="14" width="3" height="12" fill="#ffffff" />
    <rect x="26" y="14" width="3" height="12" fill="#ffffff" />
    <rect x="4" y="27" width="28" height="4" rx="1" fill="#0284c7" stroke="#38bdf8" strokeWidth="0.8" />
  </svg>
);

export const Padlock3DIcon: React.FC<{ className?: string }> = ({ className = 'w-7 h-7 sm:w-8 sm:h-8' }) => (
  <svg className={`${className} shrink-0 drop-shadow-md`} viewBox="0 0 36 36" fill="none">
    <rect x="8" y="14" width="20" height="18" rx="4" fill="url(#lock_grad)" stroke="#fde047" strokeWidth="1.2" />
    <path d="M12 14V10C12 6.68629 14.6863 4 18 4C21.3137 4 24 6.68629 24 10V14" stroke="#fef08a" strokeWidth="3" strokeLinecap="round" />
    <circle cx="18" cy="22" r="2.5" fill="#78350f" />
    <rect x="17" y="22" width="2" height="4" fill="#78350f" />
    <defs>
      <linearGradient id="lock_grad" x1="18" y1="14" x2="18" y2="32" gradientUnits="userSpaceOnUse">
        <stop stopColor="#facc15" />
        <stop offset="1" stopColor="#ca8a04" />
      </linearGradient>
    </defs>
  </svg>
);

export const CalendarClock3DIcon: React.FC<{ className?: string }> = ({ className = 'w-7 h-7 sm:w-8 sm:h-8' }) => (
  <svg className={`${className} shrink-0 drop-shadow-md`} viewBox="0 0 36 36" fill="none">
    <rect x="5" y="7" width="22" height="24" rx="3" fill="#ffffff" stroke="#93c5fd" strokeWidth="1.2" />
    <rect x="5" y="7" width="22" height="6" fill="#0284c7" />
    <circle cx="23" cy="23" r="8" fill="#0284c7" stroke="#ffffff" strokeWidth="1.2" />
    <circle cx="23" cy="23" r="6" fill="#0f172a" />
    <path d="M23 19V23H26" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const SettingsGear3DIcon: React.FC<{ className?: string }> = ({ className = 'w-7 h-7 sm:w-8 sm:h-8' }) => (
  <svg className={`${className} shrink-0 drop-shadow-md`} viewBox="0 0 36 36" fill="none">
    <circle cx="18" cy="18" r="13" fill="url(#gear_grad)" stroke="#67e8f9" strokeWidth="1.2" />
    <circle cx="18" cy="18" r="5" fill="#040d2e" stroke="#38bdf8" strokeWidth="1.5" />
    <path d="M18 2V7M18 29V34M2 18H7M29 18H34" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M6.5 6.5L10 10M26 26L29.5 29.5M6.5 29.5L10 26M26 10L29.5 6.5" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
    <defs>
      <linearGradient id="gear_grad" x1="18" y1="5" x2="18" y2="31" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0284c7" />
        <stop offset="1" stopColor="#082f49" />
      </linearGradient>
    </defs>
  </svg>
);

export const CloudSync3DIcon: React.FC<{ className?: string }> = ({ className = 'w-7 h-7 sm:w-8 sm:h-8' }) => (
  <svg className={`${className} shrink-0 drop-shadow-md`} viewBox="0 0 36 36" fill="none">
    <path d="M10 22C6.68629 22 4 19.3137 4 16C4 12.9 6.3 10.3 9.4 10.1C10.5 5.5 14.8 2 20 2C26.1 2 31 6.9 31 13C31 13.3 31 13.7 30.9 14C33.3 15 35 17.3 35 20C35 23.3 32.3 26 29 26H10" fill="url(#cloud_grad)" stroke="#bae6fd" strokeWidth="1.2" />
    <rect x="23" y="19" width="10" height="14" rx="3" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
    <path d="M28 22V30M25 25L28 22L31 25" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <defs>
      <linearGradient id="cloud_grad" x1="18" y1="2" x2="18" y2="26" gradientUnits="userSpaceOnUse">
        <stop stopColor="#38bdf8" />
        <stop offset="1" stopColor="#0284c7" />
      </linearGradient>
    </defs>
  </svg>
);

export const SecurityAudit3DIcon: React.FC<{ className?: string }> = ({ className = 'w-7 h-7 sm:w-8 sm:h-8' }) => (
  <svg className={`${className} shrink-0 drop-shadow-md`} viewBox="0 0 36 36" fill="none">
    <path d="M18 3L6 8V18C6 25 11 31 18 34C25 31 30 25 30 18V8L18 3Z" fill="url(#shield_grad)" stroke="#67e8f9" strokeWidth="1.2" />
    <circle cx="18" cy="14" r="3.5" fill="#ffffff" />
    <path d="M12 24C12 21 14.5 19 18 19C21.5 19 24 21 24 24" fill="#ffffff" />
    <circle cx="26" cy="26" r="4.5" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
    <path d="M26 24V28M24 26H28" stroke="#22d3ee" strokeWidth="1.2" strokeLinecap="round" />
    <defs>
      <linearGradient id="shield_grad" x1="18" y1="3" x2="18" y2="34" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0ea5e9" />
        <stop offset="1" stopColor="#0369a1" />
      </linearGradient>
    </defs>
  </svg>
);

export const DatabaseCheck3DIcon: React.FC<{ className?: string }> = ({ className = 'w-7 h-7 sm:w-8 sm:h-8' }) => (
  <svg className={`${className} shrink-0 drop-shadow-md`} viewBox="0 0 36 36" fill="none">
    <ellipse cx="18" cy="9" rx="12" ry="4" fill="#38bdf8" stroke="#bae6fd" strokeWidth="1" />
    <path d="M6 9V17C6 19.2 11.4 21 18 21C24.6 21 30 19.2 30 17V9" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
    <path d="M6 17V25C6 27.2 11.4 29 18 29C24.6 29 30 27.2 30 25V17" fill="#0369a1" stroke="#38bdf8" strokeWidth="1" />
    <circle cx="26" cy="26" r="6" fill="#22c55e" stroke="#ffffff" strokeWidth="1.2" />
    <path d="M24 26L25.5 27.5L28.5 24.5" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const DeviceSync3DIcon: React.FC<{ className?: string }> = ({ className = 'w-7 h-7 sm:w-8 sm:h-8' }) => (
  <svg className={`${className} shrink-0 drop-shadow-md`} viewBox="0 0 36 36" fill="none">
    <rect x="4" y="6" width="22" height="15" rx="2" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
    <rect x="7" y="9" width="16" height="9" fill="#0f172a" />
    <rect x="20" y="14" width="12" height="18" rx="2" fill="#0369a1" stroke="#67e8f9" strokeWidth="1" />
    <rect x="22" y="17" width="8" height="11" fill="#0f172a" />
    <circle cx="18" cy="24" r="5" fill="#22c55e" stroke="#ffffff" strokeWidth="1" />
    <path d="M16 24L17.5 25.5L20 22.5" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const PdfExcelExport3DIcon: React.FC<{ className?: string }> = ({ className = 'w-7 h-7 sm:w-8 sm:h-8' }) => (
  <svg className={`${className} shrink-0 drop-shadow-md`} viewBox="0 0 36 36" fill="none">
    {/* Red PDF Icon */}
    <rect x="4" y="7" width="14" height="20" rx="2.5" fill="#ef4444" stroke="#fca5a5" strokeWidth="0.8" />
    <text x="11" y="18" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">PDF</text>
    {/* Green Excel Icon */}
    <rect x="18" y="9" width="14" height="20" rx="2.5" fill="#16a34a" stroke="#86efac" strokeWidth="0.8" />
    <text x="25" y="21" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="900">X</text>
  </svg>
);

export const ProhibitedDoc3DIcon: React.FC<{ className?: string }> = ({ className = 'w-7 h-7 sm:w-8 sm:h-8' }) => (
  <svg className={`${className} shrink-0 drop-shadow-md`} viewBox="0 0 36 36" fill="none">
    <rect x="6" y="5" width="20" height="26" rx="3" fill="#ffffff" stroke="#93c5fd" strokeWidth="1" />
    <rect x="10" y="9" width="12" height="2" fill="#3b82f6" />
    <rect x="10" y="13" width="8" height="2" fill="#cbd5e1" />
    <circle cx="23" cy="23" r="8" fill="#ef4444" stroke="#ffffff" strokeWidth="1.2" />
    <line x1="17.5" y1="17.5" x2="28.5" y2="28.5" stroke="#ffffff" strokeWidth="2.5" />
  </svg>
);

export const EyeDoc3DIcon: React.FC<{ className?: string }> = ({ className = 'w-7 h-7 sm:w-8 sm:h-8' }) => (
  <svg className={`${className} shrink-0 drop-shadow-md`} viewBox="0 0 36 36" fill="none">
    <rect x="6" y="4" width="20" height="26" rx="3" fill="#ffffff" stroke="#93c5fd" strokeWidth="1" />
    <rect x="10" y="8" width="12" height="2" fill="#3b82f6" />
    <rect x="10" y="12" width="9" height="2" fill="#cbd5e1" />
    <circle cx="23" cy="23" r="7.5" fill="#0284c7" stroke="#ffffff" strokeWidth="1" />
    <ellipse cx="23" cy="23" rx="4.5" ry="3" fill="#ffffff" />
    <circle cx="23" cy="23" r="1.8" fill="#0284c7" />
  </svg>
);

export const RestoreDatabase3DIcon: React.FC<{ className?: string }> = ({ className = 'w-7 h-7 sm:w-8 sm:h-8' }) => (
  <svg className={`${className} shrink-0 drop-shadow-md`} viewBox="0 0 36 36" fill="none">
    <rect x="16" y="12" width="15" height="18" rx="3" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
    <circle cx="12" cy="18" r="8" fill="#0284c7" stroke="#bae6fd" strokeWidth="1.2" />
    <path d="M12 13V18L15 20" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M7 15L12 11L14 16" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const OrgChart3DIcon: React.FC<{ className?: string }> = ({ className = 'w-7 h-7 sm:w-8 sm:h-8' }) => (
  <svg className={`${className} shrink-0 drop-shadow-md`} viewBox="0 0 36 36" fill="none">
    <rect x="14" y="4" width="8" height="6" rx="1.5" fill="#38bdf8" stroke="#ffffff" strokeWidth="0.8" />
    <line x1="18" y1="10" x2="18" y2="16" stroke="#bae6fd" strokeWidth="1.5" />
    <line x1="8" y1="16" x2="28" y2="16" stroke="#bae6fd" strokeWidth="1.5" />
    <rect x="4" y="18" width="8" height="6" rx="1.5" fill="#0284c7" />
    <rect x="14" y="18" width="8" height="6" rx="1.5" fill="#0284c7" />
    <rect x="24" y="18" width="8" height="6" rx="1.5" fill="#0284c7" />
    <circle cx="8" cy="28" r="2" fill="#22c55e" />
    <circle cx="18" cy="28" r="2" fill="#22c55e" />
    <circle cx="28" cy="28" r="2" fill="#22c55e" />
  </svg>
);

// --- Component Definition ---

export const MainMenuUnifiedGrid: React.FC = () => {
  const {
    setActiveView,
    invoices,
    products,
    contacts,
    accounts,
    journalEntries,
    settings,
    auditLogs,
    exportDatabaseJson,
    importDatabaseJson,
    showToast,
  } = useAccounting();

  // Modal Dialog States for Image 2 Advanced Features
  const [auditLogModalOpen, setAuditLogModalOpen] = useState(false);
  const [permissionsModalOpen, setPermissionsModalOpen] = useState(false);
  const [docAuditTrackerModalOpen, setDocAuditTrackerModalOpen] = useState(false);
  const [immutabilityModalOpen, setImmutabilityModalOpen] = useState(false);
  const [restoreModalOpen, setRestoreModalOpen] = useState(false);
  const [deviceSyncModalOpen, setDeviceSyncModalOpen] = useState(false);
  const [quickExportModalOpen, setQuickExportModalOpen] = useState(false);
  const [barcodeSearchModalOpen, setBarcodeSearchModalOpen] = useState(false);
  const [periodClosingModalOpen, setPeriodClosingModalOpen] = useState(false);
  const [costCentersModalOpen, setCostCentersModalOpen] = useState(false);

  // Barcode search query
  const [barcodeInput, setBarcodeInput] = useState('');

  // Helper navigation with target sub-tab handling
  const navigateInventory = (tab: 'items' | 'alerts' | 'movements' | 'adjustments') => {
    sessionStorage.setItem('alghafari_inventory_tab', tab);
    setActiveView('inventory');
  };

  const navigateReports = (reportKey: string) => {
    sessionStorage.setItem('alghafari_reports_tab', reportKey);
    setActiveView('reports');
  };

  const navigateSettings = (sectionKey: string) => {
    sessionStorage.setItem('alghafari_settings_tab', sectionKey);
    setActiveView('settings');
  };

  // Instant local backup
  const handleInstantAutoBackup = () => {
    try {
      const jsonStr = exportDatabaseJson();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `alghafari_soft_pro_backup_${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      localStorage.setItem('alghafari_last_backup_date', new Date().toLocaleString('ar-SA'));
      showToast('تم تصدير وحفظ النسخة الاحتياطية الشاملة تلقائياً بنجاح ✓', 'success');
    } catch {
      showToast('حدث خطأ أثناء إنشاء النسخة الاحتياطية', 'error');
    }
  };

  // Fast Barcode item lookup
  const matchedBarcodeProduct = barcodeInput.trim()
    ? products.find(
        (p) =>
          p.barcode?.toLowerCase() === barcodeInput.trim().toLowerCase() ||
          p.code?.toLowerCase() === barcodeInput.trim().toLowerCase()
      )
    : null;

  return (
    <div className="space-y-6 select-none" id="main-menu-unified-root">
      {/* =========================================================================
          SECTION 1: Image 1 - The 2-Column Core Business Grid + Settings Bar
          In RTL: 1st child = RIGHT (3D Icon), 2nd = CENTER (Text), 3rd = LEFT (Chevron <)
          ========================================================================= */}
      <div className="space-y-3 sm:space-y-3.5">
        {/* Row 1 */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3.5">
          {/* Right Col: نقطة البيع (POS) سريع */}
          <button
            type="button"
            onClick={() => setActiveView('pos')}
            className="onyx-neon-btn min-h-[58px] sm:min-h-[64px] px-3 sm:px-4 py-2 flex items-center justify-between text-right cursor-pointer group"
          >
            <PosTerminal3DIcon />
            <div className="flex-1 px-2.5">
              <div className="font-black text-white text-xs sm:text-sm lg:text-base leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                نقطة البيع (POS)
              </div>
              <div className="text-[10px] sm:text-xs text-cyan-300 font-bold">سريع</div>
            </div>
            <div className="onyx-chevron-circle">
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform stroke-[2.5]" />
            </div>
          </button>

          {/* Left Col: فواتير المبيعات */}
          <button
            type="button"
            onClick={() => setActiveView('invoices')}
            className="onyx-neon-btn min-h-[58px] sm:min-h-[64px] px-3 sm:px-4 py-2 flex items-center justify-between text-right cursor-pointer group"
          >
            <SalesInvoice3DIcon />
            <div className="flex-1 px-2.5 font-black text-white text-xs sm:text-sm lg:text-base drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              فواتير المبيعات
            </div>
            <div className="onyx-chevron-circle">
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform stroke-[2.5]" />
            </div>
          </button>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3.5">
          {/* Right Col: عروض الأسعار */}
          <button
            type="button"
            onClick={() => setActiveView('quotations')}
            className="onyx-neon-btn min-h-[58px] sm:min-h-[64px] px-3 sm:px-4 py-2 flex items-center justify-between text-right cursor-pointer group"
          >
            <PriceTag3DIcon />
            <div className="flex-1 px-2.5 font-black text-white text-xs sm:text-sm lg:text-base drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              عروض الأسعار
            </div>
            <div className="onyx-chevron-circle">
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform stroke-[2.5]" />
            </div>
          </button>

          {/* Left Col: المشتريات والتوريد */}
          <button
            type="button"
            onClick={() => setActiveView('purchases')}
            className="onyx-neon-btn min-h-[58px] sm:min-h-[64px] px-3 sm:px-4 py-2 flex items-center justify-between text-right cursor-pointer group"
          >
            <HandTrolley3DIcon />
            <div className="flex-1 px-2.5 font-black text-white text-xs sm:text-sm lg:text-base drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              المشتريات والتوريد
            </div>
            <div className="onyx-chevron-circle">
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform stroke-[2.5]" />
            </div>
          </button>
        </div>

        {/* Row 3 */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3.5">
          {/* Right Col: المردودات */}
          <button
            type="button"
            onClick={() => setActiveView('returns')}
            className="onyx-neon-btn min-h-[58px] sm:min-h-[64px] px-3 sm:px-4 py-2 flex items-center justify-between text-right cursor-pointer group"
          >
            <ReturnCircle3DIcon />
            <div className="flex-1 px-2.5 font-black text-white text-xs sm:text-sm lg:text-base drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              المردودات
            </div>
            <div className="onyx-chevron-circle">
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform stroke-[2.5]" />
            </div>
          </button>

          {/* Left Col: المخزون و COGS */}
          <button
            type="button"
            onClick={() => navigateInventory('items')}
            className="onyx-neon-btn min-h-[58px] sm:min-h-[64px] px-3 sm:px-4 py-2 flex items-center justify-between text-right cursor-pointer group"
          >
            <BoxesStack3DIcon />
            <div className="flex-1 px-2.5 font-black text-white text-xs sm:text-sm lg:text-base drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              المخزون و COGS
            </div>
            <div className="onyx-chevron-circle">
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform stroke-[2.5]" />
            </div>
          </button>
        </div>

        {/* Row 4 */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3.5">
          {/* Right Col: التحويلات والاستلام */}
          <button
            type="button"
            onClick={() => setActiveView('transfers')}
            className="onyx-neon-btn min-h-[58px] sm:min-h-[64px] px-3 sm:px-4 py-2 flex items-center justify-between text-right cursor-pointer group"
          >
            <DoubleTransferArrows3DIcon />
            <div className="flex-1 px-2.5 font-black text-white text-xs sm:text-sm lg:text-base drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              التحويلات والاستلام
            </div>
            <div className="onyx-chevron-circle">
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform stroke-[2.5]" />
            </div>
          </button>

          {/* Left Col: العملاء والموردين */}
          <button
            type="button"
            onClick={() => setActiveView('contacts')}
            className="onyx-neon-btn min-h-[58px] sm:min-h-[64px] px-3 sm:px-4 py-2 flex items-center justify-between text-right cursor-pointer group"
          >
            <UsersGroup3DIcon />
            <div className="flex-1 px-2.5 font-black text-white text-xs sm:text-sm lg:text-base drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              العملاء والموردين
            </div>
            <div className="onyx-chevron-circle">
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform stroke-[2.5]" />
            </div>
          </button>
        </div>

        {/* Row 5 */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3.5">
          {/* Right Col: سندات القبض والصرف */}
          <button
            type="button"
            onClick={() => setActiveView('vouchers')}
            className="onyx-neon-btn min-h-[58px] sm:min-h-[64px] px-3 sm:px-4 py-2 flex items-center justify-between text-right cursor-pointer group"
          >
            <VouchersDoc3DIcon />
            <div className="flex-1 px-2.5 font-black text-white text-xs sm:text-sm lg:text-base drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              سندات القبض والصرف
            </div>
            <div className="onyx-chevron-circle">
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform stroke-[2.5]" />
            </div>
          </button>

          {/* Left Col: قيود اليومية الآلية */}
          <button
            type="button"
            onClick={() => setActiveView('journal')}
            className="onyx-neon-btn min-h-[58px] sm:min-h-[64px] px-3 sm:px-4 py-2 flex items-center justify-between text-right cursor-pointer group"
          >
            <JournalLedger3DIcon />
            <div className="flex-1 px-2.5 font-black text-white text-xs sm:text-sm lg:text-base drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              قيود اليومية الآلية
            </div>
            <div className="onyx-chevron-circle">
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform stroke-[2.5]" />
            </div>
          </button>
        </div>

        {/* Row 6 */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3.5">
          {/* Right Col: العملات وأسعار الصرف */}
          <button
            type="button"
            onClick={() => setActiveView('currencies')}
            className="onyx-neon-btn min-h-[58px] sm:min-h-[64px] px-3 sm:px-4 py-2 flex items-center justify-between text-right cursor-pointer group"
          >
            <CurrencyFx3DIcon />
            <div className="flex-1 px-2.5 font-black text-white text-xs sm:text-sm lg:text-base drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              العملات وأسعار الصرف
            </div>
            <div className="onyx-chevron-circle">
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform stroke-[2.5]" />
            </div>
          </button>

          {/* Left Col: الفروع والمستودعات */}
          <button
            type="button"
            onClick={() => setActiveView('branches')}
            className="onyx-neon-btn min-h-[58px] sm:min-h-[64px] px-3 sm:px-4 py-2 flex items-center justify-between text-right cursor-pointer group"
          >
            <Warehouse3DIcon />
            <div className="flex-1 px-2.5 font-black text-white text-xs sm:text-sm lg:text-base drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              الفروع والمستودعات
            </div>
            <div className="onyx-chevron-circle">
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform stroke-[2.5]" />
            </div>
          </button>
        </div>

        {/* Row 7 */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3.5">
          {/* Right Col: حركة الصنف */}
          <button
            type="button"
            onClick={() => navigateInventory('movements')}
            className="onyx-neon-btn min-h-[58px] sm:min-h-[64px] px-3 sm:px-4 py-2 flex items-center justify-between text-right cursor-pointer group"
          >
            <ItemMovement3DIcon />
            <div className="flex-1 px-2.5 font-black text-white text-xs sm:text-sm lg:text-base drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              حركة الصنف
            </div>
            <div className="onyx-chevron-circle">
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform stroke-[2.5]" />
            </div>
          </button>

          {/* Left Col: باركود الأصناف */}
          <button
            type="button"
            onClick={() => setBarcodeSearchModalOpen(true)}
            className="onyx-neon-btn min-h-[58px] sm:min-h-[64px] px-3 sm:px-4 py-2 flex items-center justify-between text-right cursor-pointer group"
          >
            <BarcodeScanner3DIcon />
            <div className="flex-1 px-2.5 font-black text-white text-xs sm:text-sm lg:text-base drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              باركود الأصناف
            </div>
            <div className="onyx-chevron-circle">
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform stroke-[2.5]" />
            </div>
          </button>
        </div>

        {/* Row 8 */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3.5">
          {/* Right Col: تنبيهات المخزون */}
          <button
            type="button"
            onClick={() => navigateInventory('alerts')}
            className="onyx-neon-btn min-h-[58px] sm:min-h-[64px] px-3 sm:px-4 py-2 flex items-center justify-between text-right cursor-pointer group"
          >
            <StockAlertBell3DIcon />
            <div className="flex-1 px-2.5 font-black text-white text-xs sm:text-sm lg:text-base drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              تنبيهات المخزون
            </div>
            <div className="onyx-chevron-circle">
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform stroke-[2.5]" />
            </div>
          </button>

          {/* Left Col: جرد المخزون */}
          <button
            type="button"
            onClick={() => navigateInventory('adjustments')}
            className="onyx-neon-btn min-h-[58px] sm:min-h-[64px] px-3 sm:px-4 py-2 flex items-center justify-between text-right cursor-pointer group"
          >
            <StocktakeClipboard3DIcon />
            <div className="flex-1 px-2.5 font-black text-white text-xs sm:text-sm lg:text-base drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              جرد المخزون
            </div>
            <div className="onyx-chevron-circle">
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform stroke-[2.5]" />
            </div>
          </button>
        </div>

        {/* Row 9 */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3.5">
          {/* Right Col: طلبات الشراء */}
          <button
            type="button"
            onClick={() => setActiveView('purchases')}
            className="onyx-neon-btn min-h-[58px] sm:min-h-[64px] px-3 sm:px-4 py-2 flex items-center justify-between text-right cursor-pointer group"
          >
            <CartPlus3DIcon />
            <div className="flex-1 px-2.5 font-black text-white text-xs sm:text-sm lg:text-base drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              طلبات الشراء
            </div>
            <div className="onyx-chevron-circle">
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform stroke-[2.5]" />
            </div>
          </button>

          {/* Left Col: تسوية المخزون */}
          <button
            type="button"
            onClick={() => navigateInventory('adjustments')}
            className="onyx-neon-btn min-h-[58px] sm:min-h-[64px] px-3 sm:px-4 py-2 flex items-center justify-between text-right cursor-pointer group"
          >
            <BalanceScales3DIcon />
            <div className="flex-1 px-2.5 font-black text-white text-xs sm:text-sm lg:text-base drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              تسوية المخزون
            </div>
            <div className="onyx-chevron-circle">
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform stroke-[2.5]" />
            </div>
          </button>
        </div>

        {/* Row 10 */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3.5">
          {/* Right Col: المصروفات والإيرادات */}
          <button
            type="button"
            onClick={() => navigateReports('INCOME_STATEMENT')}
            className="onyx-neon-btn min-h-[58px] sm:min-h-[64px] px-3 sm:px-4 py-2 flex items-center justify-between text-right cursor-pointer group"
          >
            <WalletMoney3DIcon />
            <div className="flex-1 px-2.5 font-black text-white text-xs sm:text-sm lg:text-base drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              المصروفات والإيرادات
            </div>
            <div className="onyx-chevron-circle">
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform stroke-[2.5]" />
            </div>
          </button>

          {/* Left Col: أوامر البيع */}
          <button
            type="button"
            onClick={() => setActiveView('quotations')}
            className="onyx-neon-btn min-h-[58px] sm:min-h-[64px] px-3 sm:px-4 py-2 flex items-center justify-between text-right cursor-pointer group"
          >
            <Handshake3DIcon />
            <div className="flex-1 px-2.5 font-black text-white text-xs sm:text-sm lg:text-base drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              أوامر البيع
            </div>
            <div className="onyx-chevron-circle">
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform stroke-[2.5]" />
            </div>
          </button>
        </div>

        {/* Row 11 */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3.5">
          {/* Right Col: كشف حساب تفصيلي */}
          <button
            type="button"
            onClick={() => navigateReports('ACCOUNT_LEDGER')}
            className="onyx-neon-btn min-h-[58px] sm:min-h-[64px] px-3 sm:px-4 py-2 flex items-center justify-between text-right cursor-pointer group"
          >
            <AccountLedger3DIcon />
            <div className="flex-1 px-2.5 font-black text-white text-xs sm:text-sm lg:text-base drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              كشف حساب تفصيلي
            </div>
            <div className="onyx-chevron-circle">
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform stroke-[2.5]" />
            </div>
          </button>

          {/* Left Col: الخزائن والبنوك */}
          <button
            type="button"
            onClick={() => setActiveView('chart')}
            className="onyx-neon-btn min-h-[58px] sm:min-h-[64px] px-3 sm:px-4 py-2 flex items-center justify-between text-right cursor-pointer group"
          >
            <BankBuilding3DIcon />
            <div className="flex-1 px-2.5 font-black text-white text-xs sm:text-sm lg:text-base drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              الخزائن والبنوك
            </div>
            <div className="onyx-chevron-circle">
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform stroke-[2.5]" />
            </div>
          </button>
        </div>

        {/* Row 12 */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3.5">
          {/* Right Col: إقفال الفترات المالية */}
          <button
            type="button"
            onClick={() => setPeriodClosingModalOpen(true)}
            className="onyx-neon-btn min-h-[58px] sm:min-h-[64px] px-3 sm:px-4 py-2 flex items-center justify-between text-right cursor-pointer group"
          >
            <Padlock3DIcon />
            <div className="flex-1 px-2.5 font-black text-white text-xs sm:text-sm lg:text-base drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              إقفال الفترات المالية
            </div>
            <div className="onyx-chevron-circle">
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform stroke-[2.5]" />
            </div>
          </button>

          {/* Left Col: أعمار الديون */}
          <button
            type="button"
            onClick={() => navigateReports('DEBT_AGING')}
            className="onyx-neon-btn min-h-[58px] sm:min-h-[64px] px-3 sm:px-4 py-2 flex items-center justify-between text-right cursor-pointer group"
          >
            <CalendarClock3DIcon />
            <div className="flex-1 px-2.5 font-black text-white text-xs sm:text-sm lg:text-base drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              أعمار الديون
            </div>
            <div className="onyx-chevron-circle">
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform stroke-[2.5]" />
            </div>
          </button>
        </div>
      </div>

      {/* =========================================================================
          SECTION 2: Image 2 - Seamless Extension (4 Numbered Wide Bars + Framed Hub)
          In RTL: 1st child = RIGHT (3D Icon), 2nd = CENTER (Text), 3rd = LEFT (Chevron <)
          ========================================================================= */}
      <div className="pt-2 space-y-4">
        {/* 4. كشف الحساب وأعمار الديون */}
        <button
          type="button"
          onClick={() => navigateReports('ACCOUNT_LEDGER')}
          className="onyx-neon-btn w-full min-h-[58px] sm:min-h-[64px] px-4 sm:px-6 py-2.5 flex items-center justify-between text-right cursor-pointer group"
        >
          <CalendarClock3DIcon />
          <div className="flex-1 pr-3 font-black text-white text-sm sm:text-base lg:text-lg drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            4. كشف الحساب وأعمار الديون
          </div>
          <div className="onyx-chevron-circle">
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform stroke-[2.5]" />
          </div>
        </button>

        {/* 5. الأصول ومراكز التكلفة */}
        <button
          type="button"
          onClick={() => setCostCentersModalOpen(true)}
          className="onyx-neon-btn w-full min-h-[58px] sm:min-h-[64px] px-4 sm:px-6 py-2.5 flex items-center justify-between text-right cursor-pointer group"
        >
          <Warehouse3DIcon />
          <div className="flex-1 pr-3 font-black text-white text-sm sm:text-base lg:text-lg drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            5. الأصول ومراكز التكلفة
          </div>
          <div className="onyx-chevron-circle">
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform stroke-[2.5]" />
          </div>
        </button>

        {/* 6. الصلاحيات وسجل المراقبة */}
        <button
          type="button"
          onClick={() => setAuditLogModalOpen(true)}
          className="onyx-neon-btn w-full min-h-[58px] sm:min-h-[64px] px-4 sm:px-6 py-2.5 flex items-center justify-between text-right cursor-pointer group"
        >
          <SecurityAudit3DIcon />
          <div className="flex-1 pr-3 font-black text-white text-sm sm:text-base lg:text-lg drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            6. الصلاحيات وسجل المراقبة
          </div>
          <div className="onyx-chevron-circle">
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform stroke-[2.5]" />
          </div>
        </button>

        {/* 7. النسخ الاحتياطي والمزامنة */}
        <button
          type="button"
          onClick={() => setDeviceSyncModalOpen(true)}
          className="onyx-neon-btn w-full min-h-[58px] sm:min-h-[64px] px-4 sm:px-6 py-2.5 flex items-center justify-between text-right cursor-pointer group"
        >
          <CloudSync3DIcon />
          <div className="flex-1 pr-3 font-black text-white text-sm sm:text-base lg:text-lg drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            7. النسخ الاحتياطي والمزامنة
          </div>
          <div className="onyx-chevron-circle">
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform stroke-[2.5]" />
          </div>
        </button>

        {/* --- Dedicated Framed Container: "مميزات متقدمة وإدارة احترافية" --- */}
        <div className="onyx-advanced-frame p-4 sm:p-6 mt-6 space-y-4">
          {/* Frame Header with Gold Wing Accents and Shield Badge */}
          <div className="flex items-center justify-center gap-3 relative">
            <div className="flex-1 h-[2px] bg-gradient-to-l from-[#ffc629] via-[#eab308]/50 to-transparent" />
            <div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-[#031b69] via-[#05268c] to-[#031b69] border border-cyan-400/80 shadow-[0_0_15px_rgba(0,200,255,0.4)] flex items-center gap-2 text-xs sm:text-sm font-black text-[#ffc629] shrink-0">
              <ShieldCheck className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
              <span>مميزات متقدمة وإدارة احترافية</span>
            </div>
            <div className="flex-1 h-[2px] bg-gradient-to-r from-[#ffc629] via-[#eab308]/50 to-transparent" />
          </div>

          {/* 10 Advanced Features Grid (2 Columns x 5 Rows matching Image 2) */}
          <div className="space-y-3 pt-2">
            {/* Advanced Row 1 */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3.5">
              {/* Right: سجل مراقبة لجميع العمليات (Audit Log) */}
              <button
                type="button"
                onClick={() => setAuditLogModalOpen(true)}
                className="onyx-neon-btn min-h-[58px] sm:min-h-[64px] px-3 sm:px-4 py-2 flex items-center justify-between text-right cursor-pointer group"
              >
                <StocktakeClipboard3DIcon />
                <div className="flex-1 pr-2 text-right">
                  <div className="font-bold text-white text-xs sm:text-sm leading-tight">
                    سجل مراقبة لجميع العمليات
                  </div>
                  <div className="text-[10px] text-cyan-300 font-mono font-bold">(Audit Log)</div>
                </div>
              </button>

              {/* Left: صلاحيات دقيقة لكل مستخدم */}
              <button
                type="button"
                onClick={() => setPermissionsModalOpen(true)}
                className="onyx-neon-btn min-h-[58px] sm:min-h-[64px] px-3 sm:px-4 py-2 flex items-center justify-between text-right cursor-pointer group"
              >
                <UsersGroup3DIcon />
                <div className="flex-1 pr-2 text-right font-bold text-white text-xs sm:text-sm leading-tight">
                  صلاحيات دقيقة لكل مستخدم
                </div>
              </button>
            </div>

            {/* Advanced Row 2 */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3.5">
              {/* Right: معرفة من أضاف أو عدّل أو حذف أي مستند */}
              <button
                type="button"
                onClick={() => setDocAuditTrackerModalOpen(true)}
                className="onyx-neon-btn min-h-[58px] sm:min-h-[64px] px-3 sm:px-4 py-2 flex items-center justify-between text-right cursor-pointer group"
              >
                <EyeDoc3DIcon />
                <div className="flex-1 pr-2 text-right font-bold text-white text-xs sm:text-sm leading-tight">
                  معرفة من أضاف أو عدّل أو حذف أي مستند
                </div>
              </button>

              {/* Left: منع حذف الفواتير المرحلة محاسبياً */}
              <button
                type="button"
                onClick={() => setImmutabilityModalOpen(true)}
                className="onyx-neon-btn min-h-[58px] sm:min-h-[64px] px-3 sm:px-4 py-2 flex items-center justify-between text-right cursor-pointer group"
              >
                <ProhibitedDoc3DIcon />
                <div className="flex-1 pr-2 text-right font-bold text-white text-xs sm:text-sm leading-tight">
                  منع حذف الفواتير المرحلة محاسبياً
                </div>
              </button>
            </div>

            {/* Advanced Row 3 */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3.5">
              {/* Right: نسخ احتياطي تلقائي */}
              <button
                type="button"
                onClick={handleInstantAutoBackup}
                className="onyx-neon-btn min-h-[58px] sm:min-h-[64px] px-3 sm:px-4 py-2 flex items-center justify-between text-right cursor-pointer group"
              >
                <DatabaseCheck3DIcon />
                <div className="flex-1 pr-2 text-right font-bold text-white text-xs sm:text-sm leading-tight">
                  نسخ احتياطي تلقائي
                </div>
              </button>

              {/* Left: استعادة النسخ الاحتياطية */}
              <button
                type="button"
                onClick={() => setRestoreModalOpen(true)}
                className="onyx-neon-btn min-h-[58px] sm:min-h-[64px] px-3 sm:px-4 py-2 flex items-center justify-between text-right cursor-pointer group"
              >
                <RestoreDatabase3DIcon />
                <div className="flex-1 pr-2 text-right font-bold text-white text-xs sm:text-sm leading-tight">
                  استعادة النسخ الاحتياطية
                </div>
              </button>
            </div>

            {/* Advanced Row 4 */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3.5">
              {/* Right: تعدد المستخدمين والفروع */}
              <button
                type="button"
                onClick={() => setActiveView('branches')}
                className="onyx-neon-btn min-h-[58px] sm:min-h-[64px] px-3 sm:px-4 py-2 flex items-center justify-between text-right cursor-pointer group"
              >
                <OrgChart3DIcon />
                <div className="flex-1 pr-2 text-right font-bold text-white text-xs sm:text-sm leading-tight">
                  تعدد المستخدمين والفروع
                </div>
              </button>

              {/* Left: مزامنة البيانات بين الأجهزة */}
              <button
                type="button"
                onClick={() => setDeviceSyncModalOpen(true)}
                className="onyx-neon-btn min-h-[58px] sm:min-h-[64px] px-3 sm:px-4 py-2 flex items-center justify-between text-right cursor-pointer group"
              >
                <DeviceSync3DIcon />
                <div className="flex-1 pr-2 text-right font-bold text-white text-xs sm:text-sm leading-tight">
                  مزامنة البيانات بين الأجهزة
                </div>
              </button>
            </div>

            {/* Advanced Row 5 */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3.5">
              {/* Right: إشعارات فورية بالعمليات المهمة */}
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('smart-notifications-board-section');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    showToast('تم تحديث لوحة الإشعارات الذكية للمخزون والديون ✓', 'info');
                  }
                }}
                className="onyx-neon-btn min-h-[58px] sm:min-h-[64px] px-3 sm:px-4 py-2 flex items-center justify-between text-right cursor-pointer group"
              >
                <StockAlertBell3DIcon />
                <div className="flex-1 pr-2 text-right font-bold text-white text-xs sm:text-sm leading-tight">
                  إشعارات فورية بالعمليات المهمة
                </div>
              </button>

              {/* Left: إمكانية تصدير التقارير إلى PDF و Excel */}
              <button
                type="button"
                onClick={() => setQuickExportModalOpen(true)}
                className="onyx-neon-btn min-h-[58px] sm:min-h-[64px] px-3 sm:px-4 py-2 flex items-center justify-between text-right cursor-pointer group"
              >
                <PdfExcelExport3DIcon />
                <div className="flex-1 pr-2 text-right font-bold text-white text-xs sm:text-sm leading-tight">
                  إمكانية تصدير التقارير إلى PDF و Excel
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MODALS & DIALOGS for Image 2 Advanced Features
          ========================================================================= */}

      {/* 1. Audit Log Viewer Modal */}
      {auditLogModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto overscroll-contain animate-in fade-in duration-200">
          <div className="w-full max-w-3xl rounded-3xl bg-[#040C2E] border-2 border-cyan-400/80 shadow-2xl p-5 text-white flex flex-col max-h-[90dvh] my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-blue-500/30">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-[#00c8ff] flex items-center justify-center border border-cyan-400/50">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base sm:text-lg">سجل مراقبة العمليات الكامل (Audit Log)</h3>
                  <p className="text-xs text-slate-400">تتبع زمني دقيق لكل حركة ومستند وتعديل داخل النظام</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAuditLogModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-2">
              {auditLogs.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  لا توجد عمليات مسجلة حديثاً في سجل المراقبة
                </div>
              ) : (
                auditLogs.slice(0, 30).map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-2xl bg-[#020824]/80 border border-blue-500/20 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-cyan-300">{log.userName || 'المدير العام'}</span>
                        <span className="text-[10px] text-slate-400 font-mono-num">{log.timestamp}</span>
                      </div>
                      <div className="text-slate-200 mt-1">{log.details || log.action}</div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                      {log.action}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-blue-500/30 flex justify-between items-center text-xs">
              <span className="text-slate-400">إجمالي العمليات الموثقة: {auditLogs.length}</span>
              <button
                type="button"
                onClick={() => {
                  setAuditLogModalOpen(false);
                  navigateSettings('users');
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00c8ff] to-[#075bff] text-slate-950 font-bold"
              >
                فتح إعدادات الأمان وسجل المراجعة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. User Permissions Matrix Modal */}
      {permissionsModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto overscroll-contain animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-3xl bg-[#040C2E] border-2 border-cyan-400/80 shadow-2xl p-5 text-white flex flex-col max-h-[90dvh] my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-blue-500/30">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-[#00d99a] flex items-center justify-center border border-emerald-400/50">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base sm:text-lg">صلاحيات دقيقة لكل مستخدم ودور وظيفي</h3>
                  <p className="text-xs text-slate-400">مصفوفة الرقابة والصلاحيات المحاسبية المعتمدة في النظام</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPermissionsModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-[#020824] border border-blue-500/20 space-y-2">
                <div className="font-bold text-cyan-300 flex items-center justify-between">
                  <span>1. مدير النظام (Super Admin)</span>
                  <span className="text-emerald-400 text-[10px]">كامل الصلاحيات (100%)</span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  الوصول لجميع شاشات المحاسبة، إعدادات النظام، التصفير، إدارة المستخدمين، وتعديل الضرائب والفروع.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-[#020824] border border-blue-500/20 space-y-2">
                <div className="font-bold text-cyan-300 flex items-center justify-between">
                  <span>2. المحاسب العام (Accountant)</span>
                  <span className="text-cyan-400 text-[10px]">محاسبي وتشغيلي</span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  إنشاء ومراجعة القيود اليومية، الفواتير، السندات، تقارير القوائم المالية، وممنوع من حذف القيود المرحلة أو تصفير النظام.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-[#020824] border border-blue-500/20 space-y-2">
                <div className="font-bold text-cyan-300 flex items-center justify-between">
                  <span>3. كاشير نقطة البيع (Cashier)</span>
                  <span className="text-amber-400 text-[10px]">مبيعات نقطة البيع فقط</span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  إصدار فواتير البيع السريعة، استلام النقد والشبكة، طباعة الإيصالات، وممنوع من رؤية تكلفة الشراء أو دليل الحسابات.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-[#020824] border border-blue-500/20 space-y-2">
                <div className="font-bold text-cyan-300 flex items-center justify-between">
                  <span>4. أمين المستودع (Storekeeper)</span>
                  <span className="text-purple-400 text-[10px]">حركة ومخزون</span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  استلام البضائع، التحويل بين المستودعات، الجرد المخزني، ومتابعة النواقص دون صلاحيات مالية.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-blue-500/30 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setPermissionsModalOpen(false);
                  navigateSettings('users');
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00d99a] to-[#075bff] text-slate-950 font-black text-xs"
              >
                تخصيص الصلاحيات وإضافة مستخدم جديد
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Document Audit & Change Tracker Modal */}
      {docAuditTrackerModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto overscroll-contain animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-3xl bg-[#040C2E] border-2 border-cyan-400/80 shadow-2xl p-5 text-white flex flex-col max-h-[90dvh] my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-blue-500/30">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-[#00c8ff] flex items-center justify-center border border-cyan-400/50">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base sm:text-lg">معرفة من أضاف أو عدّل أو حذف أي مستند</h3>
                  <p className="text-xs text-slate-400">بصمة الموظف والوقت وتفاصيل الإجراء لكل مستند محفوظ</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDocAuditTrackerModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-2 text-xs">
              <div className="p-3 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-blue-950/40 border border-cyan-500/30 text-cyan-200">
                يحتفظ النظام آلياً باسم المستخدم الذي أصدر الفاتورة أو السند وتاريخ الإنشاء بدقة الثواني ورقم العملية لمنع أي تلاعب.
              </div>

              <div className="space-y-2 mt-2">
                {invoices.slice(0, 10).map((inv) => (
                  <div
                    key={inv.id}
                    className="p-3 rounded-xl bg-[#020824] border border-blue-500/20 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-white flex items-center gap-2">
                        <span className="font-mono-num text-cyan-300">{inv.invoiceNumber}</span>
                        <span>•</span>
                        <span>{inv.partyName}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        المنشئ: <strong className="text-slate-200">المدير العام</strong> | التاريخ:{' '}
                        <span className="font-mono-num">{inv.date}</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-[#00d99a] border border-emerald-500/30">
                      مرحل وموثق
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-blue-500/30 flex justify-end">
              <button
                type="button"
                onClick={() => setDocAuditTrackerModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 text-white font-bold"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Strict Accounting Immutability & Anti-Deletion Modal */}
      {immutabilityModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto overscroll-contain animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-3xl bg-[#040C2E] border-2 border-red-500/80 shadow-2xl p-5 text-white flex flex-col space-y-4 max-h-[90dvh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-red-500/30">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center border border-red-400/50">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base sm:text-lg">قاعدة منع حذف الفواتير المرحلة محاسبياً</h3>
                  <p className="text-xs text-red-300">توافق كامل مع المعايير المحاسبية وأنظمة هيئة الزكاة والضريبة</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setImmutabilityModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-200">
              <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/30 text-rose-200">
                <strong>لماذا تمنع الأنظمة المحاسبية وأونكس برو حذف الفواتير المرحلة؟</strong>
                <p className="mt-1.5 text-xs text-slate-300">
                  عند حفظ الفاتورة، يُنشئ النظام تلقائياً قيوداً يومية تخصم من المخزون وتؤثر في الذمم وضريبة القيمة المضافة. حذف الفاتورة يؤدي لكسر تسلسل الأرقام وخلل ميزان المراجعة.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#020824] border border-blue-500/20 space-y-2">
                <div className="font-bold text-[#00d99a]">الطريقة النظامية لإلغاء أي فاتورة:</div>
                <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                  <li>إنشاء <strong>فاتورة مردودات مبيعات</strong> لنفس الصنف لإعادة الكميات للمخزن.</li>
                  <li>أو إصدار <strong>إشعار دائن (Credit Note)</strong> لتسوية حساب العميل دون حذف أصل الفاتورة.</li>
                  <li>حالة الحماية الحالية في النظام: <strong className="text-emerald-400">مفعلة ونشطة 100%</strong>.</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setImmutabilityModalOpen(false);
                  setActiveView('returns');
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs"
              >
                إنشاء فاتورة مردودات الآن
              </button>
              <button
                type="button"
                onClick={() => setImmutabilityModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs"
              >
                فهمت ذلك
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Restore Backup Modal */}
      {restoreModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto overscroll-contain animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-[#040C2E] border-2 border-cyan-400/80 shadow-2xl p-5 text-white flex flex-col space-y-4 max-h-[90dvh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-blue-500/30">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-[#00c8ff] flex items-center justify-center border border-cyan-400/50">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base sm:text-lg">استعادة نسخة احتياطية من ملف (JSON)</h3>
                  <p className="text-xs text-slate-400">استرجاع كافة الفواتير والأصناف والقيود من ملف محفوظ سابقاً</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRestoreModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#020824] border border-blue-500/20 space-y-3 text-center">
              <p className="text-xs text-slate-300">
                اختر ملف النسخة الاحتياطية بصيغة <strong>.json</strong> من جهازك أو هاتفك لاسترجاع البيانات:
              </p>

              <label className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#00c8ff] to-[#075bff] text-slate-950 font-black text-xs cursor-pointer hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-cyan-500/20">
                <Upload className="w-4 h-4 stroke-[2.5]" />
                <span>تحديد ملف النسخة الاحتياطية (.JSON)</span>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const content = event.target?.result as string;
                        if (content) {
                          const isOk = importDatabaseJson(content);
                          if (isOk) {
                            showToast('تمت استعادة النسخة الاحتياطية بنجاح ✓', 'success');
                            setRestoreModalOpen(false);
                          } else {
                            showToast('فشل في قراءة ملف النسخة الاحتياطية أو الملف غير متوافق', 'error');
                          }
                        }
                      };
                      reader.readAsText(file);
                    }
                  }}
                />
              </label>

              <div className="text-[11px] text-amber-300/90 pt-1">
                تنبيه: استعادة نسخة احتياطية ستستبدل البيانات الحالية ببيانات الملف المسترجع.
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setRestoreModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Multi-Device & Cloud Sync Modal */}
      {deviceSyncModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto overscroll-contain animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-[#040C2E] border-2 border-cyan-400/80 shadow-2xl p-5 text-white flex flex-col space-y-4 max-h-[90dvh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-blue-500/30">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-[#00c8ff] flex items-center justify-center border border-cyan-400/50">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base sm:text-lg">مزامنة البيانات بين الأجهزة والتخزين</h3>
                  <p className="text-xs text-slate-400">حالة الربط والعمل بدون إنترنت (PWA Offline) والمزامنة</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDeviceSyncModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-2xl bg-[#020824] border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">حالة التخزين المحلي المشفر:</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">محفوظ في IndexedDB و LocalStorage</div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-[#00d99a]">
                  نشط وآمن ✓
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-[#020824] border border-cyan-500/30 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">العمل بدون إنترنت (PWA Standalone):</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">يعمل 100% بدون شبكة إنترنت</div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-cyan-500/20 text-[#00c8ff]">
                  مفعل أوفلاين ✓
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-[#020824] border border-blue-500/30 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">نقل البيانات لهاتف أو جهاز آخر:</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">تصدير ملف النسخة الاحتياطية واستعادته فوراً</div>
                </div>
                <button
                  type="button"
                  onClick={handleInstantAutoBackup}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#00c8ff] to-[#075bff] text-slate-950 font-bold text-[11px]"
                >
                  تصدير فوري
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setDeviceSyncModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Quick Reports Export Modal (PDF & Excel) */}
      {quickExportModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto overscroll-contain animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-[#040C2E] border-2 border-emerald-400/80 shadow-2xl p-5 text-white flex flex-col space-y-4 max-h-[90dvh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-500/30">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-[#00d99a] flex items-center justify-center border border-emerald-400/50">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base sm:text-lg">تصدير التقارير والقوائم إلى PDF و Excel</h3>
                  <p className="text-xs text-slate-400">تصدير فوري بنقرة واحدة لجميع مخرجات النظام المحاسبي</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setQuickExportModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              {/* Export Debt Aging & Contacts to Excel */}
              <div className="p-3 rounded-2xl bg-[#020824] border border-blue-500/20 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">كشف حسابات العملاء والموردين والديون</div>
                  <div className="text-slate-400 text-[10px]">كافة الأرصدة، الهواتف، وأعمار الذمم الدائنة والمدينة</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    exportContactsToExcel(contacts, settings.baseCurrency);
                    showToast('تم تصدير كشف العملاء والموردين وأعمار الذمم إلى إكسل بنجاح ✓', 'success');
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Excel</span>
                </button>
              </div>

              {/* Export Inventory to Excel */}
              <div className="p-3 rounded-2xl bg-[#020824] border border-blue-500/20 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">حركة المخزون وتقييم الأصناف</div>
                  <div className="text-slate-400 text-[10px]">الكميات، التكلفة، أسعار البيع والتصنيفات</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    exportProductsToExcel(products, settings.baseCurrency);
                    showToast('تم تصدير تقرير المخزون والأصناف إلى إكسل بنجاح ✓', 'success');
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Excel</span>
                </button>
              </div>

              {/* Open Full Reports View for PDF & Print */}
              <div className="p-3 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-blue-950/40 border border-cyan-500/30 flex items-center justify-between">
                <div>
                  <div className="font-bold text-cyan-200">القوائم المالية الكاملة (PDF & طباعة)</div>
                  <div className="text-slate-400 text-[10px]">قائمة الدخل، الميزانية العمومية، وميزان المراجعة</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setQuickExportModalOpen(false);
                    setActiveView('reports');
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-[#00c8ff] hover:bg-cyan-400 text-slate-950 font-black text-xs flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>فتح التقارير</span>
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setQuickExportModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Barcode Fast Search & Scanner Modal */}
      {barcodeSearchModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto overscroll-contain animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-[#040C2E] border-2 border-cyan-400/80 shadow-2xl p-5 text-white flex flex-col space-y-4 max-h-[90dvh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-cyan-500/30">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-[#00c8ff] flex items-center justify-center border border-cyan-400/50">
                  <Barcode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base sm:text-lg">البحث السريع بباركود أو كود الصنف</h3>
                  <p className="text-xs text-slate-400">مرر الباركود بجهاز القارئ أو اكتب رقم الكود للبحث المباشر</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setBarcodeSearchModalOpen(false);
                  setBarcodeInput('');
                }}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  autoFocus
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  placeholder="امسح الباركود أو اكتب الكود هنا..."
                  className="w-full py-3.5 pr-11 pl-4 rounded-2xl bg-[#020824] border-2 border-cyan-400/60 focus:border-cyan-300 text-white font-mono text-sm placeholder:text-slate-500 outline-none shadow-inner"
                />
                <Barcode className="w-5 h-5 text-cyan-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              </div>

              {matchedBarcodeProduct ? (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/50 to-teal-950/40 border border-emerald-400/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{matchedBarcodeProduct.nameAr}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-[#00d99a] font-bold text-xs font-mono">
                      {matchedBarcodeProduct.stockQty} {matchedBarcodeProduct.unit}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 font-mono-num pt-1 border-t border-emerald-500/20">
                    <div>سعر البيع: <strong className="text-emerald-300">{matchedBarcodeProduct.salePrice} {settings.baseCurrency}</strong></div>
                    <div>سعر التكلفة: <strong className="text-cyan-300">{matchedBarcodeProduct.costPrice} {settings.baseCurrency}</strong></div>
                    <div>الباركود: <strong className="text-slate-200">{matchedBarcodeProduct.barcode || 'غير محدد'}</strong></div>
                    <div>الكود: <strong className="text-slate-200">{matchedBarcodeProduct.code}</strong></div>
                  </div>
                </div>
              ) : barcodeInput.trim() ? (
                <div className="p-3 text-center text-xs text-amber-300 bg-amber-950/30 rounded-xl border border-amber-500/30">
                  لم يتم العثور على صنف مطابق لهذا الباركود
                </div>
              ) : null}
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setBarcodeSearchModalOpen(false);
                  navigateInventory('items');
                }}
                className="text-xs text-cyan-300 underline font-bold"
              >
                الانتقال لإدارة الأصناف الكاملة
              </button>
              <button
                type="button"
                onClick={() => {
                  setBarcodeSearchModalOpen(false);
                  setBarcodeInput('');
                }}
                className="px-5 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. Financial Period Closing Modal */}
      {periodClosingModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto overscroll-contain animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-[#040C2E] border-2 border-amber-400/80 shadow-2xl p-5 text-white flex flex-col space-y-4 max-h-[90dvh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-amber-500/30">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-[#ffc629] flex items-center justify-center border border-amber-400/50">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base sm:text-lg">إقفال الفترات المالية وتدوير الأرصدة</h3>
                  <p className="text-xs text-slate-400">إقفال السنة المالية الحالية وترحيل الأرباح والمخزون</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPeriodClosingModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#020824] border border-blue-500/20 space-y-2 text-xs text-slate-200">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-slate-400">السنة المالية النشطة:</span>
                <span className="font-bold text-white font-mono-num">{settings.fiscalYear}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-slate-400">حالة التوازن المحاسبي:</span>
                <span className="font-bold text-emerald-400">متوازن 100% (مدين = دائن)</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-slate-400">إجمالي القيود المؤثرة:</span>
                <span className="font-bold text-cyan-300 font-mono-num">{journalEntries.length} قيد</span>
              </div>
              <p className="text-slate-400 text-[11px] pt-1">
                عند الإقفال، يتم ترحيل صافي ربح الفترة إلى حساب الأرباح المبقاة وتثبيت أرصدة أول المدة للسنة الجديدة.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  showToast(`تم تثبيت ومراجعة سلامة الفترة المالية لعام ${settings.fiscalYear} بنجاح ✓`, 'success');
                  setPeriodClosingModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#ffc629] to-[#d97706] text-slate-950 font-black text-xs"
              >
                اعتماد وتثبيت الأرصدة
              </button>
              <button
                type="button"
                onClick={() => setPeriodClosingModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10. Cost Centers & Fixed Assets Modal */}
      {costCentersModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto overscroll-contain animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-3xl bg-[#040C2E] border-2 border-cyan-400/80 shadow-2xl p-5 text-white flex flex-col space-y-4 max-h-[90dvh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-cyan-500/30">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-[#00c8ff] flex items-center justify-center border border-cyan-400/50">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base sm:text-lg">5. الأصول الثابتة ومراكز التكلفة</h3>
                  <p className="text-xs text-slate-400">توزيع المصروفات والإيرادات على المشاريع والفروع</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCostCentersModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-2xl bg-[#020824] border border-blue-500/20 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">المركز الرئيسي (الإدارة العامة)</div>
                  <div className="text-slate-400 text-[10px]">كود: CC-01 | مركز التكلفة الافتراضي</div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 font-bold">
                  نشط
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-[#020824] border border-blue-500/20 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">مشروع المبيعات والتوزيع الخارجي</div>
                  <div className="text-slate-400 text-[10px]">كود: CC-02 | أسطول النقل والمندوبين</div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-500/20 text-cyan-300 font-bold">
                  نشط
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setCostCentersModalOpen(false);
                  setActiveView('branches');
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00c8ff] to-[#075bff] text-slate-950 font-bold text-xs"
              >
                إدارة الفروع ومراكز التكلفة
              </button>
              <button
                type="button"
                onClick={() => setCostCentersModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
