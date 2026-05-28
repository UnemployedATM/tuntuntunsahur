import React, { useState } from 'react';
import { format, startOfWeek, addDays, isSameDay, isToday } from 'date-fns';
import { Calendar as CalendarIcon, Clock, User, Phone, Plus, RotateCcw, XCircle, CheckCircle, MessageSquare } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import SessionForm from '../components/SessionForm';
import RescheduleModal from '../components/RescheduleModal';

const Calendar = () => {
  const { sessions, addSession, rescheduleSession, cancelSession, markAttendance, updateCommunication } = useAppContext();
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date()));
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedDateForBooking, setSelectedDateForBooking] = useState(null);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  const hours = Array.from({ length: 14 }, (_, i) => i + 6);

  const getSessionsForSlot = (date, hour) => {
    return sessions.filter(session => {
      const sessionDate = new Date(session.dateTime);
      return isSameDay(sessionDate, date) && sessionDate.getHours() === hour && session.status !== 'cancelled';
    });
  };

  const navigateWeek = (direction) => {
    setCurrentWeekStart(addDays(currentWeekStart, direction * 7));
  };

  const handleCancelSession = (sessionId) => {
    if (window.confirm('Are you sure you want to cancel this session?')) {
      cancelSession(sessionId);
    }
  };

  const handleMarkAttendance = (sessionId, attended) => {
    markAttendance(sessionId, attended, true);
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-white flex items-center gap-3">
              <CalendarIcon className="w-8 h-8" />
              <span className="serif">Studio</span> Calendar
            </h1>
            <p className="text-[#a0a0a0] mt-2">{format(currentWeekStart, 'MMMM yyyy')}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigateWeek(-1)} className="px-5 py-2.5 bg-[#161616] border border-[rgba(255,255,255,0.08)] rounded-xl hover:bg-[#1f1f1f] transition-all text-[#a0a0a0] hover:text-white">← Previous</button>
            <button onClick={() => setCurrentWeekStart(startOfWeek(new Date()))} className="px-5 py-2.5 bg-[#FF4B2B] text-white rounded-xl hover:bg-[#ff5c3d] transition-all shadow-lg shadow-[#FF4B2B]/20">Today</button>
            <button onClick={() => navigateWeek(1)} className="px-5 py-2.5 bg-[#161616] border border-[rgba(255,255,255,0.08)] rounded-xl hover:bg-[#1f1f1f] transition-all text-[#a0a0a0] hover:text-white">Next →</button>
          </div>
        </div>

        <div className="bg-[#111111] rounded-2xl shadow-2xl overflow-hidden border border-[rgba(255,255,255,0.08)]">
          <div className="grid grid-cols-8 border-b border-[rgba(255,255,255,0.08)] bg-[#161616]">
            <div className="p-4 text-sm font-medium text-[#a0a0a0] border-r border-[rgba(255,255,255,0.08)]">Time</div>
            {weekDays.map((day, index) => (
              <div key={index} className={`p-4 text-center border-r border-[rgba(255,255,255,0.08)] last:border-r-0 ${isToday(day) ? 'bg-[#FF4B2B]/10' : ''}`}>
                <div className="text-sm font-medium text-[#a0a0a0]">{format(day, 'EEE')}</div>
                <div className={`text-xl font-semibold mt-1 ${isToday(day) ? 'text-[#FF4B2B]' : 'text-white'}`}>{format(day, 'd')}</div>
              </div>
            ))}
          </div>

          <div className="overflow-y-auto max-h-[650px]">
            {hours.map((hour) => (
              <div key={hour} className="grid grid-cols-8 border-b border-[rgba(255,255,255,0.04)]">
                <div className="p-3 text-xs text-[#666666] border-r border-[rgba(255,255,255,0.08)] flex items-center justify-center">
                  <Clock className="w-3 h-3 mr-1" />{hour}:00
                </div>
                {weekDays.map((day, dayIndex) => {
                  const slotSessions = getSessionsForSlot(day, hour);
                  return (
                    <div key={dayIndex} className={`p-2 border-r border-[rgba(255,255,255,0.04)] last:border-r-0 min-h-[90px] ${isToday(day) ? 'bg-[#FF4B2B]/5' : ''}`} onClick={() => { setSelectedDateForBooking({ date: day, hour }); setShowSessionForm(true); }}>
                      {slotSessions.map((session) => (
                        <div key={session.id} className="mb-2 p-3 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white text-xs rounded-xl cursor-pointer hover:from-[#764ba2] hover:to-[#667eea] transition-all shadow-lg" onClick={(e) => { e.stopPropagation(); setSelectedSession(session); }}>
                          <div className="font-semibold truncate">{session.clientName}</div>
                          <div className="opacity-80 truncate mt-0.5">{session.specialNeeds !== 'None' ? session.specialNeeds : ''}</div>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {session.needs.towel && <span className="px-2 py-0.5 bg-white/20 rounded-lg text-[10px]">Towel</span>}
                            {session.needs.faja && <span className="px-2 py-0.5 bg-white/20 rounded-lg text-[10px]">Faja</span>}
                            {session.needs.water && <span className="px-2 py-0.5 bg-white/20 rounded-lg text-[10px]">Water</span>}
                          </div>
                        </div>
                      ))}
                      {!slotSessions.length && (
                        <div className="w-full h-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <Plus className="w-5 h-5 text-[#666666]" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {selectedSession && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#111111] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[rgba(255,255,255,0.08)]">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-semibold text-white">Session Details</h2>
                  <button onClick={() => setSelectedSession(null)} className="text-[#666666] hover:text-white transition-colors"><XCircle className="w-6 h-6" /></button>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center"><User className="w-5 h-5 text-white" /></div><div><div className="text-xs text-[#a0a0a0] uppercase tracking-wide">Client</div><div className="font-semibold text-white">{selectedSession.clientName}</div></div></div>
                    <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center"><Phone className="w-5 h-5 text-white" /></div><div><div className="text-xs text-[#a0a0a0] uppercase tracking-wide">Cellphone</div><div className="font-semibold text-white">{selectedSession.clientCellphone}</div></div></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-[#161616] rounded-xl border border-[rgba(255,255,255,0.08)]"><div className="text-xs text-[#a0a0a0] uppercase tracking-wide mb-1">Age</div><div className="font-semibold text-white">{selectedSession.clientAge} years</div></div>
                    <div className="p-4 bg-[#161616] rounded-xl border border-[rgba(255,255,255,0.08)]"><div className="text-xs text-[#a0a0a0] uppercase tracking-wide mb-1">Special Needs</div><div className="font-semibold text-white">{selectedSession.specialNeeds}</div></div>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-[#667eea]/10 to-[#764ba2]/10 rounded-xl border border-[#667eea]/20"><div className="text-xs text-[#a0a0a0] uppercase tracking-wide mb-2">Scheduled Time</div><div className="font-semibold text-white">{format(new Date(selectedSession.dateTime), 'EEEE, MMMM d, yyyy h:mm a')}</div></div>
                  {selectedSession.rescheduleHistory.length > 0 && (
                    <div className="p-4 bg-gradient-to-r from-[#FFB800]/10 to-[#ff8c00]/10 rounded-xl border border-[#FFB800]/20">
                      <div className="flex items-center gap-2 mb-3"><RotateCcw className="w-5 h-5 text-[#FFB800]" /><div className="font-semibold text-[#FFB800]">Reschedule History</div></div>
                      <div className="space-y-2">{selectedSession.rescheduleHistory.map((reschedule, idx) => (<div key={idx} className="text-sm text-[#a0a0a0] p-3 bg-[#161616] rounded-lg"><div className="text-[#666666] text-xs mb-1">From:</div><div className="text-white">{format(new Date(reschedule.from), 'MMM d, h:mm a')}</div><div className="text-[#666666] text-xs mt-2 mb-1">To:</div><div className="text-white">{format(new Date(reschedule.to), 'MMM d, h:mm a')}</div>{reschedule.reason && <><div className="text-[#666666] text-xs mt-2 mb-1">Reason:</div><div className="text-[#a0a0a0]">{reschedule.reason}</div></>}</div>))}</div>
                    </div>
                  )}
                  <div className="p-4 bg-[#161616] rounded-xl border border-[rgba(255,255,255,0.08)]">
                    <div className="text-xs text-[#a0a0a0] uppercase tracking-wide mb-3">Equipment Needs</div>
                    <div className="flex gap-2 flex-wrap">
                      {selectedSession.needs.towel && <span className="px-4 py-2 bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-400 rounded-xl text-sm border border-blue-500/30">Towel</span>}
                      {selectedSession.needs.faja && <span className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-purple-600/20 text-purple-400 rounded-xl text-sm border border-purple-500/30">Faja</span>}
                      {selectedSession.needs.water && <span className="px-4 py-2 bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-400 rounded-xl text-sm border border-green-500/30">Water</span>}
                      {selectedSession.needs.bringOwn && <span className="px-4 py-2 bg-[#1f1f1f] text-[#a0a0a0] rounded-xl text-sm border border-[rgba(255,255,255,0.08)]">Brings Own</span>}
                    </div>
                  </div>
                  <div className={`p-4 rounded-xl border ${selectedSession.refundEligible && selectedSession.status === 'scheduled' ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30' : 'bg-gradient-to-r from-red-500/10 to-rose-500/10 border-red-500/30'}`}>
                    <div className="text-xs text-[#a0a0a0] uppercase tracking-wide mb-2">Cancelation Deadline</div>
                    <div className="font-semibold text-white">{format(new Date(selectedSession.cancelationDeadline), 'MMM d, yyyy h:mm a')}</div>
                    <div className={`text-sm mt-2 ${selectedSession.refundEligible ? 'text-green-400' : 'text-red-400'}`}>{selectedSession.refundEligible ? '✓ Refund eligible if cancelled before deadline' : '✗ No refund - past cancelation deadline'}</div>
                  </div>
                  {selectedSession.status === 'scheduled' && (
                    <div className="flex flex-wrap gap-3 pt-4 border-t border-[rgba(255,255,255,0.08)]">
                      <button onClick={() => setShowRescheduleModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#FFB800] to-[#ff8c00] text-white rounded-xl hover:from-[#ff8c00] hover:to-[#FFB800] transition-all shadow-lg shadow-[#FFB800]/20"><RotateCcw className="w-4 h-4" />Reschedule</button>
                      <button onClick={() => handleCancelSession(selectedSession.id)} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#FF4B2B] to-[#ff3d3d] text-white rounded-xl hover:from-[#ff3d3d] hover:to-[#FF4B2B] transition-all shadow-lg shadow-[#FF4B2B]/20"><XCircle className="w-4 h-4" />Cancel</button>
                    </div>
                  )}
                  {selectedSession.status === 'scheduled' && new Date(selectedSession.dateTime) < new Date() && (
                    <div className="pt-4 border-t border-[rgba(255,255,255,0.08)]">
                      <h3 className="font-semibold text-white mb-4">Post-Session Actions</h3>
                      <div className="space-y-3">
                        <div className="flex gap-3">
                          <button onClick={() => handleMarkAttendance(selectedSession.id, true)} disabled={selectedSession.attended === true} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all ${selectedSession.attended === true ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white' : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 shadow-lg shadow-green-500/20'}`}><CheckCircle className="w-4 h-4" />{selectedSession.attended === true ? 'Attended' : 'Mark as Attended'}</button>
                          <button onClick={() => handleMarkAttendance(selectedSession.id, false)} disabled={selectedSession.attended === false} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all ${selectedSession.attended === false ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white' : 'bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600 shadow-lg shadow-red-500/20'}`}><XCircle className="w-4 h-4" />{selectedSession.attended === false ? 'Not Attended' : 'Mark as Not Attended'}</button>
                        </div>
                        {selectedSession.attended === false && (<button onClick={() => updateCommunication(selectedSession.id, !selectedSession.communicated)} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all ${selectedSession.communicated ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white' : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 shadow-lg shadow-blue-500/20'}`}><MessageSquare className="w-4 h-4" />{selectedSession.communicated ? 'Communicated ✓' : 'Mark as Communicated'}</button>)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {showSessionForm && (<SessionForm initialDate={selectedDateForBooking?.date} initialHour={selectedDateForBooking?.hour} onClose={() => { setShowSessionForm(false); setSelectedDateForBooking(null); }} />)}
        {showRescheduleModal && selectedSession && (<RescheduleModal session={selectedSession} onClose={() => { setShowRescheduleModal(false); setSelectedSession(null); }} />)}
      </div>
    </div>
  );
};

export default Calendar;
