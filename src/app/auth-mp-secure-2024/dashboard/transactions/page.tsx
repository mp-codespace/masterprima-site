// src/app/auth-mp-secure-2024/dashboard/transactions/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { DollarSign, Search, Filter, X, Eye, AlertCircle } from 'lucide-react';

type Transaction = {
  id: string;
  external_id: string;
  amount: number;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED';
  items: { id: string; name: string; price: number; qty: number }[];
  customer_details: { given_names?: string; email?: string; mobile_number?: string } | null;
  created_at: string;
};

const statusColors = {
  PAID: 'bg-green-100 text-green-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  FAILED: 'bg-red-100 text-red-800',
  EXPIRED: 'bg-gray-100 text-gray-800',
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/auth-mp-secure-2024/transactions');
        if (!response.ok) {
          throw new Error('Failed to fetch transactions');
        }
        const data = await response.json();
        setTransactions(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(t => statusFilter === 'all' || t.status === statusFilter)
      .filter(t =>
        t.external_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.customer_details?.given_names?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.customer_details?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [transactions, searchTerm, statusFilter]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-urbanist text-neutral-charcoal">Transactions</h1>
          <p className="text-neutral-dark-gray mt-1">View and manage all payment transactions.</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Invoice ID, Name, or Email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 border-2 border-transparent rounded-lg focus:outline-none focus:bg-white focus:border-primary-orange"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2 px-3 bg-gray-100 border-2 border-transparent rounded-lg focus:outline-none focus:bg-white focus:border-primary-orange"
            >
              <option value="all">All Statuses</option>
              <option value="PAID">Paid</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b-2 border-gray-200 bg-gray-50">
              <tr>
                <th className="p-4 text-sm font-semibold text-gray-600">Invoice ID</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Customer</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Amount</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Date</th>
                <th className="p-4 text-sm font-semibold text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse border-b border-gray-100">
                    <td className="p-4"><div className="h-5 bg-gray-200 rounded w-3/4"></div></td>
                    <td className="p-4"><div className="h-5 bg-gray-200 rounded w-1/2"></div></td>
                    <td className="p-4"><div className="h-5 bg-gray-200 rounded w-1/2"></div></td>
                    <td className="p-4"><div className="h-5 bg-gray-200 rounded w-1/4"></div></td>
                    <td className="p-4"><div className="h-5 bg-gray-200 rounded w-1/2"></div></td>
                    <td className="p-4 flex justify-end"><div className="h-8 w-8 bg-gray-200 rounded-md"></div></td>
                  </tr>
                ))
              ) : filteredTransactions.map(t => (
                <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                  <td className="p-4 font-mono text-xs text-gray-700">{t.external_id}</td>
                  <td className="p-4">
                    <div className="font-semibold text-neutral-charcoal">{t.customer_details?.given_names || 'N/A'}</div>
                    <div className="text-xs text-gray-500">{t.customer_details?.email}</div>
                  </td>
                  <td className="p-4 font-semibold text-neutral-charcoal">
                    Rp {t.amount.toLocaleString('id-ID')}
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusColors[t.status]}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-600">{formatDate(t.created_at)}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => setSelectedTransaction(t)} className="p-2 text-gray-500 hover:text-primary-orange hover:bg-gray-100 rounded-md">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!isLoading && error && (
            <div className="text-center py-20 text-red-500">
                <AlertCircle className="w-12 h-12 mx-auto mb-2"/>
                <h4 className="font-semibold text-lg">Failed to load data</h4>
                <p className="text-sm">{error}</p>
            </div>
          )}
          {!isLoading && !error && filteredTransactions.length === 0 && (
            <div className="text-center py-20 text-gray-500">
              <DollarSign className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <h4 className="font-semibold text-lg">No Transactions Found</h4>
              <p className="text-sm">Try adjusting your search or filter.</p>
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedTransaction(null)}>
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-lg w-full" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b pb-3 mb-4">
                <h3 className="text-lg font-bold text-gray-900">Transaction Details</h3>
                <button onClick={() => setSelectedTransaction(null)} className="p-1 rounded-full hover:bg-gray-100">
                    <X className="w-5 h-5 text-gray-600" />
                </button>
            </div>
            <div className="space-y-4 text-sm">
                <div><span className="font-semibold text-gray-600">Invoice ID:</span> <span className="font-mono text-gray-800">{selectedTransaction.external_id}</span></div>
                <div><span className="font-semibold text-gray-600">Status:</span> <span className={`px-2 py-0.5 rounded-full text-xs ${statusColors[selectedTransaction.status]}`}>{selectedTransaction.status}</span></div>
                <div><span className="font-semibold text-gray-600">Amount:</span> <span className="text-gray-800">Rp {selectedTransaction.amount.toLocaleString('id-ID')}</span></div>
                <div><span className="font-semibold text-gray-600">Date:</span> <span className="text-gray-800">{formatDate(selectedTransaction.created_at)}</span></div>
                <div className="pt-2 border-t mt-2">
                    <h4 className="font-semibold text-gray-600 mb-2">Customer Details</h4>
                    <p><strong>Name:</strong> {selectedTransaction.customer_details?.given_names || 'N/A'}</p>
                    <p><strong>Email:</strong> {selectedTransaction.customer_details?.email || 'N/A'}</p>
                    <p><strong>Phone:</strong> {selectedTransaction.customer_details?.mobile_number || 'N/A'}</p>
                </div>
                <div className="pt-2 border-t mt-2">
                    <h4 className="font-semibold text-gray-600 mb-2">Items</h4>
                    <ul>
                        {selectedTransaction.items.map(item => (
                            <li key={item.id} className="flex justify-between">
                                <span>{item.name} x{item.qty}</span>
                                <span>Rp {(item.price * item.qty).toLocaleString('id-ID')}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
