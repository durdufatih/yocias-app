"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import Toasts from "../components/Toast";
import { useToast } from "../lib/useToast";
import { useAuth } from "../lib/useAuth";
import { getPatients, addMeasurement, saveBodyAnalysis } from "../lib/db";
import type { BodyAnalysisData } from "../lib/db";
import type { Patient } from "../lib/data";
import { useI18n } from "../lib/i18n";
import posthog from "posthog-js";

type ExtractedData = BodyAnalysisData & { fat?: number };

function StatCard({ label, value, unit }: { label: string; value: number | string | null | undefined; unit?: string }) {
  if (value === null || value === undefined) return null;
  return (
    <div className="bg-surface-container-low rounded-xl p-4">
      <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-1.5" style={{ fontFamily: "Inter, sans-serif" }}>{label}</p>
      <p className="text-xl font-extrabold text-on-surface" style={{ fontFamily: "Manrope, sans-serif" }}>
        {value}{unit && <span className="text-sm font-normal text-outline ml-1">{unit}</span>}
      </p>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 overflow-hidden">
      <div className="px-5 py-3.5 border-b border-outline-variant/10 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
        <p className="text-xs font-bold text-on-surface uppercase tracking-wider" style={{ fontFamily: "Inter, sans-serif" }}>{title}</p>
      </div>
      <div className="p-4 grid grid-cols-2 gap-3">{children}</div>
    </div>
  );
}

function AIAnalysisContent() {
  useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const params = useSearchParams();
  const { toasts, addToast, remove } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>(params.get("patientId") ?? "");
  const [fileName, setFileName] = useState<string | null>(null);
  const [analysing, setAnalysing] = useState(false);
  const [result, setResult] = useState<ExtractedData | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { getPatients().then(setPatients); }, []);

  const selectedPatient = patients.find((p) => p.id === selectedPatientId) ?? null;

  const runAnalysis = async (file: File) => {
    setFileName(file.name);
    setResult(null);
    setSaved(false);
    setError(null);
    setAnalysing(true);
    posthog.capture("ai_analysis_started", { patient_id: selectedPatientId, file_name: file.name });
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch("/api/analyze", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      setResult(data as ExtractedData);
      const count = Object.values(data).filter((v) => v !== null && v !== undefined).length;
      posthog.capture("ai_analysis_completed", { patient_id: selectedPatientId, data_points: count });
      addToast(`Analysis complete — ${count} data points extracted.`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Analysis failed";
      posthog.capture("ai_analysis_error", { patient_id: selectedPatientId, error: msg });
      setError(msg);
      addToast(msg, "info");
    } finally {
      setAnalysing(false);
    }
  };

  const handleSave = async () => {
    if (!result || !selectedPatientId) return;
    const weight = result.weight;
    const fat = result.fat_pct ?? result.fat;
    const muscle = result.skeletal_muscle_kg ?? result.lean_mass_kg;
    const bmi = result.bmi;

    if (!weight || !fat || !muscle || !bmi) {
      addToast("Cannot save: missing weight, fat%, muscle or BMI.", "info");
      return;
    }

    setSaving(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const date = result.date ?? today;
      const measurement = await addMeasurement(selectedPatientId, {
        date, weight, fat, muscle, bmi,
      });
      await saveBodyAnalysis(selectedPatientId, measurement.id ?? null, date, result);
      setSaved(true);
      posthog.capture("ai_analysis_saved", { patient_id: selectedPatientId });
      addToast(`All data saved to ${selectedPatient?.name ?? "patient"}'s record.`);
    } catch {
      addToast("Failed to save. Please try again.", "info");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-surface min-h-screen">
      <Sidebar />
      <main className="pl-64 min-h-screen">
        <TopBar />
        <div className="p-8 max-w-6xl mx-auto">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-outline mb-6" style={{ fontFamily: "Inter, sans-serif" }}>
            <Link href="/dashboard" className="hover:text-primary transition-colors">{t.nav.clients}</Link>
            <span className="material-symbols-outlined text-[12px]">chevron_right</span>
            {selectedPatient && (
              <>
                <Link href={`/clients/${selectedPatient.id}`} className="hover:text-primary transition-colors">{selectedPatient.name}</Link>
                <span className="material-symbols-outlined text-[12px]">chevron_right</span>
              </>
            )}
            <span className="text-primary font-semibold">{t.ai.title}</span>
          </div>

          {/* Header */}
          <div className="mb-8 flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-extrabold text-on-surface tracking-tight" style={{ fontFamily: "Manrope, sans-serif" }}>{t.ai.title}</h2>
              <p className="text-outline mt-1 text-sm">{t.ai.uploadFirstSub}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => router.back()} className="px-5 py-2.5 border border-outline-variant text-outline font-bold text-sm rounded-full hover:bg-surface-container-low transition-colors">{t.common.cancel}</button>
              <button
                onClick={handleSave}
                disabled={!result || saving || saved || !selectedPatientId}
                className="bg-primary text-white px-6 py-2.5 rounded-full font-bold text-sm hover:opacity-90 transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? <><span className="material-symbols-outlined text-sm animate-spin" style={{ animationDuration: "1s" }}>progress_activity</span>{t.ai.saving}</>
                  : saved ? <><span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>{t.ai.saved}</>
                  : <><span className="material-symbols-outlined text-sm">save</span>{t.ai.save}</>}
              </button>
            </div>
          </div>

          {/* Patient Selector */}
          <div className="mb-8 flex items-center gap-4 p-5 bg-surface-container-lowest rounded-2xl border border-outline-variant/20">
            <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-1" style={{ fontFamily: "Inter, sans-serif" }}>{t.ai.selectPatient}</p>
              <select
                value={selectedPatientId}
                onChange={(e) => { setSelectedPatientId(e.target.value); setResult(null); setSaved(false); }}
                className="text-sm font-semibold text-on-surface bg-transparent border-none focus:outline-none cursor-pointer w-full"
              >
                <option value="">{t.ai.selectPatientPlaceholder}</option>
                {patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            {selectedPatient && (
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${selectedPatient.status === "Active" ? "bg-primary/10 text-primary" : "bg-surface-container-high text-outline"}`}>
                {selectedPatient.status}
              </span>
            )}
          </div>

          <div className="grid grid-cols-12 gap-8">
            {/* Left: Upload */}
            <div className="col-span-4 flex flex-col gap-5">
              <div
                onDragOver={(e) => { if (!selectedPatientId || analysing) return; e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (!selectedPatientId || analysing) return; const f = e.dataTransfer.files[0]; if (f) runAnalysis(f); }}
                onClick={() => { if (!selectedPatientId || analysing) return; fileRef.current?.click(); }}
                className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center min-h-[200px] transition-all ${
                  !selectedPatientId ? "cursor-not-allowed opacity-40 bg-surface-container-low border-outline-variant/20"
                  : analysing ? "cursor-wait bg-primary/5 border-primary/20"
                  : isDragging ? "bg-secondary-container/30 border-secondary/50 scale-[1.01] cursor-copy"
                  : result ? "bg-primary/5 border-primary/30 cursor-pointer"
                  : "bg-surface-container-low border-outline-variant/30 hover:border-primary/40 hover:bg-surface-container cursor-pointer"
                }`}
              >
                <input ref={fileRef} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) runAnalysis(f); e.target.value = ""; }} />
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${analysing || result ? "bg-primary/10" : "bg-surface-container"}`}>
                  <span className={`material-symbols-outlined text-3xl ${analysing ? "animate-spin text-primary" : result ? "text-primary" : "text-outline"}`}
                    style={{ fontVariationSettings: result ? "'FILL' 1" : "'FILL' 0", animationDuration: "1s" }}>
                    {analysing ? "progress_activity" : result ? "check_circle" : !selectedPatientId ? "lock" : "cloud_upload"}
                  </span>
                </div>
                {analysing ? (
                  <><p className="text-sm font-bold text-primary">{t.ai.analyzing}</p><p className="text-xs text-outline mt-1 truncate max-w-full px-2">{fileName}</p></>
                ) : result ? (
                  <><p className="text-sm font-bold text-primary truncate max-w-full px-2">{fileName}</p><p className="text-xs text-outline mt-1">{t.ai.analyzeAnother}</p></>
                ) : !selectedPatientId ? (
                  <><p className="text-sm font-semibold text-outline">{t.ai.uploadWarning}</p></>
                ) : (
                  <><p className="text-sm font-semibold text-on-surface">{t.ai.uploadReport}</p><p className="text-xs text-outline mt-1.5">{t.ai.uploadHint}</p></>
                )}
              </div>

              {/* Report metadata */}
              {result && (
                <div className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/20 space-y-3">
                  <p className="text-[10px] font-bold text-outline uppercase tracking-widest" style={{ fontFamily: "Inter, sans-serif" }}>Report Info</p>
                  {[
                    { label: "Device", value: result.device },
                    { label: "Name (report)", value: result.patient_name },
                    { label: "Date", value: result.date },
                    { label: "Gender", value: result.gender },
                    { label: "Body Type", value: result.body_type },
                  ].filter(i => i.value).map((item) => (
                    <div key={item.label} className="flex justify-between items-center">
                      <span className="text-[11px] text-outline uppercase tracking-wider" style={{ fontFamily: "Inter, sans-serif" }}>{item.label}</span>
                      <span className="text-xs font-semibold text-on-surface">{item.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {error && (
                <div className="p-4 bg-error/5 border border-error/20 rounded-2xl flex gap-3 items-start">
                  <span className="material-symbols-outlined text-error text-base flex-shrink-0">error</span>
                  <p className="text-xs text-error leading-relaxed">{error}</p>
                </div>
              )}

              {saved && (
                <div className="p-4 bg-secondary-container/30 border border-secondary/20 rounded-2xl flex items-center gap-3">
                  <span className="material-symbols-outlined text-secondary text-xl flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  <div>
                    <p className="text-sm font-semibold text-on-surface">{t.ai.saved}</p>
                    <Link href={`/clients/${selectedPatientId}`} className="text-xs text-primary hover:underline">{t.ai.viewProfile}</Link>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Results */}
            <div className={`col-span-8 flex flex-col gap-4 transition-all duration-500 ${result ? "opacity-100" : analysing ? "opacity-30 pointer-events-none" : "opacity-20 pointer-events-none"}`}>

              {/* Analysing placeholder */}
              {analysing && (
                <div className="flex flex-col items-center justify-center py-24">
                  <span className="material-symbols-outlined text-5xl text-primary mb-4 animate-spin" style={{ animationDuration: "1.5s" }}>progress_activity</span>
                  <p className="text-sm font-semibold text-on-surface">{t.ai.analyzing}</p>
                </div>
              )}

              {!analysing && !result && (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <span className="material-symbols-outlined text-5xl text-outline mb-4">document_scanner</span>
                  <p className="text-sm font-semibold text-outline">{t.ai.uploadFirst}</p>
                </div>
              )}

              {result && !analysing && (
                <>
                  <Section title={t.ai.bodyComp} icon="monitor_weight">
                    <StatCard label="Weight" value={result.weight} unit="kg" />
                    <StatCard label="Height" value={result.height} unit="cm" />
                    <StatCard label="BMI" value={result.bmi} />
                    <StatCard label="WHR" value={result.whr} />
                    <StatCard label="Age" value={result.age} unit="yrs" />
                    <StatCard label="Metabolic Age" value={result.metabolic_age} unit="yrs" />
                    <StatCard label="Ideal Weight" value={result.ideal_weight_kg} unit="kg" />
                    <StatCard label="Obesity Degree" value={result.obesity_degree_pct} unit="%" />
                    <StatCard label="Body Density" value={result.body_density} />
                  </Section>

                  <Section title={t.ai.fatAnalysis} icon="local_fire_department">
                    <StatCard label="Fat Mass" value={result.fat_kg} unit="kg" />
                    <StatCard label="Fat %" value={result.fat_pct} unit="%" />
                    <StatCard label="Fat-Free Mass" value={result.fat_free_kg} unit="kg" />
                    <StatCard label="Visceral Fat Level" value={result.visceral_fat_level} />
                  </Section>

                  <Section title={t.ai.fluidAnalysis} icon="water_drop">
                    <StatCard label="Sıvı Ağırlığı" value={result.fluid_kg} unit="kg" />
                    <StatCard label="Sıvı Oranı" value={result.fluid_pct} unit="%" />
                    <StatCard label="Hücre İçi Sıvı" value={result.intracellular_fluid_kg} unit="kg" />
                    <StatCard label="Hücre Dışı Sıvı" value={result.extracellular_fluid_kg} unit="kg" />
                  </Section>

                  <Section title={t.ai.massAnalysis} icon="fitness_center">
                    <StatCard label="Yağımsız Kas Dokusu" value={result.lean_mass_kg} unit="kg" />
                    <StatCard label="İskeletsel Kaslar" value={result.skeletal_muscle_kg} unit="kg" />
                    <StatCard label="Kemik Mineralleri" value={result.bone_mass_kg} unit="kg" />
                    <StatCard label="Hücre Kütlesi" value={result.cell_mass_kg} unit="kg" />
                    <StatCard label="Protein Miktarı" value={result.protein_kg} unit="kg" />
                    <StatCard label="Protein %" value={result.protein_pct} unit="%" />
                  </Section>

                  <Section title={t.ai.metabolism} icon="electric_bolt">
                    <StatCard label="BMR" value={result.bmr_kcal} unit="kcal" />
                    <StatCard label="BMR (kJ)" value={result.bmr_kj} unit="kJ" />
                    <StatCard label="BMR / kg" value={result.bmr_per_kg} />
                  </Section>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Toasts toasts={toasts} remove={remove} />
    </div>
  );
}

export default function AIAnalysisPage() {
  return <Suspense><AIAnalysisContent /></Suspense>;
}
