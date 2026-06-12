import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { UserPlus, Search, Edit } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Resident {
  _id: string;
  fullName: string;
  studentId: string;
  department: string;
  session: string;
  hallName: string;
  roomNumber: string;
  allottedDate: string;
  status: string;
}

const Residents = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    studentId: '',
    department: '',
    session: '',
    hallName: user?.hallName || 'Shadhinota Hall',
    roomNumber: '',
    allottedDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (user?.hallName) {
      setFormData(prev => ({ ...prev, hallName: user.hallName! }));
    }
  }, [user]);

  const queryClient = useQueryClient();

  const { data: residents, isLoading } = useQuery({
    queryKey: ['residents'],
    queryFn: async () => {
      const { data } = await api.get('/residents');
      return data;
    },
  });

  const addMutation = useMutation({
    mutationFn: (newResident: typeof formData) => api.post('/residents', newResident),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residents'] });
      setShowAddForm(false);
      setFormData({
        fullName: '',
        studentId: '',
        department: '',
        session: '',
        hallName: user?.hallName || 'Shadhinota Hall',
        roomNumber: '',
        allottedDate: new Date().toISOString().split('T')[0],
      });
    },
  });

  const filteredResidents = residents?.filter((r: Resident) => 
    r.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.studentId.includes(searchTerm)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">
          Resident Management {user?.hallName && `- ${user.hallName}`}
        </h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md hover:bg-opacity-90"
          style={{ backgroundColor: '#004d40' }}
        >
          <UserPlus size={18} />
          <span>{showAddForm ? 'Cancel' : 'Add Resident'}</span>
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">Add New Resident</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <input
              className="border p-2 rounded"
              placeholder="Full Name"
              required
              value={formData.fullName}
              onChange={e => setFormData({ ...formData, fullName: e.target.value })}
            />
            <input
              className="border p-2 rounded"
              placeholder="Student ID"
              required
              value={formData.studentId}
              onChange={e => setFormData({ ...formData, studentId: e.target.value })}
            />
            <input
              className="border p-2 rounded"
              placeholder="Department"
              required
              value={formData.department}
              onChange={e => setFormData({ ...formData, department: e.target.value })}
            />
            <input
              className="border p-2 rounded"
              placeholder="Session"
              required
              value={formData.session}
              onChange={e => setFormData({ ...formData, session: e.target.value })}
            />
            {!user?.hallName ? (
              <select
                className="border p-2 rounded"
                value={formData.hallName}
                onChange={e => setFormData({ ...formData, hallName: e.target.value })}
              >
                <option>Shadhinota Hall</option>
                <option>July-6 Hall</option>
                <option>Gonotontro Hall</option>
                <option>Matrivasha Hall</option>
              </select>
            ) : (
              <div className="border p-2 rounded bg-gray-50 text-gray-500 text-sm flex items-center">
                Hall: {user.hallName}
              </div>
            )}
            <input
              className="border p-2 rounded"
              placeholder="Room Number"
              required
              value={formData.roomNumber}
              onChange={e => setFormData({ ...formData, roomNumber: e.target.value })}
            />
            <input
              type="date"
              className="border p-2 rounded"
              required
              value={formData.allottedDate}
              onChange={e => setFormData({ ...formData, allottedDate: e.target.value })}
            />
            <div className="lg:col-span-2">
              <button
                type="submit"
                disabled={addMutation.isPending}
                className="bg-primary text-white px-6 py-2 rounded-md"
                style={{ backgroundColor: '#004d40' }}
              >
                {addMutation.isPending ? 'Adding...' : 'Save Resident'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
          <Search className="text-gray-400" size={18} />
          <input
            className="flex-1 outline-none text-sm"
            placeholder="Search by name or student ID..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-sm">
              <tr>
                <th className="px-4 py-3">Student Info</th>
                <th className="px-4 py-3">Hall / Room</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Allotted Date</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y">
              {isLoading ? (
                <tr><td colSpan={5} className="p-4 text-center">Loading...</td></tr>
              ) : filteredResidents?.map((r: Resident) => (
                <tr key={r._id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <p className="font-semibold text-gray-800">{r.fullName}</p>
                    <p className="text-xs text-gray-500">{r.studentId} | {r.department}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p>{r.hallName}</p>
                    <p className="text-xs text-gray-500">Room: {r.roomNumber}</p>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold ${
                      r.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">{new Date(r.allottedDate).toLocaleDateString()}</td>
                  <td className="px-4 py-4">
                    <button className="text-primary hover:text-teal-800">
                      <Edit size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Residents;
