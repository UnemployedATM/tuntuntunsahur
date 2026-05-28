import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SessionProvider } from './context/SessionContext';
import { StaffProvider } from './context/StaffContext';
import Sidebar from './components/Sidebar';
import Calendar from './pages/Calendar';
import StudioMap from './pages/StudioMap';
import Staff from './pages/Staff';
import Complaints from './pages/Complaints';
import './index.css';

function App() {
  return (
    <SessionProvider>
      <StaffProvider>
        <Router>
          <div className="flex h-screen bg-[#050505] text-white font-sans overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
              <Routes>
                <Route path="/" element={<Navigate to="/calendar" replace />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/studio-map" element={<StudioMap />} />
                <Route path="/staff" element={<Staff />} />
                <Route path="/complaints" element={<Complaints />} />
              </Routes>
            </main>
          </div>
        </Router>
      </StaffProvider>
    </SessionProvider>
  );
}

export default App;
