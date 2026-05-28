import { addDays, addHours } from 'date-fns';

const now = new Date();

export const mockClients = [
  {
    id: '1',
    name: 'Maria Garcia',
    cellphone: '+1234567890',
    age: 32,
    specialNeeds: 'None',
    createdAt: new Date('2024-01-15'),
    lastContactedAt: new Date('2024-03-01'),
    complaints: []
  },
  {
    id: '2',
    name: 'John Smith',
    cellphone: '+1987654321',
    age: 28,
    specialNeeds: 'Wheelchair accessible',
    createdAt: new Date('2024-02-20'),
    lastContactedAt: new Date('2024-03-10'),
    complaints: [
      {
        id: 'c1',
        description: 'Equipment was not ready',
        reportedAt: new Date('2024-02-25'),
        solved: true,
        solvedAt: new Date('2024-02-26'),
        resolutionTime: '1 day',
        resolution: 'Provided alternative equipment and discount on next session'
      }
    ]
  },
  {
    id: '3',
    name: 'Ana Rodriguez',
    cellphone: '+1122334455',
    age: 45,
    specialNeeds: 'Requires faja',
    createdAt: new Date('2024-03-01'),
    lastContactedAt: new Date('2024-03-15'),
    complaints: []
  }
];

export const mockStaff = [
  { id: 's1', name: 'Carlos Mendez', role: 'Manager', available: true },
  { id: 's2', name: 'Laura Perez', role: 'Instructor', available: true },
  { id: 's3', name: 'Miguel Torres', role: 'Instructor', available: false },
  { id: 's4', name: 'Sofia Ramirez', role: 'Receptionist', available: true }
];

export const mockEquipment = [
  { id: 'e1', name: 'Yoga Mat', total: 20, available: 15, inReparation: 2, status: 'available' },
  { id: 'e2', name: 'Resistance Bands', total: 30, available: 28, inReparation: 0, status: 'available' },
  { id: 'e3', name: 'Exercise Ball', total: 15, available: 10, inReparation: 3, status: 'available' },
  { id: 'e4', name: 'Faja (Compression Belt)', total: 10, available: 5, inReparation: 1, status: 'available' },
  { id: 'e5', name: 'Towel Set', total: 50, available: 30, inReparation: 5, status: 'available' },
  { id: 'e6', name: 'Water Bottle', total: 40, available: 35, inReparation: 0, status: 'available' },
  { id: 'e7', name: 'Foam Roller', total: 12, available: 0, inReparation: 8, status: 'reparation' }
];

export const mockSessions = [
  {
    id: 'sess1',
    clientId: '1',
    clientName: 'Maria Garcia',
    clientCellphone: '+1234567890',
    clientAge: 32,
    specialNeeds: 'None',
    dateTime: addHours(now, 2),
    originalDateTime: addHours(now, 2),
    rescheduleHistory: [],
    needs: { towel: true, faja: false, water: true, bringOwn: false },
    status: 'scheduled',
    attended: null,
    communicated: null,
    cancelationDeadline: addHours(now, 26),
    refundEligible: true,
    notes: ''
  },
  {
    id: 'sess2',
    clientId: '2',
    clientName: 'John Smith',
    clientCellphone: '+1987654321',
    clientAge: 28,
    specialNeeds: 'Wheelchair accessible',
    dateTime: addDays(now, 1),
    originalDateTime: addDays(now, -1),
    rescheduleHistory: [
      { from: addDays(now, -1), to: addDays(now, 1), reason: 'Client request' }
    ],
    needs: { towel: false, faja: false, water: true, bringOwn: true },
    status: 'scheduled',
    attended: null,
    communicated: null,
    cancelationDeadline: addDays(now, 2),
    refundEligible: true,
    notes: ''
  },
  {
    id: 'sess3',
    clientId: '3',
    clientName: 'Ana Rodriguez',
    clientCellphone: '+1122334455',
    clientAge: 45,
    specialNeeds: 'Requires faja',
    dateTime: addDays(now, -2),
    originalDateTime: addDays(now, -2),
    rescheduleHistory: [],
    needs: { towel: true, faja: true, water: false, bringOwn: false },
    status: 'completed',
    attended: true,
    communicated: true,
    cancelationDeadline: addDays(now, -1),
    refundEligible: false,
    notes: 'Great session!'
  }
];

export const mockSettings = {
  cancelationPolicyHours: 24,
  followUpReminderDays: 7,
  dailyCapacity: 8 // Max clients per day
};
