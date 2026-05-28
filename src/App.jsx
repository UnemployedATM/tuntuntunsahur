import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  Calendar as CalIcon, Map, Users, AlertTriangle, 
  ChevronLeft, ChevronRight, Settings, X, Edit2, Trash2, AlertCircle
} from 'lucide-react';
import { format, addDays, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO, getHours, isToday } from 'date-fns';
import { es } from 'date-fns/locale';

// --- Mock Data ---
const MOCK_CLIENTS = [
  { id: '1', name: 'Ana García', cellphone: '5512345678', age: 28, special_needs: 'Ninguna' },
  { id: '2', name: 'Carlos López', cellphone: '5587654321', age: 34, special_needs: 'Alergia al látex' },
];

const MOCK_STAFF = [
  { id: '1', name: 'Admin User', role: 'Manager', is_available: true },
  { id: '2', name: 'Instructor A', role: 'Instructor', is_available: true },
];

const MOCK_EQUIPMENT = [
  { id: '1', name: 'Reformer', total_count: 5, available_count: 3, in_repair_count: 2 },
  { id: '2', name: 'Cadillac', total_count: 2, available_count: 2, in_repair_count: 0 },
  { id: '3', name: 'Wunda Chair', total_count: 3, available_count: 1, in_repair_count: 2 },
];

const INITIAL_SETTINGS = {
  daily_capacity: 10,
  cancellation_policy_hours: 24,
  follow_up_interval_days: 7,
};

// --- Reusable UI Components (Bento Style) ---
const Button = ({ children, onClick, variant = 'primary', className = '', type = "button", ...props }) => {
  const baseStyle = "px-6 py-3 rounded-[18px] font-bold text-sm uppercase tracking-wide transition-all duration-200 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-[var(--orange)] text-white hover:opacity-90",
    secondary: "bg-[var(--card)] border border-[var(--line)] text-[var(--white)] hover:bg-[var(--card-2)]",
    danger: "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20",
    cyan: "bg-[var(--cyan)] text-black hover:opacity-90",
    pink: "bg-[var(--pink)] text-white hover:opacity-90",
    ghost: "bg-transparent text-[var(--mut)] hover:text-[var(--white)]",
  };
  return (
    <button type={type} onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

const Input = ({ label, error, ...props }) => (
  <div className="mb-4">
    {label && <label className="block text-[var(--white)] font-bold mb-2 text-sm">{label}</label>}
    <input 
      className={`w-full bg-[var(--card-2)] border ${error ? 'border-red-500' : 'border-[var(--line-2)]'} rounded-[12px] px-4 py-3 text-[var(--white)] placeholder-[var(--mut-2)] focus:outline-none focus:border-[var(--accent)] transition-all`}
      {...props} 
    />
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const Card = ({ children, className = '', accent }) => (
  <div 
    className={`bg-[var(--card)] border border-[var(--line)] rounded-[28px] p-6 ${className}`}
    style={accent ? { borderTop: `4px solid ${accent}` } : {}}
  >
    {children}
  </div>
);

const Badge = ({ children, color = 'slate' }) => {
  const colors = {
    slate: 'bg-[var(--slate)] text-[var(--white)]',
    cyan: 'bg-[var(--cyan)] text-black',
    green: 'bg-[var(--green)] text-black',
    pink: 'bg-[var(--pink)] text-white',
    orange: 'bg-[var(--orange)] text-white',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${colors[color] || colors.slate}`}>
      {children}
    </span>
  );
};

// --- Sub-Components for Views ---

const SessionForm = ({ slot, onClose, onSave, clients, settings, existingSessions }) => {
  const [formData, setFormData] = useState({
    client_name: '', cellphone: '', age: '', special_needs: '',
    needs_towel: false, needs_faja: false, needs_water: false, brings_own: false,
  });
  const [errors, setErrors] = useState({});

  const handlePhoneBlur = () => {
    const client = clients.find(c => c.cellphone === formData.cellphone);
    if (client) {
      setFormData(prev => ({ ...prev, client_name: client.name, age: client.age, special_needs: client.special_needs }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dateStr = format(slot.day, 'yyyy-MM-dd');
    const count = existingSessions.filter(s => format(parseISO(s.start_time), 'yyyy-MM-dd') === dateStr).length;
    
    if (count >= settings.daily_capacity) {
      setErrors({ form: `Capacidad máxima (${settings.daily_capacity}) alcanzada.` });
      return;
    }
    if (!formData.client_name || !formData.cellphone) {
      setErrors({ form: 'Nombre y celular obligatorios.' });
      return;
    }

    onSave({
      ...formData,
      start_time: format(slot.day, 'yyyy-MM-dd') + 'T' + String(slot.hour).padStart(2, '0') + ':00:00',
      end_time: format(slot.day, 'yyyy-MM-dd') + 'T' + String(slot.hour + 1).padStart(2, '0') + ':00:00',
      status: 'booked', refund_eligible: true, id: Date.now().toString()
    });
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg" accent="var(--cyan)">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black uppercase text-[var(--white)]">Nueva Sesión</h3>
          <button onClick={onClose} className="text-[var(--mut)]"><X size={24}/></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Celular" value={formData.cellphone} onChange={e => setFormData({...formData, cellphone: e.target.value})} onBlur={handlePhoneBlur} placeholder="55..." />
            <Input label="Edad" type="number" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} />
          </div>
          <Input label="Nombre" value={formData.client_name} onChange={e => setFormData({...formData, client_name: e.target.value})} />
          <Input label="Necesidades" value={formData.special_needs} onChange={e => setFormData({...formData, special_needs: e.target.value})} />
          
          <div className="mb-6">
            <label className="block text-[var(--white)] font-bold mb-3 text-sm">Equipamiento</label>
            <div className="grid grid-cols-2 gap-3">
              {['needs_towel', 'needs_faja', 'needs_water', 'brings_own'].map(key => (
                <label key={key} className={`flex items-center gap-3 p-3 rounded-[12px] border cursor-pointer ${formData[key] ? 'bg-[var(--cyan)]/10 border-[var(--cyan)]' : 'bg-[var(--card-2)] border-[var(--line-2)]'}`}>
                  <input type="checkbox" checked={formData[key]} onChange={e => setFormData({...formData, [key]: e.target.checked})} className="accent-[var(--cyan)] w-5 h-5" />
                  <span className="text-sm font-bold text-[var(--white)] capitalize">{key.replace('_', ' ')}</span>
                </label>
              ))}
            </div>
          </div>
          {errors.form && <div className="bg-red-500/10 text-red-500 p-3 rounded-[12px] mb-4 text-sm font-bold">{errors.form}</div>}
          <div className="flex gap-3">
            <Button variant="secondary" onClick={onClose} className="flex-1">Cancelar</Button>
            <Button type="submit" variant="cyan" className="flex-1">Confirmar</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

const SessionDetail = ({ session, onClose, onUpdate, onDelete, onReschedule, settings }) => {
  const [mode, setMode] = useState('view');

  const isRefundEligible = () => {
    const now = new Date();
    const start = parseISO(session.start_time);
    return (start - now) / (1000 * 60 * 60) > settings.cancellation_policy_hours;
  };

  const handleRescheduleSubmit = (e) => {
    e.preventDefault();
    const newDate = new Date(e.target.date.value);
    const newHour = parseInt(e.target.hour.value);
    onReschedule(session, newDate, newHour);
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl" accent="var(--pink)">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-2xl font-black uppercase text-[var(--white)]">{session.client_name}</h3>
            <p className="text-[var(--mut)] font-mono text-sm">{session.cellphone}</p>
          </div>
          <button onClick={onClose} className="text-[var(--mut)]"><X size={24}/></button>
        </div>

        {mode === 'view' ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[var(--card-2)] p-4 rounded-[18px]">
                <div className="text-xs font-bold uppercase text-[var(--mut-2)] mb-1">Inicio</div>
                <div className="text-[var(--white)] font-black">{format(parseISO(session.start_time), 'EEE d MMM, HH:mm', {locale: es})}</div>
              </div>
              <div className="bg-[var(--card-2)] p-4 rounded-[18px]">
                <div className="text-xs font-bold uppercase text-[var(--mut-2)] mb-1">Reembolso</div>
                <div className={`font-black ${isRefundEligible() ? 'text-[var(--green)]' : 'text-[var(--orange)]'}`}>
                  {isRefundEligible() ? 'Elegible' : 'No Elegible'}
                </div>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {session.needs_towel && <Badge color="cyan">Toalla</Badge>}
              {session.needs_faja && <Badge color="pink">Faja</Badge>}
              {session.needs_water && <Badge color="cyan">Agua</Badge>}
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="secondary" onClick={() => setMode('reschedule')} className="flex-1"><Edit2 size={16}/> Reagendar</Button>
              <Button variant="danger" onClick={() => onDelete(session.id)} className="flex-1"><Trash2 size={16}/> Cancelar</Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleRescheduleSubmit} className="space-y-6">
            <h4 className="text-lg font-black text-[var(--white)] uppercase">Reagendar</h4>
            <Input type="date" name="date" label="Fecha" defaultValue={format(parseISO(session.start_time), 'yyyy-MM-dd')} />
            <Input type="number" name="hour" label="Hora" defaultValue={getHours(parseISO(session.start_time))} />
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={() => setMode('view')} className="flex-1">Volver</Button>
              <Button type="submit" variant="pink" className="flex-1">Guardar</Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};

const CalendarView = ({ sessions, setSessions, settings }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [modalData, setModalData] = useState(null); // { type: 'new'|'edit', slot?:{}, session?:{} }

  const weekDays = eachDayOfInterval({ start: startOfWeek(currentDate, { locale: es }), end: endOfWeek(currentDate, { locale: es }) });

  const handleSlotClick = (day, hour) => setModalData({ type: 'new', slot: { day, hour } });
  const handleSessionClick = (session) => setModalData({ type: 'edit', session });

  const addSession = (newSession) => {
    setSessions([...sessions, newSession]);
    setModalData(null);
  };

  const updateSession = (updated) => {
    setSessions(sessions.map(s => s.id === updated.id ? updated : s));
    setModalData(null);
  };

  const deleteSession = (id) => {
    setSessions(sessions.filter(s => s.id !== id));
    setModalData(null);
  };

  const rescheduleSession = (session, newDay, newHour) => {
    const updated = {
      ...session,
      start_time: newDay.toISOString().split('T')[0] + 'T' + String(newHour).padStart(2, '0') + ':00:00',
      original_start_time: session.original_start_time || session.start_time,
      reschedule_history: [...(session.reschedule_history || []), { originalDate: session.start_time, changedAt: new Date().toISOString() }]
    };
    updateSession(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black uppercase tracking-tight text-[var(--white)]">Calendario</h2>
        <div className="flex items-center gap-2 bg-[var(--card)] p-1 rounded-[18px] border border-[var(--line)]">
          <button onClick={() => setCurrentDate(subDays(currentDate, 7))} className="p-2 hover:bg-[var(--card-2)] rounded-full text-[var(--mut)]"><ChevronLeft size={20}/></button>
          <span className="px-4 font-bold text-[var(--white)] min-w-[140px] text-center capitalize">
            {format(startOfWeek(currentDate, { locale: es }), 'd MMM', { locale: es })}
          </span>
          <button onClick={() => setCurrentDate(addDays(currentDate, 7))} className="p-2 hover:bg-[var(--card-2)] rounded-full text-[var(--mut)]"><ChevronRight size={20}/></button>
        </div>
      </div>

      <div className="bg-[var(--card)] border border-[var(--line)] rounded-[28px] overflow-hidden">
        <div className="grid grid-cols-8 border-b border-[var(--line)]">
          <div className="p-4 border-r border-[var(--line)] bg-[var(--card-2)]"></div>
          {weekDays.map((day, i) => (
            <div key={i} className={`p-4 text-center border-r border-[var(--line)] last:border-r-0 ${isToday(day) ? 'bg-[var(--cyan)]/10' : ''}`}>
              <div className="text-xs font-bold uppercase tracking-wider text-[var(--mut)]">{format(day, 'EEE', { locale: es })}</div>
              <div className={`text-xl font-black ${isToday(day) ? 'text-[var(--cyan)]' : 'text-[var(--white)]'}`}>{format(day, 'd')}</div>
            </div>
          ))}
        </div>
        <div className="overflow-y-auto max-h-[800px]">
          {Array.from({ length: 12 }, (_, i) => i + 7).map(hour => (
            <div key={hour} className="grid grid-cols-8 border-b border-[var(--line)] last:border-b-0">
              <div className="p-4 border-r border-[var(--line)] text-xs font-bold text-[var(--mut-2)] flex items-center justify-center">{hour}:00</div>
              {weekDays.map((day, i) => {
                const session = sessions.find(s => isSameDay(parseISO(s.start_time), day) && getHours(parseISO(s.start_time)) === hour);
                return (
                  <div key={i} onClick={() => session ? handleSessionClick(session) : handleSlotClick(day, hour)}
                    className={`border-r border-[var(--line)] last:border-r-0 p-2 min-h-[80px] cursor-pointer ${!session && 'hover:bg-[var(--card-2)]'}`}>
                    {session && (
                      <div className={`h-full rounded-[18px] p-3 text-xs font-bold relative shadow-lg ${session.needs_towel ? 'bg-[var(--cyan)] text-black' : session.needs_faja ? 'bg-[var(--pink)] text-white' : 'bg-[var(--green)] text-black'}`}>
                        <div className="truncate font-black uppercase">{session.client_name}</div>
                        <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-current opacity-40"></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {modalData?.type === 'new' && (
        <SessionForm slot={modalData.slot} onClose={() => setModalData(null)} onSave={addSession} clients={MOCK_CLIENTS} settings={settings} existingSessions={sessions} />
      )}
      {modalData?.type === 'edit' && modalData.session && (
        <SessionDetail session={modalData.session} onClose={() => setModalData(null)} onUpdate={updateSession} onDelete={deleteSession} onReschedule={rescheduleSession} settings={settings} />
      )}
    </div>
  );
};

const StudioMapView = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-black uppercase text-[var(--white)]">Estudio</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {MOCK_EQUIPMENT.map(item => (
        <Card key={item.id} accent="var(--green)">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-black text-[var(--white)]">{item.name}</h3>
            <Badge color={item.in_repair_count > 0 ? 'orange' : 'green'}>{item.in_repair_count > 0 ? 'Reparación' : 'OK'}</Badge>
          </div>
          <div className="text-sm text-[var(--mut)] mb-1">Disponibles: <span className="text-[var(--white)] font-bold">{item.available_count}/{item.total_count}</span></div>
          <div className="h-2 bg-[var(--card-2)] rounded-full overflow-hidden">
            <div className="h-full bg-[var(--green)]" style={{ width: `${(item.available_count / item.total_count) * 100}%` }}></div>
          </div>
        </Card>
      ))}
    </div>
  </div>
);

const StaffView = ({ settings, setSettings }) => (
  <div className="space-y-6">
    <h2 className="text-3xl font-black uppercase text-[var(--white)]">Staff & Config</h2>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card accent="var(--cyan)">
        <h3 className="text-lg font-black text-[var(--cyan)] uppercase mb-4">Equipo</h3>
        {MOCK_STAFF.map(s => (
          <div key={s.id} className="flex justify-between items-center p-3 bg-[var(--card-2)] rounded-[12px] mb-2">
            <div><div className="text-[var(--white)] font-bold">{s.name}</div><div className="text-xs text-[var(--mut)]">{s.role}</div></div>
            <div className={`w-3 h-3 rounded-full ${s.is_available ? 'bg-[var(--green)]' : 'bg-[var(--slate)]'}`}></div>
          </div>
        ))}
      </Card>
      <Card accent="var(--orange)">
        <h3 className="text-lg font-black text-[var(--orange)] uppercase mb-4">Configuración</h3>
        <div className="space-y-4">
          <Input label="Capacidad Diaria" type="number" value={settings.daily_capacity} onChange={e => setSettings({...settings, daily_capacity: parseInt(e.target.value)})} />
          <Input label="Política Cancelación (hrs)" type="number" value={settings.cancellation_policy_hours} onChange={e => setSettings({...settings, cancellation_policy_hours: parseInt(e.target.value)})} />
        </div>
      </Card>
    </div>
  </div>
);

const ComplaintsView = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-black uppercase text-[var(--white)]">Quejas</h2>
    <Card accent="var(--pink)">
      <div className="text-center py-12 text-[var(--mut)]">Sin quejas registradas.</div>
    </Card>
  </div>
);

// --- Layout Component (Uses useLocation safely) ---
const MainLayout = () => {
  const location = useLocation();
  
  const getAccent = () => {
    if (location.pathname === '/studio-map') return 'var(--green)';
    if (location.pathname === '/staff') return 'var(--orange)';
    if (location.pathname === '/complaints') return 'var(--pink)';
    return 'var(--cyan)';
  };

  const NavItem = ({ to, icon: Icon, label }) => {
    const active = location.pathname === to;
    return (
      <Link to={to} className={`flex items-center gap-3 px-4 py-3 rounded-[18px] font-bold text-sm uppercase tracking-wide transition-all ${active ? 'bg-[var(--accent)] text-black shadow-lg' : 'text-[var(--mut)] hover:text-[var(--white)] hover:bg-[var(--card-2)]'}`}>
        <Icon size={20} />
        <span>{label}</span>
      </Link>
    );
  };

  const [sessions, setSessions] = useState([]);
  const [settings, setSettings] = useState(INITIAL_SETTINGS);

  return (
    <div className="min-h-screen bg-[var(--black)] text-[var(--white)] font-sans selection:bg-[var(--pink)] selection:text-white flex" style={{ '--accent': getAccent() }}>
      <aside className="w-full md:w-64 bg-[var(--card)] border-r border-[var(--line)] p-6 flex flex-col gap-2 sticky top-0 md:h-screen z-10">
        <div className="mb-8 px-2">
          <h1 className="text-2xl font-black tracking-tighter text-[var(--white)]">/<span style={{color: 'var(--violet)'}}>Studio</span></h1>
          <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--mut)]">Booking</div>
        </div>
        <nav className="space-y-1 flex-1">
          <NavItem to="/" icon={CalIcon} label="Calendario" />
          <NavItem to="/studio-map" icon={Map} label="Estudio" />
          <NavItem to="/staff" icon={Users} label="Staff" />
          <NavItem to="/complaints" icon={AlertTriangle} label="Quejas" />
        </nav>
      </aside>
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <Routes>
          <Route path="/" element={<CalendarView sessions={sessions} setSessions={setSessions} settings={settings} />} />
          <Route path="/studio-map" element={<StudioMapView />} />
          <Route path="/staff" element={<StaffView settings={settings} setSettings={setSettings} />} />
          <Route path="/complaints" element={<ComplaintsView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

// --- Root App ---
export default function App() {
  return (
    <Router>
      <MainLayout />
    </Router>
  );
}