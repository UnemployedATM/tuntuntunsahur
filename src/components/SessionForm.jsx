import React, { useState, useEffect } from 'react';
import { format, setHours, setMinutes } from 'date-fns';
import { X, User, Phone, Calendar, Clock, Package } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const SessionForm = ({ initialDate, initialHour, onClose }) => {
  const { clients, addSession, findClientByPhone, settings } = useAppContext();
  
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Book New Session</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          {existingClient && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">✓ Existing client found: {existingClient.name}</p>
              <p className="text-green-600 text-sm">Client data auto-filled from previous sessions</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Client Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <User className="w-4 h-4 inline mr-1" />
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="John Doe"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Cellphone *
                </label>
                <input
                  type="tel"
                  value={formData.cellphone}
                  onChange={(e) => setFormData({ ...formData, cellphone: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.cellphone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="+1234567890"
                />
                {errors.cellphone && <p className="text-red-500 text-xs mt-1">{errors.cellphone}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age *</label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.age ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="30"
                  min="1"
                  max="120"
                />
                {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Special Needs</label>
                <input
                  type="text"
                  value={formData.specialNeeds}
                  onChange={(e) => setFormData({ ...formData, specialNeeds: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Wheelchair accessible, Faja required"
                />
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.date ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Time *
                </label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.time ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.time && <p className="text-red-500 text-xs mt-1">{errors.time}</p>}
              </div>
            </div>

            {/* Equipment Needs */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Package className="w-4 h-4 inline mr-1" />
                Equipment Needs
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={formData.towel}
                    onChange={(e) => setFormData({ ...formData, towel: e.target.checked })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span>Towel</span>
                </label>
                <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={formData.faja}
                    onChange={(e) => setFormData({ ...formData, faja: e.target.checked })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span>Faja (Compression Belt)</span>
                </label>
                <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={formData.water}
                    onChange={(e) => setFormData({ ...formData, water: e.target.checked })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span>Water Bottle</span>
                </label>
                <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={formData.bringOwn}
                    onChange={(e) => setFormData({ ...formData, bringOwn: e.target.checked })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span>Brings Own Equipment</span>
                </label>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Any additional information..."
              />
            </div>

            {/* Cancelation Policy Info */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Cancelation Policy:</strong> Client can cancel with full refund until{' '}
                {format(new Date(new Date(formData.date).getTime() + settings.cancelationPolicyHours * 60 * 60 * 1000), 'MMM d, h:mm a')}
                ({settings.cancelationPolicyHours} hours before session)
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
