import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { LogIn } from 'lucide-react';
import { AxiosError } from 'axios';

const Login = () => {
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/login', { studentId, password });
      login(data);
      navigate('/dashboard');
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message: string }>;
      setError(axiosError.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center space-y-2">
          <img src="/pust_logo.png" alt="PUST Logo" className="w-24 h-24 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-[#004d40]">Pabna University of Science and Engineering</h1>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">PUST Residents</h2>
          <p className="text-sm text-gray-500">Sign in to access your dashboard</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <div className="p-3 text-sm text-red-700 bg-red-100 rounded">{error}</div>}
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="student-id" className="sr-only">Student ID</label>
              <input
                id="student-id"
                name="studentId"
                type="text"
                required
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="Student ID"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md group hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              style={{ backgroundColor: '#004d40' }}
            >
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <LogIn className="w-5 h-5" />
              </span>
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
