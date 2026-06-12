import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { CreditCard, Users, TrendingUp, History, CheckCircle, XCircle } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

interface Payment {
  _id: string;
  transactionId: string;
  student?: {
    fullName: string;
    hallName: string;
  };
  amount: number;
  createdAt: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const paymentStatus = searchParams.get('payment');

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const { data } = await api.get('/reports/analytics');
      return data;
    },
    enabled: user?.role !== 'Student',
  });

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
        window.location.href = data.url;
      }
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Failed to initialize payment');
    }
  });

  if (analyticsLoading || duesLoading) return <div>Loading dashboard...</div>;

  if (user?.role === 'Student') {
    return (
      <div className="space-y-6">
        {paymentStatus === 'success' && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-3 animate-bounce">
            <CheckCircle className="text-green-500" />
            <span>Payment successful! Your records have been updated.</span>
          </div>
        )}
        {paymentStatus === 'fail' && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-3">
            <XCircle className="text-red-500" />
            <span>Payment failed. Please try again.</span>
          </div>
        )}

        <h1 className="text-2xl font-bold text-gray-800">Welcome, {user.fullName}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="text-primary" /> Current Dues
            </h2>
            <div className="mb-6">
              <p className="text-4xl font-bold text-red-600">{studentDues?.totalDue} BDT</p>
              <p className="text-sm text-gray-500 mt-2">All dues must be paid in full.</p>
            </div>
            <button 
              className="w-full bg-[#004d40] text-white py-3 rounded-lg font-bold hover:bg-opacity-90 transition shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed"
              disabled={studentDues?.totalDue === 0 || paymentMutation.isPending}
              onClick={() => paymentMutation.mutate()}
            >
              {paymentMutation.isPending ? 'Processing...' : 'Pay Now'}
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <History className="text-primary" /> Profile Info
            </h2>
            <div className="space-y-2 text-sm">
              <p><span className="font-semibold">Student ID:</span> {user.studentId}</p>
              <p><span className="font-semibold">Hall:</span> {user.hallName}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold">{analytics?.totalRevenue} BDT</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full text-green-600">
              <TrendingUp size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Payments</p>
              <p className="text-2xl font-bold">{analytics?.totalTransactions}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full text-blue-600">
              <CreditCard size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Residents</p>
              <p className="text-2xl font-bold">--</p>
            </div>
            <div className="bg-teal-100 p-3 rounded-full text-teal-600">
              <Users size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-4">Recent Payments</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-sm">
              <tr>
                <th className="px-4 py-2">Transaction ID</th>
                <th className="px-4 py-2">Student</th>
                <th className="px-4 py-2">Hall</th>
                <th className="px-4 py-2">Amount</th>
                <th className="px-4 py-2">Date</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y">
              {analytics?.recentPayments.map((payment: Payment) => (
                <tr key={payment._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs">{payment.transactionId}</td>
                  <td className="px-4 py-3">{payment.student?.fullName}</td>
                  <td className="px-4 py-3">{payment.student?.hallName}</td>
                  <td className="px-4 py-3 font-semibold">{payment.amount} BDT</td>
                  <td className="px-4 py-3">{new Date(payment.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
