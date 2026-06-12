import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { CreditCard, History, User as UserIcon, Bell, Download, CheckCircle, XCircle } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { AxiosError } from 'axios';

interface Payment {
  _id: string;
  transactionId: string;
  amount: number;
  createdAt: string;
  voucherUrl?: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const paymentStatus = searchParams.get('payment');

  const { data: studentDues, isLoading: duesLoading } = useQuery({
    queryKey: ['studentDues', user?.studentId],
    queryFn: async () => {
      const { data } = await api.get(`/payments/dues/${user?.studentId}`);
      return data;
    },
    enabled: user?.role === 'Student',
  });

  const paymentMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/payments/init', { studentId: user?.studentId });
      return data;
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url; // Redirect to SSLCommerz Gateway
      }
    },
    onError: (error: unknown) => {
      const axiosError = error as AxiosError<{ message: string }>;
      const message = axiosError.response?.data?.message || axiosError.message || 'Failed to initialize payment';
      alert(message);
    }
  });

  const { data: paymentHistory, isLoading: historyLoading } = useQuery({
    queryKey: ['paymentHistory', user?.studentId],
    queryFn: async () => {
      const { data } = await api.get(`/payments/history/${user?.studentId}`);
      return data;
    },
    enabled: user?.role === 'Student',
  });

  if (duesLoading || historyLoading) return <div className="flex justify-center py-20">Loading student dashboard...</div>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Payment Status Alerts */}
      {paymentStatus === 'success' && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-3 animate-bounce">
          <CheckCircle className="text-green-500" />
          <span>Payment successful! Your records have been updated.</span>
        </div>
      )}
      {paymentStatus === 'fail' && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-3">
          <XCircle className="text-red-500" />
          <span>Payment failed. Please try again or contact the hall office.</span>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Welcome, {user?.fullName}</h1>
        <div className="bg-white p-2 rounded-full shadow-sm relative cursor-pointer hover:bg-gray-50">
          <Bell size={20} className="text-gray-600" />
          {studentDues?.totalDue > 0 && (
            <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full border-2 border-white"></span>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Due Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 bg-gradient-to-br from-white to-gray-50">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <CreditCard size={18} className="text-[#004d40]" /> Current Outstanding
            </h2>
            <div className="mb-6">
              <p className="text-4xl font-black text-red-600">{studentDues?.totalDue} BDT</p>
              <p className="text-xs text-gray-400 mt-2">All dues must be paid in full.</p>
            </div>
            <button 
              className="w-full bg-[#004d40] text-white py-3 rounded-lg font-bold hover:bg-opacity-90 transition shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed"
              disabled={studentDues?.totalDue === 0 || paymentMutation.isPending}
              onClick={() => paymentMutation.mutate()}
            >
              {paymentMutation.isPending ? 'Processing...' : 'Pay Now'}
            </button>
          </div>

          {/* Quick Stats */}
          <div className="bg-[#004d40] text-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xs font-bold uppercase tracking-widest opacity-70 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link to="/profile" className="flex items-center gap-3 p-3 bg-white/10 rounded-lg hover:bg-white/20 transition">
                <UserIcon size={20} />
                <span>My Profile</span>
              </Link>
              <button 
                onClick={() => window.print()}
                className="w-full flex items-center gap-3 p-3 bg-white/10 rounded-lg hover:bg-white/20 transition"
              >
                <History size={20} />
                <span>Print Statement</span>
              </button>
            </div>
          </div>
        </div>

        {/* Recent Payment History */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <History size={20} className="text-[#004d40]" /> Recent Payments
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                  <tr>
                    <th className="px-6 py-4">Transaction ID</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Voucher</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {paymentHistory?.map((payment: Payment) => (
                    <tr key={payment._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-mono text-xs">{payment.transactionId}</td>
                      <td className="px-6 py-4 font-bold text-teal-700">{payment.amount} BDT</td>
                      <td className="px-6 py-4 text-gray-500">{new Date(payment.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        {payment.voucherUrl && (
                          <a 
                            href={`${import.meta.env.PROD ? 'https://pust-residents.onrender.com' : 'http://localhost:5000'}${payment.voucherUrl}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-primary hover:underline font-medium"
                          >
                            <Download size={14} /> Download
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                  {paymentHistory?.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-gray-400">
                        No payments recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
