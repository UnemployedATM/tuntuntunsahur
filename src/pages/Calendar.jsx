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
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <CalendarIcon className="w-8 h-8" />
              Studio Calendar
            </h1>
            <p className="text-gray-600 mt-1">{format(currentWeekStart, 'MMMM yyyy')}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigateWeek(-1)} className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">← Previous</button>
            <button onClick={() => setCurrentWeekStart(startOfWeek(new Date()))} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Today</button>
            <button onClick={() => navigateWeek(1)} className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Next →</button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-8 border-b border-gray-200 bg-gray-50">
            <div className="p-3 text-sm font-semibold text-gray-600 border-r border-gray-200">Time</div>
            {weekDays.map((day, index) => (
              <div key={index} className={`p-3 text-center border-r border-gray-200 last:border-r-0 ${isToday(day) ? 'bg-blue-50' : ''}`}>
                <div className="text-sm font-medium text-gray-600">{format(day, 'EEE')}</div>
                <div className={`text-lg font-bold ${isToday(day) ? 'text-blue-600' : 'text-gray-800'}`}>{format(day, 'd')}</div>
              </div>
            ))}
          </div>

          <div className="overflow-y-auto max-h-[600px]">
            {hours.map((hour) => (
              <div key={hour} className="grid grid-cols-8 border-b border-gray-100">
                <div className="p-2 text-xs text-gray-500 border-r border-gray-200 flex items-center justify-center">
                  <Clock className="w-3 h-3 mr-1" />{hour}:00
                </div>
                {weekDays.map((day, dayIndex) => {
                  const slotSessions = getSessionsForSlot(day, hour);
                  return (
                    <div key={dayIndex} className={`p-1 border-r border-gray-100 last:border-r-0 min-h-[80px] ${isToday(day) ? 'bg-blue-50/30' : ''}`}>
                      {slotSessions.map((session) => (
                        <div key={session.id} className="mb-1 p-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs rounded cursor-pointer hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm" onClick={() => setSelectedSession(session)}>
                          <div className="font-semibold truncate">{session.clientName}</div>
                          <div className="opacity-90 truncate">{session.specialNeeds !== 'None' ? session.specialNeeds : ''}</div>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {session.needs.towel && <span className="px-1 bg-white/20 rounded text-[10px]">Towel</span>}
                            {session.needs.faja && <span className="px-1 bg-white/20 rounded text-[10px]">Faja</span>}
                            {session.needs.water && <span className="px-1 bg-white/20 rounded text-[10px]">Water</span>}
                          </div>
                        </div>
                      ))}
                      <button onClick={() => { setSelectedDateForBooking({ date: day, hour }); setShowSessionForm(true); }} className="w-full h-6 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {selectedSession && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">Session Details</h2>
                  <button onClick={() => setSelectedSession(null)} className="text-gray-400 hover:text-gray-600"><XCircle className="w-6 h-6" /></button>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2"><User className="w-5 h-5 text-blue-600" /><div><div className="text-sm text-gray-500">Client</div><div className="font-semibold">{selectedSession.clientName}</div></div></div>
                    <div className="flex items-center gap-2"><Phone className="w-5 h-5 text-blue-600" /><div><div className="text-sm text-gray-500">Cellphone</div><div className="font-semibold">{selectedSession.clientCellphone}</div></div></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><div className="text-sm text-gray-500">Age</div><div className="font-semibold">{selectedSession.clientAge} years</div></div>
                    <div><div className="text-sm text-gray-500">Special Needs</div><div className="font-semibold">{selectedSession.specialNeeds}</div></div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg"><div className="text-sm text-gray-500 mb-2">Scheduled Time</div><div className="font-semibold text-blue-800">{format(new Date(selectedSession.dateTime), 'EEEE, MMMM d, yyyy h:mm a')}</div></div>
                  {selectedSession.rescheduleHistory.length > 0 && (
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2"><RotateCcw className="w-5 h-5 text-yellow-600" /><div className="font-semibold text-yellow-800">Reschedule History</div></div>
                      <div className="space-y-2">{selectedSession.rescheduleHistory.map((reschedule, idx) => (<div key={idx} className="text-sm text-yellow-700"><div>From: {format(new Date(reschedule.from), 'MMM d, h:mm a')}</div><div>To: {format(new Date(reschedule.to), 'MMM d, h:mm a')}</div>{reschedule.reason && <div>Reason: {reschedule.reason}</div>}</div>))}</div>
                    </div>
                  )}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500 mb-2">Equipment Needs</div>
                    <div className="flex gap-2">
                      {selectedSession.needs.towel && <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Towel</span>}
                      {selectedSession.needs.faja && <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">Faja</span>}
                      {selectedSession.needs.water && <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Water</span>}
                      {selectedSession.needs.bringOwn && <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm">Brings Own</span>}
                    </div>
                  </div>
                  <div className={`p-4 rounded-lg ${selectedSession.refundEligible && selectedSession.status === 'scheduled' ? 'bg-green-50' : 'bg-red-50'}`}>
                    <div className="text-sm opacity-70 mb-1">Cancelation Deadline</div>
                    <div className="font-semibold">{format(new Date(selectedSession.cancelationDeadline), 'MMM d, yyyy h:mm a')}</div>
                    <div className={`text-sm mt-1 ${selectedSession.refundEligible ? 'text-green-700' : 'text-red-700'}`}>{selectedSession.refundEligible ? '✓ Refund eligible if cancelled before deadline' : '✗ No refund - past cancelation deadline'}</div>
                  </div>
                  {selectedSession.status === 'scheduled' && (
                    <div className="flex flex-wrap gap-2 pt-4 border-t">
                      <button onClick={() => setShowRescheduleModal(true)} className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"><RotateCcw className="w-4 h-4" />Reschedule</button>
                      <button onClick={() => handleCancelSession(selectedSession.id)} className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"><XCircle className="w-4 h-4" />Cancel</button>
                    </div>
                  )}
                  {selectedSession.status === 'scheduled' && new Date(selectedSession.dateTime) < new Date() && (
                    <div className="pt-4 border-t">
                      <h3 className="font-semibold mb-3">Post-Session Actions</h3>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <button onClick={() => handleMarkAttendance(selectedSession.id, true)} disabled={selectedSession.attended === true} className={`flex items-center gap-2 px-4 py-2 rounded-lg ${selectedSession.attended === true ? 'bg-green-600 text-white' : 'bg-green-500 text-white hover:bg-green-600'}`}><CheckCircle className="w-4 h-4" />{selectedSession.attended === true ? 'Attended' : 'Mark as Attended'}</button>
                          <button onClick={() => handleMarkAttendance(selectedSession.id, false)} disabled={selectedSession.attended === false} className={`flex items-center gap-2 px-4 py-2 rounded-lg ${selectedSession.attended === false ? 'bg-red-600 text-white' : 'bg-red-500 text-white hover:bg-red-600'}`}><XCircle className="w-4 h-4" />{selectedSession.attended === false ? 'Not Attended' : 'Mark as Not Attended'}</button>
                        </div>
                        {selectedSession.attended === false && (<button onClick={() => updateCommunication(selectedSession.id, !selectedSession.communicated)} className={`flex items-center gap-2 px-4 py-2 rounded-lg ${selectedSession.communicated ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white hover:bg-blue-600'}`}><MessageSquare className="w-4 h-4" />{selectedSession.communicated ? 'Communicated ✓' : 'Mark as Communicated'}</button>)}
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
