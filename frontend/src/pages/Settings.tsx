import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../services/api';
import { Save, AlertCircle } from 'lucide-react';

interface HallFees {
  seatRent: number;
  establishment: number;
}

interface SettingsData {
  admissionFees: Record<string, number>;
  monthlyFees: Record<string, HallFees>;
}

const Settings = () => {
  const [fees, setFees] = useState<SettingsData | null>(null);
  const [message, setMessage] = useState('');

  const { data: currentSettings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data } = await api.get('/settings');
      return data;
    },
  });

  useEffect(() => {
    if (currentSettings) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFees(currentSettings);
    }
  }, [currentSettings]);

  const updateMutation = useMutation({
    mutationFn: (newSettings: SettingsData) => api.put('/settings', newSettings),
    onSuccess: () => {
      setMessage('Settings updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    },
  });

  const handleAdmissionChange = (field: string, value: string) => {
    if (!fees) return;
    setFees({
      ...fees,
      admissionFees: {
        ...fees.admissionFees,
        [field]: parseFloat(value) || 0,
      },
    });
  };

  const handleMonthlyChange = (hall: string, field: string, value: string) => {
    if (!fees) return;
    setFees({
      ...fees,
      monthlyFees: {
        ...fees.monthlyFees,
        [hall]: {
          ...fees.monthlyFees[hall],
          [field]: parseFloat(value) || 0,
        },
      },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fees) {
      updateMutation.mutate(fees);
    }
  };

  if (isLoading || !fees) return <div>Loading settings...</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Fee Configurations</h1>
        {message && <p className="text-green-600 font-medium">{message}</p>}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <AlertCircle size={20} className="text-teal-600" /> Admission Fees (Initial Payment)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.keys(fees.admissionFees).map((key) => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <input
                  type="number"
                  className="w-full border p-2 rounded focus:ring-1 focus:ring-primary outline-none"
                  value={fees.admissionFees[key]}
                  onChange={(e) => handleAdmissionChange(key, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-6">Monthly Fees (By Hall)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {Object.keys(fees.monthlyFees).map((hall) => (
              <div key={hall} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-bold text-teal-800 mb-4">{hall}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-gray-500 uppercase mb-1">Seat Rent</label>
                    <input
                      type="number"
                      className="w-full border p-2 rounded bg-white"
                      value={fees.monthlyFees[hall].seatRent}
                      onChange={(e) => handleMonthlyChange(hall, 'seatRent', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500 uppercase mb-1">Establishment</label>
                    <input
                      type="number"
                      className="w-full border p-2 rounded bg-white"
                      value={fees.monthlyFees[hall].establishment}
                      onChange={(e) => handleMonthlyChange(hall, 'establishment', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="bg-[#004d40] text-white px-8 py-3 rounded-md font-bold flex items-center gap-2 hover:bg-opacity-90 shadow-lg"
          >
            <Save size={20} />
            {updateMutation.isPending ? 'Saving...' : 'Save All Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
