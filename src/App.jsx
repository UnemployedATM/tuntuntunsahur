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
    <nav className="w-72 bg-[#111111] border-r border-[rgba(255,255,255,0.08)] min-h-screen p-6 fixed left-0 top-0 backdrop-blur-sm">
      <div className="mb-10">
        <h1 className="text-2xl font-semibold flex items-center gap-3 text-white">
          <LayoutDashboard className="w-7 h-7" />
          <span className="serif">Studio</span> Booking
        </h1>
        <p className="text-xs text-[#a0a0a0] mt-2 tracking-wide">Management System</p>
      </div>
      
      <ul className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'bg-[#FF4B2B] text-white shadow-lg shadow-[#FF4B2B]/20'
                    : 'text-[#a0a0a0] hover:bg-[#1f1f1f] hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      
      <div className="absolute bottom-6 left-6 right-6">
        <div className="p-4 bg-[#161616] rounded-xl text-xs text-[#666666] border border-[rgba(255,255,255,0.08)]">
          <p>© 2024 Studio Booking</p>
          <p className="mt-1">v1.0.0</p>
        </div>
      </div>
    </nav>
  );
};

const MainLayout = ({ children }) => {
  return (
    <div className="flex bg-[#0a0a0a] min-h-screen">
      <Navigation />
      <main className="ml-72 flex-1 p-8">
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
