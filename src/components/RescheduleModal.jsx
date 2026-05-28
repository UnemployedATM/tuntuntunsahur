import React, { useState } from 'react';
import { format } from 'date-fns';
import { X, RotateCcw, Calendar, Clock } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const RescheduleModal = ({ session, onClose }) => {
  const { rescheduleSession } = useAppContext();
  const [newDate, setNewDate] = useState(format(new Date(session.dateTime), 'yyyy-MM-dd'));
  const [newTime, setNewTime] = useState(format(new Date(session.dateTime), 'HH:mm'));
  const [reason, setReason] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const [hours, minutes] = newTime.split(':').map(Number);
    const newDateTime = new Date(newDate);
    newDateTime.setHours(hours, minutes);

    rescheduleSession(session.id, newDateTime, reason);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <RotateCcw className="w-6 h-6" />
              Reschedule Session
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Current:</strong> {format(new Date(session.dateTime), 'EEEE, MMM d, h:mm a')}
            </p>
            {session.rescheduleHistory.length > 0 && (
              <p className="text-xs text-yellow-600 mt-1">
                This is reschedule #{session.rescheduleHistory.length + 1}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="w-4 h-4 inline mr-1" />
                New Date
              </label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Clock className="w-4 h-4 inline mr-1" />
                New Time
              </label>
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Rescheduling
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Optional: Why is the client rescheduling?"
              />
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-700">
                <strong>Note:</strong> The original booking time will be preserved in the history for tracking purposes.
              </p>
            </div>

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
                className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
              >
                Confirm Reschedule
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RescheduleModal;
