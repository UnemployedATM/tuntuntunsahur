import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  Calendar as CalIcon, Map, Users, AlertTriangle, Plus, 
  Clock, Phone, User, Tag, CheckCircle, XCircle, AlertCircle,
  ChevronLeft, ChevronRight, Settings, Save, Trash2, Edit2,
  Mail, MessageSquare, Search, Filter, X
} from 'lucide-react';
import { format, addDays, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO, setHours, setMinutes, getHours, getMinutes, isToday, isTomorrow } from 'date-fns';
import { es } from 'date-fns/locale';

// --- Mock Data & Constants ---
const MOCK_CLIENTS = [
  { id: '1', name: 'Ana García', cellphone: '5512345678', age: 28, special_needs: 'Ninguna', created_at: new Date().toISOString() },
  { id: '2', name: 'Carlos López', cellphone: '5587654321', age: 34, special_needs: 'Alergia al látex', created_at: new Date().toISOString() },
  { id: '3', name: 'Mariana Ruiz', cellphone: '5511223344', age: 45, special_needs: 'Movilidad reducida', created_at: new Date().toISOString() },
];

const MOCK_STAFF = [
  { id: '1', name: 'Admin User', role: 'Manager', is_available: true },
  { id: '2', name: 'Instructor A', role: 'Instructor', is_available: true },
  { id: '3', name: 'Receptionist B', role: 'Front Desk', is_available: false },
];

const MOCK_EQUIPMENT = [
  { id: '1', name: 'Reformer', total_count: 5, available_count: 3, in_repair_count: 2 },
  { id: '2', name: 'Cadillac', total_count: 2, available_count: 2, in_repair_count: 0 },
  { id: '3', name: 'Wunda Chair', total_count: 3, available_count: 1, in_repair_count: 2 },
  { id: '4', name: 'Barrel', total_count: 2, available_count: 2, in_repair_count: 0 },
  { id: '5', name: 'Yoga Mats', total_count: 10, available_count: 8, in_repair_count: 2 },
];

const INITIAL_SETTINGS = {
  daily_capacity: 10,
  cancellation_policy_hours: 24,
  follow_up_interval_days: 7,
};

const COLORS = {
  cyan: '#02b6db',
  green: '#00d287',
  pink: '#ff0080',
  orange: '#f84828',
  yellow: '#f8c000',
  violet: '#8870f8',
  slate: '#2c2b3b',
  black: '#000000',
  card: '#141417',
  white: '#f4f4f6',
  mut: '#a6a6b2',
};

// --- Components ---

const Button = ({ children, onClick, variant = 'primary', className = '', ...props }) => {
  const baseStyle = "px-6 py-3 rounded-[18px] font-bold text-sm uppercase tracking-wide transition-all duration-200 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-[var(--orange)] text-white hover:opacity-90 shadow-lg shadow-orange-900/20",
    secondary: "bg-[var(--card)] border border-[var(--line)] text-[var(--white)] hover:bg-[var(--card-2)]",
    danger: "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20",
    ghost: "bg-transparent text-[var(--mut)] hover:text-[var(--white)]",
    cyan: "bg-[var(--cyan)] text-black hover:opacity-90",
    green: "bg-[var(--green)] text-black hover:opacity-90",
    pink: "bg-[var(--pink)] text-white hover:opacity-90",
  };
  
  return (
    <button onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

const Input = ({ label, error, ...props }) => (
  <div className="mb-4">
    {label && <label className="block text-[var(--white)] font-bold mb-2 text-sm">{label}</label>}
    <input 
      className={`w-full bg-[var(--card-2)] border ${error ? 'border-red-500' : 'border-[var(--line-2)]'} rounded-[12px] px-4 py-3 text-[var(--white)] placeholder-[var(--mut-2)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all`}
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

// --- Views ---

const CalendarView = ({ sessions, setSessions, settings }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [sessionDetail, setSessionDetail] = useState(null);

  const weekDays = eachDayOfInterval({
    start: startOfWeek(currentDate, { locale: es }),
    end: endOfWeek(currentDate, { locale: es }),
  });

  const handleSlotClick = (day, hour) => {
    setSelectedSlot({ day, hour });
    setIsModalOpen(true);
  };

  const handleSessionClick = (session) => {
    setSessionDetail(session);
  };

  const addSession = (newSession) => {
    setSessions([...sessions, { ...newSession, id: Date.now().toString() }]);
    setIsModalOpen(false);
  };

  const updateSession = (updatedSession) => {
    setSessions(sessions.map(s => s.id === updatedSession.id ? updatedSession : s));
    setSessionDetail(null);
  };

  const deleteSession = (id) => {
    setSessions(sessions.filter(s => s.id !== id));
    setSessionDetail(null);
  };

  const rescheduleSession = (session, newDay, newHour) => {
    const historyEntry = {
      originalDate: session.start_time,
      changedAt: new Date().toISOString(),
    };
    
    const updated = {
      ...session,
      start_time: newDay.toISOString().split('T')[0] + 'T' + String(newHour).padStart(2, '0') + ':00:00',
      original_start_time: session.original_start_time || session.start_time,
      reschedule_history: [...(session.reschedule_history || []), historyEntry]
    };
    updateSession(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tight text-[var(--white)]">Calendario</h2>
          <p className="text-[var(--mut)] text-sm font-medium mt-1">Gestiona tus sesiones semanales</p>
        </div>
        <div className="flex items-center gap-2 bg-[var(--card)] p-1 rounded-[18px] border border-[var(--line)]">
          <button onClick={() => setCurrentDate(subDays(currentDate, 7))} className="p-2 hover:bg-[var(--card-2)] rounded-full text-[var(--mut)] hover:text-[var(--white)]">
            <ChevronLeft size={20} />
          </button>
          <span className="px-4 font-bold text-[var(--white)] min-w-[140px] text-center capitalize">
            {format(startOfWeek(currentDate, { locale: es }), 'd MMM', { locale: es })} - {format(endOfWeek(currentDate, { locale: es }), 'd MMM', { locale: es })}
          </span>
          <button onClick={() => setCurrentDate(addDays(currentDate, 7))} className="p-2 hover:bg-[var(--card-2)] rounded-full text-[var(--mut)] hover:text-[var(--white)]">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="bg-[var(--card)] border border-[var(--line)] rounded-[28px] overflow-hidden">
        <div className="grid grid-cols-8 border-b border-[var(--line)]">
          <div className="p-4 border-r border-[var(--line)] bg-[var(--card-2)]"></div>
          {weekDays.map((day, i) => (
            <div key={i} className={`p-4 text-center border-r border-[var(--line)] last:border-r-0 ${isToday(day) ? 'bg-[var(--cyan)]/10' : ''}`}>
              <div className="text-xs font-bold uppercase tracking-wider text-[var(--mut)] mb-1">{format(day, 'EEE', { locale: es })}</div>
              <div className={`text-xl font-black ${isToday(day) ? 'text-[var(--cyan)]' : 'text-[var(--white)]'}`}>{format(day, 'd')}</div>
            </div>
          ))}
        </div>
        
        <div className="overflow-y-auto max-h-[800px]">
          {Array.from({ length: 12 }, (_, i) => i + 7).map(hour => (
            <div key={hour} className="grid grid-cols-8 border-b border-[var(--line)] last:border-b-0">
              <div className="p-4 border-r border-[var(--line)] text-xs font-bold text-[var(--mut-2)] flex items-center justify-center">
                {hour}:00
              </div>
              {weekDays.map((day, i) => {
                const session = sessions.find(s => {
                  const sDate = parseISO(s.start_time);
                  return isSameDay(sDate, day) && getHours(sDate) === hour;
                });

                return (
                  <div 
                    key={i} 
                    onClick={() => session ? handleSessionClick(session) : handleSlotClick(day, hour)}
                    className={`border-r border-[var(--line)] last:border-r-0 p-2 min-h-[80px] cursor-pointer transition-colors ${!session && 'hover:bg-[var(--card-2)]'}`}
                  >
                    {session && (
                      <div className={`h-full rounded-[18px] p-3 text-xs font-bold relative overflow-hidden group shadow-lg ${
                        session.needs_towel ? 'bg-[var(--cyan)] text-black' :
                        session.needs_faja ? 'bg-[var(--pink)] text-white' :
                        'bg-[var(--green)] text-black'
                      }`}>
                        <div className="relative z-10">
                          <div className="truncate font-black uppercase">{session.client_name}</div>
                          <div className="opacity-80 truncate mt-1">{session.special_needs || 'Sin necesidades'}</div>
                          <div className="flex gap-1 mt-2 flex-wrap">
                            {session.needs_towel && <span className="bg-black/20 px-1.5 rounded text-[9px]">Toalla</span>}
                            {session.needs_faja && <span className="bg-white/20 px-1.5 rounded text-[9px]">Faja</span>}
                            {session.needs_water && <span className="bg-black/20 px-1.5 rounded text-[9px]">Agua</span>}
                          </div>
                        </div>
                        {/* Signature Dot */}
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

      {/* Modals would go here (simplified for brevity) */}
      {isModalOpen && selectedSlot && (
        <SessionForm 
          slot={selectedSlot} 
          onClose={() => setIsModalOpen(false)} 
          onSave={addSession}
          clients={MOCK_CLIENTS}
          settings={settings}
          existingSessions={sessions}
        />
      )}
      {sessionDetail && (
        <SessionDetail 
          session={sessionDetail} 
          onClose={() => setSessionDetail(null)}
          onUpdate={updateSession}
          onDelete={deleteSession}
          onReschedule={rescheduleSession}
          settings={settings}
        />
      )}
    </div>
  );
};

const SessionForm = ({ slot, onClose, onSave, clients, settings, existingSessions }) => {
  const [formData, setFormData] = useState({
    client_name: '',
    cellphone: '',
    age: '',
    special_needs: '',
    needs_towel: false,
    needs_faja: false,
    needs_water: false,
    brings_own: false,
  });

  const [errors, setErrors] = useState({});

  // Auto-fill if phone matches
  const handlePhoneBlur = () => {
    const client = clients.find(c => c.cellphone === formData.cellphone);
    if (client) {
      setFormData(prev => ({
        ...prev,
        client_name: client.name,
        age: client.age,
        special_needs: client.special_needs,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Capacity Check
    const dateStr = format(slot.day, 'yyyy-MM-dd');
    const count = existingSessions.filter(s => format(parseISO(s.start_time), 'yyyy-MM-dd') === dateStr).length;
    
    if (count >= settings.daily_capacity) {
      setErrors({ form: `Capacidad máxima (${settings.daily_capacity}) alcanzada para este día.` });
      return;
    }

    if (!formData.client_name || !formData.cellphone) {
      setErrors({ form: 'Nombre y celular son obligatorios' });
      return;
    }

    onSave({
      ...formData,
      start_time: format(slot.day, 'yyyy-MM-dd') + 'T' + String(slot.hour).padStart(2, '0') + ':00:00',
      end_time: format(slot.day, 'yyyy-MM-dd') + 'T' + String(slot.hour + 1).padStart(2, '0') + ':00:00',
      status: 'booked',
      refund_eligible: true,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-[var(--card)] border-[var(--line)]" accent="var(--cyan)">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black uppercase text-[var(--white)]">Nueva Sesión</h3>
          <button onClick={onClose} className="text-[var(--mut)] hover:text-[var(--white)]"><X size={24}/></button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Celular" value={formData.cellphone} onChange={e => setFormData({...formData, cellphone: e.target.value})} onBlur={handlePhoneBlur} placeholder="55..." />
            <Input label="Edad" type="number" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} />
          </div>
          <Input label="Nombre Completo" value={formData.client_name} onChange={e => setFormData({...formData, client_name: e.target.value})} />
          <Input label="Necesidades Especiales" value={formData.special_needs} onChange={e => setFormData({...formData, special_needs: e.target.value})} />
          
          <div className="mb-6">
            <label className="block text-[var(--white)] font-bold mb-3 text-sm">Equipamiento</label>
            <div className="grid grid-cols-2 gap-3">
              {['needs_towel', 'needs_faja', 'needs_water', 'brings_own'].map(key => (
                <label key={key} className={`flex items-center gap-3 p-3 rounded-[12px] border cursor-pointer transition-all ${formData[key] ? 'bg-[var(--cyan)]/10 border-[var(--cyan)]' : 'bg-[var(--card-2)] border-[var(--line-2)]'}`}>
                  <input type="checkbox" checked={formData[key]} onChange={e => setFormData({...formData, [key]: e.target.checked})} className="accent-[var(--cyan)] w-5 h-5" />
                  <span className="text-sm font-bold text-[var(--white)] capitalize">{key.replace('_', ' ')}</span>
                </label>
              ))}
            </div>
          </div>

          {errors.form && <div className="bg-red-500/10 text-red-500 p-3 rounded-[12px] mb-4 text-sm font-bold">{errors.form}</div>}
          
          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancelar</Button>
            <Button type="submit" variant="cyan" className="flex-1">Confirmar Reserva</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

const SessionDetail = ({ session, onClose, onUpdate, onDelete, onReschedule, settings }) => {
  const [mode, setMode] = useState('view'); // view, reschedule
  
  const isRefundEligible = () => {
    const now = new Date();
    const start = parseISO(session.start_time);
    const diffHours = (start - now) / (1000 * 60 * 60);
    return diffHours > settings.cancellation_policy_hours;
  };

  const handleRescheduleSubmit = (e) => {
    e.preventDefault();
    const newDate = e.target.date.value;
    const newHour = parseInt(e.target.hour.value);
    if(newDate && newHour) {
      onReschedule(session, new Date(newDate), newHour);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-[var(--card)] border-[var(--line)]" accent="var(--pink)">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-2xl font-black uppercase text-[var(--white)]">{session.client_name}</h3>
            <p className="text-[var(--mut)] font-mono text-sm mt-1">{session.cellphone} • {session.age} años</p>
          </div>
          <button onClick={onClose} className="text-[var(--mut)] hover:text-[var(--white)]"><X size={24}/></button>
        </div>

        {mode === 'view' ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[var(--card-2)] p-4 rounded-[18px]">
                <div className="text-xs font-bold uppercase text-[var(--mut-2)] mb-1">Fecha Original</div>
                <div className="text-[var(--white)] font-black">{format(parseISO(session.start_time), 'EEEE d MMMM, HH:mm', {locale: es})}</div>
              </div>
              <div className="bg-[var(--card-2)] p-4 rounded-[18px]">
                <div className="text-xs font-bold uppercase text-[var(--mut-2)] mb-1">Estado Reembolso</div>
                <div className={`font-black ${isRefundEligible() ? 'text-[var(--green)]' : 'text-[var(--orange)]'}`}>
                  {isRefundEligible() ? 'Elegible para Reembolso' : 'No Reembolsable'}
                </div>
              </div>
            </div>

            <div className="bg-[var(--card-2)] p-4 rounded-[18px]">
              <div className="text-xs font-bold uppercase text-[var(--mut-2)] mb-2">Necesidades</div>
              <div className="flex gap-2 flex-wrap">
                {session.special_needs && <Badge color="slate">{session.special_needs}</Badge>}
                {session.needs_towel && <Badge color="cyan">Toalla</Badge>}
                {session.needs_faja && <Badge color="pink">Faja</Badge>}
                {session.needs_water && <Badge color="cyan">Agua</Badge>}
              </div>
            </div>

            {session.reschedule_history && session.reschedule_history.length > 0 && (
               <div className="bg-[var(--card-2)] p-4 rounded-[18px] border-l-4 border-[var(--violet)]">
                 <div className="text-xs font-bold uppercase text-[var(--violet)] mb-2">Historial de Cambios</div>
                 {session.reschedule_history.map((h, i) => (
                   <div key={i} className="text-sm text-[var(--mut)]">
                     Movido desde: <span className="text-[var(--white)] font-bold">{format(parseISO(h.originalDate), 'dd/MM HH:mm')}</span>
                   </div>
                 ))}
               </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button variant="secondary" onClick={() => setMode('reschedule')} className="flex-1"><Edit2 size={16}/> Reagendar</Button>
              <Button variant="danger" onClick={() => onDelete(session.id)} className="flex-1"><Trash2 size={16}/> Cancelar</Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleRescheduleSubmit} className="space-y-6">
            <h4 className="text-lg font-black text-[var(--white)] uppercase">Reagendar Sesión</h4>
            <Input type="date" name="date" label="Nueva Fecha" defaultValue={format(parseISO(session.start_time), 'yyyy-MM-dd')} />
            <Input type="number" name="hour" label="Nueva Hora (0-23)" defaultValue={getHours(parseISO(session.start_time))} min="7" max="20" />
            
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={() => setMode('view')} className="flex-1">Volver</Button>
              <Button type="submit" variant="pink" className="flex-1">Confirmar Cambio</Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};

const StudioMapView = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-black uppercase tracking-tight text-[var(--white)]">Mapa del Estudio</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {MOCK_EQUIPMENT.map(item => (
        <Card key={item.id} accent="var(--green)">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-black text-[var(--white)]">{item.name}</h3>
            <Badge color={item.in_repair_count > 0 ? 'orange' : 'green'}>
              {item.in_repair_count > 0 ? 'En Reparación' : 'OK'}
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--mut)]">Disponibles</span>
              <span className="text-[var(--white)] font-bold">{item.available_count} / {item.total_count}</span>
            </div>
            <div className="h-2 bg-[var(--card-2)] rounded-full overflow-hidden">
              <div className="h-full bg-[var(--green)]" style={{ width: `${(item.available_count / item.total_count) * 100}%` }}></div>
            </div>
            {item.in_repair_count > 0 && (
              <div className="text-xs text-[var(--orange)] font-bold mt-2 flex items-center gap-1">
                <AlertCircle size={12} /> {item.in_repair_count} en reparación
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  </div>
);

const StaffView = ({ settings, setSettings }) => (
  <div className="space-y-6">
    <h2 className="text-3xl font-black uppercase tracking-tight text-[var(--white)]">Staff & Configuración</h2>
    
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card accent="var(--cyan)">
        <h3 className="text-lg font-black text-[var(--cyan)] uppercase mb-4 flex items-center gap-2"><Users size={20}/> Equipo Disponible</h3>
        <div className="space-y-3">
          {MOCK_STAFF.map(staff => (
            <div key={staff.id} className="flex items-center justify-between p-3 bg-[var(--card-2)] rounded-[12px]">
              <div>
                <div className="text-[var(--white)] font-bold">{staff.name}</div>
                <div className="text-xs text-[var(--mut)]">{staff.role}</div>
              </div>
              <div className={`w-3 h-3 rounded-full ${staff.is_available ? 'bg-[var(--green)]' : 'bg-[var(--slate)]'}`}></div>
            </div>
          ))}
        </div>
      </Card>

      <Card accent="var(--orange)">
        <h3 className="text-lg font-black text-[var(--orange)] uppercase mb-4 flex items-center gap-2"><Settings size={20}/> Configuración Global</h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[var(--mut)] uppercase">Capacidad Diaria Máxima</label>
            <input 
              type="number" 
              value={settings.daily_capacity} 
              onChange={(e) => setSettings({...settings, daily_capacity: parseInt(e.target.value)})}
              className="w-full bg-[var(--card-2)] border border-[var(--line-2)] rounded-[12px] px-4 py-2 text-[var(--white)] font-bold mt-1"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-[var(--mut)] uppercase">Política de Cancelación (Horas)</label>
            <input 
              type="number" 
              value={settings.cancellation_policy_hours} 
              onChange={(e) => setSettings({...settings, cancellation_policy_hours: parseInt(e.target.value)})}
              className="w-full bg-[var(--card-2)] border border-[var(--line-2)] rounded-[12px] px-4 py-2 text-[var(--white)] font-bold mt-1"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-[var(--mut)] uppercase">Recordatorio de Seguimiento (Días)</label>
            <input 
              type="number" 
              value={settings.follow_up_interval_days} 
              onChange={(e) => setSettings({...settings, follow_up_interval_days: parseInt(e.target.value)})}
              className="w-full bg-[var(--card-2)] border border-[var(--line-2)] rounded-[12px] px-4 py-2 text-[var(--white)] font-bold mt-1"
            />
          </div>
        </div>
      </Card>
    </div>
  </div>
);

const ComplaintsView = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-black uppercase tracking-tight text-[var(--white)]">Quejas y Reclamaciones</h2>
    <Card accent="var(--pink)">
      <div className="text-center py-12">
        <AlertTriangle size={48} className="mx-auto text-[var(--pink)] mb-4 opacity-50" />
        <h3 className="text-xl font-black text-[var(--white)] uppercase">Sin Quejas Registradas</h3>
        <p className="text-[var(--mut)] mt-2">El sistema está limpio. Buen trabajo.</p>
      </div>
    </Card>
  </div>
);

// --- Main App ---

const SidebarItem = ({ icon: Icon, label, path, active }) => (
  <Link to={path} className={`flex items-center gap-3 px-4 py-3 rounded-[18px] transition-all font-bold text-sm uppercase tracking-wide ${active ? 'bg-[var(--accent)] text-black shadow-lg' : 'text-[var(--mut)] hover:text-[var(--white)] hover:bg-[var(--card-2)]'}`}>
    <Icon size={20} />
    <span>{label}</span>
  </Link>
);

export default function App() {
  const [sessions, setSessions] = useState([]);
  const [settings, setSettings] = useState(INITIAL_SETTINGS);
  const location = useLocation();

  // Dynamic accent color based on route
  const getAccent = () => {
    if (location.pathname === '/studio-map') return 'var(--green)';
    if (location.pathname === '/staff') return 'var(--orange)';
    if (location.pathname === '/complaints') return 'var(--pink)';
    return 'var(--cyan)';
  };

  return (
    <div className="min-h-screen bg-[var(--black)] text-[var(--white)] font-sans selection:bg-[var(--pink)] selection:text-white">
      <div className="flex flex-col md:flex-row min-h-screen">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-[var(--card)] border-r border-[var(--line)] p-6 flex flex-col gap-2 sticky top-0 md:h-screen">
          <div className="mb-8 px-2">
            <h1 className="text-2xl font-black tracking-tighter text-[var(--white)]">
              /<span style={{color: 'var(--violet)'}}>Studio</span>App
            </h1>
            <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--mut)] mt-1">Booking System</div>
          </div>
          
          <nav className="space-y-1 flex-1">
            <SidebarItem icon={CalIcon} label="Calendario" path="/" active={location.pathname === '/'} />
            <SidebarItem icon={Map} label="Estudio" path="/studio-map" active={location.pathname === '/studio-map'} />
            <SidebarItem icon={Users} label="Staff" path="/staff" active={location.pathname === '/staff'} />
            <SidebarItem icon={AlertTriangle} label="Quejas" path="/complaints" active={location.pathname === '/complaints'} />
          </nav>

          <div className="mt-auto pt-6 border-t border-[var(--line)]">
             <div className="text-[10px] font-bold text-[var(--mut-2)] uppercase tracking-widest">v1.0 Bento</div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto" style={{ '--accent': getAccent() }}>
          <Routes>
            <Route path="/" element={<CalendarView sessions={sessions} setSessions={setSessions} settings={settings} />} />
            <Route path="/studio-map" element={<StudioMapView />} />
            <Route path="/staff" element={<StaffView settings={settings} setSettings={setSettings} />} />
            <Route path="/complaints" element={<ComplaintsView />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}