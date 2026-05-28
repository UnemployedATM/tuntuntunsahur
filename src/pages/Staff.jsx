import React, { useState } from 'react';
import { Users, UserCheck, UserX, Plus, Edit2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const Staff = () => {
  const { staff, updateStaffAvailability, settings, updateSettings, getClientsNeedingFollowUp } = useAppContext();
  const [showSettings, setShowSettings] = useState(false);
  const [cancelationHours, setCancelationHours] = useState(settings.cancelationPolicyHours.toString());
  const [followUpDays, setFollowUpDays] = useState(settings.followUpReminderDays.toString());

  const availableCount = staff.filter(s => s.available).length;
  const clientsNeedingFollowUp = getClientsNeedingFollowUp();

  const handleSaveSettings = () => {
    updateSettings({
      cancelationPolicyHours: parseInt(cancelationHours) || 24,
      followUpReminderDays: parseInt(followUpDays) || 7
    });
    setShowSettings(false);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <Users className="w-8 h-8" />
              Studio Staff
            </h1>
            <p className="text-gray-600 mt-1">Manage staff availability and studio settings</p>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900"
          >
            <Edit2 className="w-4 h-4" />
            Settings
          </button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mb-6 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Studio Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cancelation Policy (hours before session)
                </label>
                <input
                  type="number"
                  value={cancelationHours}
                  onChange={(e) => setCancelationHours(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="168"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Clients can get a full refund if they cancel before this time window
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Follow-up Reminder (days after last contact)
                </label>
                <input
                  type="number"
                  value={followUpDays}
                  onChange={(e) => setFollowUpDays(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="90"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Staff gets reminded to contact clients after this many days
                </p>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <button
                onClick={handleSaveSettings}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Settings
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-md">
            <div className="text-sm text-gray-500">Total Staff</div>
            <div className="text-3xl font-bold text-gray-800">{staff.length}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-xl shadow-md border border-green-200">
            <div className="flex items-center gap-2 text-sm text-green-700">
              <UserCheck className="w-4 h-4" />
              Available Now
            </div>
            <div className="text-3xl font-bold text-green-800">{availableCount}</div>
          </div>
          <div className="bg-red-50 p-4 rounded-xl shadow-md border border-red-200">
            <div className="flex items-center gap-2 text-sm text-red-700">
              <UserX className="w-4 h-4" />
              Unavailable
            </div>
            <div className="text-3xl font-bold text-red-800">{staff.length - availableCount}</div>
          </div>
        </div>

        {/* Follow-up Reminders */}
        {clientsNeedingFollowUp.length > 0 && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <h3 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Clients Needing Follow-up ({clientsNeedingFollowUp.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {clientsNeedingFollowUp.map(client => (
                <div key={client.id} className="bg-white p-3 rounded-lg border border-yellow-200">
                  <div className="font-medium text-gray-800">{client.name}</div>
                  <div className="text-sm text-gray-600">{client.cellphone}</div>
                  {client.lastContactedAt && (
                    <div className="text-xs text-yellow-600 mt-1">
                      Last contacted: {new Date(client.lastContactedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Staff List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-800">Staff Members</h2>
          </div>
          
          <div className="divide-y divide-gray-100">
            {staff.map((member) => (
              <div key={member.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    member.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{member.name}</h3>
                    <p className="text-sm text-gray-600">{member.role}</p>
                  </div>
                </div>
                
                <button
                  onClick={() => updateStaffAvailability(member.id, !member.available)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    member.available
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  }`}
                >
                  {member.available ? '✓ Available' : '✗ Unavailable'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Current Settings Display */}
        <div className="mt-6 bg-white p-4 rounded-xl shadow-md">
          <h3 className="font-semibold text-gray-800 mb-2">Current Studio Policies</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span><strong>Cancelation with refund:</strong> Up to {settings.cancelationPolicyHours} hours before session</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span><strong>Client follow-up reminder:</strong> Every {settings.followUpReminderDays} days</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Staff;
