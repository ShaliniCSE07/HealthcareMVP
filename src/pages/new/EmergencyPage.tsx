import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BackendAPI } from '@/services/apiClient';
import { GlassCard } from '@/components/carex/GlassCard';
import { Loader2, AlertCircle, Phone, Heart, ShieldAlert, User as UserIcon } from 'lucide-react';
import { motion } from 'framer-motion';

const EmergencyPage = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmergencyInfo = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const info = await BackendAPI.getEmergencyInfo(id);
        setData(info);
      } catch (err: any) {
        console.error('Failed to fetch emergency info', err);
        setError('Health Passport data not found or inaccessible.');
      } finally {
        setLoading(false);
      }
    };

    fetchEmergencyInfo();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050A14] flex items-center justify-center p-6">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground animate-pulse">Accessing Secure Health Vault...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#050A14] flex items-center justify-center p-6">
        <GlassCard className="p-8 text-center max-w-md border-destructive/20">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-6" />
          <h2 className="text-2xl font-display font-bold text-white mb-2">Error Accessing Passport</h2>
          <p className="text-muted-foreground mb-8">{error || 'Something went wrong.'}</p>
          <Link to="/" className="inline-flex items-center text-primary hover:underline font-medium">
            Return to Homepage
          </Link>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050A14] text-white p-4 md:p-8 flex flex-col items-center">
      <header className="w-full max-w-2xl mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
            <ShieldAlert className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold tracking-tight">CareXAI Emergency</h1>
            <p className="text-xs text-muted-foreground">Universal Health Passport</p>
          </div>
        </div>
        <div className="px-3 py-1 rounded-full bg-destructive/10 border border-destructive/20 text-destructive text-[10px] font-bold uppercase tracking-widest animate-pulse">
          Emergency Mode
        </div>
      </header>

      <main className="w-full max-w-2xl space-y-6">
        {/* Patient Identity */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <GlassCard className="p-6 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl" />
            <div className="flex items-center gap-6">
              <div className="h-20 w-20 rounded-2xl border-2 border-primary/20 p-1 bg-background/50 relative overflow-hidden group">
                {data.profilePicUrl ? (
                  <img src={data.profilePicUrl} alt={data.name} className="h-full w-full object-cover rounded-xl" />
                ) : (
                  <div className="h-full w-full bg-primary/10 flex items-center justify-center rounded-xl">
                    <UserIcon className="h-10 w-10 text-primary/40" />
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-3xl font-display font-bold text-white leading-tight">{data.name}</h2>
                <p className="text-muted-foreground flex items-center gap-2 mt-1">
                  <span className="h-2 w-2 rounded-full bg-success" /> Verified Patient
                </p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Critical Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Blood Group */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <GlassCard className="p-6 h-full border-primary/20 bg-primary/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Heart className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Blood Group</h3>
              </div>
              <div className="text-5xl font-black text-white">{data.bloodGroup || 'N/A'}</div>
            </GlassCard>
          </motion.div>

          {/* Allergies */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard className="p-6 h-full border-destructive/20 bg-destructive/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 rounded-lg bg-destructive/20 flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                </div>
                <h3 className="text-sm font-bold text-destructive uppercase tracking-wider">Allergies</h3>
              </div>
              <div className="text-xl font-bold text-white">
                {data.allergies ? (
                  <ul className="list-disc list-inside space-y-1">
                    {data.allergies.split(',').map((a: string, i: number) => (
                      <li key={i}>{a.trim()}</li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-muted-foreground italic">None Reported</span>
                )}
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Current Condition */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard className="p-6">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Current Conditions</h3>
            <div className="text-lg font-medium text-white leading-relaxed">
              {data.currentCondition || 'No chronic conditions reported.'}
            </div>
          </GlassCard>
        </motion.div>

        {/* Emergency Contact */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <GlassCard className="p-6 border-success/20 bg-success/5">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-success/20 flex items-center justify-center">
                <Phone className="h-6 w-6 text-success" />
              </div>
              <h3 className="text-lg font-bold text-white">Emergency Contact</h3>
            </div>
            
            {data.emergencyContact ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1 uppercase tracking-tighter">Primary Contact</p>
                  <p className="text-2xl font-bold text-white">{data.emergencyContact.split(':')[0] || 'Unknown'}</p>
                </div>
                <a 
                  href={`tel:${data.emergencyContact.split(':')[1] || ''}`}
                  className="w-full sm:w-auto px-8 py-4 bg-success hover:bg-success/90 text-white rounded-2xl flex items-center justify-center gap-3 font-bold transition-all shadow-lg shadow-success/20"
                >
                  <Phone className="h-5 w-5" />
                  Call Now
                </a>
              </div>
            ) : (
              <p className="text-muted-foreground italic">No emergency contact configured.</p>
            )}
          </GlassCard>
        </motion.div>
      </main>

      <footer className="mt-12 w-full max-w-2xl text-center">
        <p className="text-xs text-muted-foreground mb-2">
          Securely generated by CareXAI Universal Health Ledger
        </p>
        <p className="text-[10px] text-muted-foreground/50 uppercase tracking-widest">
          End-to-End Encrypted Access
        </p>
      </footer>
    </div>
  );
};

export default EmergencyPage;
