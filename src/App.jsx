import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Calendar as CalendarIcon, Map, Users, AlertTriangle, LayoutDashboard } from 'lucide-react';
import { AppProvider } from './context/AppContext';
import Calendar from './pages/Calendar';
import StudioMap from './pages/StudioMap';
import Staff from './pages/Staff';
import Complaints from './pages/Complaints';

const Navigation = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', icon: CalendarIcon, label: 'Calendar' },
    { path: '/studio-map', icon: Map, label: 'Studio Map' },
    { path: '/staff', icon: Users, label: 'Staff' },
    { path: '/complaints', icon: AlertTriangle, label: 'Complaints' }
  ];

  return (
    <nav className="w-64 bg-gray-900 text-white min-h-screen p-4 fixed left-0 top-0">
      <div className="mb-8">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <LayoutDashboard className="w-6 h-6" />
          Studio Booking
        </h1>
        <p className="text-xs text-gray-400 mt-1">Management System</p>
      </div>
      
      <ul className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      
      <div className="absolute bottom-4 left-4 right-4">
        <div className="p-3 bg-gray-800 rounded-lg text-xs text-gray-400">
          <p>© 2024 Studio Booking</p>
          <p className="mt-1">v1.0.0</p>
        </div>
      </div>
    </nav>
  );
};

const MainLayout = ({ children }) => {
  return (
    <div className="flex">
      <Navigation />
      <main className="ml-64 flex-1">
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <Router>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Calendar />} />
            <Route path="/studio-map" element={<StudioMap />} />
            <Route path="/staff" element={<Staff />} />
            <Route path="/complaints" element={<Complaints />} />
          </Routes>
        </MainLayout>
      </Router>
    </AppProvider>
  );
}

export default App;
