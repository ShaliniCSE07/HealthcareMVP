import React, { useState } from 'react';
import { AppLayout } from '@/components/carex/AppLayout';
import { GlassCard } from '@/components/carex/GlassCard';
import { NeonButton as Button } from '@/components/carex/NeonButton';
import { Upload, FileText, Activity, AlertCircle, CheckCircle2, BrainCircuit, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface LabBiomarker {
  name: string;
  value: string;
  unit: string;
  range: string;
  status: 'normal' | 'warning' | 'critical';
  explanation: string;
}

interface AnalysisResult {
  title: string;
  date: string;
  overallSummary: string;
  biomarkers: LabBiomarker[];
  recommendations: string[];
}

const ReportAnalysis = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const simulateAnalysis = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    
    // Simulate neural processing delay
    await new Promise(resolve => setTimeout(resolve, 3500));
    
    const mockResult: AnalysisResult = {
      title: "Comprehensive Blood Panel",
      date: new Date().toLocaleDateString(),
      overallSummary: "Your overall profile looks stable, though we've identified 2 biomarkers that are slightly outside the optimal range. This is often related to diet or hydration levels.",
      biomarkers: [
        {
          name: "Glucose (Fasting)",
          value: "105",
          unit: "mg/dL",
          range: "70 - 99",
          status: "warning",
          explanation: "Your blood sugar is slightly higher than the target range. This could be due to a recent meal or stress. It's not critical, but worth monitoring."
        },
        {
          name: "Hemoglobin",
          value: "14.2",
          unit: "g/dL",
          range: "13.5 - 17.5",
          status: "normal",
          explanation: "Your iron levels are excellent, indicating good oxygen transport in your blood."
        },
        {
          name: "HDL Cholesterol",
          value: "38",
          unit: "mg/dL",
          range: "> 40",
          status: "warning",
          explanation: "This is your 'good' cholesterol. It's slightly below the target, which means adding more healthy fats like olive oil or nuts to your diet could help."
        },
        {
          name: "Creatinine",
          value: "0.9",
          unit: "mg/dL",
          range: "0.7 - 1.3",
          status: "normal",
          explanation: "Your kidney function is perfectly within the healthy range."
        }
      ],
      recommendations: [
        "Increase daily water intake to 2.5 Liters.",
        "Consider a 30-minute walk 4 times a week to improve HDL levels.",
        "Discuss these results during your scheduled consultation with Dr. Aris Thorne."
      ]
    };

    setResult(mockResult);
    setIsAnalyzing(false);
    toast.success("Analysis Complete: Neural insights generated.");
  };

  return (
    <AppLayout title="AI Lab Explainer" subtitle="Translate complex medical reports into plain language">
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        
        {/* Upload Section */}
        <section>
          <GlassCard className="p-8">
            <div className="flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center border-2 border-dashed border-primary/30">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Upload Your Lab Report</h3>
                <p className="text-slate-400 text-sm max-w-md">
                  Securely upload your blood test or diagnostic report (PDF/JPG). 
                  Our AI will scan it to explain the results in simple terms.
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <label className="relative group">
                  <input 
                    type="file" 
                    className="hidden" 
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <Button variant="outline" className="pointer-events-none">
                    {file ? file.name : "Select File"}
                  </Button>
                </label>
                
                {file && (
                  <Button 
                    onClick={simulateAnalysis} 
                    isLoading={isAnalyzing}
                    className="bg-primary text-black hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)]"
                  >
                    Start Neural Analysis
                  </Button>
                )}
              </div>
            </div>
          </GlassCard>
        </section>

        <AnimatePresence>
          {isAnalyzing && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center py-12 space-y-6"
            >
              <div className="relative">
                <BrainCircuit className="w-16 h-16 text-primary animate-pulse" />
                <div className="absolute inset-0 w-16 h-16 bg-primary/20 blur-xl rounded-full animate-ping" />
              </div>
              <div className="text-center">
                <h4 className="text-lg font-bold">Reading Biomarkers...</h4>
                <p className="text-slate-400 text-xs uppercase tracking-[0.2em]">Neural Link Processing Active</p>
              </div>
            </motion.div>
          )}

          {result && !isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Overall Summary */}
                <GlassCard className="lg:col-span-2 p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <Activity className="text-primary w-5 h-5" />
                    <h3 className="text-lg font-bold">Medical Snapshot: {result.title}</h3>
                  </div>
                  <p className="text-slate-300 leading-relaxed italic border-l-2 border-primary/40 pl-4 py-1">
                    "{result.overallSummary}"
                  </p>
                  
                  <div className="space-y-4 mt-8">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">Biomarker Analysis</h4>
                    <div className="space-y-4">
                      {result.biomarkers.map((bio, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50 hover:border-primary/30 transition-colors space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-100">{bio.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-mono text-primary">{bio.value}</span>
                              <span className="text-xs text-slate-400">{bio.unit}</span>
                            </div>
                          </div>
                          
                          {/* Status Meter */}
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-[10px] text-slate-500 uppercase font-bold">
                              <span>Low</span>
                              <span>Optimal Range: {bio.range}</span>
                              <span>High</span>
                            </div>
                            <div className="h-2 rounded-full bg-slate-800 overflow-hidden relative">
                              <div 
                                className={`h-full absolute transition-all duration-1000 ${
                                  bio.status === 'normal' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 
                                  bio.status === 'warning' ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]' : 
                                  'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                                }`}
                                style={{ 
                                  width: bio.status === 'normal' ? '50%' : bio.status === 'warning' ? '75%' : '90%',
                                  left: bio.status === 'normal' ? '25%' : bio.status === 'warning' ? '12%' : '5%' 
                                }}
                              />
                            </div>
                          </div>
                          
                          <p className="text-sm text-slate-400 leading-snug">
                            {bio.explanation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </GlassCard>

                {/* Recommendations */}
                <GlassCard className="p-6 space-y-6 bg-primary/5 border-primary/20">
                  <div className="flex items-center gap-3">
                    <BrainCircuit className="text-primary w-5 h-5" />
                    <h3 className="text-lg font-bold">AI Recommendations</h3>
                  </div>
                  <div className="space-y-4">
                    {result.recommendations.map((rec, idx) => (
                      <div key={idx} className="flex gap-3">
                        <div className="mt-1">
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                        </div>
                        <p className="text-sm text-slate-300 leading-tight">{rec}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="pt-6 border-t border-primary/10">
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200">
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      <p className="text-[10px] leading-relaxed italic">
                        This AI explanation is for educational purposes only and does not replace professional medical advice. Always consult your physician for diagnosis.
                      </p>
                    </div>
                  </div>
                </GlassCard>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </AppLayout>
  );
};

export default ReportAnalysis;
