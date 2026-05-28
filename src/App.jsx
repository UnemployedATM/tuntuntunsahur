import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
// --- Icons (Simple SVG Components) ---
const IconCalendar = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const IconMap = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>;
const IconUsers = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const IconAlert = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>;
const IconPlus = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const IconX = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;

// --- Mock Data (Replace with Supabase later) ---
const initialSessions = [
  { id: 1, client: 'Ana Garcia', date: '2024-05-28', time: '09:00', needs: ['Towel'], color: 't-cyan' },
  { id: 2, client: 'Carlos Ruiz', date: '2024-05-28', time: '10:00', needs: ['Water', 'Faja'], color: 't-green' },
  { id: 3, client: 'Elena Pop', date: '2024-05-29', time: '11:00', needs: [], color: 't-pink' },
];

const initialEquipment = [
  { name: 'Reformer A', status: 'available' },
  { name: 'Reformer B', status: 'available' },
  { name: 'Cadillac', status: 'repair' },
  { name: 'Chair', status: 'available' },
];

const initialStaff = [
  { name: 'Pablo Michel', role: 'Admin', available: true },
  { name: 'Sofia L.', role: 'Trainer', available: false },
];

// --- Components ---

function App() {
  const [activeTab, setActiveTab] = useState('calendar');
  const [sessions, setSessions] = useState(initialSessions);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSession, setNewSession] = useState({ client: '', date: '', time: '', needs: [] });

  // Bento Navigation Handler
  const renderContent = () => {
    switch(activeTab) {
      case 'calendar': return <CalendarView sessions={sessions} onAdd={() => setIsModalOpen(true)} />;
      case 'map': return <StudioMap equipment={initialEquipment} />;
      case 'staff': return <StaffView staff={initialStaff} />;
      case 'complaints': return <ComplaintsView />;
      default: return <CalendarView sessions={sessions} onAdd={() => setIsModalOpen(true)} />;
    }
  };

  return (
    <div className="app-container">
      {/* Top Bar */}
      <div className="topbar">
        <div className="mark"><span className="sl">/</span>Studio<span className="se">Booking</span></div>
        <div className="tag">BENTO v1.0</div>
      </div>

      {/* Main Bento Grid Layout */}
      <div className="grid hero">
        
        {/* Nav Tiles */}
        <div className={`tile h-cyan t-cyan rev ${activeTab === 'calendar' ? 'active-tile' : ''}`} onClick={() => setActiveTab('calendar')}>
          <div className="k">MAIN</div>
          <div className="blab big" style={{fontSize: '24px'}}>CALENDAR</div>
          <div style={{position:'absolute', right:20, top:20}}><IconCalendar /></div>
        </div>

        <div className={`tile h-green t-green rev ${activeTab === 'map' ? 'active-tile' : ''}`} onClick={() => setActiveTab('map')}>
          <div className="hand" style={{fontSize: '20px'}}>Studio Map</div>
          <div style={{position:'absolute', right:20, top:20}}><IconMap /></div>
        </div>

        <div className={`tile h-pink t-pink rev ${activeTab === 'staff' ? 'active-tile' : ''}`} onClick={() => setActiveTab('staff')}>
          <div className="t" style={{fontSize: '18px'}}><b>Staff</b> & Availability</div>
          <div style={{position:'absolute', right:20, top:20}}><IconUsers /></div>
        </div>

        <div className={`tile h-slate t-slate rev ${activeTab === 'complaints' ? 'active-tile' : ''}`} onClick={() => setActiveTab('complaints')}>
          <div className="blab" style={{fontSize: '18px', color: 'var(--orange)'}}>COMPLAINTS</div>
          <div style={{position:'absolute', right:20, top:20}}><IconAlert /></div>
        </div>

        {/* Content Area (Spans full width below nav) */}
        <div className="tile h-name rev no-dot" style={{gridColumn: '1 / -1', background: 'var(--card)', minHeight: '400px', display:'block', overflowY:'auto'}}>
          {renderContent()}
        </div>
      </div>

      {/* Simple Modal for Adding Session */}
      {isModalOpen && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center'}}>
          <div className="card" style={{width:'90%', maxWidth:'500px', position:'relative'}}>
            <button onClick={() => setIsModalOpen(false)} style={{position:'absolute', top:15, right:15, background:'none', border:'none', color:'var(--mut)', cursor:'pointer'}}><IconX /></button>
            <h3 style={{marginBottom:'20px'}}><span className="sl">/</span> New Booking</h3>
            
            <div className="qg">
              <label className="qlab">Client Name</label>
              <input className="fld" value={newSession.client} onChange={e => setNewSession({...newSession, client: e.target.value})} placeholder="Ex: Ana Garcia" />
            </div>
            
            <div className="grid duo" style={{marginTop:'10px'}}>
              <div className="qg">
                <label className="qlab">Date</label>
                <input type="date" className="fld" value={newSession.date} onChange={e => setNewSession({...newSession, date: e.target.value})} />
              </div>
              <div className="qg">
                <label className="qlab">Time</label>
                <input type="time" className="fld" value={newSession.time} onChange={e => setNewSession({...newSession, time: e.target.value})} />
              </div>
            </div>

            <button className="btn" onClick={() => {
              if(!newSession.client || !newSession.date) return alert("Missing info");
              setSessions([...sessions, { ...newSession, id: Date.now(), needs: ['Towel'], color: 't-lav' }]);
              setIsModalOpen(false);
            }}>Confirm Booking</button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Sub-Views ---

function CalendarView({ sessions, onAdd }) {
  return (
    <div style={{padding: '10px'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
        <h2 className="blab" style={{fontSize:'24px'}}>Weekly Schedule</h2>
        <button className="btn" style={{width:'auto', padding:'10px 20px', fontSize:'14px'}} onClick={onAdd}><IconPlus /> Add Session</button>
      </div>
      
      <div className="grid" style={{gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap:'10px'}}>
        {sessions.map(s => (
          <div key={s.id} className={`tile ${s.color} rev`} style={{minHeight:'120px', padding:'20px'}}>
            <div className="k" style={{fontSize:'10px'}}>{s.date}</div>
            <div style={{fontWeight:800, fontSize:'18px', marginTop:'5px'}}>{s.time}</div>
            <div style={{fontWeight:600, marginTop:'5px'}}>{s.client}</div>
            <div style={{marginTop:'10px', display:'flex', gap:'5px', flexWrap:'wrap'}}>
              {s.needs.map((n, i) => <span key={i} className="pill on" style={{fontSize:'10px', padding:'2px 8px'}}>{n}</span>)}
            </div>
          </div>
        ))}
        {sessions.length === 0 && <div className="card" style={{padding:'40px', textAlign:'center', color:'var(--mut)'}}>No sessions booked yet.</div>}
      </div>
    </div>
  );
}

function StudioMap({ equipment }) {
  return (
    <div style={{padding: '10px'}}>
      <h2 className="blab" style={{fontSize:'24px', marginBottom:'20px'}}>Equipment Status</h2>
      <div className="grid duo">
        {equipment.map((eq, i) => (
          <div key={i} className={`mini rev ${eq.status === 'repair' ? 't-orange' : 't-cyan'}`} style={{color: eq.status === 'repair' ? '#fff' : 'var(--ink)'}}>
            <div className="name">{eq.name}</div>
            <div className="txt" style={{textTransform:'uppercase', fontWeight:700, fontSize:'12px'}}>{eq.status}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StaffView({ staff }) {
  return (
    <div style={{padding: '10px'}}>
      <h2 className="blab" style={{fontSize:'24px', marginBottom:'20px'}}>Team</h2>
      <div className="card">
        <table className="data">
          <thead><tr><th>Name</th><th>Role</th><th>Status</th></tr></thead>
          <tbody>
            {staff.map((s, i) => (
              <tr key={i}>
                <td>{s.name}</td>
                <td>{s.role}</td>
                <td><span className={`pill ${s.available ? 'on' : ''}`}>{s.available ? 'Available' : 'Busy'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ComplaintsView() {
  return (
    <div style={{padding: '10px'}}>
      <h2 className="blab" style={{fontSize:'24px', marginBottom:'20px', color:'var(--orange)'}}>Complaints Log</h2>
      <div className="nota rev">
        <div className="nt">⚠️ No Active Complaints</div>
        <p>All recent issues have been resolved within 24 hours.</p>
      </div>
    </div>
  );
}

export default App;