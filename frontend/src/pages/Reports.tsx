import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { FileDown, Calendar, Filter } from 'lucide-react';

interface ReportPayment {
  _id: string;
  transactionId: string;
  student?: {
    fullName: string;
    hallName: string;
  };
  amount: number;
  paymentDate: string;
}

const Reports = () => {
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: reportData, isLoading, refetch } = useQuery({
    queryKey: ['report', startDate, endDate],
    queryFn: async () => {
      const { data } = await api.get(`/reports/range?startDate=${startDate}&endDate=${endDate}`);
      return data;
    },
  });

  const handleExport = () => {
    window.open(`http://localhost:5000/api/reports/export?startDate=${startDate}&endDate=${endDate}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Financial Reports</h1>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-md hover:bg-green-800 transition shadow-sm"
        >
          <FileDown size={18} />
          <span>Export to Excel</span>
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">From Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="date"
                className="pl-10 pr-3 py-2 border rounded outline-none focus:ring-1 focus:ring-primary"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">To Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="date"
                className="pl-10 pr-3 py-2 border rounded outline-none focus:ring-1 focus:ring-primary"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <button
            onClick={() => refetch()}
            className="bg-[#004d40] text-white px-6 py-2 rounded-md hover:bg-opacity-90 flex items-center gap-2"
          >
            <Filter size={18} />
            Filter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center">
          <p className="text-sm text-gray-500 uppercase font-bold tracking-wider mb-2">Total Transactions</p>
          <p className="text-4xl font-black text-gray-800">{reportData?.count || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center">
          <p className="text-sm text-gray-500 uppercase font-bold tracking-wider mb-2">Total Collection</p>
          <p className="text-4xl font-black text-teal-700">{reportData?.totalAmount || 0} BDT</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-sm">
              <tr>
                <th className="px-4 py-3">Transaction ID</th>
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3">Hall</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y">
              {isLoading ? (
                <tr><td colSpan={5} className="p-4 text-center">Loading...</td></tr>
              ) : reportData?.payments.map((p: ReportPayment) => (
                <tr key={p._id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 font-mono text-xs">{p.transactionId}</td>
                  <td className="px-4 py-4">{p.student?.fullName}</td>
                  <td className="px-4 py-4">{p.student?.hallName}</td>
                  <td className="px-4 py-4 font-bold">{p.amount} BDT</td>
                  <td className="px-4 py-4 text-gray-500">{new Date(p.paymentDate).toLocaleDateString()}</td>
                </tr>
              ))}
              {reportData?.payments.length === 0 && (
                <tr><td colSpan={5} className="p-10 text-center text-gray-400">No data found for this range.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
