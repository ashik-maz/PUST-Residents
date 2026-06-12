import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../services/api';
import { Search, CreditCard, AlertCircle } from 'lucide-react';
import { AxiosError } from 'axios';

interface DueItem {
  _id: string;
  type: string;
  description?: string;
  amount: number;
}

const Payments = () => {
  const [studentId, setStudentId] = useState('');
  const [amountToPay, setAmountToPay] = useState('');
  const [searchId, setSearchId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { data: studentDues, isFetching, refetch } = useQuery({
    queryKey: ['studentDues', searchId],
    queryFn: async () => {
      const { data } = await api.get(`/payments/dues/${searchId}`);
      return data;
    },
    enabled: !!searchId,
    retry: false,
  });

  const paymentMutation = useMutation({
    mutationFn: (paymentData: { studentId: string; amountPaid: number }) => api.post('/payments/pay', paymentData),
    onSuccess: (response) => {
      setSuccess('Payment processed successfully!');
      setError('');
      refetch();
      // Automatically open voucher in new tab
      if (response.data.voucherUrl) {
        const backendUrl = import.meta.env.PROD ? 'https://pust-residents.onrender.com' : 'http://localhost:5000';
        window.open(`${backendUrl}${response.data.voucherUrl}`, '_blank');
      }
    },
    onError: (err: unknown) => {
      const axiosError = err as AxiosError<{ message: string }>;
      setError(axiosError.response?.data?.message || 'Payment failed');
      setSuccess('');
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchId(studentId);
    setError('');
    setSuccess('');
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentDues) return;

    const paidAmount = parseFloat(amountToPay);
    if (paidAmount !== studentDues.totalDue) {
      setError('Full due payment is required. Partial payments are not allowed.');
      return;
    }

    paymentMutation.mutate({
      studentId: searchId,
      amountPaid: paidAmount,
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800">Payment Processing</h1>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-4">Find Resident</h2>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            className="flex-1 border p-2 rounded outline-none focus:ring-1 focus:ring-primary"
            placeholder="Enter Student ID (e.g., 200101)"
            value={studentId}
            onChange={e => setStudentId(e.target.value)}
          />
          <button
            type="submit"
            className="bg-[#004d40] text-white px-6 py-2 rounded-md hover:bg-opacity-90 transition flex items-center gap-2"
          >
            <Search size={18} />
            Search
          </button>
        </form>
      </div>

      {isFetching && <div className="text-center py-10">Searching...</div>}

      {studentDues && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-4">Resident Details</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Name</p>
                <p className="font-semibold">{studentDues.student.fullName}</p>
              </div>
              <div>
                <p className="text-gray-500">Student ID</p>
                <p className="font-semibold">{studentDues.student.studentId}</p>
              </div>
              <div>
                <p className="text-gray-500">Hall</p>
                <p className="font-semibold">{studentDues.student.hallName}</p>
              </div>
              <div>
                <p className="text-gray-500">Room</p>
                <p className="font-semibold">{studentDues.student.roomNumber}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold mb-4">Unpaid Dues Breakdown</h2>
              {studentDues.dues.length === 0 ? (
                <p className="text-green-600 font-medium">No outstanding dues.</p>
              ) : (
                <div className="space-y-3">
                  {studentDues.dues.map((due: DueItem) => (
                    <div key={due._id} className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-100">
                      <div>
                        <p className="font-medium">{due.type} Fee</p>
                        <p className="text-xs text-gray-500">{due.description || 'No description'}</p>
                      </div>
                      <p className="font-bold">{due.amount} BDT</p>
                    </div>
                  ))}
                  <div className="pt-4 border-t flex justify-between items-center text-lg">
                    <span className="font-bold">Total Outstanding</span>
                    <span className="font-extrabold text-red-600">{studentDues.totalDue} BDT</span>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold mb-4">Collect Payment</h2>
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded border border-red-100 flex gap-2">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div className="mb-4 p-3 bg-green-50 text-green-700 text-xs rounded border border-green-100">
                  {success}
                </div>
              )}
              
              <form onSubmit={handlePayment} className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Amount Paid (BDT)</label>
                  <input
                    type="number"
                    className="w-full border p-2 rounded outline-none focus:ring-1 focus:ring-primary font-bold text-lg"
                    placeholder="Enter amount"
                    required
                    disabled={studentDues.totalDue === 0}
                    value={amountToPay}
                    onChange={e => setAmountToPay(e.target.value)}
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Must be exactly {studentDues.totalDue} BDT</p>
                </div>
                
                <button
                  type="submit"
                  disabled={paymentMutation.isPending || studentDues.totalDue === 0}
                  className="w-full bg-[#004d40] text-white py-3 rounded-md font-bold flex items-center justify-center gap-2 hover:bg-opacity-90 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <CreditCard size={18} />
                  Process Payment
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
