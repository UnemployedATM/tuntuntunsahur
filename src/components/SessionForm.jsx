import React, { useState, useEffect } from 'react';
import { format, setHours, setMinutes, startOfDay, endOfDay } from 'date-fns';
import { X, User, Phone, Calendar, Clock, Package } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const SessionForm = ({ initialDate, initialHour, onClose }) => {
  const { clients, sessions, addSession, findClientByPhone, settings } = useAppContext();
  
  const [formData, setFormData] = useState({
    name: '',
    cellphone: '',
    age: '',
    specialNeeds: 'None',
    date: initialDate ? format(initialDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    time: initialHour ? `${String(initialHour).padStart(2, '0')}:00` : '10:00',
    towel: false,
    faja: false,
    water: false,
    bringOwn: false,
    notes: ''
  });

  const [existingClient, setExistingClient] = useState(null);
  const [errors, setErrors] = useState({});

  // Check daily capacity when date changes
  useEffect(() => {
    if (formData.date) {
      const selectedDate = new Date(formData.date);
      const dayStart = startOfDay(selectedDate);
      const dayEnd = endOfDay(selectedDate);
      
      const sessionsOnDay = sessions.filter(s => {
        const sDate = new Date(s.dateTime);
        return sDate >= dayStart && sDate <= dayEnd && s.status !== 'cancelled';
      });
      
      const dailyLimit = parseInt(settings.daily_capacity) || 10;
      if (sessionsOnDay.length >= dailyLimit) {
        setErrors(prev => ({ ...prev, date: `Daily capacity reached! Maximum ${dailyLimit} sessions per day.` }));
      } else {
        const newErrors = { ...errors };
        delete newErrors.date;
        setErrors(newErrors);
      }
    }
  }, [formData.date, sessions, settings.daily_capacity]);

  useEffect(() => {
    if (formData.cellphone) {
      const client = findClientByPhone(formData.cellphone);
      setExistingClient(client);
      if (client) {
        setFormData(prev => ({
          ...prev,
          name: client.name,
          age: client.age.toString(),
          specialNeeds: client.specialNeeds
        }));
      }
    }
  }, [formData.cellphone, findClientByPhone]);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.cellphone.trim()) newErrors.cellphone = 'Cellphone is required';
    if (!formData.age || formData.age < 1 || formData.age > 120) newErrors.age = 'Valid age required';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.time) newErrors.time = 'Time is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Check daily capacity one more time before submitting
    const selectedDate = new Date(formData.date);
    const dayStart = startOfDay(selectedDate);
    const dayEnd = endOfDay(selectedDate);
    
    const sessionsOnDay = sessions.filter(s => {
      const sDate = new Date(s.dateTime);
      return sDate >= dayStart && sDate <= dayEnd && s.status !== 'cancelled';
    });
    
    const dailyLimit = parseInt(settings.daily_capacity) || 10;
    if (sessionsOnDay.length >= dailyLimit) {
      alert(`Daily capacity reached! Maximum ${dailyLimit} sessions per day.`);
      return;
    }
    
    if (!validate()) return;

    const [hours, minutes] = formData.time.split(':').map(Number);
    const dateTime = setMinutes(setHours(new Date(formData.date), hours), minutes);

    const sessionData = {
      clientId: existingClient?.id || `new_${Date.now()}`,
      clientName: formData.name,
      clientCellphone: formData.cellphone,
      clientAge: parseInt(formData.age),
      specialNeeds: formData.specialNeeds,
      dateTime,
      needs: {
        towel: formData.towel,
        faja: formData.faja,
        water: formData.water,
        bringOwn: formData.bringOwn
      },
      notes: formData.notes
    };

    addSession(sessionData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#111111] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[rgba(255,255,255,0.08)]">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-white">Book New Session</h2>
            <button onClick={onClose} className="text-[#666666] hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          {existingClient && (
            <div className="mb-4 p-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl">
              <p className="text-green-400 font-medium">✓ Existing client found: {existingClient.name}</p>
              <p className="text-green-500/70 text-sm">Client data auto-filled from previous sessions</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Client Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#a0a0a0] mb-1">
                  <User className="w-4 h-4 inline mr-1" />
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 bg-[#161616] border rounded-xl focus:ring-2 focus:ring-[#FF4B2B] text-white placeholder-[#666666] ${
                    errors.name ? 'border-red-500' : 'border-[rgba(255,255,255,0.08)]'
                  }`}
                  placeholder="John Doe"
                />
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#a0a0a0] mb-1">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Cellphone *
                </label>
                <input
                  type="tel"
                  value={formData.cellphone}
                  onChange={(e) => setFormData({ ...formData, cellphone: e.target.value })}
                  className={`w-full px-3 py-2 bg-[#161616] border rounded-xl focus:ring-2 focus:ring-[#FF4B2B] text-white placeholder-[#666666] ${
                    errors.cellphone ? 'border-red-500' : 'border-[rgba(255,255,255,0.08)]'
                  }`}
                  placeholder="+1234567890"
                />
                {errors.cellphone && <p className="text-red-400 text-xs mt-1">{errors.cellphone}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#a0a0a0] mb-1">Age *</label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className={`w-full px-3 py-2 bg-[#161616] border rounded-xl focus:ring-2 focus:ring-[#FF4B2B] text-white placeholder-[#666666] ${
                    errors.age ? 'border-red-500' : 'border-[rgba(255,255,255,0.08)]'
                  }`}
                  placeholder="30"
                  min="1"
                  max="120"
                />
                {errors.age && <p className="text-red-400 text-xs mt-1">{errors.age}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#a0a0a0] mb-1">Special Needs</label>
                <input
                  type="text"
                  value={formData.specialNeeds}
                  onChange={(e) => setFormData({ ...formData, specialNeeds: e.target.value })}
                  className="w-full px-3 py-2 bg-[#161616] border border-[rgba(255,255,255,0.08)] rounded-xl focus:ring-2 focus:ring-[#FF4B2B] text-white placeholder-[#666666]"
                  placeholder="e.g., Wheelchair accessible, Faja required"
                />
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#a0a0a0] mb-1">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className={`w-full px-3 py-2 bg-[#161616] border rounded-xl focus:ring-2 focus:ring-[#FF4B2B] text-white ${
                    errors.date ? 'border-red-500' : 'border-[rgba(255,255,255,0.08)]'
                  }`}
                />
                {errors.date && <p className="text-red-400 text-xs mt-1">{errors.date}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#a0a0a0] mb-1">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Time *
                </label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className={`w-full px-3 py-2 bg-[#161616] border rounded-xl focus:ring-2 focus:ring-[#FF4B2B] text-white ${
                    errors.time ? 'border-red-500' : 'border-[rgba(255,255,255,0.08)]'
                  }`}
                />
                {errors.time && <p className="text-red-400 text-xs mt-1">{errors.time}</p>}
              </div>
            </div>

            {/* Equipment Needs */}
            <div>
              <label className="block text-sm font-medium text-[#a0a0a0] mb-2">
                <Package className="w-4 h-4 inline mr-1" />
                Equipment Needs
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 p-3 bg-[#161616] border border-[rgba(255,255,255,0.08)] rounded-xl cursor-pointer hover:bg-[#1f1f1f] transition-all">
                  <input
                    type="checkbox"
                    checked={formData.towel}
                    onChange={(e) => setFormData({ ...formData, towel: e.target.checked })}
                    className="w-4 h-4 text-[#FF4B2B] rounded focus:ring-[#FF4B2B]"
                  />
                  <span className="text-white">Towel</span>
                </label>
                <label className="flex items-center gap-2 p-3 bg-[#161616] border border-[rgba(255,255,255,0.08)] rounded-xl cursor-pointer hover:bg-[#1f1f1f] transition-all">
                  <input
                    type="checkbox"
                    checked={formData.faja}
                    onChange={(e) => setFormData({ ...formData, faja: e.target.checked })}
                    className="w-4 h-4 text-[#FF4B2B] rounded focus:ring-[#FF4B2B]"
                  />
                  <span className="text-white">Faja (Compression Belt)</span>
                </label>
                <label className="flex items-center gap-2 p-3 bg-[#161616] border border-[rgba(255,255,255,0.08)] rounded-xl cursor-pointer hover:bg-[#1f1f1f] transition-all">
                  <input
                    type="checkbox"
                    checked={formData.water}
                    onChange={(e) => setFormData({ ...formData, water: e.target.checked })}
                    className="w-4 h-4 text-[#FF4B2B] rounded focus:ring-[#FF4B2B]"
                  />
                  <span className="text-white">Water Bottle</span>
                </label>
                <label className="flex items-center gap-2 p-3 bg-[#161616] border border-[rgba(255,255,255,0.08)] rounded-xl cursor-pointer hover:bg-[#1f1f1f] transition-all">
                  <input
                    type="checkbox"
                    checked={formData.bringOwn}
                    onChange={(e) => setFormData({ ...formData, bringOwn: e.target.checked })}
                    className="w-4 h-4 text-[#FF4B2B] rounded focus:ring-[#FF4B2B]"
                  />
                  <span className="text-white">Brings Own Equipment</span>
                </label>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-[#a0a0a0] mb-1">Additional Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 bg-[#161616] border border-[rgba(255,255,255,0.08)] rounded-xl focus:ring-2 focus:ring-[#FF4B2B] text-white placeholder-[#666666]"
                rows="3"
                placeholder="Any additional information..."
              />
            </div>

            {/* Cancelation Policy Info */}
            <div className="p-3 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/30 rounded-xl">
              <p className="text-sm text-blue-300">
                <strong className="text-blue-200">Cancelation Policy:</strong> Client can cancel with full refund until{' '}
                {format(new Date(new Date(formData.date).getTime() + settings.cancelationPolicyHours * 60 * 60 * 1000), 'MMM d, h:mm a')}
                ({settings.cancelationPolicyHours} hours before session)
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4 border-t border-[rgba(255,255,255,0.08)]">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 bg-[#161616] border border-[rgba(255,255,255,0.08)] text-[#a0a0a0] rounded-xl hover:bg-[#1f1f1f] hover:text-white transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!!errors.date}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#FF4B2B] to-[#ff3d3d] text-white rounded-xl hover:from-[#ff3d3d] hover:to-[#FF4B2B] transition-all shadow-lg shadow-[#FF4B2B]/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Book Session
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SessionForm;
