import { useAuth } from '../context/AuthContext';
import { User as UserIcon, Book, Hash, ShieldCheck } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();

  if (!user) return null;

  const profileItems = [
    { icon: <UserIcon className="text-blue-500" />, label: 'Full Name', value: user.fullName },
    { icon: <Hash className="text-purple-500" />, label: 'Student ID', value: user.studentId },
    { icon: <ShieldCheck className="text-green-500" />, label: 'Role', value: user.role },
    { icon: <Book className="text-orange-500" />, label: 'Hall Name', value: user.hallName || 'N/A' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="h-32 bg-[#004d40]"></div>
        <div className="px-8 pb-8">
          <div className="relative -mt-16 mb-6">
            <div className="h-32 w-32 bg-white rounded-full p-1 shadow-lg">
              <div className="h-full w-full bg-gray-100 rounded-full flex items-center justify-center text-[#004d40]">
                <UserIcon size={64} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-800 border-b pb-2">Personal Information</h2>
              <div className="space-y-4">
                {profileItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="p-2 bg-gray-50 rounded-lg">{item.icon}</div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{item.label}</p>
                      <p className="text-gray-900 font-semibold">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-800 border-b pb-2">Account Status</h2>
              <div className="p-4 bg-teal-50 rounded-xl border border-teal-100">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-teal-800">Payment Status</span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">ACTIVE</span>
                </div>
                <p className="text-sm text-teal-700 leading-relaxed">
                  Your account is in good standing. All features are available. Remember to check your dues monthly.
                </p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
                <p className="text-xs text-gray-500 font-bold uppercase">Security</p>
                <button className="text-sm text-[#004d40] font-semibold hover:underline">Change Password</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
