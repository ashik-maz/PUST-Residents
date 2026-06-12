import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import StudentDashboard from './pages/StudentDashboard';
import Residents from './pages/Residents';
import Payments from './pages/Payments';
import Settings from './pages/Settings';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import Navbar from './components/Navbar';

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, roles }: { children: React.ReactNode, roles?: string[] }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" />;

  return <>{children}</>;
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {user && <Navbar />}
      <div className={user ? "container mx-auto py-6 px-4" : ""}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              {user?.role === 'Student' ? <StudentDashboard /> : <Dashboard />}
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/residents" element={
            <ProtectedRoute roles={['Provost', 'Co-Provost']}>
              <Residents />
            </ProtectedRoute>
          } />
          <Route path="/payments" element={
            <ProtectedRoute roles={['Provost', 'Co-Provost']}>
              <Payments />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute roles={['Provost']}>
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="/reports" element={
            <ProtectedRoute roles={['Provost', 'Co-Provost']}>
              <Reports />
            </ProtectedRoute>
          } />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
