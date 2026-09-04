import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  ShoppingBag,
  Edit2,
  Trash2,
  X,
  MessageCircle,
} from 'lucide-react';
import { AdminCustomer } from './types';

interface AdminCustomersProps {
  customers: AdminCustomer[];
  onSaveCustomers: (customers: AdminCustomer[]) => void;
}

export const AdminCustomers: React.FC<AdminCustomersProps> = ({
  customers,
  onSaveCustomers,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'VIP' | 'Active' | 'New'>('All');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<AdminCustomer | null>(null);

  const [formData, setFormData] = useState<Partial<AdminCustomer>>({
    name: '',
    email: '',
    phone: '+92 ',
    city: 'Karachi',
    status: 'Active',
    totalOrders: 1,
    totalSpent: 3000,
  });

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalSpentAll = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const vipCount = customers.filter((c) => c.status === 'VIP').length;

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      email: '',
      phone: '+92 ',
      city: 'Karachi',
      status: 'New',
      totalOrders: 0,
      totalSpent: 0,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (cust: AdminCustomer) => {
    setEditingCustomer(cust);
    setFormData({ ...cust });
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    if (editingCustomer) {
      const updated = customers.map((c) =>
        c.id === editingCustomer.id ? ({ ...c, ...formData } as AdminCustomer) : c
      );
      onSaveCustomers(updated);
    } else {
      const newCust: AdminCustomer = {
        id: `c-${Date.now()}`,
        name: formData.name || 'New Customer',
        email: formData.email || '',
        phone: formData.phone || '',
        city: formData.city || 'Karachi',
        joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        totalOrders: Number(formData.totalOrders) || 0,
        totalSpent: Number(formData.totalSpent) || 0,
        status: formData.status || 'New',
        avatar:
          formData.avatar ||
          `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80`,
      };
      onSaveCustomers([newCust, ...customers]);
    }

    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this customer record?')) {
      onSaveCustomers(customers.filter((c) => c.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-[#1a1e24] p-5 sm:p-6 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-2xs">
        <div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-[#2d5a61] dark:text-teal-400" />
            Registered Patrons & Customers
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Customer directory, loyalty tiers, lifetime spend values, and contact history.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#2d5a61] text-white hover:bg-[#1e3c41] transition-colors flex items-center justify-center gap-2 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Customer</span>
        </button>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-[#1a1e24] p-4 rounded-xl border border-gray-200/80 dark:border-gray-800">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Patrons</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{customers.length}</p>
        </div>
        <div className="bg-white dark:bg-[#1a1e24] p-4 rounded-xl border border-gray-200/80 dark:border-gray-800">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">VIP Collectors</p>
          <p className="text-xl font-bold text-[#c59d5f] mt-1">{vipCount}</p>
        </div>
        <div className="bg-white dark:bg-[#1a1e24] p-4 rounded-xl border border-gray-200/80 dark:border-gray-800">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Total Customer Spend</p>
          <p className="text-xl font-bold text-[#2d5a61] dark:text-teal-400 mt-1">
            PKR {totalSpentAll.toLocaleString()}
          </p>
        </div>
        <div className="bg-white dark:bg-[#1a1e24] p-4 rounded-xl border border-gray-200/80 dark:border-gray-800">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Avg. Spend / Patron</p>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            PKR {customers.length > 0 ? Math.round(totalSpentAll / customers.length).toLocaleString() : 0}
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-[#1a1e24] p-4 sm:p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by patron name, city, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9.5 pr-4 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#2d5a61]/30"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {(['All', 'VIP', 'Active', 'New'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-[#2d5a61] text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {st === 'All' ? 'All Customers' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white dark:bg-[#1a1e24] rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/70 dark:bg-gray-800/50 text-[11px] uppercase tracking-wider text-gray-400 border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Customer</th>
                <th className="py-3.5 px-3 font-semibold">Contact Info</th>
                <th className="py-3.5 px-3 font-semibold">City</th>
                <th className="py-3.5 px-3 font-semibold text-center">Orders</th>
                <th className="py-3.5 px-3 font-semibold text-right">Lifetime Spend</th>
                <th className="py-3.5 px-3 font-semibold text-center">Tier</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredCustomers.map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-gray-50/60 dark:hover:bg-gray-800/30 transition-colors"
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          c.avatar ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
                        }
                        alt=""
                        className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700 shrink-0"
                      />
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{c.name}</p>
                        <span className="text-[10px] text-gray-400">Joined {c.joinedDate}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-3">
                    <p className="text-gray-700 dark:text-gray-300 font-medium">{c.phone}</p>
                    <p className="text-[10px] text-gray-400">{c.email}</p>
                  </td>

                  <td className="py-3.5 px-3 text-gray-700 dark:text-gray-300">{c.city}</td>

                  <td className="py-3.5 px-3 text-center font-semibold text-gray-800 dark:text-gray-200">
                    {c.totalOrders}
                  </td>

                  <td className="py-3.5 px-3 text-right font-bold text-[#2d5a61] dark:text-teal-400">
                    PKR {c.totalSpent.toLocaleString()}
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                        c.status === 'VIP'
                          ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                          : c.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400'
                          : 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <a
                        href={`https://wa.me/${c.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                        title="Chat on WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleOpenEdit(c)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-[#2d5a61] hover:bg-teal-50 dark:hover:bg-teal-950/40 transition-colors"
                        title="Edit customer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete customer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Customer Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#1a1e24] rounded-2xl border border-gray-200 dark:border-gray-800 max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-serif text-lg font-bold text-gray-900 dark:text-white">
                {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-200 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-200 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-200 mb-1">
                    Phone / WhatsApp *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-200 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city || ''}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-200 mb-1">
                    Customer Tier
                  </label>
                  <select
                    value={formData.status || 'Active'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as AdminCustomer['status'],
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="Active">Active</option>
                    <option value="VIP">VIP</option>
                    <option value="New">New</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#2d5a61] text-white font-semibold hover:bg-[#1e3c41] shadow-xs"
                >
                  {editingCustomer ? 'Update Record' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
