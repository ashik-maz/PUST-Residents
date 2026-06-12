import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, CreditCard, Settings, FileBarChart, LogOut, User as UserIcon } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['Provost', 'Co-Provost', 'Student'] },
    { label: 'Residents', path: '/residents', icon: Users, roles: ['Provost', 'Co-Provost'] },
    { label: 'Payments', path: '/payments', icon: CreditCard, roles: ['Provost', 'Co-Provost'] },
    { label: 'Reports', path: '/reports', icon: FileBarChart, roles: ['Provost', 'Co-Provost'] },
    { label: 'Settings', path: '/settings', icon: Settings, roles: ['Provost'] },
    { label: 'My Profile', path: '/profile', icon: UserIcon, roles: ['Provost', 'Co-Provost', 'Student'] },
  ];

  return (
    <nav className="bg-[#004d40] text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-bold">PUST Hall ERP</Link>
            <div className="hidden md:flex space-x-4">
              {navItems.filter(item => item.roles.includes(user?.role || '')).map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center space-x-1 px-3 py-2 rounded-md hover:bg-[#00695c] transition"
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{user?.fullName}</p>
              <p className="text-xs text-teal-200 capitalize">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-full hover:bg-[#00695c] transition"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
