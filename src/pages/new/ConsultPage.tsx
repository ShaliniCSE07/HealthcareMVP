import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/carex/AppLayout';
import { VideoCall } from '@/components/features/VideoCall';
import { useHealth } from '@/services/HealthContext';
import { BackendAPI } from '@/services/apiClient';
import { Appointment, UserRole } from '@/types';
import { Loader2, VideoOff, Check } from 'lucide-react';
import { GlassCard } from '@/components/carex/GlassCard';
import { NeonButton } from '@/components/carex/NeonButton';
import { toast } from 'sonner';

const ConsultPage = () => {
  const { user, refreshData } = useHealth();
  const [activeAppointment, setActiveAppointment] = useState<Appointment | null>(null);
  const [showBooking, setShowBooking] = useState(false);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const loadConsultation = async () => {
    setLoading(true);
    try {
      const appts = await BackendAPI.getAppointments();
      const today = new Date().toISOString().split('T')[0];
      
      // Strict filter: must be for today, must be VIDEO, and must NOT be completed/cancelled
      const active = appts.find(a => 
        a.date === today &&
        a.consultationType === 'VIDEO' &&
        (a.status === 'SCHEDULED' || a.status === 'IN_PROGRESS' || a.status === 'PENDING')
      );
      
      if (active) {
        setActiveAppointment(active);
      } else {
        setActiveAppointment(null); // Explicitly clear
        const docs = await BackendAPI.getDoctors();
        setDoctors(docs);
      }
    } catch (err) {
      console.error("Failed to load data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConsultation();
  }, []);

  const handleBookAppointment = async () => {
    if (!selectedDoctor) return;
    setIsBooking(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      await BackendAPI.createAppointment({
        doctorId: selectedDoctor.id,
        date: today,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        type: "General Checkup",
        consultationType: 'VIDEO'
      });
      
      toast.success("Consultation booked successfully!");
      
      // Refresh global state and local consultation data without page reload
      await refreshData();
      await loadConsultation();
      setShowBooking(false);
    } catch (err) {
      toast.error("Booking failed. Please try again.");
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <AppLayout title="Consultation Hub" subtitle="Secure telemedicine channel & neural booking system">
      <div className="min-h-[calc(100vh-200px)] py-6">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : activeAppointment ? (
          <VideoCall
            appointmentId={activeAppointment.id}
            otherUserName={user?.role === UserRole.DOCTOR ? activeAppointment.patientName : activeAppointment.doctorName}
            currentUserRole={user?.role || UserRole.PATIENT}
            onClose={() => navigate('/dashboard')}
          />
        ) : (
          <div className="max-w-4xl mx-auto space-y-8">
            <GlassCard className="p-12 text-center border-dashed">
              <VideoOff className="h-12 w-12 mx-auto mb-4 opacity-20 text-primary" />
              <h3 className="text-xl font-display font-bold mb-2">No Active Consultation</h3>
              <p className="text-muted-foreground text-sm mb-6">
                You don't have any video consultations scheduled for today.
              </p>
              <NeonButton variant="neon" size="lg" onClick={() => setShowBooking(true)}>
                Book New Consultation
              </NeonButton>
            </GlassCard>

            {showBooking && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-display font-bold flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-primary rounded-full shadow-glow" />
                  Select a Verified Specialist
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {doctors.map((doc) => (
                    <GlassCard 
                      key={doc.id} 
                      className={`p-5 cursor-pointer transition-all ${selectedDoctor?.id === doc.id ? 'ring-2 ring-primary shadow-glow bg-primary/5' : 'hover:border-primary/30'}`}
                      onClick={() => setSelectedDoctor(doc)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-full bg-gradient-aurora flex items-center justify-center font-bold text-lg text-white shadow-glow">
                          {doc.name.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        <div>
                          <h4 className="font-bold">{doc.name}</h4>
                          <p className="text-xs text-primary font-medium">{doc.specialization}</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">{doc.experienceYears} Years Exp.</p>
                        </div>
                        {selectedDoctor?.id === doc.id && (
                          <div className="ml-auto h-6 w-6 rounded-full bg-primary flex items-center justify-center text-white">
                            <Check className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    </GlassCard>
                  ))}
                </div>

                {selectedDoctor && (
                  <GlassCard className="p-6 bg-primary/10 border-primary/20">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mb-1">Schedule Confirmation</p>
                        <p className="text-sm">Video Consultation with <span className="font-bold text-primary">{selectedDoctor.name}</span></p>
                      </div>
                      <NeonButton variant="neon" onClick={handleBookAppointment} disabled={isBooking}>
                        {isBooking ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Confirm Booking for Today
                      </NeonButton>
                    </div>
                  </GlassCard>
                )}
              </motion.div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default ConsultPage;
