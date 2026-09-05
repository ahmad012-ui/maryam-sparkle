import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  MessageCircle,
  Plus,
  Eye,
  CheckCircle2,
  Clock,
  Palette,
  X,
  Phone,
  Mail,
  Maximize2,
  Calendar,
  Images,
} from 'lucide-react';
import { AdminCustomOrder } from './types';
import { MultiImageUpload } from './MultiImageUpload';

interface AdminCustomOrdersProps {
  customOrders: AdminCustomOrder[];
  onSaveCustomOrders: (orders: AdminCustomOrder[]) => void;
  isAddModalOpen?: boolean;
  onCloseAddModal?: () => void;
}

const EMPTY_CUSTOM_ORDER_FORM: Partial<AdminCustomOrder> = {
  customerName: '',
  email: '',
  phone: '',
  jewelryType: '',
  preferredStones: [],
  wristSize: '',
  metalFinish: '',
  budgetRange: '',
  quoteAmount: undefined,
  notes: '',
  status: 'New Request',
  referenceImages: [],
};

export const AdminCustomOrders: React.FC<AdminCustomOrdersProps> = ({
  customOrders,
  onSaveCustomOrders,
  isAddModalOpen = false,
  onCloseAddModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [activeImagePreview, setActiveImagePreview] = useState<string | null>(null);
  const [selectedOrderForPhotos, setSelectedOrderForPhotos] = useState<AdminCustomOrder | null>(null);

  // Modal for new bespoke order
  const [showAddModal, setShowAddModal] = useState(isAddModalOpen);
  const [formData, setFormData] = useState<Partial<AdminCustomOrder>>(EMPTY_CUSTOM_ORDER_FORM);

  const statuses: AdminCustomOrder['status'][] = [
    'New Request',
    'Quote Sent',
    'In Production',
    'Completed',
    'Declined',
  ];

  const filteredOrders = customOrders.filter((c) => {
    const matchesSearch =
      c.requestNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.jewelryType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = (id: string, newStatus: AdminCustomOrder['status']) => {
    const updated = customOrders.map((c) =>
      c.id === id ? { ...c, status: newStatus } : c
    );
    onSaveCustomOrders(updated);
  };

  const handleUpdateQuote = (id: string, amount: number) => {
    const updated = customOrders.map((c) =>
      c.id === id ? { ...c, quoteAmount: amount } : c
    );
    onSaveCustomOrders(updated);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName?.trim()) return;

    const newReq: AdminCustomOrder = {
      id: `cst-${Date.now()}`,
      requestNumber: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: formData.customerName,
      email: formData.email || '',
      phone: formData.phone || '',
      jewelryType: formData.jewelryType || 'Custom Piece',
      preferredStones: Array.isArray(formData.preferredStones)
        ? formData.preferredStones
        : [],
      wristSize: formData.wristSize || '',
      metalFinish: formData.metalFinish || '',
      notes: formData.notes || '',
      budgetRange: formData.budgetRange || '',
      date: new Date().toISOString().split('T')[0],
      status: formData.status || 'New Request',
      quoteAmount: formData.quoteAmount,
      referenceImages: formData.referenceImages || [],
    };

    onSaveCustomOrders([newReq, ...customOrders]);
    setShowAddModal(false);
    if (onCloseAddModal) onCloseAddModal();
  };

  const getStatusBadge = (status: AdminCustomOrder['status']) => {
    switch (status) {
      case 'New Request':
        return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400';
      case 'Quote Sent':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400';
      case 'In Production':
        return 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/30 dark:text-sky-400';
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-[#1a1e24] p-5 sm:p-6 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-2xs">
        <div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#c59d5f]" />
            Bespoke Artisan Craft Requests
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage custom jewelry orders, stone preferences, wrist measurements, and direct WhatsApp quote responses.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#2d5a61] text-white hover:bg-[#1e3c41] transition-colors flex items-center justify-center gap-2 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>+ Log Custom Request</span>
        </button>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-[#1a1e24] p-4 rounded-xl border border-gray-200/80 dark:border-gray-800">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Total Inquiries</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{customOrders.length}</p>
        </div>
        <div className="bg-white dark:bg-[#1a1e24] p-4 rounded-xl border border-gray-200/80 dark:border-gray-800">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">New Inquiries</p>
          <p className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-1">
            {customOrders.filter((c) => c.status === 'New Request').length}
          </p>
        </div>
        <div className="bg-white dark:bg-[#1a1e24] p-4 rounded-xl border border-gray-200/80 dark:border-gray-800">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">In Studio Production</p>
          <p className="text-xl font-bold text-sky-600 dark:text-sky-400 mt-1">
            {customOrders.filter((c) => c.status === 'In Production').length}
          </p>
        </div>
        <div className="bg-white dark:bg-[#1a1e24] p-4 rounded-xl border border-gray-200/80 dark:border-gray-800">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Completed Pieces</p>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {customOrders.filter((c) => c.status === 'Completed').length}
          </p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white dark:bg-[#1a1e24] p-4 sm:p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer, request #, or stones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9.5 pr-4 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#2d5a61]/30"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button
            onClick={() => setStatusFilter('All')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap ${
              statusFilter === 'All'
                ? 'bg-[#2d5a61] text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
            }`}
          >
            All Requests
          </button>
          {statuses.map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-[#2d5a61] text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Orders Cards / Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {filteredOrders.length === 0 ? (
          <div className="col-span-2 bg-white dark:bg-[#1a1e24] p-12 text-center text-gray-400 rounded-2xl border border-gray-200 dark:border-gray-800">
            No bespoke requests found matching your filter.
          </div>
        ) : (
          filteredOrders.map((req) => (
            <div
              key={req.id}
              className="bg-white dark:bg-[#1a1e24] rounded-2xl border border-gray-200/80 dark:border-gray-800 p-5 shadow-2xs hover:shadow-xs transition-all space-y-4"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#2d5a61] dark:text-teal-400">
                      {req.requestNumber}
                    </span>
                    <span className="text-[11px] text-gray-400">• {req.date}</span>
                  </div>
                  <h3 className="font-serif text-base font-bold text-gray-900 dark:text-white mt-0.5">
                    {req.customerName}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-gray-400" />
                      {req.phone}
                    </span>
                    {req.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-gray-400" />
                        {req.email}
                      </span>
                    )}
                  </div>
                </div>

                {/* Status Dropdown */}
                <select
                  value={req.status}
                  onChange={(e) =>
                    handleUpdateStatus(req.id, e.target.value as AdminCustomOrder['status'])
                  }
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full border cursor-pointer ${getStatusBadge(
                    req.status
                  )} bg-transparent`}
                >
                  {statuses.map((st) => (
                    <option key={st} value={st} className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {/* Jewelry Details */}
              <div className="p-3.5 rounded-xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400 font-medium">Design Type:</span>
                  <span className="font-bold text-gray-900 dark:text-white">{req.jewelryType}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400 font-medium">Sizing / Fit:</span>
                  <span className="text-gray-800 dark:text-gray-200">{req.wristSize}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400 font-medium">Finish:</span>
                  <span className="text-gray-800 dark:text-gray-200">{req.metalFinish}</span>
                </div>
                <div className="pt-2 border-t border-gray-200/60 dark:border-gray-700/60">
                  <span className="text-gray-500 dark:text-gray-400 block mb-1">Stones & Beads:</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {req.preferredStones.map((stone, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#2d5a61]/10 text-[#2d5a61] dark:bg-teal-950/40 dark:text-teal-300 border border-[#2d5a61]/20"
                      >
                        {stone}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Notes */}
              {req.notes && (
                <div className="text-xs text-gray-600 dark:text-gray-300 bg-amber-50/50 dark:bg-amber-950/20 p-3 rounded-xl border border-amber-200/40">
                  <span className="font-semibold text-amber-900 dark:text-amber-200 block mb-0.5">
                    Customer Artisan Notes:
                  </span>
                  <p className="text-[11px] leading-relaxed">{req.notes}</p>
                </div>
              )}

              {/* Reference & Craft Photos */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    Inspiration & Craft Photos:
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedOrderForPhotos(req)}
                    className="text-[11px] font-semibold text-[#2d5a61] dark:text-[#c59d5f] hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>
                      {req.referenceImages && req.referenceImages.length > 0
                        ? `Manage Photos (${req.referenceImages.length})`
                        : 'Upload Photos'}
                    </span>
                  </button>
                </div>

                {req.referenceImages && req.referenceImages.length > 0 ? (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {req.referenceImages.map((img, i) => (
                      <div
                        key={i}
                        className="relative group shrink-0 cursor-pointer"
                        onClick={() => setActiveImagePreview(img)}
                      >
                        <img
                          src={img}
                          alt="Reference preview"
                          className="w-14 h-14 rounded-lg object-cover border border-gray-200 dark:border-gray-700 group-hover:opacity-85 transition-opacity"
                        />
                        <div className="absolute inset-0 bg-black/30 rounded-lg opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                          <Maximize2 className="w-4 h-4" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-gray-400 italic">No reference photos attached yet.</p>
                )}
              </div>

              {/* Budget & Quote Footer */}
              <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 block">Customer Budget: {req.budgetRange}</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Quote:</span>
                    <input
                      type="number"
                      value={req.quoteAmount || ''}
                      onChange={(e) => handleUpdateQuote(req.id, Number(e.target.value))}
                      placeholder="PKR"
                      className="w-24 px-2 py-1 text-xs font-bold text-[#2d5a61] dark:text-teal-400 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                    />
                  </div>
                </div>

                {/* Direct WhatsApp Response Button */}
                <a
                  href={`https://wa.me/${req.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(
                    req.customerName
                  )},%20this%20is%20Maryam%20Sparkle%20Jewelry.%20Regarding%20your%20custom%20order%20request%20(${
                    req.requestNumber
                  }%20-%20${encodeURIComponent(req.jewelryType)}),%20we%20have%20reviewed%20your%20specifications!%20Estimated%20quote:%20PKR%20${
                    req.quoteAmount ? req.quoteAmount.toLocaleString() : '...'
                  }.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Quote</span>
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Image Preview Modal */}
      {activeImagePreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs"
          onClick={() => setActiveImagePreview(null)}
        >
          <div className="relative max-w-2xl max-h-[85vh] p-2 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
            <img
              src={activeImagePreview}
              alt="Inspiration Enlarged"
              className="max-h-[75vh] w-auto mx-auto object-contain rounded-xl"
            />
            <button
              onClick={() => setActiveImagePreview(null)}
              className="absolute top-4 right-4 p-2 bg-black/60 text-white rounded-full hover:bg-black/80"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Add Custom Request Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#1a1e24] rounded-2xl border border-gray-200 dark:border-gray-800 max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-serif text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#c59d5f]" />
                Log Bespoke Customer Request
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  if (onCloseAddModal) onCloseAddModal();
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-200 mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.customerName || ''}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    placeholder="e.g. Alizeh Mansoor"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-200 mb-1">
                    WhatsApp Phone *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+92 300 1234567"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-200 mb-1">
                  Jewelry Type & Pieces *
                </label>
                <input
                  type="text"
                  required
                  value={formData.jewelryType || ''}
                  onChange={(e) => setFormData({ ...formData, jewelryType: e.target.value })}
                  placeholder="e.g. Bridal 3-tier pearl choker with gold spacers"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-200 mb-1">
                    Wrist / Neck Size
                  </label>
                  <input
                    type="text"
                    value={formData.wristSize || ''}
                    onChange={(e) => setFormData({ ...formData, wristSize: e.target.value })}
                    placeholder='6.5" / 15" with extender'
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-200 mb-1">
                    Metal Finish
                  </label>
                  <input
                    type="text"
                    value={formData.metalFinish || ''}
                    onChange={(e) => setFormData({ ...formData, metalFinish: e.target.value })}
                    placeholder="18K Gold Plated / Rose Gold"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-200 mb-1">
                  Preferred Stones & Beads (comma separated)
                </label>
                <input
                  type="text"
                  value={
                    Array.isArray(formData.preferredStones)
                      ? formData.preferredStones.join(', ')
                      : ''
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      preferredStones: e.target.value.split(',').map((s) => s.trim()),
                    })
                  }
                  placeholder="Freshwater Pearl, Aventurine, Rose Quartz"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-200 mb-1">
                    Budget Range
                  </label>
                  <input
                    type="text"
                    value={formData.budgetRange || ''}
                    onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value })}
                    placeholder="PKR 4,000 - PKR 7,000"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-200 mb-1">
                    Quoted Price (PKR)
                  </label>
                  <input
                    type="number"
                    value={formData.quoteAmount || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, quoteAmount: Number(e.target.value) })
                    }
                    placeholder="5500"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-200 mb-1">
                  Artisan Notes & Occasion
                </label>
                <textarea
                  rows={3}
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Special instructions or customer reference notes..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              {/* Multiple Upload for Inspiration and Attire Photos */}
              <div>
                <MultiImageUpload
                  images={formData.referenceImages || []}
                  onChange={(newImages) =>
                    setFormData({ ...formData, referenceImages: newImages })
                  }
                  maxImages={8}
                  label="Inspiration Photos & Attire Swatches (Multiple Upload)"
                  description="Upload client sketches, bride/party attire colors, or bead style reference pictures."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    if (onCloseAddModal) onCloseAddModal();
                  }}
                  className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#2d5a61] text-white font-semibold hover:bg-[#1e3c41] shadow-xs"
                >
                  Save Bespoke Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Photos Modal for an existing custom order */}
      {selectedOrderForPhotos && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-xl w-full p-6 border border-gray-200 dark:border-gray-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Images className="w-5 h-5 text-[#c59d5f]" />
                  <span>Inspiration & Craft Photos</span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Request {selectedOrderForPhotos.requestNumber} · {selectedOrderForPhotos.customerName}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrderForPhotos(null)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <MultiImageUpload
              images={selectedOrderForPhotos.referenceImages || []}
              onChange={(newImgs) => {
                const updated = customOrders.map((o) =>
                  o.id === selectedOrderForPhotos.id
                    ? { ...o, referenceImages: newImgs }
                    : o
                );
                onSaveCustomOrders(updated);
                setSelectedOrderForPhotos({
                  ...selectedOrderForPhotos,
                  referenceImages: newImgs,
                });
              }}
              maxImages={10}
              label="Bespoke Order Gallery"
              description="Add sketches, client moodboards, or finished craft photos for quality checking."
            />

            <div className="flex justify-end pt-3 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setSelectedOrderForPhotos(null)}
                className="px-5 py-2 rounded-xl bg-[#2d5a61] text-white text-xs font-semibold hover:bg-[#1e3c41] transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
