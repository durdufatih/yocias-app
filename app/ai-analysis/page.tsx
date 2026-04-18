"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import Toasts from "../components/Toast";
import { useToast } from "../lib/useToast";

const BIOMARKERS = [
  { name: "HbA1c", value: "6.4", unit: "%", status: "HIGH", statusStyle: "bg-error-container text-on-error-container", ref: "4.0 - 5.6" },
  { name: "Vitamin D, 25-OH", value: "42", unit: "ng/mL", status: "OPTIMAL", statusStyle: "bg-secondary-container text-on-secondary-container", ref: "30 - 100" },
  { name: "TSH", value: "2.15", unit: "uIU/mL", status: "NORMAL", statusStyle: "bg-surface-container-high text-outline", ref: "0.45 - 4.5" },
  { name: "LDL Cholesterol", value: "112", unit: "mg/dL", status: "ELEVATED", statusStyle: "bg-error-container text-on-error-container", ref: "< 100" },
  { name: "Ferritin", value: "28", unit: "ng/mL", status: "LOW", statusStyle: "bg-error-container text-on-error-container", ref: "30 - 300" },
];

export default function AIAnalysisPage() {
  const router = useRouter();
  const { toasts, addToast, remove } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [analysing, setAnalysing] = useState(false);
  const [done, setDone] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showProtocolDetail, setShowProtocolDetail] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!analysing) return;
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setAnalysing(false);
          setDone(true);
          addToast("AI analysis complete — 5 biomarkers extracted.");
          return 100;
        }
        return p + Math.random() * 8 + 2;
      });
    }, 200);
    return () => clearInterval(interval);
  }, [analysing, addToast]);

  const handleFile = (f: File) => {
    setFile(f.name);
    setProgress(0);
    setDone(false);
    setSaved(false);
    setAnalysing(true);
  };

  const handleSave = () => {
    if (!done) return;
    setSaved(true);
    addToast("Results saved to patient record.");
  };

  const handleDiscard = () => {
    router.back();
  };

  const handleApplyProtocol = () => {
    addToast("Mediterranean Anti-Inflammatory Protocol applied.");
    setShowProtocolDetail(false);
  };

  return (
    <div className="bg-surface min-h-screen">
      <Sidebar />
      <main className="pl-64 min-h-screen">
        <TopBar />
        <div className="p-8 max-w-7xl mx-auto">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-outline mb-6" style={{ fontFamily: "Inter, sans-serif" }}>
            <Link href="/dashboard" className="hover:text-primary transition-colors">Clients</Link>
            <span className="material-symbols-outlined text-[12px]">chevron_right</span>
            <span>Eleanor Thorne</span>
            <span className="material-symbols-outlined text-[12px]">chevron_right</span>
            <span className="text-primary font-semibold">Laboratory AI Analysis</span>
          </div>

          {/* Header */}
          <div className="mb-10 flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-extrabold text-on-surface tracking-tight" style={{ fontFamily: "Manrope, sans-serif" }}>AI Data Analysis</h2>
              <p className="text-outline mt-1">Extract biomarkers and trends from laboratory reports.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleDiscard}
                className="px-6 py-2.5 border border-outline-variant text-outline font-bold text-sm rounded-full hover:bg-surface-container-low transition-colors"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                Discard
              </button>
              <button
                onClick={handleSave}
                disabled={!done || saved}
                className="bg-primary text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-primary-container transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                {saved ? (
                  <><span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1", fontSize: "16px" }}>check_circle</span> Saved</>
                ) : "Save Results"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left Panel */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              {/* Upload Zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                  isDragging ? "bg-secondary-container/30 border-secondary/50" : file ? "bg-primary/5 border-primary/30" : "bg-surface-container-low border-outline-variant/30 hover:border-primary/50"
                }`}
              >
                <input ref={fileRef} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                <span className={`material-symbols-outlined mb-3 text-3xl transition-colors ${file ? "text-primary" : "text-outline"}`} style={{ fontVariationSettings: file ? "'FILL' 1" : "'FILL' 0" }}>
                  {file ? "description" : "cloud_upload"}
                </span>
                {file ? (
                  <>
                    <div className="text-sm font-semibold text-primary truncate max-w-full px-2">{file}</div>
                    <p className="text-xs text-outline mt-1">Click to replace</p>
                  </>
                ) : (
                  <>
                    <div className="text-sm font-semibold text-on-surface">Upload Report</div>
                    <p className="text-xs text-outline mt-1">Drag PDF or <span className="text-primary">browse files</span></p>
                  </>
                )}
              </div>

              {/* Progress */}
              <div className="bg-surface-container-lowest rounded-2xl p-6 border border-surface-container">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-on-surface flex items-center gap-2" style={{ fontFamily: "Inter, sans-serif" }}>
                    <span className={`material-symbols-outlined text-sm text-primary ${analysing ? "animate-spin" : ""}`} style={{ animationDuration: "1s" }}>
                      {done ? "check_circle" : "sync"}
                    </span>
                    {done ? "Analysis Complete" : analysing ? "Processing Analysis" : "Waiting for Upload"}
                  </span>
                  <span className="text-xs text-primary font-bold" style={{ fontFamily: "Inter, sans-serif" }}>{Math.round(progress)}%</span>
                </div>
                <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${done ? "bg-primary" : "bg-primary"}`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-outline mt-3 leading-relaxed" style={{ fontFamily: "Inter, sans-serif" }}>
                  {done
                    ? `Parsed 5 biomarkers from ${file ?? "report"}.`
                    : file
                    ? `Parsing biomarkers from ${file}...`
                    : "Upload a PDF or image to begin analysis."}
                </p>
              </div>

              {/* Metadata */}
              {file && (
                <div className="space-y-4 px-1">
                  {[
                    { label: "Lab Source", value: "LabCorp" },
                    { label: "Patient", value: "E. Thorne" },
                    { label: "Report Date", value: "Oct 14, 2023" },
                    { label: "Markers Found", value: done ? "5" : "—" },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between items-center">
                      <span className="text-[11px] text-outline uppercase tracking-wider" style={{ fontFamily: "Inter, sans-serif" }}>{item.label}</span>
                      <span className="text-xs font-semibold text-on-surface">{item.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Panel */}
            <div className="lg:col-span-8">
              <div className={`bg-surface-container-lowest rounded-2xl border border-surface-container shadow-sm overflow-hidden transition-opacity ${!done && file ? "opacity-60" : done ? "opacity-100" : "opacity-40"}`}>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low/50">
                      {["Biomarker", "Value", "Status", "Reference"].map((col) => (
                        <th key={col} className="px-6 py-4 text-[11px] text-outline uppercase tracking-widest font-bold" style={{ fontFamily: "Inter, sans-serif" }}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container">
                    {BIOMARKERS.map((marker) => (
                      <tr key={marker.name} className="hover:bg-surface-container-low/30 transition-colors">
                        <td className="px-6 py-5">
                          <div className="font-bold text-on-surface text-sm" style={{ fontFamily: "Manrope, sans-serif" }}>{marker.name}</div>
                        </td>
                        <td className="px-6 py-5 font-bold text-on-surface text-sm">
                          {marker.value} <span className="text-outline font-normal text-xs">{marker.unit}</span>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`px-2 py-1 text-[10px] font-bold rounded ${marker.statusStyle}`} style={{ fontFamily: "Inter, sans-serif" }}>{marker.status}</span>
                        </td>
                        <td className="px-6 py-5 text-xs text-outline">{marker.ref}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Clinical Insight */}
              <div className="mt-6 p-5 border border-primary/20 bg-primary/5 rounded-2xl flex gap-4">
                <span className="material-symbols-outlined text-primary text-xl flex-shrink-0">lightbulb</span>
                <div>
                  <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-1" style={{ fontFamily: "Inter, sans-serif" }}>Clinical Insight</h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Elevated HbA1c (6.4%) and LDL (112 mg/dL) indicate a metabolic risk profile. Recommendation: Focus on low-glycemic load dietary interventions and increased soluble fiber intake.
                  </p>
                </div>
              </div>

              {/* AI Protocol */}
              <div className="mt-6 rounded-2xl p-6" style={{ background: "linear-gradient(135deg, rgba(55,96,44,0.05) 0%, rgba(37,104,106,0.08) 100%)", backdropFilter: "blur(12px)", border: "1px solid rgba(55,96,44,0.15)" }}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                  <h4 className="text-sm font-bold text-on-surface" style={{ fontFamily: "Manrope, sans-serif" }}>AI Dietary Protocol Suggestion</h4>
                  <span className="ml-auto text-[10px] font-bold px-2 py-0.5 bg-secondary/10 text-secondary rounded tracking-wider uppercase" style={{ fontFamily: "Inter, sans-serif" }}>AI Generated</span>
                </div>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Based on the analyzed biomarkers, a <span className="font-semibold text-on-surface">Mediterranean-style anti-inflammatory protocol</span> is recommended. Priority foods: omega-3 rich fish, legumes, leafy greens. Limit: refined carbohydrates, saturated fats. Target HbA1c reduction of 0.5% over 3 months.
                </p>

                {showProtocolDetail && (
                  <div className="mt-4 p-4 bg-surface-container rounded-xl space-y-2">
                    {["Week 1–2: Dietary audit and macro calibration", "Week 3–4: Introduce omega-3 supplementation (2g/day)", "Month 2: Add soluble fiber protocol (psyllium 10g/day)", "Month 3: Retest HbA1c and LDL — target 5.9% / 95 mg/dL"].map((step, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-on-surface">
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold flex-shrink-0 text-[10px]">{i + 1}</span>
                        {step}
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex gap-4">
                  <button
                    onClick={handleApplyProtocol}
                    disabled={!done}
                    className="text-xs font-bold text-primary hover:underline disabled:opacity-40 disabled:no-underline"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    APPLY TO PROTOCOL
                  </button>
                  <button
                    onClick={() => setShowProtocolDetail(!showProtocolDetail)}
                    className="text-xs font-bold text-outline hover:text-on-surface"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    {showProtocolDetail ? "HIDE DETAILS" : "VIEW DETAILS"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Toasts toasts={toasts} remove={remove} />
    </div>
  );
}
