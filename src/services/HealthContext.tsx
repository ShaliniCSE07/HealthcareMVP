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
          MockBackend.getPatientHistory(userId),
          BackendAPI.getAlerts().catch(() => []),
          MockBackend.getAppointments(userId, UserRole.PATIENT),
          MockBackend.getMedications(userId)
        ]);
        setVitals(v);
        setAlerts(a as any);
        setAppointments(appt);
        setMedications(med);
      } else if (role === UserRole.DOCTOR) {
        const [a, appt, pats] = await Promise.all([
          BackendAPI.getAlerts().catch(() => []),
          MockBackend.getAppointments(userId, UserRole.DOCTOR),
          MockBackend.getAssignedPatients(userId)
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
      
      // Subscribe to real-time updates from MockBackend
      const unsubscribe = MockBackend.subscribe(() => {
        fetchAllData(user.id, user.role);
      });

      const interval = setInterval(() => fetchAllData(user.id, user.role), 10000); // Poll less frequently if subscribed
      return () => {
        unsubscribe();
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
    setIsLoading(false);
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
