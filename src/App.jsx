import React, { useState } from 'react';
import Calendar from './pages/Calendar';
import StudioMap from './pages/StudioMap';
import Staff from './pages/Staff';
import Complaints from './pages/Complaints';

function App() {
  const [activeTab, setActiveTab] = useState('calendar');

  return (
    <div className="wrap">
      {/* Topbar */}
      <div className="topbar">
        <div className="mark"><span className="sl">/</span>Studio<span className="serif">Booking</span></div>
        <nav>
          <button className={activeTab === 'calendar' ? 'active' : ''} onClick={() => setActiveTab('calendar')}>Calendar</button>
          <button className={activeTab === 'map' ? 'active' : ''} onClick={() => setActiveTab('map')}>Map</button>
          <button className={activeTab === 'staff' ? 'active' : ''} onClick={() => setActiveTab('staff')}>Staff</button>
          <button className={activeTab === 'complaints' ? 'active' : ''} onClick={() => setActiveTab('complaints')}>Complaints</button>
        </nav>
      </div>

      {/* Content */}
      <main className="grid" style={{ marginTop: '14px' }}>
        {activeTab === 'calendar' && <Calendar />}
        {activeTab === 'map' && <StudioMap />}
        {activeTab === 'staff' && <Staff />}
        {activeTab === 'complaints' && <Complaints />}
      </main>
    </div>
  );
}

export default App;