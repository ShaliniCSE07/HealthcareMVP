import React, { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Activity, Droplets, Brain, ArrowUpRight, Calendar, Pill, FileText } from "lucide-react";
import { AppLayout } from "@/components/carex/AppLayout";
import { GlassCard } from "@/components/carex/GlassCard";
import { VitalCard } from "@/components/carex/VitalCard";
import { RiskBadge } from "@/components/carex/RiskBadge";
import { NeonButton } from "@/components/carex/NeonButton";
import { useHealth } from "@/services/HealthContext";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar
} from "recharts";
import { Link, useNavigate } from "react-router-dom";

const sparkData = (vitals: any[], key: string) =>
  vitals.slice(-12).map(v => ({ v: v[key] }));

const PatientDashboard = () => {
  const { user, vitals, alerts, appointments } = useHealth();
  const navigate = useNavigate();
  
  // Get latest values
  const current = vitals[vitals.length - 1] || { systolicBP: 120, diastolicBP: 80, glucose: 95, heartRate: 72 };

  const trendData = vitals.slice(-24).map(v => ({
    hour: new Date(v.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    hr: v.heartRate || 72,
    bp: v.systolicBP || 120,
  }));

  const adherenceData = [
    { day: "Mon", v: 90 },
    { day: "Tue", v: 100 },
    { day: "Wed", v: 85 },
    { day: "Thu", v: 100 },
    { day: "Fri", v: 95 },
    { day: "Sat", v: 100 },
    { day: "Sun", v: 100 },
  ];

  const upcomingAppointments = appointments
    .filter(a => a.status === 'SCHEDULED' || a.status === 'PENDING')
    .slice(0, 2)
    .map(a => ({
      day: new Date(a.date).toLocaleDateString([], { month: 'short', day: 'numeric' }),
      time: a.time,
      title: `${a.type} · ${a.doctorName}`,
      type: a.consultationType === 'VIDEO' ? 'Video' : 'In-person'
    }));

  const activities = alerts.slice(0, 5).map(a => ({
    time: new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    text: a.message,
    type: a.severity === 'CRITICAL' ? 'warning' : 'success'
  }));

  return (
    <AppLayout title={`Welcome back, ${user?.name || 'Sarah'}`} subtitle="Here's your health snapshot for today">
      {/* Top row: vitals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <VitalCard label="Heart Rate" value={current.heartRate || 72} unit="bpm" icon={Heart} color="destructive" data={sparkData(vitals, 'heartRate')} trend={2} />
        <VitalCard label="Blood Pressure" value={current.systolicBP || 120} unit={`/${current.diastolicBP || 80} mmHg`} icon={Activity} color="primary" data={sparkData(vitals, 'systolicBP')} trend={-1} />
        <VitalCard label="Glucose" value={current.glucose || 98} unit="mg/dL" icon={Droplets} color="success" data={sparkData(vitals, 'glucose')} trend={3} />
        <VitalCard label="AI Wellness" value={94} unit="/100" icon={Brain} color="secondary" data={sparkData(vitals, 'heartRate')} trend={5} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend chart */}
        <GlassCard className="lg:col-span-2 p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="font-display text-xl font-semibold">24-Hour Vitals Trend</h2>
              <p className="text-sm text-muted-foreground">Continuous monitoring · live</p>
            </div>
            <RiskBadge level="low" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height={256} minWidth={0} debounce={50}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="hrGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="bpGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--secondary))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 12,
                    boxShadow: "var(--glow-primary)",
                  }}
                />
                <Area type="monotone" dataKey="hr" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#hrGrad)" />
                <Area type="monotone" dataKey="bp" stroke="hsl(var(--secondary))" strokeWidth={2} fill="url(#bpGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* AI Insight */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-9 w-9 rounded-lg bg-gradient-aurora flex items-center justify-center shadow-glow">
              <Brain className="h-4 w-4 text-primary-foreground" />
            </div>
            <h3 className="font-display font-semibold">AI Insight</h3>
          </div>
          <p className="text-sm text-foreground leading-relaxed">
            Your sleep-adjusted recovery is <span className="text-primary font-semibold">+12%</span> this week.
            Heart rate variability suggests good cardiovascular fitness. Keep current routine.
          </p>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Recovery</span>
              <span className="font-mono text-success">87%</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <motion.div
                initial={{ width: 0 }} animate={{ width: "87%" }} transition={{ duration: 1.2, ease: "easeOut" }}
                className="h-full bg-gradient-primary shadow-glow"
              />
            </div>
          </div>
          <Link to="/insights">
            <NeonButton variant="neon" size="sm" className="w-full mt-5" asChild>
              <span>View Full Report <ArrowUpRight className="h-3.5 w-3.5" /></span>
            </NeonButton>
          </Link>
        </GlassCard>

        {/* Adherence */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold">Medication Adherence</h3>
              <p className="text-xs text-muted-foreground">Past 7 days</p>
            </div>
            <Pill className="h-5 w-5 text-primary" />
          </div>
          <div className="h-40">
            <ResponsiveContainer width="100%" height={160} minWidth={0} debounce={50}>
              <BarChart data={adherenceData}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: "hsl(var(--muted) / 0.3)" }} contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                <Bar dataKey="v" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Appointments */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold">Upcoming</h3>
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-3">
            {upcomingAppointments.length > 0 ? upcomingAppointments.map((a, i) => (
              <div key={i} className="glass rounded-xl p-3 flex items-center gap-3 hover:border-primary/40 transition-colors">
                <div className="text-center px-2">
                  <p className="text-[10px] text-muted-foreground uppercase">{a.day.split(" ")[0]}</p>
                  <p className="font-display font-bold">{a.day.split(" ")[1]}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{a.title}</p>
                  <p className="text-xs text-muted-foreground">{a.time} · {a.type}</p>
                </div>
              </div>
            )) : (
              <p className="text-xs text-muted-foreground text-center py-4">No upcoming appointments</p>
            )}
          </div>
        </GlassCard>

        {/* New: Report Analysis Quick Access */}
        <GlassCard className="p-6 lg:col-span-3 bg-primary/5 border-primary/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-lg">AI Lab Explainer</h3>
                <p className="text-sm text-muted-foreground">Upload reports to translate medical jargon into simple insights.</p>
              </div>
            </div>
            <NeonButton onClick={() => navigate('/reports')}>
              Analyze New Report
            </NeonButton>
          </div>
        </GlassCard>

        {/* Activity */}
        <GlassCard className="p-6 lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold">Activity Feed</h3>
            <span className="flex items-center gap-1.5 text-xs text-success">
              <span className="h-2 w-2 rounded-full bg-success animate-pulse" /> Live
            </span>
          </div>
          <ul className="space-y-3">
            {activities.map((a, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 py-2 border-b border-border/50 last:border-0"
              >
                <span className={`h-2 w-2 rounded-full ${a.type === "warning" ? "bg-warning shadow-[0_0_8px_hsl(var(--warning))]" : a.type === "success" ? "bg-success shadow-[0_0_8px_hsl(var(--success))]" : "bg-primary shadow-[0_0_8px_hsl(var(--primary))]"}`} />
                <span className="flex-1 text-sm">{a.text}</span>
                <span className="text-xs text-muted-foreground font-mono">{a.time}</span>
              </motion.li>
            ))}
          </ul>
        </GlassCard>

        {/* Universal Health Passport (QR) Section */}
        <HealthQRSection user={user} />
      </div>
    </AppLayout>
  );
};

// --- Sub-component for Health QR ---
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Download, Edit3, Save, X, Phone as PhoneIcon, ShieldAlert as ShieldIcon } from 'lucide-react';
import { BackendAPI } from "@/services/apiClient";
import { toast } from "sonner";

const HealthQRSection = ({ user }: { user: any }) => {
  const [showEdit, setShowEdit] = useState(false);
  const [formData, setFormData] = useState({
    bloodGroup: user?.bloodGroup || '',
    allergies: user?.allergies || '',
    currentCondition: user?.currentCondition || '',
    emergencyContact: user?.emergencyContact || ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const emergencyUrl = `${window.location.origin}/emergency/${user?.id}`;

  const handleDownloadQR = () => {
    const svg = document.getElementById('health-qr-code');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `HealthQR_${user?.name.replace(/\s+/g, '_')}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await BackendAPI.updateEmergencyInfo(formData);
      toast.success("Emergency information updated successfully");
      setShowEdit(false);
      // Update local state if needed (or refresh data)
    } catch (err) {
      toast.error("Failed to update emergency information");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <GlassCard className="p-6 lg:col-span-3 border-primary/20 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
      
      <div className="flex flex-col md:flex-row items-start gap-8 relative z-10">
        {/* QR Display */}
        <div className="flex flex-col items-center gap-4 bg-white p-4 rounded-3xl shadow-glow-primary">
          <div className="p-2 bg-slate-50 rounded-2xl border border-slate-100">
            <QRCodeSVG 
              id="health-qr-code"
              value={emergencyUrl}
              size={180}
              level="H"
              includeMargin={true}
              imageSettings={{
                src: "/favicon.svg",
                x: undefined,
                y: undefined,
                height: 40,
                width: 40,
                excavate: true,
              }}
            />
          </div>
          <div className="text-center">
            <p className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-1">Scan in Emergency</p>
            <p className="text-[10px] text-slate-500 font-mono">{user?.id?.toUpperCase().slice(0, 12)}</p>
          </div>
          <NeonButton variant="outline" size="sm" className="w-full text-slate-900 border-slate-200" onClick={handleDownloadQR}>
            <Download className="h-3.5 w-3.5 mr-2" /> Download
          </NeonButton>
        </div>

        {/* Info & Edit Section */}
        <div className="flex-1 w-full">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <QrCode className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-xl">Universal Health Passport</h3>
                <p className="text-sm text-muted-foreground">Emergency responders can access critical info by scanning.</p>
              </div>
            </div>
            {!showEdit && (
              <button 
                onClick={() => setShowEdit(true)}
                className="p-2 hover:bg-primary/10 rounded-lg text-primary transition-colors"
              >
                <Edit3 className="h-5 w-5" />
              </button>
            )}
          </div>

          {showEdit ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Blood Group</label>
                <input 
                  className="w-full bg-background/50 border border-border rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary outline-none"
                  value={formData.bloodGroup}
                  onChange={e => setFormData({...formData, bloodGroup: e.target.value})}
                  placeholder="e.g. O+, A-"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Emergency Contact (Name:Phone)</label>
                <input 
                  className="w-full bg-background/50 border border-border rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary outline-none"
                  value={formData.emergencyContact}
                  onChange={e => setFormData({...formData, emergencyContact: e.target.value})}
                  placeholder="e.g. John Doe: +1234567890"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Allergies (comma separated)</label>
                <input 
                  className="w-full bg-background/50 border border-border rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary outline-none"
                  value={formData.allergies}
                  onChange={e => setFormData({...formData, allergies: e.target.value})}
                  placeholder="e.g. Peanuts, Penicillin, Latex"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Chronic Conditions</label>
                <textarea 
                  className="w-full bg-background/50 border border-border rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary outline-none h-20 resize-none"
                  value={formData.currentCondition}
                  onChange={e => setFormData({...formData, currentCondition: e.target.value})}
                  placeholder="e.g. Diabetes Type 2, Hypertension"
                />
              </div>
              <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                <NeonButton variant="ghost" size="sm" onClick={() => setShowEdit(false)}>
                  <X className="h-4 w-4 mr-2" /> Cancel
                </NeonButton>
                <NeonButton size="sm" onClick={handleSave} isLoading={isSaving}>
                  <Save className="h-4 w-4 mr-2" /> Save Passport Info
                </NeonButton>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                <div className="flex items-center gap-2 mb-1">
                  <Droplets className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Blood Group</span>
                </div>
                <p className="text-2xl font-black text-primary">{formData.bloodGroup || 'Not Set'}</p>
              </div>
              <div className="p-4 rounded-2xl bg-success/5 border border-success/10">
                <div className="flex items-center gap-2 mb-1">
                  <PhoneIcon className="h-3.5 w-3.5 text-success" />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Emergency Contact</span>
                </div>
                <p className="font-bold text-success truncate">{formData.emergencyContact || 'Not Configured'}</p>
              </div>
              <div className="p-4 rounded-2xl bg-destructive/5 border border-destructive/10 sm:col-span-2">
                <div className="flex items-center gap-2 mb-1">
                  <ShieldIcon className="h-3.5 w-3.5 text-destructive" />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Allergies & Critical Info</span>
                </div>
                <p className="text-sm text-foreground/80 line-clamp-2">
                  {formData.allergies ? `Allergies: ${formData.allergies}` : 'No allergies reported.'}
                  {formData.currentCondition ? ` · ${formData.currentCondition}` : ''}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
};

export default PatientDashboard;
