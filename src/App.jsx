import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import {
  Calendar as CalIcon, Map, Users, AlertTriangle,
  ChevronLeft, ChevronRight, X, Edit2, Trash2,
  Plus, Check, Wrench, Power, Filter, RotateCcw, UserPlus, Inbox, Clock
} from 'lucide-react';
import { format, addDays, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO, getHours, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { store, INITIAL_SETTINGS, DEFAULT_HOURLY_CAPACITY } from './lib/db';

// Seed data, default settings, and the persistence layer (Supabase with an
// automatic localStorage fallback) live in ./lib/db. The studio collections and
// their setters are provided by the useStudioData hook (defined below).

// Weekday chips ordered Lun→Dom; value matches JS Date.getDay() (0=Dom).
const WEEKDAYS = [
  { v: 1, l: 'Lun' }, { v: 2, l: 'Mar' }, { v: 3, l: 'Mié' }, { v: 4, l: 'Jue' },
  { v: 5, l: 'Vie' }, { v: 6, l: 'Sáb' }, { v: 0, l: 'Dom' },
];

// A day is closed if its weekday is in closed_weekdays OR its date is an exempt day.
const isClosedDay = (day, settings) => {
  const dateStr = format(day, 'yyyy-MM-dd');
  return (settings.closed_weekdays || []).includes(day.getDay()) || (settings.exempt_days || []).includes(dateStr);
};

const STAFF_ROLES = ['Manager', 'Instructor', 'Recepción', 'Terapeuta', 'Limpieza'];
const COMPLAINT_CATEGORIES = ['Servicio', 'Limpieza', 'Equipo', 'Staff', 'Instalaciones', 'Otro'];
const COMPLAINT_SEVERITIES = ['Baja', 'Media', 'Alta'];

// --- Reusable UI Components (Bento Style) ---
const Button = ({ children, onClick, variant = 'primary', className = '', type = "button", ...props }) => {
  const baseStyle = "px-6 py-3 rounded-[18px] font-bold text-sm uppercase tracking-wide transition-all duration-200 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-[var(--orange)] text-white hover:opacity-90",
    secondary: "bg-[var(--card)] border border-[var(--line)] text-[var(--white)] hover:bg-[var(--card-2)]",
    danger: "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20",
    cyan: "bg-[var(--cyan)] text-black hover:opacity-90",
    pink: "bg-[var(--pink)] text-white hover:opacity-90",
    green: "bg-[var(--green)] text-black hover:opacity-90",
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

const Select = ({ label, options, ...props }) => (
  <div className="mb-4">
    {label && <label className="block text-[var(--white)] font-bold mb-2 text-sm">{label}</label>}
    <select
      className="w-full bg-[var(--card-2)] border border-[var(--line-2)] rounded-[12px] px-4 py-3 text-[var(--white)] focus:outline-none focus:border-[var(--accent)] transition-all appearance-none cursor-pointer"
      {...props}
    >
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

const Textarea = ({ label, ...props }) => (
  <div className="mb-4">
    {label && <label className="block text-[var(--white)] font-bold mb-2 text-sm">{label}</label>}
    <textarea
      rows={3}
      className="w-full bg-[var(--card-2)] border border-[var(--line-2)] rounded-[12px] px-4 py-3 text-[var(--white)] placeholder-[var(--mut-2)] focus:outline-none focus:border-[var(--accent)] transition-all resize-none"
      {...props}
    />
  </div>
);

// Generic centered modal: click backdrop to close, click card to keep open.
const Modal = ({ title, accent = 'var(--cyan)', onClose, children, maxWidth = 'max-w-lg' }) => (
  <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
    <div className={`w-full ${maxWidth}`} onClick={e => e.stopPropagation()}>
      <Card accent={accent}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black uppercase text-[var(--white)]">{title}</h3>
          <button onClick={onClose} className="text-[var(--mut)] hover:text-[var(--white)] transition-colors"><X size={24}/></button>
        </div>
        {children}
      </Card>
    </div>
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
    repeat: 1,
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
    if (!formData.client_name || !formData.cellphone) {
      setErrors({ form: 'Nombre y celular obligatorios.' });
      return;
    }

    // Book the slot weekly for `repeat` weeks, skipping closed days and full slots.
    const repeat = Math.max(1, Math.min(52, parseInt(formData.repeat) || 1));
    const dailyCap = Number(settings.daily_capacity) || 0;
    const hourlyCap = Number(settings.hourly_capacity) || DEFAULT_HOURLY_CAPACITY;
    const baseId = Date.now();
    const toCreate = [];
    let skippedClosed = 0;
    let skippedCapacity = 0;

    for (let w = 0; w < repeat; w++) {
      const day = addDays(slot.day, w * 7);
      const dateStr = format(day, 'yyyy-MM-dd');

      if (isClosedDay(day, settings)) { skippedClosed++; continue; }

      const onDate = (s) => format(parseISO(s.start_time), 'yyyy-MM-dd') === dateStr;
      const inSlot = (s) => onDate(s) && getHours(parseISO(s.start_time)) === slot.hour;

      const dayCount = existingSessions.filter(onDate).length + toCreate.filter(onDate).length;
      if (dayCount >= dailyCap) { skippedCapacity++; continue; }

      const slotCount = existingSessions.filter(inSlot).length + toCreate.filter(inSlot).length;
      if (slotCount >= hourlyCap) { skippedCapacity++; continue; }

      toCreate.push({
        client_name: formData.client_name,
        cellphone: formData.cellphone,
        age: formData.age,
        special_needs: formData.special_needs,
        needs_towel: formData.needs_towel,
        needs_faja: formData.needs_faja,
        needs_water: formData.needs_water,
        brings_own: formData.brings_own,
        start_time: dateStr + 'T' + String(slot.hour).padStart(2, '0') + ':00:00',
        end_time: dateStr + 'T' + String(slot.hour + 1).padStart(2, '0') + ':00:00',
        status: 'booked', refund_eligible: true, id: `${baseId}-${w}`,
      });
    }

    if (toCreate.length === 0) {
      setErrors({ form: skippedClosed > 0 && skippedCapacity === 0
        ? 'Todas las fechas caen en días cerrados.'
        : `Sin cupo: se alcanzó el límite por hora (${hourlyCap}) o diario (${dailyCap}).` });
      return;
    }

    onSave(toCreate, { created: toCreate.length, skippedClosed, skippedCapacity });
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

          <div className="grid grid-cols-2 gap-4 items-center">
            <Input label="Repetir (semanas)" type="number" min="1" max="52" value={formData.repeat} onChange={e => setFormData({...formData, repeat: e.target.value})} />
            <div className="mb-4 text-xs text-[var(--mut)] leading-relaxed">
              <span className="capitalize">{format(slot.day, "EEE d MMM", { locale: es })}</span> · {String(slot.hour).padStart(2, '0')}:00
              {Number(formData.repeat) > 1 && <><br/><span className="text-[var(--cyan)] font-bold">{Number(formData.repeat)} sesiones semanales</span></>}
            </div>
          </div>

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

const SESSION_STATUS = {
  booked: { label: 'Reservada', color: 'slate' },
  attended: { label: 'Asistió', color: 'green' },
  no_show: { label: 'No asistió', color: 'orange' },
};

const SessionDetail = ({ session, onClose, onUpdate, onDelete, onReschedule, settings }) => {
  const [mode, setMode] = useState('view');
  const status = session.status && SESSION_STATUS[session.status] ? session.status : 'booked';

  const isRefundEligible = () => {
    const now = new Date();
    const start = parseISO(session.start_time);
    return (start - now) / (1000 * 60 * 60) > settings.cancellation_policy_hours;
  };

  const setStatus = (next) => onUpdate({ ...session, status: next });

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
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-2xl font-black uppercase text-[var(--white)]">{session.client_name}</h3>
              <Badge color={SESSION_STATUS[status].color}>{SESSION_STATUS[status].label}</Badge>
            </div>
            <p className="text-[var(--mut)] font-mono text-sm">{session.cellphone}</p>
          </div>
          <button onClick={onClose} className="text-[var(--mut)] hover:text-[var(--white)] transition-colors"><X size={24}/></button>
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
            <div>
              <div className="text-xs font-bold uppercase text-[var(--mut-2)] mb-2">Asistencia</div>
              <div className="grid grid-cols-2 gap-3">
                <Button variant={status === 'attended' ? 'green' : 'secondary'} onClick={() => setStatus(status === 'attended' ? 'booked' : 'attended')} className="!py-2"><Check size={16}/> Check-in</Button>
                <Button variant={status === 'no_show' ? 'primary' : 'secondary'} onClick={() => setStatus(status === 'no_show' ? 'booked' : 'no_show')} className="!py-2"><Clock size={16}/> No-show</Button>
              </div>
            </div>
            <div className="flex gap-3 pt-4 border-t border-[var(--line)]">
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

const CalendarView = ({ sessions, setSessions, clients, setClients, settings }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [modalData, setModalData] = useState(null); // { type: 'new'|'edit', slot?:{}, session?:{} }
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  const weekDays = eachDayOfInterval({ start: startOfWeek(currentDate, { locale: es }), end: endOfWeek(currentDate, { locale: es }) });

  // Hour rows: the configured operating window, unioned with any hours that already
  // have sessions this week (so off-hours bookings stay visible, never hidden).
  const openHour = Number(settings.open_hour ?? 7);
  const closeHour = Number(settings.close_hour ?? 19);
  const baseHours = [];
  for (let h = openHour; h < closeHour; h++) baseHours.push(h);
  const weekHours = sessions
    .filter(s => weekDays.some(d => isSameDay(parseISO(s.start_time), d)))
    .map(s => getHours(parseISO(s.start_time)));
  const hours = [...new Set([...baseHours, ...weekHours])].sort((a, b) => a - b);

  const handleSlotClick = (day, hour) => setModalData({ type: 'new', slot: { day, hour } });
  const handleSessionClick = (session) => setModalData({ type: 'edit', session });

  const addSession = (newSessions, meta) => {
    setSessions([...sessions, ...newSessions]);
    // Auto-capture: add unseen phone numbers to the client directory.
    const first = newSessions[0];
    if (first?.cellphone && !clients.some(c => c.cellphone === first.cellphone)) {
      setClients([...clients, {
        id: `cl-${Date.now()}`,
        name: first.client_name,
        cellphone: first.cellphone,
        age: first.age || '',
        special_needs: first.special_needs || 'Ninguna',
      }]);
    }
    setModalData(null);
    if (meta && (meta.created > 1 || meta.skippedClosed || meta.skippedCapacity)) {
      const parts = [`${meta.created} sesión${meta.created === 1 ? '' : 'es'} agendada${meta.created === 1 ? '' : 's'}`];
      if (meta.skippedClosed) parts.push(`${meta.skippedClosed} omitida${meta.skippedClosed === 1 ? '' : 's'} por día cerrado`);
      if (meta.skippedCapacity) parts.push(`${meta.skippedCapacity} omitida${meta.skippedCapacity === 1 ? '' : 's'} por cupo lleno`);
      setToast(parts.join(' · '));
    }
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
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-3xl font-black uppercase tracking-tight text-[var(--white)]">Calendario</h2>
        <div className="flex items-center gap-2 bg-[var(--card)] p-1 rounded-[18px] border border-[var(--line)]">
          <button onClick={() => setCurrentDate(subDays(currentDate, 7))} className="p-2 hover:bg-[var(--card-2)] rounded-full text-[var(--mut)] transition-colors"><ChevronLeft size={20}/></button>
          <span className="px-4 font-bold text-[var(--white)] min-w-[140px] text-center capitalize">
            {format(startOfWeek(currentDate, { locale: es }), 'd MMM', { locale: es })}
          </span>
          <button onClick={() => setCurrentDate(addDays(currentDate, 7))} className="p-2 hover:bg-[var(--card-2)] rounded-full text-[var(--mut)] transition-colors"><ChevronRight size={20}/></button>
          <button onClick={() => setCurrentDate(new Date())} className="ml-1 px-4 py-2 rounded-[14px] bg-[var(--cyan)] text-black text-xs font-bold uppercase tracking-wide hover:opacity-90 transition-opacity">Hoy</button>
        </div>
      </div>

      <div className="bg-[var(--card)] border border-[var(--line)] rounded-[28px] overflow-hidden">
        <div className="grid grid-cols-8 border-b border-[var(--line)]">
          <div className="p-4 border-r border-[var(--line)] bg-[var(--card-2)]"></div>
          {weekDays.map((day, i) => {
            const closed = isClosedDay(day, settings);
            return (
              <div key={i} className={`p-4 text-center border-r border-[var(--line)] last:border-r-0 ${isToday(day) ? 'bg-[var(--cyan)]/10' : closed ? 'bg-black/40' : ''}`}>
                <div className="text-xs font-bold uppercase tracking-wider text-[var(--mut)]">{format(day, 'EEE', { locale: es })}</div>
                <div className={`text-xl font-black ${isToday(day) ? 'text-[var(--cyan)]' : closed ? 'text-[var(--mut-2)]' : 'text-[var(--white)]'}`}>{format(day, 'd')}</div>
                {closed && <div className="text-[9px] font-bold uppercase tracking-wider text-[var(--orange)] mt-0.5">Cerrado</div>}
              </div>
            );
          })}
        </div>
        <div className="overflow-y-auto max-h-[800px]">
          {hours.length === 0 && (
            <div className="p-8 text-center text-[var(--mut)] text-sm">Horario sin horas de operación. Ajusta "Abre" y "Cierra" en Staff.</div>
          )}
          {hours.map(hour => (
            <div key={hour} className="grid grid-cols-8 border-b border-[var(--line)] last:border-b-0">
              <div className="p-4 border-r border-[var(--line)] text-xs font-bold text-[var(--mut-2)] flex items-center justify-center">{hour}:00</div>
              {weekDays.map((day, i) => {
                const slotSessions = sessions.filter(s => isSameDay(parseISO(s.start_time), day) && getHours(parseISO(s.start_time)) === hour);
                const closed = isClosedDay(day, settings);
                const hourlyCap = Number(settings.hourly_capacity) || DEFAULT_HOURLY_CAPACITY;
                // Closed days are non-bookable, but pre-existing sessions stay visible & clickable.
                const hasRoom = !closed && slotSessions.length < hourlyCap;
                return (
                  <div key={i}
                    className={`border-r border-[var(--line)] last:border-r-0 p-2 min-h-[80px] ${closed && slotSessions.length === 0 ? 'cursor-not-allowed bg-black/40' : ''}`}>
                    <div className="flex flex-col gap-1 h-full min-h-[64px]">
                      {slotSessions.map(session => (
                        <div key={session.id} onClick={() => handleSessionClick(session)}
                          className={`rounded-[12px] px-2.5 py-2 text-xs font-bold relative shadow cursor-pointer transition-all
                            ${session.needs_towel ? 'bg-[var(--cyan)] text-black' : session.needs_faja ? 'bg-[var(--pink)] text-white' : 'bg-[var(--green)] text-black'}
                            ${session.status === 'attended' ? 'ring-2 ring-[var(--green)] ring-offset-2 ring-offset-[var(--card)]' : ''}
                            ${session.status === 'no_show' ? 'opacity-40 line-through' : ''}`}>
                          <div className="truncate font-black uppercase pr-5">{session.client_name}</div>
                          {session.status === 'attended' && <Check size={13} className="absolute top-1/2 -translate-y-1/2 right-2" strokeWidth={3} />}
                          {session.status === 'no_show' && <Clock size={13} className="absolute top-1/2 -translate-y-1/2 right-2" strokeWidth={3} />}
                          {(!session.status || session.status === 'booked') && <div className="absolute top-1/2 -translate-y-1/2 right-2 w-2 h-2 rounded-full bg-current opacity-40"></div>}
                        </div>
                      ))}
                      {hasRoom && (
                        <button onClick={() => handleSlotClick(day, hour)}
                          className="flex-1 min-h-[34px] w-full rounded-[12px] border border-dashed border-[var(--line-2)] text-[var(--mut-2)] flex items-center justify-center gap-1 hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-[var(--card-2)] transition-all">
                          <Plus size={15} strokeWidth={3} />
                          {slotSessions.length > 0 && <span className="text-[10px] font-black uppercase tracking-wide">{slotSessions.length}/{hourlyCap}</span>}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {modalData?.type === 'new' && (
        <SessionForm slot={modalData.slot} onClose={() => setModalData(null)} onSave={addSession} clients={clients} settings={settings} existingSessions={sessions} />
      )}
      {modalData?.type === 'edit' && modalData.session && (
        <SessionDetail session={modalData.session} onClose={() => setModalData(null)} onUpdate={updateSession} onDelete={deleteSession} onReschedule={rescheduleSession} settings={settings} />
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-[var(--card)] border border-[var(--cyan)] rounded-[18px] p-4 shadow-2xl flex items-start gap-3">
          <Check size={18} className="text-[var(--cyan)] shrink-0 mt-0.5" />
          <span className="text-sm font-bold text-[var(--white)]">{toast}</span>
          <button onClick={() => setToast(null)} className="text-[var(--mut)] hover:text-[var(--white)] ml-auto shrink-0"><X size={16}/></button>
        </div>
      )}
    </div>
  );
};

const EquipmentForm = ({ item, onClose, onSave }) => {
  const [data, setData] = useState(item || { name: '', total_count: 1, in_repair_count: 0 });
  const [error, setError] = useState('');

  const submit = (e) => {
    e.preventDefault();
    const total = parseInt(data.total_count) || 0;
    const repair = parseInt(data.in_repair_count) || 0;
    if (!data.name.trim()) return setError('El nombre es obligatorio.');
    if (total < 1) return setError('La cantidad total debe ser al menos 1.');
    if (repair > total) return setError('Las unidades en reparación no pueden exceder el total.');
    onSave({
      id: item?.id || Date.now().toString(),
      name: data.name.trim(),
      total_count: total,
      in_repair_count: repair,
      available_count: total - repair,
    });
  };

  return (
    <Modal title={item ? 'Editar Equipo' : 'Nuevo Equipo'} accent="var(--green)" onClose={onClose}>
      <form onSubmit={submit}>
        <Input label="Nombre" value={data.name} onChange={e => setData({ ...data, name: e.target.value })} placeholder="Reformer" autoFocus />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Cantidad total" type="number" min="1" value={data.total_count} onChange={e => setData({ ...data, total_count: e.target.value })} />
          <Input label="En reparación" type="number" min="0" value={data.in_repair_count} onChange={e => setData({ ...data, in_repair_count: e.target.value })} />
        </div>
        {error && <div className="bg-red-500/10 text-red-500 p-3 rounded-[12px] mb-4 text-sm font-bold">{error}</div>}
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button type="submit" variant="green" className="flex-1">Guardar</Button>
        </div>
      </form>
    </Modal>
  );
};

const StudioMapView = ({ equipment, setEquipment }) => {
  const [modal, setModal] = useState(null); // null | { item? }

  const save = (it) => {
    setEquipment(prev => prev.some(e => e.id === it.id) ? prev.map(e => e.id === it.id ? it : e) : [...prev, it]);
    setModal(null);
  };
  const remove = (id) => {
    if (window.confirm('¿Eliminar este equipo del inventario?')) setEquipment(prev => prev.filter(e => e.id !== id));
  };
  const adjustRepair = (id, delta) => setEquipment(prev => prev.map(e => {
    if (e.id !== id) return e;
    const newRepair = Math.min(e.total_count, Math.max(0, e.in_repair_count + delta));
    return { ...e, in_repair_count: newRepair, available_count: e.total_count - newRepair };
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black uppercase text-[var(--white)]">Estudio</h2>
        <Button variant="green" onClick={() => setModal({})}><Plus size={18}/> Equipo</Button>
      </div>

      {equipment.length === 0 ? (
        <Card accent="var(--green)"><div className="text-center py-12 text-[var(--mut)]">Sin equipo registrado. Agrega el primero.</div></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {equipment.map(item => (
            <Card key={item.id} accent="var(--green)">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-black text-[var(--white)]">{item.name}</h3>
                <Badge color={item.in_repair_count > 0 ? 'orange' : 'green'}>{item.in_repair_count > 0 ? 'Reparación' : 'OK'}</Badge>
              </div>
              <div className="text-sm text-[var(--mut)] mb-1">Disponibles: <span className="text-[var(--white)] font-bold">{item.available_count}/{item.total_count}</span></div>
              <div className="h-2 bg-[var(--card-2)] rounded-full overflow-hidden">
                <div className="h-full bg-[var(--green)] transition-all" style={{ width: `${item.total_count ? (item.available_count / item.total_count) * 100 : 0}%` }}></div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--line)]">
                <span className="text-xs font-bold uppercase text-[var(--mut)] flex items-center gap-1"><Wrench size={14}/> En reparación</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => adjustRepair(item.id, -1)} className="w-8 h-8 rounded-full bg-[var(--card-2)] border border-[var(--line-2)] text-[var(--white)] font-black hover:bg-[var(--green)] hover:text-black transition-colors disabled:opacity-30" disabled={item.in_repair_count === 0}>−</button>
                  <span className="font-black text-[var(--white)] w-6 text-center">{item.in_repair_count}</span>
                  <button onClick={() => adjustRepair(item.id, 1)} className="w-8 h-8 rounded-full bg-[var(--card-2)] border border-[var(--line-2)] text-[var(--white)] font-black hover:bg-[var(--orange)] hover:text-white transition-colors disabled:opacity-30" disabled={item.in_repair_count >= item.total_count}>+</button>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button variant="secondary" onClick={() => setModal({ item })} className="flex-1 !py-2 !text-xs"><Edit2 size={14}/> Editar</Button>
                <Button variant="danger" onClick={() => remove(item.id)} className="!py-2 !px-4"><Trash2 size={14}/></Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {modal && <EquipmentForm item={modal.item} onClose={() => setModal(null)} onSave={save} />}
    </div>
  );
};

const StaffForm = ({ member, onClose, onSave }) => {
  const [data, setData] = useState(member || { name: '', role: STAFF_ROLES[1], is_available: true });
  const [error, setError] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!data.name.trim()) return setError('El nombre es obligatorio.');
    onSave({ id: member?.id || Date.now().toString(), name: data.name.trim(), role: data.role, is_available: data.is_available });
  };

  return (
    <Modal title={member ? 'Editar Miembro' : 'Nuevo Miembro'} accent="var(--cyan)" onClose={onClose}>
      <form onSubmit={submit}>
        <Input label="Nombre" value={data.name} onChange={e => setData({ ...data, name: e.target.value })} placeholder="Nombre completo" autoFocus />
        <Select label="Rol" options={STAFF_ROLES} value={data.role} onChange={e => setData({ ...data, role: e.target.value })} />
        <label className={`flex items-center gap-3 p-3 rounded-[12px] border cursor-pointer mb-6 ${data.is_available ? 'bg-[var(--green)]/10 border-[var(--green)]' : 'bg-[var(--card-2)] border-[var(--line-2)]'}`}>
          <input type="checkbox" checked={data.is_available} onChange={e => setData({ ...data, is_available: e.target.checked })} className="accent-[var(--green)] w-5 h-5" />
          <span className="text-sm font-bold text-[var(--white)]">Disponible / en turno</span>
        </label>
        {error && <div className="bg-red-500/10 text-red-500 p-3 rounded-[12px] mb-4 text-sm font-bold">{error}</div>}
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button type="submit" variant="cyan" className="flex-1">Guardar</Button>
        </div>
      </form>
    </Modal>
  );
};

const StaffView = ({ staff, setStaff, settings, setSettings }) => {
  const [modal, setModal] = useState(null); // null | { member? }

  const save = (m) => {
    setStaff(prev => prev.some(s => s.id === m.id) ? prev.map(s => s.id === m.id ? m : s) : [...prev, m]);
    setModal(null);
  };
  const remove = (id) => {
    if (window.confirm('¿Eliminar a este miembro del staff?')) setStaff(prev => prev.filter(s => s.id !== id));
  };
  const toggle = (id) => setStaff(prev => prev.map(s => s.id === id ? { ...s, is_available: !s.is_available } : s));
  const updateSetting = (key, value) => setSettings({ ...settings, [key]: parseInt(value) || 0 });

  const activeCount = staff.filter(s => s.is_available).length;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-black uppercase text-[var(--white)]">Staff & Config</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card accent="var(--cyan)">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black text-[var(--cyan)] uppercase">Equipo <span className="text-[var(--mut)] text-sm">({activeCount} en turno)</span></h3>
            <Button variant="cyan" onClick={() => setModal({})} className="!py-2 !px-4 !text-xs"><UserPlus size={14}/> Agregar</Button>
          </div>
          {staff.length === 0 ? (
            <div className="text-center py-8 text-[var(--mut)] text-sm">Sin miembros registrados.</div>
          ) : staff.map(s => (
            <div key={s.id} className="flex justify-between items-center p-3 bg-[var(--card-2)] rounded-[12px] mb-2 gap-2">
              <div className="min-w-0">
                <div className="text-[var(--white)] font-bold truncate">{s.name}</div>
                <div className="text-xs text-[var(--mut)]">{s.role}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => toggle(s.id)} className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide transition-colors ${s.is_available ? 'bg-[var(--green)] text-black' : 'bg-[var(--slate)] text-[var(--mut)]'}`}>
                  <Power size={12}/> {s.is_available ? 'Activo' : 'Inactivo'}
                </button>
                <button onClick={() => setModal({ member: s })} className="p-2 rounded-full text-[var(--mut)] hover:text-[var(--white)] hover:bg-[var(--card)] transition-colors"><Edit2 size={14}/></button>
                <button onClick={() => remove(s.id)} className="p-2 rounded-full text-[var(--mut)] hover:text-red-500 hover:bg-[var(--card)] transition-colors"><Trash2 size={14}/></button>
              </div>
            </div>
          ))}
        </Card>
        <Card accent="var(--orange)">
          <h3 className="text-lg font-black text-[var(--orange)] uppercase mb-4">Configuración</h3>
          <div className="space-y-4">
            <Input label="Capacidad por hora" type="number" min="1" value={settings.hourly_capacity ?? DEFAULT_HOURLY_CAPACITY} onChange={e => updateSetting('hourly_capacity', e.target.value)} />
            <Input label="Capacidad diaria" type="number" min="0" value={settings.daily_capacity} onChange={e => updateSetting('daily_capacity', e.target.value)} />
            <Input label="Política de cancelación (hrs)" type="number" min="0" value={settings.cancellation_policy_hours} onChange={e => updateSetting('cancellation_policy_hours', e.target.value)} />
            <Input label="Intervalo de seguimiento (días)" type="number" min="0" value={settings.follow_up_interval_days} onChange={e => updateSetting('follow_up_interval_days', e.target.value)} />
          </div>
          <p className="text-xs text-[var(--mut-2)] mt-4 flex items-center gap-1"><Check size={12}/> Los cambios se guardan automáticamente.</p>
        </Card>
      </div>

      {modal && <StaffForm member={modal.member} onClose={() => setModal(null)} onSave={save} />}
    </div>
  );
};

const SEVERITY_COLOR = { Alta: 'orange', Media: 'pink', Baja: 'cyan' };

const ComplaintForm = ({ complaint, onClose, onSave }) => {
  const [data, setData] = useState(complaint || {
    client_name: '', category: COMPLAINT_CATEGORIES[0], severity: 'Media', description: '',
  });
  const [error, setError] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!data.client_name.trim()) return setError('El nombre del cliente es obligatorio.');
    if (!data.description.trim()) return setError('Describe la queja.');
    onSave({
      id: complaint?.id || Date.now().toString(),
      client_name: data.client_name.trim(),
      category: data.category,
      severity: data.severity,
      description: data.description.trim(),
      status: complaint?.status || 'open',
      created_at: complaint?.created_at || new Date().toISOString(),
      resolved_at: complaint?.resolved_at || null,
    });
  };

  return (
    <Modal title={complaint ? 'Editar Queja' : 'Nueva Queja'} accent="var(--pink)" onClose={onClose}>
      <form onSubmit={submit}>
        <Input label="Cliente" value={data.client_name} onChange={e => setData({ ...data, client_name: e.target.value })} placeholder="Nombre del cliente" autoFocus />
        <div className="grid grid-cols-2 gap-4">
          <Select label="Categoría" options={COMPLAINT_CATEGORIES} value={data.category} onChange={e => setData({ ...data, category: e.target.value })} />
          <Select label="Severidad" options={COMPLAINT_SEVERITIES} value={data.severity} onChange={e => setData({ ...data, severity: e.target.value })} />
        </div>
        <Textarea label="Descripción" value={data.description} onChange={e => setData({ ...data, description: e.target.value })} placeholder="¿Qué ocurrió?" />
        {error && <div className="bg-red-500/10 text-red-500 p-3 rounded-[12px] mb-4 text-sm font-bold">{error}</div>}
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button type="submit" variant="pink" className="flex-1">Guardar</Button>
        </div>
      </form>
    </Modal>
  );
};

const ComplaintsView = ({ complaints, setComplaints }) => {
  const [modal, setModal] = useState(null); // null | { complaint? }
  const [filter, setFilter] = useState('open'); // all | open | resolved

  const save = (c) => {
    setComplaints(prev => prev.some(x => x.id === c.id) ? prev.map(x => x.id === c.id ? c : x) : [c, ...prev]);
    setModal(null);
  };
  const remove = (id) => {
    if (window.confirm('¿Eliminar esta queja?')) setComplaints(prev => prev.filter(x => x.id !== id));
  };
  const toggleStatus = (id) => setComplaints(prev => prev.map(x => x.id === id
    ? { ...x, status: x.status === 'open' ? 'resolved' : 'open', resolved_at: x.status === 'open' ? new Date().toISOString() : null }
    : x));

  const openCount = complaints.filter(c => c.status === 'open').length;
  const filtered = complaints.filter(c => filter === 'all' || c.status === filter);

  const FilterTab = ({ value, label, count }) => (
    <button
      onClick={() => setFilter(value)}
      className={`px-4 py-2 rounded-[14px] text-xs font-bold uppercase tracking-wide transition-colors ${filter === value ? 'bg-[var(--pink)] text-white' : 'bg-[var(--card-2)] text-[var(--mut)] hover:text-[var(--white)]'}`}
    >
      {label}{typeof count === 'number' ? ` (${count})` : ''}
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black uppercase text-[var(--white)]">Quejas</h2>
        <Button variant="pink" onClick={() => setModal({})}><Plus size={18}/> Queja</Button>
      </div>

      <div className="flex items-center gap-2">
        <Filter size={16} className="text-[var(--mut)]" />
        <FilterTab value="open" label="Abiertas" count={openCount} />
        <FilterTab value="resolved" label="Resueltas" />
        <FilterTab value="all" label="Todas" count={complaints.length} />
      </div>

      {filtered.length === 0 ? (
        <Card accent="var(--pink)">
          <div className="flex flex-col items-center py-12 text-[var(--mut)] gap-2">
            <Inbox size={32} className="opacity-50" />
            <span>{filter === 'open' ? 'No hay quejas abiertas. ¡Bien!' : filter === 'resolved' ? 'Sin quejas resueltas aún.' : 'Sin quejas registradas.'}</span>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map(c => (
            <Card key={c.id} accent={c.status === 'resolved' ? 'var(--green)' : 'var(--pink)'}>
              <div className="flex justify-between items-start gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <h3 className="text-lg font-black text-[var(--white)]">{c.client_name}</h3>
                    <Badge color={SEVERITY_COLOR[c.severity] || 'slate'}>{c.severity}</Badge>
                    <Badge color="slate">{c.category}</Badge>
                    {c.status === 'resolved' && <Badge color="green">Resuelta</Badge>}
                  </div>
                  <p className="text-[var(--mut)] text-sm mb-2">{c.description}</p>
                  <div className="text-xs text-[var(--mut-2)] font-mono">
                    {format(parseISO(c.created_at), "d MMM yyyy, HH:mm", { locale: es })}
                    {c.resolved_at && <span className="text-[var(--green)]"> · resuelta {format(parseISO(c.resolved_at), 'd MMM HH:mm', { locale: es })}</span>}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-[var(--line)]">
                <Button variant={c.status === 'open' ? 'green' : 'secondary'} onClick={() => toggleStatus(c.id)} className="flex-1 !py-2 !text-xs">
                  {c.status === 'open' ? <><Check size={14}/> Resolver</> : <><RotateCcw size={14}/> Reabrir</>}
                </Button>
                <Button variant="secondary" onClick={() => setModal({ complaint: c })} className="!py-2 !px-4"><Edit2 size={14}/></Button>
                <Button variant="danger" onClick={() => remove(c.id)} className="!py-2 !px-4"><Trash2 size={14}/></Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {modal && <ComplaintForm complaint={modal.complaint} onClose={() => setModal(null)} onSave={save} />}
    </div>
  );
};

// --- Data layer: load from the store (Supabase or localStorage) and expose
// useState-style setters that transparently persist every change. ------------
const useStudioData = () => {
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [error, setError] = useState(null);

  const [clients, setClientsState] = useState([]);
  const [staff, setStaffState] = useState([]);
  const [equipment, setEquipmentState] = useState([]);
  const [sessions, setSessionsState] = useState([]);
  const [complaints, setComplaintsState] = useState([]);
  const [settings, setSettingsState] = useState(INITIAL_SETTINGS);

  // Mirror of the latest values so a setter can diff prev -> next without
  // running side effects inside a React state updater (StrictMode-safe).
  const ref = useRef({ clients: [], staff: [], equipment: [], sessions: [], complaints: [], settings: INITIAL_SETTINGS });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await store.loadAll();
        if (cancelled) return;
        const mergedSettings = { ...INITIAL_SETTINGS, ...(data.settings || {}) };
        ref.current = {
          clients: data.clients, staff: data.staff, equipment: data.equipment,
          sessions: data.sessions, complaints: data.complaints, settings: mergedSettings,
        };
        setClientsState(data.clients);
        setStaffState(data.staff);
        setEquipmentState(data.equipment);
        setSessionsState(data.sessions);
        setComplaintsState(data.complaints);
        setSettingsState(mergedSettings);
        setStatus('ready');
      } catch (e) {
        if (cancelled) return;
        setError(e?.message || String(e));
        setStatus('error');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Setter that accepts an array or an updater fn (like useState), updates React
  // state, and persists the change to the store.
  const makeSetter = (table, setState) => (updater) => {
    const prev = ref.current[table];
    const next = typeof updater === 'function' ? updater(prev) : updater;
    ref.current[table] = next;
    setState(next);
    store.persistCollection(table, prev, next);
  };

  const setSettings = (updater) => {
    const prev = ref.current.settings;
    const next = typeof updater === 'function' ? updater(prev) : updater;
    ref.current.settings = next;
    setSettingsState(next);
    store.saveSettings(next);
  };

  return {
    status, error,
    clients, setClients: makeSetter('clients', setClientsState),
    staff, setStaff: makeSetter('staff', setStaffState),
    equipment, setEquipment: makeSetter('equipment', setEquipmentState),
    sessions, setSessions: makeSetter('sessions', setSessionsState),
    complaints, setComplaints: makeSetter('complaints', setComplaintsState),
    settings, setSettings,
  };
};

const StudioLoading = () => (
  <div className="flex flex-col items-center justify-center py-32 text-center gap-4">
    <div className="w-10 h-10 rounded-full border-4 border-[var(--line)] border-t-[var(--cyan)] animate-spin"></div>
    <p className="text-[var(--mut)] font-bold uppercase tracking-wide text-sm">Cargando datos…</p>
  </div>
);

const StudioError = ({ message }) => (
  <div className="max-w-xl mx-auto mt-12">
    <Card accent="var(--orange)">
      <div className="flex items-center gap-3 mb-4">
        <AlertTriangle className="text-[var(--orange)]" size={28} />
        <h3 className="text-xl font-black uppercase text-[var(--white)]">Error de conexión</h3>
      </div>
      <p className="text-[var(--mut)] text-sm mb-4">{message || 'No se pudieron cargar los datos.'}</p>
      <div className="bg-[var(--card-2)] rounded-[12px] p-4 text-xs text-[var(--mut-2)] space-y-2">
        <p className="font-bold text-[var(--white)]">Posibles causas:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Las variables <code className="text-[var(--cyan)]">VITE_SUPABASE_URL</code> y <code className="text-[var(--cyan)]">VITE_SUPABASE_ANON_KEY</code> no están configuradas.</li>
          <li>El esquema (<code className="text-[var(--cyan)]">supabase_schema.sql</code>) aún no se ejecutó en Supabase.</li>
          <li>Las políticas RLS no permiten el acceso a las tablas.</li>
        </ul>
      </div>
      <Button variant="secondary" onClick={() => window.location.reload()} className="w-full mt-4"><RotateCcw size={16}/> Reintentar</Button>
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

  const {
    status, error,
    sessions, setSessions,
    settings, setSettings,
    clients, setClients,
    staff, setStaff,
    equipment, setEquipment,
    complaints, setComplaints,
  } = useStudioData();

  // Per-tab notification counts (subject of each tab; mirrors the Quejas badge).
  const openComplaints = complaints.filter(c => c.status === 'open').length;
  const todayPending = sessions.filter(s => isToday(parseISO(s.start_time)) && (!s.status || s.status === 'booked')).length;
  const equipmentInRepair = equipment.reduce((sum, e) => sum + (Number(e.in_repair_count) || 0), 0);

  const NavItem = ({ to, icon: Icon, label, badge }) => {
    const active = location.pathname === to;
    return (
      <Link to={to} className={`flex items-center gap-3 px-4 py-3 rounded-[18px] font-bold text-sm uppercase tracking-wide transition-all ${active ? 'bg-[var(--accent)] text-black shadow-lg' : 'text-[var(--mut)] hover:text-[var(--white)] hover:bg-[var(--card-2)]'}`}>
        <Icon size={20} />
        <span className="flex-1">{label}</span>
        {badge > 0 && <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${active ? 'bg-black/20 text-black' : 'bg-[var(--pink)] text-white'}`}>{badge}</span>}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--black)] text-[var(--white)] font-sans selection:bg-[var(--pink)] selection:text-white flex" style={{ '--accent': getAccent() }}>
      <aside className="w-full md:w-64 bg-[var(--card)] border-r border-[var(--line)] p-6 flex flex-col gap-2 sticky top-0 md:h-screen z-10">
        <div className="mb-8 px-2">
          <h1 className="text-2xl font-black tracking-tighter text-[var(--white)]">/<span style={{color: 'var(--violet)'}}>Studio</span></h1>
          <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--mut)]">Booking</div>
        </div>
        <nav className="space-y-1 flex-1">
          <NavItem to="/" icon={CalIcon} label="Calendario" badge={todayPending} />
          <NavItem to="/studio-map" icon={Map} label="Estudio" badge={equipmentInRepair} />
          <NavItem to="/staff" icon={Users} label="Staff" />
          <NavItem to="/complaints" icon={AlertTriangle} label="Quejas" badge={openComplaints} />
        </nav>
      </aside>
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {status === 'loading' ? (
          <StudioLoading />
        ) : status === 'error' ? (
          <StudioError message={error} />
        ) : (
          <Routes>
            <Route path="/" element={<CalendarView sessions={sessions} setSessions={setSessions} clients={clients} setClients={setClients} settings={settings} />} />
            <Route path="/studio-map" element={<StudioMapView equipment={equipment} setEquipment={setEquipment} />} />
            <Route path="/staff" element={<StaffView staff={staff} setStaff={setStaff} settings={settings} setSettings={setSettings} />} />
            <Route path="/complaints" element={<ComplaintsView complaints={complaints} setComplaints={setComplaints} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
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