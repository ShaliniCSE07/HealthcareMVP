import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, PatientProfile, HealthMetrics, RiskAlert, UserRole, Appointment, Medication } from '../types';
import { MockBackend } from './mockBackend';
import { BackendAPI } from './apiClient';

interface HealthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  vitals: HealthMetrics[];
  alerts: RiskAlert[];
  appointments: Appointment[];
  medications: Medication[];
  isLoading: boolean;
  refreshData: () => void;
  addAlert: (alert: RiskAlert) => void;
  clearAlerts: () => void;
  removeAlert: (id: string | number) => void;
}

const HealthContext = createContext<HealthContextType | undefined>(undefined);

export const HealthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [vitals, setVitals] = useState<HealthMetrics[]>([]);
  const [alerts, setAlerts] = useState<RiskAlert[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAllData = async (userId: string, role: UserRole) => {
    try {
      if (role === UserRole.PATIENT) {
        const [v, a, appt, med] = await Promise.all([
          BackendAPI.getMyMetrics().catch(() => []),
          BackendAPI.getAlerts().catch(() => []),
          BackendAPI.getAppointments().catch(() => []),
          BackendAPI.getMedicationOrders({ active: 'true' }).catch(() => [])
        ]);
        setVitals(v);
        setAlerts(a as any);
        setAppointments(appt);
        setMedications(med);
      } else if (role === UserRole.DOCTOR) {
        const [a, appt, pats] = await Promise.all([
          BackendAPI.getAlerts().catch(() => []),
          BackendAPI.getAppointments().catch(() => []),
          BackendAPI.getAssignedPatients().catch(() => [])
        ]);
        setAlerts(a as any);
        setAppointments(appt);
        // Patients list could be added to context if needed
      }
    } catch (error) {
      console.error("Failed to fetch health data:", error);
    }
  };

  // Sync data periodically and on backend changes
  useEffect(() => {
    if (user) {
      fetchAllData(user.id, user.role);
      
      // Subscribe to real-time updates from BackendAPI via Socket.io
      const unsubAppt = BackendAPI.onAppointmentUpdated(() => refreshData());
      const unsubApptCreated = BackendAPI.onAppointmentCreated(() => refreshData());

      const interval = setInterval(() => fetchAllData(user.id, user.role), 30000); // Poll less frequently
      return () => {
        unsubAppt();
        unsubApptCreated();
        clearInterval(interval);
      };
    }
  }, [user]);

  const refreshData = () => {
    if (user) {
      fetchAllData(user.id, user.role);
    }
  };

  const addAlert = (alert: RiskAlert) => {
    setAlerts(prev => [alert, ...prev]);
  };

  const clearAlerts = async () => {
    try {
      await BackendAPI.markAllAlertsRead();
      setAlerts([]);
    } catch (e) {
      console.error("Failed to clear alerts in backend:", e);
    }
  };

  const removeAlert = async (id: string | number) => {
    try {
      await BackendAPI.dismissAlert(id);
      setAlerts(prev => prev.filter(a => a.id !== id));
    } catch (e) {
      console.error("Failed to dismiss alert in backend:", e);
    }
  };

  useEffect(() => {
    const initSession = async () => {
      try {
        const currentUser = await BackendAPI.getCurrentUser();
        if (currentUser) {
          setUser(currentUser as any);
        }
      } catch (err) {
        console.log("No valid session found");
      } finally {
        setIsLoading(false);
      }
    };
    
    initSession();
  }, []);

  return (
    <HealthContext.Provider value={{
      user,
      setUser,
      vitals,
      alerts,
      appointments,
      medications,
      isLoading,
      refreshData,
      addAlert,
      clearAlerts,
      removeAlert
    }}>
      {children}
    </HealthContext.Provider>
  );
};

export const useHealth = () => {
  const context = useContext(HealthContext);
  if (context === undefined) {
    throw new Error('useHealth must be used within a HealthProvider');
  }
  return context;
};
