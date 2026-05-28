import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  mockClients, 
  mockStaff, 
  mockEquipment, 
  mockSessions, 
  mockSettings 
} from '../data/mockData';

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [clients, setClients] = useState(mockClients);
  const [staff, setStaff] = useState(mockStaff);
  const [equipment, setEquipment] = useState(mockEquipment);
  const [sessions, setSessions] = useState(mockSessions);
  const [settings, setSettings] = useState(mockSettings);
  const [selectedClient, setSelectedClient] = useState(null);

  // Add or update a session
  const addSession = (sessionData) => {
    // Check daily capacity
    const sessionsOnDate = sessions.filter(s => {
      const sessionDate = new Date(s.dateTime).toISOString().split('T')[0];
      const newDate = new Date(sessionData.dateTime).toISOString().split('T')[0];
      return sessionDate === newDate && s.status !== 'cancelled';
    });

    if (sessionsOnDate.length >= settings.dailyCapacity) {
      alert(`Error: Daily capacity reached! Maximum ${settings.dailyCapacity} clients allowed per day.`);
      return null;
    }

    const newSession = {
      id: `sess${Date.now()}`,
      ...sessionData,
      originalDateTime: sessionData.dateTime,
      rescheduleHistory: [],
      status: 'scheduled',
      attended: null,
      communicated: null,
      cancelationDeadline: new Date(sessionData.dateTime.getTime() + settings.cancelationPolicyHours * 60 * 60 * 1000),
      refundEligible: true,
      notes: ''
    };
    setSessions([...sessions, newSession]);
    return newSession;
  };

  // Reschedule a session
  const rescheduleSession = (sessionId, newDateTime, reason = '') => {
    // Check capacity for new date
    const sessionsOnNewDate = sessions.filter(s => {
      const sessionDate = new Date(s.dateTime).toISOString().split('T')[0];
      const targetDate = new Date(newDateTime).toISOString().split('T')[0];
      return sessionDate === targetDate && s.status !== 'cancelled' && s.id !== sessionId;
    });

    if (sessionsOnNewDate.length >= settings.dailyCapacity) {
      alert(`Cannot reschedule: Daily capacity for ${new Date(newDateTime).toLocaleDateString()} is full (${settings.dailyCapacity} clients max).`);
      return false;
    }

    setSessions(sessions.map(session => {
      if (session.id === sessionId) {
        return {
          ...session,
          dateTime: newDateTime,
          rescheduleHistory: [
            ...session.rescheduleHistory,
            { from: session.dateTime, to: newDateTime, reason }
          ]
        };
      }
      return session;
    }));
    return true;
  };

  // Cancel a session
  const cancelSession = (sessionId) => {
    setSessions(sessions.map(session => {
      if (session.id === sessionId) {
        const now = new Date();
        const refundEligible = now <= session.cancelationDeadline;
        return {
          ...session,
          status: 'cancelled',
          refundEligible
        };
      }
      return session;
    }));
  };

  // Mark attendance
  const markAttendance = (sessionId, attended, communicated = false) => {
    setSessions(sessions.map(session => {
      if (session.id === sessionId) {
        return {
          ...session,
          attended,
          communicated: attended ? communicated : session.communicated
        };
      }
      return session;
    }));
  };

  // Update communication status
  const updateCommunication = (sessionId, communicated) => {
    setSessions(sessions.map(session => {
      if (session.id === sessionId) {
        return { ...session, communicated };
      }
      return session;
    }));
  };

  // Add complaint to client
  const addComplaint = (clientId, complaintData) => {
    setClients(clients.map(client => {
      if (client.id === clientId) {
        return {
          ...client,
          complaints: [
            ...client.complaints,
            {
              id: `c${Date.now()}`,
              reportedAt: new Date(),
              solved: false,
              ...complaintData
            }
          ]
        };
      }
      return client;
    }));
  };

  // Resolve complaint
  const resolveComplaint = (clientId, complaintId, resolution, resolutionTime) => {
    setClients(clients.map(client => {
      if (client.id === clientId) {
        return {
          ...client,
          complaints: client.complaints.map(complaint => {
            if (complaint.id === complaintId) {
              return {
                ...complaint,
                solved: true,
                solvedAt: new Date(),
                resolution,
                resolutionTime
              };
            }
            return complaint;
          })
        };
      }
      return client;
    }));
  };

  // Update equipment status
  const updateEquipment = (equipmentId, updates) => {
    setEquipment(equipment.map(eq => {
      if (eq.id === equipmentId) {
        return { ...eq, ...updates };
      }
      return eq;
    }));
  };

  // Update staff availability
  const updateStaffAvailability = (staffId, available) => {
    setStaff(staff.map(s => {
      if (s.id === staffId) {
        return { ...s, available };
      }
      return s;
    }));
  };

  // Update settings
  const updateSettings = (newSettings) => {
    setSettings({ ...settings, ...newSettings });
  };

  // Get clients needing follow-up
  const getClientsNeedingFollowUp = () => {
    const followUpDate = new Date();
    followUpDate.setDate(followUpDate.getDate() - settings.followUpReminderDays);
    
    return clients.filter(client => {
      if (!client.lastContactedAt) return true;
      return new Date(client.lastContactedAt) < followUpDate;
    });
  };

  // Find client by phone (for reuse)
  const findClientByPhone = (cellphone) => {
    return clients.find(client => client.cellphone === cellphone);
  };

  const value = {
    clients,
    staff,
    equipment,
    sessions,
    settings,
    selectedClient,
    setSelectedClient,
    addSession,
    rescheduleSession,
    cancelSession,
    markAttendance,
    updateCommunication,
    addComplaint,
    resolveComplaint,
    updateEquipment,
    updateStaffAvailability,
    updateSettings,
    getClientsNeedingFollowUp,
    findClientByPhone
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
