import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Search, Menu, Activity, AlertCircle, History, ArrowRight } from "lucide-react";
import { NeonInput } from "./NeonInput";
import { useNavigate } from "react-router-dom";
import { useHealth } from "@/services/HealthContext";
import { GlassCard } from "./GlassCard";

export const TopBar = ({ title, subtitle }: { title: string; subtitle?: string }) => {
  const navigate = useNavigate();
  const { user, alerts, vitals } = useHealth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  const initials = user?.name
    ? user.name.split(" ").map(n => n[0]).join("").toUpperCase()
    : "??";

  // Search Filtering Logic
  const filteredMetrics = searchQuery.length > 1 ? [
    { name: 'Systolic BP', value: vitals[vitals.length-1]?.systolicBP, unit: 'mmHg', path: '/vitals' },
    { name: 'Diastolic BP', value: vitals[vitals.length-1]?.diastolicBP, unit: 'mmHg', path: '/vitals' },
    { name: 'Glucose', value: vitals[vitals.length-1]?.glucose, unit: 'mg/dL', path: '/vitals' },
    { name: 'Heart Rate', value: vitals[vitals.length-1]?.heartRate, unit: 'bpm', path: '/vitals' },
  ].filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase())) : [];

  const filteredHistory = searchQuery.length > 1 ? vitals.filter(v => 
    v.timestamp.includes(searchQuery) || 
    (v.systolicBP && v.systolicBP.toString().includes(searchQuery))
  ).slice(-3).reverse() : [];

  const filteredAlerts = searchQuery.length > 1 ? alerts.filter(a => 
    a.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.severity.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 3) : [];

  const hasResults = filteredMetrics.length > 0 || filteredHistory.length > 0 || filteredAlerts.length > 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 glass-strong border-b border-border/50 px-4 md:px-8 py-4">
      <div className="flex items-center gap-4">
        <button className="md:hidden text-muted-foreground hover:text-foreground">
          <Menu className="h-6 w-6" />
        </button>
        <div className="flex-1 min-w-0">
          <motion.h1
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-xl md:text-2xl font-semibold truncate"
          >
            {title}
          </motion.h1>
          {subtitle && <p className="text-sm text-muted-foreground truncate">{subtitle}</p>}
        </div>

        <div className="hidden md:block w-80 relative" ref={searchRef}>
          <NeonInput 
            icon={<Search className="h-4 w-4" />} 
            placeholder="Search metrics, history..." 
            className="h-10"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
          />
          
          <AnimatePresence>
            {isSearchOpen && searchQuery.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full left-0 right-0 mt-2 p-2 glass-strong rounded-2xl border border-primary/20 shadow-2xl max-h-[400px] overflow-y-auto no-scrollbar"
              >
                {!hasResults ? (
                  <div className="p-8 text-center">
                    <Search className="h-8 w-8 mx-auto text-muted-foreground mb-2 opacity-20" />
                    <p className="text-xs text-muted-foreground">No matches found for "{searchQuery}"</p>
                  </div>
                ) : (
                  <div className="space-y-4 p-2">
                    {/* Metrics Section */}
                    {filteredMetrics.length > 0 && (
                      <div>
                        <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest px-2 mb-2 flex items-center gap-2">
                          <Activity className="h-3 w-3" /> Latest Metrics
                        </h4>
                        <div className="space-y-1">
                          {filteredMetrics.map((m, i) => (
                            <button
                              key={i}
                              onClick={() => { navigate(m.path); setIsSearchOpen(false); }}
                              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-primary/10 transition-colors group"
                            >
                              <span className="text-sm font-medium">{m.name}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-display font-bold text-primary">{m.value} {m.unit}</span>
                                <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Alerts Section */}
                    {filteredAlerts.length > 0 && (
                      <div>
                        <h4 className="text-[10px] font-bold text-destructive uppercase tracking-widest px-2 mb-2 flex items-center gap-2">
                          <AlertCircle className="h-3 w-3" /> Matching Alerts
                        </h4>
                        <div className="space-y-1">
                          {filteredAlerts.map((a, i) => (
                            <button
                              key={i}
                              onClick={() => { navigate('/alerts'); setIsSearchOpen(false); }}
                              className="w-full text-left p-3 rounded-xl hover:bg-destructive/10 transition-colors"
                            >
                              <p className="text-sm font-medium truncate">{a.message}</p>
                              <p className="text-[10px] text-muted-foreground uppercase">{a.severity} · {new Date(a.timestamp).toLocaleDateString()}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* History Section */}
                    {filteredHistory.length > 0 && (
                      <div>
                        <h4 className="text-[10px] font-bold text-success uppercase tracking-widest px-2 mb-2 flex items-center gap-2">
                          <History className="h-3 w-3" /> Historical Logs
                        </h4>
                        <div className="space-y-1">
                          {filteredHistory.map((v, i) => (
                            <button
                              key={i}
                              onClick={() => { navigate('/vitals'); setIsSearchOpen(false); }}
                              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-success/10 transition-colors"
                            >
                              <span className="text-xs text-muted-foreground">{new Date(v.timestamp).toLocaleString()}</span>
                              <span className="text-sm font-mono font-bold">BP: {v.systolicBP}/{v.diastolicBP}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={() => navigate("/alerts")}
          className="relative h-11 w-11 rounded-xl glass hover:border-primary/40 hover:shadow-glow transition-all flex items-center justify-center group"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5 text-foreground group-hover:text-primary transition-colors" />
          {alerts.length > 0 && (
            <motion.span
              className="absolute -top-1 -right-1 h-5 min-w-5 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center shadow-glow-destructive"
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 1.6, repeat: Infinity }}
            >
              {alerts.length}
            </motion.span>
          )}
        </button>

        <div className="h-11 w-11 rounded-xl bg-gradient-aurora flex items-center justify-center font-semibold text-primary-foreground shadow-glow shrink-0">
          {initials}
        </div>
      </div>
    </header>
  );
};
