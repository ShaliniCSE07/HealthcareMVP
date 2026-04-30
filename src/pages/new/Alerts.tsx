import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Bell, CheckCircle2, Info, X } from "lucide-react";
import { AppLayout } from "@/components/carex/AppLayout";
import { GlassCard } from "@/components/carex/GlassCard";
import { NeonButton } from "@/components/carex/NeonButton";
import { useHealth } from "@/services/HealthContext";

const config = {
  critical: { ring: "border-destructive/40", bg: "bg-destructive/10", icon: "text-destructive", glow: "shadow-glow-destructive" },
  warning: { ring: "border-warning/40", bg: "bg-warning/10", icon: "text-warning", glow: "" },
  info: { ring: "border-primary/30", bg: "bg-primary/10", icon: "text-primary", glow: "" },
  success: { ring: "border-success/40", bg: "bg-success/10", icon: "text-success", glow: "shadow-glow-success" },
};

const Alerts = () => {
  const { alerts, clearAlerts, removeAlert } = useHealth();
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("All");
  
  const mappedAlerts = alerts.length > 0 ? alerts.map((a) => {
    let severity: 'critical' | 'warning' | 'info' | 'success' = 'info';
    let title = 'Health Update';
    let icon = Bell;

    if (a.severity === 'CRITICAL') {
      severity = 'critical';
      title = 'Critical Risk Alert';
      icon = AlertTriangle;
    } else if (a.severity === 'HIGH') {
      severity = 'warning';
      title = 'High Priority Alert';
      icon = AlertTriangle;
    } else if (a.severity === 'MEDIUM') {
      severity = 'info';
      title = 'Standard Update';
      icon = Info;
    } else {
      severity = 'success';
      title = 'Condition Stable';
      icon = CheckCircle2;
    }

    return {
      id: a.id,
      severity,
      icon,
      title,
      desc: a.message,
      time: new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  }) : [];

  const displayAlerts = mappedAlerts.filter(a => {
    if (activeTab === "All") return true;
    if (activeTab === "Critical") return a.severity === "critical";
    if (activeTab === "Warnings") return a.severity === "warning";
    if (activeTab === "Info") return a.severity === "info" || a.severity === "success";
    return true;
  });

  return (
    <AppLayout title="Alerts & Notifications" subtitle="Prioritized by AI severity scoring">
      <div className="flex items-center gap-2 mb-6">
        {["All", "Critical", "Warnings", "Info"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`glass rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
              activeTab === tab ? "bg-gradient-primary text-primary-foreground shadow-glow border-0" : "hover:border-primary/40"
            }`}
          >
            {tab}
          </button>
        ))}
        <NeonButton variant="ghost" size="sm" className="ml-auto" onClick={clearAlerts}>Mark all read</NeonButton>
      </div>

      <div className="space-y-3">
        {displayAlerts.length > 0 ? (
          displayAlerts.map((a, i) => {
            const c = config[a.severity as keyof typeof config];
            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
              >
                <GlassCard className={`p-5 border ${c.ring}`}>
                  <div className="flex items-start gap-4">
                    <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${c.bg} ${c.glow}`}>
                      <a.icon className={`h-5 w-5 ${c.icon}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <h3 className="font-semibold">{a.title}</h3>
                        <span className="text-xs text-muted-foreground font-mono">{a.time}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{a.desc}</p>
                      <div className="flex gap-2 mt-3">
                        <NeonButton 
                          size="sm" 
                          variant="neon" 
                          onClick={() => setSelectedAlert(selectedAlert === a.id ? null : a.id)}
                        >
                          {selectedAlert === a.id ? 'Hide Details' : 'View Details'}
                        </NeonButton>
                        <NeonButton 
                          size="sm" 
                          variant="ghost"
                          onClick={() => removeAlert(a.id)}
                        >
                          Dismiss
                        </NeonButton>
                      </div>
                      
                      <AnimatePresence>
                        {selectedAlert === a.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-4 pt-4 border-t border-border/50 overflow-hidden"
                          >
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 rounded-lg glass bg-white/5">
                                  <p className="text-[10px] text-muted-foreground uppercase mb-1">Source</p>
                                  <p className="text-xs font-medium">AI Diagnostic Engine v2.4</p>
                                </div>
                                <div className="p-3 rounded-lg glass bg-white/5">
                                  <p className="text-[10px] text-muted-foreground uppercase mb-1">Confidence</p>
                                  <p className="text-xs font-medium text-success">98.2% Accurate</p>
                                </div>
                              </div>
                              <div>
                                <p className="text-xs font-semibold mb-2">Recommended Action</p>
                                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                                  <p className="text-xs leading-relaxed italic text-primary">
                                    "Our neural network recommends scheduling a follow-up consultation within 24 hours to discuss these metrics in detail with your primary physician."
                                  </p>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <button 
                      onClick={() => removeAlert(a.id)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="h-20 w-20 rounded-full bg-success/10 flex items-center justify-center mb-6 shadow-glow-success">
              <CheckCircle2 className="h-10 w-10 text-success" />
            </div>
            <h3 className="text-xl font-semibold mb-2">All Clear!</h3>
            <p className="text-muted-foreground max-w-xs mx-auto">
              {activeTab === "All" 
                ? "You have no active alerts or notifications at this time." 
                : `There are currently no ${activeTab.toLowerCase()} to display.`}
            </p>
            <NeonButton 
              variant="outline" 
              size="sm" 
              className="mt-6"
              onClick={() => setActiveTab("All")}
            >
              Back to all alerts
            </NeonButton>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
};

export default Alerts;
