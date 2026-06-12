import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User as UserIcon, Book, Hash, ShieldCheck, Edit3, Save, X } from 'lucide-react';
import api from '../services/api';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

const Profile = () => {
  const { user, login } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    department: user?.department || '',
    session: user?.session || '',
    roomNumber: user?.roomNumber || '',
  });

  const updateMutation = useMutation({
    mutationFn: async (newData: typeof formData) => {
      const { data } = await api.put('/auth/profile', newData);
      return data;
    },
    onSuccess: (data) => {
      login(data);
      setIsEditing(false);
      alert('Profile updated successfully!');
    },
    onError: (error: unknown) => {
      const axiosError = error as AxiosError<{ message: string }>;
      alert(axiosError.response?.data?.message || 'Failed to update profile');
    }
  });

  if (!user) return null;

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  type FormField = keyof typeof formData;

  const profileItems = [
    { icon: <UserIcon className="text-blue-500" />, label: 'Full Name', value: user.fullName, field: 'fullName' as FormField },
    { icon: <Hash className="text-purple-500" />, label: 'Student ID', value: user.studentId, permanent: true },
    { icon: <ShieldCheck className="text-green-500" />, label: 'Role', value: user.role, permanent: true },
    { icon: <Book className="text-orange-500" />, label: 'Hall Name', value: user.hallName || 'N/A', permanent: true },
    { icon: <Book className="text-indigo-500" />, label: 'Department', value: user.department || 'Not Set', field: 'department' as FormField },
    { icon: <Hash className="text-pink-500" />, label: 'Session', value: user.session || 'Not Set', field: 'session' as FormField },
    { icon: <Hash className="text-yellow-500" />, label: 'Room Number', value: user.roomNumber || 'Not Set', field: 'roomNumber' as FormField },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
        {!isEditing ? (
          <button 
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 bg-[#004d40] text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition shadow-sm"
          >
            <Edit3 size={18} />
            <span>Edit Profile</span>
          </button>
        ) : (
          <div className="flex gap-2">
            <button 
              onClick={() => setIsEditing(false)}
              className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
            >
              <X size={18} />
              <span>Cancel</span>
            </button>
            <button 
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="flex items-center gap-2 bg-[#004d40] text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition shadow-sm disabled:bg-gray-300"
            >
              <Save size={18} />
              <span>{updateMutation.isPending ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        )}
      </div>
      
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
                  <div key={idx} className="flex items-center gap-4 p-2 rounded-lg transition-colors hover:bg-gray-50">
                    <div className="p-2 bg-white shadow-sm border border-gray-100 rounded-lg">{item.icon}</div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{item.label}</p>
                      {isEditing && item.field ? (
                        <input
                          type="text"
                          className="w-full mt-1 border-b border-gray-300 focus:border-[#004d40] outline-none py-1 font-semibold text-gray-900 bg-transparent"
                          value={formData[item.field]}
                          onChange={(e) => setFormData({ ...formData, [item.field!]: e.target.value })}
                        />
                      ) : (
                        <p className={`font-semibold ${item.value === 'Not Set' ? 'text-red-400 italic' : 'text-gray-900'}`}>
                          {item.value}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-800 border-b pb-2">Requirement Checklist</h2>
              <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                <p className="text-sm text-orange-800 font-bold mb-3 flex items-center gap-2">
                  <ShieldCheck size={16} /> Payment Prerequisites
                </p>
                <ul className="space-y-2">
                  {[
                    { label: 'Full Name', val: user.fullName },
                    { label: 'Department', val: user.department },
                    { label: 'Session', val: user.session },
                    { label: 'Room Number', val: user.roomNumber }
                  ].map((req, i) => (
                    <li key={i} className="flex items-center justify-between text-xs">
                      <span className="text-orange-700">{req.label}</span>
                      {req.val ? (
                        <span className="text-green-600 font-bold">✓ Complete</span>
                      ) : (
                        <span className="text-red-500 font-bold">MISSING</span>
                      )}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-[10px] text-orange-600 leading-tight">
                  * All fields above must be filled to enable the SSLCommerz "Pay Now" button on your dashboard.
                </p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
                <p className="text-xs text-gray-500 font-bold uppercase">Security</p>
                <p className="text-[10px] text-gray-400">Manage your account security and authentication settings.</p>
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
