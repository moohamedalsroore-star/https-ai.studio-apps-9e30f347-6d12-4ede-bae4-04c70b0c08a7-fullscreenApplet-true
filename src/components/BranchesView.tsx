import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Warehouse as WarehouseIcon,
  Layers,
  MapPin,
  Phone,
  CheckCircle,
  FolderTree,
  Trash2,
} from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';

export const BranchesView: React.FC = () => {
  const {
    branches,
    warehouses,
    costCenters,
    addBranch,
    addWarehouse,
    addCostCenter,
    deleteBranch,
    deleteWarehouse,
    deleteCostCenter,
    selectedBranchId,
    setSelectedBranchId,
    openDeleteConfirm,
    showToast,
    branchActionModal,
    setBranchActionModal,
  } = useAccounting();

  const [activeTab, setActiveTab] = useState<'BRANCHES' | 'WAREHOUSES' | 'COST_CENTERS'>('BRANCHES');

  // Modals
  const [showAddBranch, setShowAddBranch] = useState(false);
  const [showAddWh, setShowAddWh] = useState(false);
  const [showAddCc, setShowAddCc] = useState(false);

  // Auto-open modal when triggered from header "إنشاء فرع أو مخزن"
  useEffect(() => {
    if (branchActionModal === 'BRANCH') {
      setShowAddBranch(true);
      setActiveTab('BRANCHES');
      setBranchActionModal(null);
    } else if (branchActionModal === 'WAREHOUSE') {
      setShowAddWh(true);
      setActiveTab('WAREHOUSES');
      setBranchActionModal(null);
    }
  }, [branchActionModal, setBranchActionModal]);

  // Forms
  const [branchForm, setBranchForm] = useState({
    code: `BR-0${branches.length + 1}`,
    nameAr: '',
    address: 'الرياض',
    phone: '0500000000',
    isMain: false,
  });

  const [whForm, setWhForm] = useState({
    branchId: branches[0]?.id || '',
    code: `WH-0${warehouses.length + 1}`,
    nameAr: '',
    location: 'المستودعات المركزية',
    isMain: false,
  });

  const [ccForm, setCcForm] = useState({
    code: `CC-0${costCenters.length + 1}`,
    nameAr: '',
    description: 'مركز تكلفة تشغيلي',
  });

  const handleSaveBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchForm.nameAr.trim()) return;
    addBranch(branchForm);
    setShowAddBranch(false);
    setBranchForm({
      code: `BR-0${branches.length + 2}`,
      nameAr: '',
      address: '',
      phone: '',
      isMain: false,
    });
  };

  const handleSaveWarehouse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!whForm.nameAr.trim()) return;
    addWarehouse(whForm);
    setShowAddWh(false);
    setWhForm({
      branchId: branches[0]?.id || '',
      code: `WH-0${warehouses.length + 2}`,
      nameAr: '',
      location: '',
      isMain: false,
    });
  };

  const handleSaveCostCenter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ccForm.nameAr.trim()) return;
    addCostCenter(ccForm);
    setShowAddCc(false);
    setCcForm({
      code: `CC-0${costCenters.length + 2}`,
      nameAr: '',
      description: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Building2 className="w-7 h-7 text-emerald-400" />
            إدارة الفروع والمستودعات ومراكز التكلفة
          </h2>
          <p className="text-sm text-slate-400">
            هيكلة الفروع الجغرافية، المستودعات التخزينية، ومراكز التكلفة التشغيلية لربط العمليات والتقارير
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'BRANCHES' && (
            <button
              onClick={() => setShowAddBranch(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              إضافة فرع جديد
            </button>
          )}
          {activeTab === 'WAREHOUSES' && (
            <button
              onClick={() => setShowAddWh(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              إضافة مستودع جديد
            </button>
          )}
          {activeTab === 'COST_CENTERS' && (
            <button
              onClick={() => setShowAddCc(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              إضافة مركز تكلفة
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 space-x-reverse space-x-2">
        <button
          onClick={() => setActiveTab('BRANCHES')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'BRANCHES'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          فروع المنشأة ({branches.length})
        </button>

        <button
          onClick={() => setActiveTab('WAREHOUSES')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'WAREHOUSES'
              ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <WarehouseIcon className="w-4 h-4" />
          المستودعات والمخازن ({warehouses.length})
        </button>

        <button
          onClick={() => setActiveTab('COST_CENTERS')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'COST_CENTERS'
              ? 'border-purple-500 text-purple-400 bg-purple-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FolderTree className="w-4 h-4" />
          مراكز التكلفة ({costCenters.length})
        </button>
      </div>

      {/* TAB 1: BRANCHES */}
      {activeTab === 'BRANCHES' && (
        branches.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">لا توجد فروع مسجلة حالياً</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                تم حذف الفرع بنجاح. يمكنك إنشاء فروعك الخاصة الجديدة في أي وقت من زر [إنشاء فرع أو مخزن].
              </p>
            </div>
            <button
              onClick={() => setShowAddBranch(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-700/30 cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>إنشاء فرع جديد الآن</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {branches.map((b) => (
              <div
                key={b.id}
                className={`p-5 rounded-2xl border transition-all ${
                  selectedBranchId === b.id
                    ? 'bg-emerald-950/20 border-emerald-500/40 shadow-lg shadow-emerald-950/20'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono-num text-xs font-bold text-emerald-400">{b.code}</span>
                  {b.isMain && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      فرع رئيسي
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-white text-base mt-2">{b.nameAr}</h4>

                <div className="mt-4 space-y-1.5 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{b.address || 'العنوان غير محدد'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono-num">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>{b.phone || 'الهاتف غير محدد'}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    المستودعات التابعة:{' '}
                    <span className="font-bold text-slate-300">
                      {warehouses.filter((w) => w.branchId === b.id).length} مستودع
                    </span>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedBranchId(b.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                        selectedBranchId === b.id
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {selectedBranchId === b.id ? 'الفرع النشط حالياً' : 'تحديد كفرع نشط'}
                    </button>
                    <button
                      onClick={() => {
                        openDeleteConfirm({
                          title: 'تأكيد حذف الفرع',
                          itemName: `الفرع: ${b.nameAr} (${b.code})`,
                          message: 'هل أنت متأكد من حذف هذا الفرع؟ لن تتمكن من التراجع.',
                          onConfirm: () => deleteBranch(b.id),
                        });
                      }}
                      className="p-1.5 rounded-lg bg-red-950/40 text-red-400 hover:text-red-300 hover:bg-red-900/60 transition-colors cursor-pointer"
                      title="حذف الفرع"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* TAB 2: WAREHOUSES */}
      {activeTab === 'WAREHOUSES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {warehouses.map((w) => (
            <div key={w.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono-num text-xs font-bold text-cyan-400">{w.code}</span>
                {w.isMain && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-400">
                    مستودع رئيسي
                  </span>
                )}
              </div>

              <h4 className="font-bold text-white text-base">{w.nameAr}</h4>

              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>{w.location}</span>
              </div>

              <div className="pt-2 text-xs text-slate-500 border-t border-slate-800 flex items-center justify-between">
                <span>
                  الفرع التابع له:{' '}
                  <span className="text-white font-semibold">
                    {branches.find((b) => b.id === w.branchId)?.nameAr || 'غير محدد'}
                  </span>
                </span>
                <button
                  onClick={() => {
                    openDeleteConfirm({
                      title: 'تأكيد حذف المستودع',
                      itemName: `المستودع: ${w.nameAr} (${w.code})`,
                      message: 'هل أنت متأكد من حذف هذا المستودع من المنشأة؟',
                      onConfirm: () => deleteWarehouse(w.id),
                    });
                  }}
                  className="p-1.5 rounded-lg bg-red-950/40 text-red-400 hover:text-red-300 hover:bg-red-900/60 transition-colors cursor-pointer"
                  title="حذف المستودع"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: COST CENTERS */}
      {activeTab === 'COST_CENTERS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {costCenters.map((cc) => (
            <div key={cc.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono-num text-xs font-bold text-purple-400">{cc.code}</span>
                <button
                  onClick={() => {
                    openDeleteConfirm({
                      title: 'تأكيد حذف مركز التكلفة',
                      itemName: `مركز التكلفة: ${cc.nameAr} (${cc.code})`,
                      message: 'هل أنت متأكد من حذف مركز التكلفة هذا؟',
                      onConfirm: () => deleteCostCenter(cc.id),
                    });
                  }}
                  className="p-1.5 rounded-lg bg-red-950/40 text-red-400 hover:text-red-300 hover:bg-red-900/60 transition-colors cursor-pointer"
                  title="حذف مركز التكلفة"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <h4 className="font-bold text-white text-base">{cc.nameAr}</h4>
              <p className="text-xs text-slate-400">{cc.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: ADD BRANCH */}
      {showAddBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-5 space-y-4">
            <h3 className="font-bold text-white text-base">إضافة فرع جديد للمنشأة</h3>
            <form onSubmit={handleSaveBranch} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">كود الفرع</label>
                <input
                  type="text"
                  required
                  value={branchForm.code}
                  onChange={(e) => setBranchForm({ ...branchForm, code: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white font-mono-num"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">اسم الفرع (بالعربية)</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: فرع جدة - شارع التحلية"
                  value={branchForm.nameAr}
                  onChange={(e) => setBranchForm({ ...branchForm, nameAr: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">العنوان</label>
                <input
                  type="text"
                  value={branchForm.address}
                  onChange={(e) => setBranchForm({ ...branchForm, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">رقم الهاتف</label>
                <input
                  type="text"
                  value={branchForm.phone}
                  onChange={(e) => setBranchForm({ ...branchForm, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white font-mono-num"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddBranch(false)}
                  className="px-4 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white cursor-pointer"
                >
                  حفظ الفرع
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD WAREHOUSE */}
      {showAddWh && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-5 space-y-4">
            <h3 className="font-bold text-white text-base">إضافة مستودع تخزيني جديد</h3>
            <form onSubmit={handleSaveWarehouse} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">الفرع التابع له</label>
                <select
                  value={whForm.branchId}
                  onChange={(e) => setWhForm({ ...whForm, branchId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.nameAr}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">كود المستودع</label>
                <input
                  type="text"
                  required
                  value={whForm.code}
                  onChange={(e) => setWhForm({ ...whForm, code: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white font-mono-num"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">اسم المستودع</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: مستودع التوزيع الشمالي"
                  value={whForm.nameAr}
                  onChange={(e) => setWhForm({ ...whForm, nameAr: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">موقع المستودع</label>
                <input
                  type="text"
                  value={whForm.location}
                  onChange={(e) => setWhForm({ ...whForm, location: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddWh(false)}
                  className="px-4 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-bold text-white cursor-pointer"
                >
                  حفظ المستودع
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD COST CENTER */}
      {showAddCc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-5 space-y-4">
            <h3 className="font-bold text-white text-base">إضافة مركز تكلفة جديد</h3>
            <form onSubmit={handleSaveCostCenter} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">كود مركز التكلفة</label>
                <input
                  type="text"
                  required
                  value={ccForm.code}
                  onChange={(e) => setCcForm({ ...ccForm, code: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white font-mono-num"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">اسم مركز التكلفة</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: قسم التسويق والمبيعات أو مشروع برج الرياض"
                  value={ccForm.nameAr}
                  onChange={(e) => setCcForm({ ...ccForm, nameAr: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">الوصف</label>
                <input
                  type="text"
                  value={ccForm.description}
                  onChange={(e) => setCcForm({ ...ccForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCc(false)}
                  className="px-4 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white cursor-pointer"
                >
                  حفظ مركز التكلفة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
