import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { User, UserRole, PatientProfile, DoctorProfile } from './types';
import { HealthProvider, useHealth } from './services/HealthContext';
import { MainLayout } from './components/common/MainLayout';
import { MockBackend } from './services/mockBackend';
import { BackendAPI, setToken, getToken } from './services/apiClient';
import { AppErrorBoundary } from './components/common/AppErrorBoundary';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'sonner';

// Lazy loaded pages
import LandingPage from './pages/new/Landing';
import Auth from './pages/new/Auth';
const Login = Auth;

// Page Components
const VitalsPage = lazy(() => import('./pages/new/Vitals'));
const InsightsPage = lazy(() => import('./pages/new/Insights'));
const AlertsPage = lazy(() => import('./pages/new/Alerts'));
const ChatPage = lazy(() => import('./pages/new/ChatPage'));
const ConsultPage = lazy(() => import('./pages/new/ConsultPage'));
const PassportPage = lazy(() => import('./pages/new/PassportPage'));
const ReportAnalysisPage = lazy(() => import('./pages/new/ReportAnalysis'));
const EmergencyPage = lazy(() => import('./pages/new/EmergencyPage'));

const SymptomScreening = lazy(() => import('./components/features/SymptomScreening').then((m) => ({ default: m.SymptomScreening })));
const PatientDashboard = lazy(() => import('./pages/new/PatientDashboard'));
const DoctorDashboard = lazy(() => import('./pages/new/DoctorDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then((m) => ({ default: m.AdminDashboard })));
const SplashScreen = lazy(() => import('./components/common/SplashScreen'));

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useHealth();
  const location = useLocation();

  if (isLoading) return <div className="flex h-screen items-center justify-center font-mono text-primary">Initializing Neural Link...</div>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  return <>{children}</>;
};

function AppContent() {
  const { user, setUser, isLoading } = useHealth();
  const [showSplash, setShowSplash] = useState(false);
  const location = useLocation();

  const navigate = useNavigate();

  useEffect(() => {
    // Redundant rehydration removed as HealthContext handles it now
  }, [setUser]);

  useEffect(() => {
    // Background simulation
    const intervalId = setInterval(() => {
      MockBackend.simulatePatientVitals();
    }, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const pageFallback = (
    <div className="flex h-[60vh] items-center justify-center font-mono text-primary animate-pulse">
      Loading Module...
    </div>
  );

  if (showSplash) {
    return (
      <Suspense fallback={null}>
        <SplashScreen onComplete={() => setShowSplash(false)} />
      </Suspense>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={pageFallback}>
        <Routes location={location} key={location.pathname}>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Auth mode="signup" />} />
          <Route path="/emergency/:id" element={<EmergencyPage />} />

          {/* Protected App Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              {user?.role === UserRole.PATIENT ? (
                <PatientDashboard />
              ) : user?.role === UserRole.DOCTOR ? (
                <DoctorDashboard />
              ) : (
                <AdminDashboard />
              )}
            </ProtectedRoute>
          } />

          <Route path="/vitals" element={<ProtectedRoute><VitalsPage /></ProtectedRoute>} />
          <Route path="/insights" element={<ProtectedRoute><InsightsPage /></ProtectedRoute>} />
          <Route path="/alerts" element={<ProtectedRoute><AlertsPage /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
          <Route path="/consult" element={<ProtectedRoute><ConsultPage /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><ReportAnalysisPage /></ProtectedRoute>} />
          <Route path="/passport" element={<ProtectedRoute><PassportPage /></ProtectedRoute>} />

          {/* Redirects */}
          <Route path="*" element={<Navigate to={user ? "/dashboard" : "/"} replace />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" richColors theme="dark" />
      <HealthProvider>
        <AppErrorBoundary>
          <AppContent />
        </AppErrorBoundary>
      </HealthProvider>
    </BrowserRouter>
  );
}

export default App;
