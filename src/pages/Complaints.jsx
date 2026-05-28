import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Clock, Plus, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { useAppContext } from '../context/AppContext';

const Complaints = () => {
  const { clients, addComplaint, resolveComplaint } = useAppContext();
  const [selectedClient, setSelectedClient] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newComplaint, setNewComplaint] = useState({ description: '' });
  const [resolutionData, setResolutionData] = useState({ resolution: '', resolutionTime: '' });

  const allComplaints = clients.flatMap(client => 
    client.complaints.map(complaint => ({ ...complaint, client }))
  );

  const unsolvedComplaints = allComplaints.filter(c => !c.solved);
  const solvedComplaints = allComplaints.filter(c => c.solved);

  const handleAddComplaint = (e) => {
    e.preventDefault();
    if (!newComplaint.description.trim()) return;
    
    addComplaint(selectedClient.id, {
      description: newComplaint.description
    });
    
    setNewComplaint({ description: '' });
    setShowAddForm(false);
    setSelectedClient(null);
  };

  const handleResolveComplaint = (client, complaint) => {
    if (!resolutionData.resolution.trim() || !resolutionData.resolutionTime.trim()) return;
    
    resolveComplaint(client.id, complaint.id, resolutionData.resolution, resolutionData.resolutionTime);
    setResolutionData({ resolution: '', resolutionTime: '' });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <AlertTriangle className="w-8 h-8" />
            User Complaints
          </h1>
          <p className="text-gray-600 mt-1">Track and manage client complaints</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-md">
            <div className="text-sm text-gray-500">Total Complaints</div>
            <div className="text-3xl font-bold text-gray-800">{allComplaints.length}</div>
          </div>
          <div className="bg-red-50 p-4 rounded-xl shadow-md border border-red-200">
            <div className="flex items-center gap-2 text-sm text-red-700">
              <AlertTriangle className="w-4 h-4" />
              Unsolved
            </div>
            <div className="text-3xl font-bold text-red-800">{unsolvedComplaints.length}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-xl shadow-md border border-green-200">
            <div className="flex items-center gap-2 text-sm text-green-700">
              <CheckCircle className="w-4 h-4" />
              Solved
            </div>
            <div className="text-3xl font-bold text-green-800">{solvedComplaints.length}</div>
          </div>
        </div>

        {/* Add Complaint Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <Plus className="w-4 h-4" />
            Log New Complaint
          </button>
        </div>

        {/* Add Complaint Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4">Log New Complaint</h2>
                
                {!selectedClient ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Client
                    </label>
                    <select
                      onChange={(e) => {
                        const client = clients.find(c => c.id === e.target.value);
                        setSelectedClient(client);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Choose a client...</option>
                      {clients.map(client => (
                        <option key={client.id} value={client.id}>
                          {client.name} - {client.cellphone}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <form onSubmit={handleAddComplaint} className="space-y-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Client:</strong> {selectedClient.name}
                      </p>
                      <p className="text-xs text-blue-600">{selectedClient.cellphone}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Complaint Description *
                      </label>
                      <textarea
                        value={newComplaint.description}
                        onChange={(e) => setNewComplaint({ ...newComplaint, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        rows="4"
                        placeholder="Describe the complaint in detail..."
                        required
                      />
                    </div>
                    
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddForm(false);
                          setSelectedClient(null);
                        }}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Submit Complaint
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Unsolved Complaints */}
        {unsolvedComplaints.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-5 h-5" />
              Unsolved Complaints
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {unsolvedComplaints.map((complaint) => (
                <div key={complaint.id} className="bg-white p-4 rounded-xl shadow-md border-l-4 border-red-500">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-800">{complaint.client.name}</h3>
                      <p className="text-sm text-gray-600">{complaint.client.cellphone}</p>
                    </div>
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                      Unsolved
                    </span>
                  </div>
                  
                  <p className="text-gray-700 mb-2">{complaint.description}</p>
                  
                  <div className="text-xs text-gray-500 mb-3">
                    Reported: {format(new Date(complaint.reportedAt), 'MMM d, yyyy h:mm a')}
                  </div>
                  
                  {/* Resolution Form */}
                  <div className="border-t pt-3">
                    <input
                      type="text"
                      placeholder="Resolution time (e.g., 2 hours, 1 day)"
                      value={resolutionData.resolutionTime}
                      onChange={(e) => setResolutionData({ ...resolutionData, resolutionTime: e.target.value })}
                      className="w-full px-2 py-1 text-sm border rounded mb-2"
                    />
                    <textarea
                      placeholder="How was it resolved?"
                      value={resolutionData.resolution}
                      onChange={(e) => setResolutionData({ ...resolutionData, resolution: e.target.value })}
                      className="w-full px-2 py-1 text-sm border rounded mb-2"
                      rows="2"
                    />
                    <button
                      onClick={() => handleResolveComplaint(complaint.client, complaint)}
                      className="w-full px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                    >
                      Mark as Solved
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Solved Complaints */}
        {solvedComplaints.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              Solved Complaints
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {solvedComplaints.map((complaint) => (
                <div key={complaint.id} className="bg-white p-4 rounded-xl shadow-md border-l-4 border-green-500 opacity-75">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-800">{complaint.client.name}</h3>
                      <p className="text-sm text-gray-600">{complaint.client.cellphone}</p>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                      Solved
                    </span>
                  </div>
                  
                  <p className="text-gray-700 mb-2">{complaint.description}</p>
                  
                  <div className="bg-green-50 p-3 rounded-lg text-sm">
                    <div className="flex items-center gap-2 text-green-800 mb-1">
                      <Clock className="w-4 h-4" />
                      <strong>Resolution Time:</strong> {complaint.resolutionTime}
                    </div>
                    <div className="flex items-start gap-2 text-green-700">
                      <MessageSquare className="w-4 h-4 mt-0.5" />
                      <div>
                        <strong>Resolution:</strong>
                        <p className="mt-1">{complaint.resolution}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 mt-2">
                    Reported: {format(new Date(complaint.reportedAt), 'MMM d, yyyy')} • 
                    Solved: {format(new Date(complaint.solvedAt), 'MMM d, yyyy')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Complaints */}
        {allComplaints.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600">No Complaints Recorded</h3>
            <p className="text-gray-500 mt-2">Great! No user complaints have been logged yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Complaints;
