"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";
import Modal from "../../components/Modal";
import Toasts from "../../components/Toast";
import { useToast } from "../../lib/useToast";
import { useAuth } from "../../lib/useAuth";
import { getPatient, getMeasurements, addMeasurement, deleteMeasurement, updatePatient, getBodyAnalyses } from "../../lib/db";
import type { BodyAnalysis, BodyAnalysisData } from "../../lib/db";
import type { Patient, Measurement } from "../../lib/data";

/* ─── Measurement Detail Modal ──────────────────────────────────────── */
function DetailRow({ label, value, unit }: { label: string; value: number | string | null | undefined; unit?: string }) {
  if (value === null || value === undefined) return null;
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <span className="text-xs text-gray-500 dark:text-gray-400" style={{ fontFamily: "Inter, sans-serif" }}>{label}</span>
      <span className="text-sm font-bold text-gray-900 dark:text-gray-100 tabular-nums">
        {value} {unit && <span className="text-xs font-normal text-gray-400">{unit}</span>}
      </span>
    </div>
  );
}

function SectionCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="flex items-center gap-2.5 px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <span className="material-symbols-outlined text-indigo-600" style={{ fontVariationSettings: "'FILL' 1", fontSize: "18px" }}>{icon}</span>
        <span className="text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider" style={{ fontFamily: "Inter, sans-serif" }}>{title}</span>
      </div>
      <div className="px-4 bg-white dark:bg-gray-900">{children}</div>
    </div>
  );
}

function BodyAnalysisDetail({ data }: { data: BodyAnalysisData }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <SectionCard title="Vücut Kompozisyonu" icon="monitor_weight">
        <DetailRow label="Boy" value={data.height} unit="cm" />
        <DetailRow label="BMI" value={data.bmi} />
        <DetailRow label="WHR — Bel Kalça Oranı" value={data.whr} />
        <DetailRow label="Metabolizma Yaşı" value={data.metabolic_age} unit="yaş" />
        <DetailRow label="İdeal Kilo" value={data.ideal_weight_kg} unit="kg" />
        <DetailRow label="Obezite Derecesi" value={data.obesity_degree_pct} unit="%" />
        <DetailRow label="Beden Yoğunluğu" value={data.body_density} />
      </SectionCard>

      <SectionCard title="Yağ Analizi" icon="local_fire_department">
        <DetailRow label="Yağ Ağırlığı" value={data.fat_kg} unit="kg" />
        <DetailRow label="Yağ Oranı" value={data.fat_pct} unit="%" />
        <DetailRow label="Yağsız Kütle" value={data.fat_free_kg} unit="kg" />
        <DetailRow label="İç Yağlanma Seviyesi" value={data.visceral_fat_level} />
      </SectionCard>

      <SectionCard title="Kütlesel Analiz" icon="fitness_center">
        <DetailRow label="Yağımsız Kas Dokusu" value={data.lean_mass_kg} unit="kg" />
        <DetailRow label="İskeletsel Kaslar" value={data.skeletal_muscle_kg} unit="kg" />
        <DetailRow label="Kemik Mineralleri" value={data.bone_mass_kg} unit="kg" />
        <DetailRow label="Hücre Kütlesi" value={data.cell_mass_kg} unit="kg" />
        <DetailRow label="Protein Miktarı" value={data.protein_kg} unit="kg" />
        <DetailRow label="Protein Oranı" value={data.protein_pct} unit="%" />
      </SectionCard>

      <div className="flex flex-col gap-4">
        <SectionCard title="Sıvı Analizi" icon="water_drop">
          <DetailRow label="Sıvı Ağırlığı" value={data.fluid_kg} unit="kg" />
          <DetailRow label="Sıvı Oranı" value={data.fluid_pct} unit="%" />
          <DetailRow label="Hücre İçi Sıvı" value={data.intracellular_fluid_kg} unit="kg" />
          <DetailRow label="Hücre Dışı Sıvı" value={data.extracellular_fluid_kg} unit="kg" />
        </SectionCard>

        <SectionCard title="Metabolizma" icon="electric_bolt">
          <DetailRow label="BMR" value={data.bmr_kcal} unit="kcal" />
          <DetailRow label="BMR" value={data.bmr_kj} unit="kJ" />
          <DetailRow label="BMR / kg" value={data.bmr_per_kg} />
        </SectionCard>
      </div>
    </div>
  );
}

/* ─── SVG Line Chart ────────────────────────────────────────────────── */
function WeightChart({ data }: { data: { date: string; weight: number }[] }) {
  const [hovered, setHovered] = useState<number | null>(null);

  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-outline text-4xl block mb-2">show_chart</span>
          <p className="text-sm text-outline">No measurements yet — log data to see the trend.</p>
        </div>
      </div>
    );
  }

  const W = 560, H = 160;
  const PAD = { top: 16, right: 24, bottom: 32, left: 44 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const weights = data.map((d) => d.weight);
  const minW = Math.min(...weights) - 1.5;
  const maxW = Math.max(...weights) + 1.5;
  const xOf = (i: number) => PAD.left + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
  const yOf = (w: number) => PAD.top + innerH - ((w - minW) / (maxW - minW)) * innerH;
  const points = data.map((d, i) => `${xOf(i)},${yOf(d.weight)}`).join(" ");
  const areaPath = [
    `M ${xOf(0)} ${yOf(data[0].weight)}`,
    ...data.map((d, i) => `L ${xOf(i)} ${yOf(d.weight)}`),
    `L ${xOf(data.length - 1)} ${H - PAD.bottom}`,
    `L ${xOf(0)} ${H - PAD.bottom}`, "Z",
  ].join(" ");
  const yTicks = 4;
  const yTickValues = Array.from({ length: yTicks + 1 }, (_, i) => minW + ((maxW - minW) / yTicks) * i);

  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: "192px" }} onMouseLeave={() => setHovered(null)}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#37602c" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#37602c" stopOpacity="0.01" />
          </linearGradient>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#37602c" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#37602c" />
          </linearGradient>
        </defs>
        {yTickValues.map((val, i) => (
          <g key={i}>
            <line x1={PAD.left} y1={yOf(val)} x2={W - PAD.right} y2={yOf(val)} stroke="#c2c9bb" strokeWidth="0.5" strokeDasharray="4,4" />
            <text x={PAD.left - 6} y={yOf(val) + 4} textAnchor="end" fontSize="9" fill="#73796d" fontFamily="Inter, sans-serif">{val.toFixed(1)}</text>
          </g>
        ))}
        {data.map((d, i) => (
          <text key={i} x={xOf(i)} y={H - 6} textAnchor="middle" fontSize="9" fill={i === data.length - 1 ? "#37602c" : "#73796d"} fontWeight={i === data.length - 1 ? "700" : "400"} fontFamily="Inter, sans-serif">
            {d.date.split(",")[0].slice(0, 6)}
          </text>
        ))}
        <path d={areaPath} fill="url(#areaGrad)" />
        <polyline points={points} fill="none" stroke="url(#lineGrad)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {data.map((d, i) => (
          <g key={i} onMouseEnter={() => setHovered(i)} style={{ cursor: "pointer" }}>
            <circle cx={xOf(i)} cy={yOf(d.weight)} r="12" fill="transparent" />
            <circle cx={xOf(i)} cy={yOf(d.weight)} r={hovered === i ? 5 : i === data.length - 1 ? 4 : 3} fill={i === data.length - 1 ? "#37602c" : "#ffffff"} stroke="#37602c" strokeWidth={i === data.length - 1 ? 0 : 2} style={{ transition: "r 0.15s" }} />
            {hovered === i && (
              <g>
                <rect x={xOf(i) - 28} y={yOf(d.weight) - 32} width="56" height="22" rx="6" fill="#37602c" />
                <text x={xOf(i)} y={yOf(d.weight) - 16} textAnchor="middle" fontSize="10" fill="white" fontWeight="700" fontFamily="Manrope, sans-serif">{d.weight} kg</text>
              </g>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────────── */
export default function PatientProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { loading: authLoading } = useAuth();
  const { toasts, addToast, remove } = useToast();

  const patientId = params.id as string;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [bodyAnalyses, setBodyAnalyses] = useState<BodyAnalysis[]>([]);
  const [activeMeasurement, setActiveMeasurement] = useState<{ measurement: Measurement; analysis: BodyAnalysis | null } | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [tab, setTab] = useState<"6M" | "1Y">("6M");
  const [showLogData, setShowLogData] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [openRowMenu, setOpenRowMenu] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const [logForm, setLogForm] = useState({ date: "", weight: "", fat: "", muscle: "", bmi: "" });
  const [editForm, setEditForm] = useState({ restingHR: "", bp: "", protocol: "" });

  useEffect(() => {
    if (authLoading) return;
    Promise.all([getPatient(patientId), getMeasurements(patientId), getBodyAnalyses(patientId)]).then(([p, m, ba]) => {
      if (!p) { setNotFound(true); setLoadingData(false); return; }
      setPatient(p);
      setMeasurements(m);
      setBodyAnalyses(ba);
      setEditForm({ restingHR: p.restingHR?.toString() ?? "", bp: p.bp ?? "", protocol: p.protocol ?? "" });
      setLoadingData(false);
    });
  }, [authLoading, patientId]);

  if (authLoading || loadingData) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <span className="material-symbols-outlined text-primary text-4xl animate-spin" style={{ animationDuration: "1s" }}>progress_activity</span>
      </div>
    );
  }

  if (notFound || !patient) {
    return (
      <div className="bg-background min-h-screen">
        <Sidebar />
        <main className="ml-64 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <span className="material-symbols-outlined text-outline text-5xl mb-4 block">person_off</span>
            <h2 className="text-xl font-bold text-on-surface mb-2" style={{ fontFamily: "Manrope, sans-serif" }}>Patient not found</h2>
            <Link href="/dashboard" className="text-primary hover:underline text-sm">← Back to directory</Link>
          </div>
        </main>
      </div>
    );
  }

  const sortedAsc = [...measurements].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const chartPoints = tab === "6M"
    ? sortedAsc.slice(-6).map((m) => ({ date: m.date, weight: m.weight }))
    : sortedAsc.map((m) => ({ date: m.date, weight: m.weight }));

  const latestWeight = measurements[0]?.weight;
  const prevWeight = measurements[1]?.weight;
  const weightDelta = latestWeight && prevWeight ? (latestWeight - prevWeight).toFixed(1) : null;

  const handleLogData = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const entry = await addMeasurement(patientId, {
        date: logForm.date,
        weight: parseFloat(logForm.weight),
        fat: parseFloat(logForm.fat),
        muscle: parseFloat(logForm.muscle),
        bmi: parseFloat(logForm.bmi),
      });
      setMeasurements((prev) => [entry, ...prev]);
      addToast("Measurement logged successfully.");
      setShowLogData(false);
      setLogForm({ date: "", weight: "", fat: "", muscle: "", bmi: "" });
    } catch {
      addToast("Failed to log measurement.", "info");
    } finally {
      setSaving(false);
    }
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updatePatient(patientId, {
        resting_hr: editForm.restingHR ? parseInt(editForm.restingHR) : undefined,
        bp: editForm.bp || undefined,
        protocol: editForm.protocol || undefined,
      });
      setPatient((prev) => prev ? { ...prev, restingHR: parseInt(editForm.restingHR), bp: editForm.bp, protocol: editForm.protocol } : prev);
      addToast("Patient data updated.");
      setShowEdit(false);
    } catch {
      addToast("Failed to update patient.", "info");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRow = async (idx: number) => {
    const m = measurements[idx];
    if (!m.id) return;
    try {
      await deleteMeasurement(m.id);
      setMeasurements((prev) => prev.filter((_, i) => i !== idx));
      setOpenRowMenu(null);
      addToast("Measurement deleted.", "info");
    } catch {
      addToast("Failed to delete measurement.", "info");
    }
  };


  return (
    <div className="bg-background min-h-screen">
      <Sidebar />
      <main className="ml-64 min-h-screen">
        <TopBar />
        <div className="p-8 max-w-7xl mx-auto space-y-6">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-outline" style={{ fontFamily: "Inter, sans-serif" }}>
            <Link href="/dashboard" className="hover:text-primary transition-colors">Clients</Link>
            <span className="material-symbols-outlined text-[12px]">chevron_right</span>
            <span className="text-on-surface font-medium">{patient.name}</span>
          </div>

          {/* Patient Header */}
          <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-xl bg-primary/15 flex items-center justify-center text-primary font-bold text-2xl" style={{ fontFamily: "Manrope, sans-serif" }}>
                {patient.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-on-background" style={{ fontFamily: "Manrope, sans-serif" }}>{patient.name}</h1>
                <p className="text-sm text-outline mt-0.5">ID: #{patient.id.slice(0, 8).toUpperCase()} • Joined {patient.joinDate ?? "—"}</p>
                <div className="flex gap-4 mt-3 flex-wrap">
                  <span className="text-xs font-semibold text-primary py-1 px-3 bg-primary/5 rounded-full">{editForm.protocol || patient.protocol || "No protocol"}</span>
                  <span className="text-xs text-outline uppercase tracking-wider mt-1" style={{ fontFamily: "Inter, sans-serif" }}>
                    {patient.age ? `${patient.age} YRS` : ""}{patient.height ? ` • ${patient.height} CM` : ""}{patient.bloodType ? ` • ${patient.bloodType}` : ""}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-8 px-8 border-l border-outline-variant/10">
              <div className="text-center">
                <p className="text-[10px] text-outline uppercase" style={{ fontFamily: "Inter, sans-serif" }}>Resting HR</p>
                <p className="text-xl font-bold" style={{ fontFamily: "Manrope, sans-serif" }}>
                  {editForm.restingHR || patient.restingHR || "—"} <span className="text-xs font-normal text-outline">BPM</span>
                </p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-outline uppercase" style={{ fontFamily: "Inter, sans-serif" }}>BP</p>
                <p className="text-xl font-bold" style={{ fontFamily: "Manrope, sans-serif" }}>{editForm.bp || patient.bp || "—"}</p>
              </div>
              {latestWeight && (
                <div className="text-center">
                  <p className="text-[10px] text-outline uppercase" style={{ fontFamily: "Inter, sans-serif" }}>Weight</p>
                  <p className="text-xl font-bold" style={{ fontFamily: "Manrope, sans-serif" }}>
                    {latestWeight} <span className="text-xs font-normal text-outline">kg</span>
                  </p>
                </div>
              )}
              <button onClick={() => setShowEdit(true)} className="self-center p-2 text-primary hover:bg-primary/5 rounded-full transition-colors">
                <span className="material-symbols-outlined">edit</span>
              </button>
            </div>
          </div>

          {/* Chart + AI Insight */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-bold text-on-surface" style={{ fontFamily: "Manrope, sans-serif" }}>Weight Trend</h2>
                  <div className="flex items-center gap-3 mt-0.5">
                    {latestWeight ? (
                      <>
                        <p className="text-xs text-outline">Current: <span className="font-semibold text-on-surface">{latestWeight} kg</span></p>
                        {weightDelta && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${parseFloat(weightDelta) < 0 ? "text-primary bg-primary/10" : "text-error bg-error/10"}`} style={{ fontFamily: "Inter, sans-serif" }}>
                            {parseFloat(weightDelta) < 0 ? "▼" : "▲"} {Math.abs(parseFloat(weightDelta))} kg
                          </span>
                        )}
                      </>
                    ) : (
                      <p className="text-xs text-outline">No measurements logged yet</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-xs text-outline">
                    <div className="w-3 h-0.5 bg-primary rounded-full" />
                    <span style={{ fontFamily: "Inter, sans-serif" }}>Weight (kg)</span>
                  </div>
                  <div className="flex bg-surface-container-low p-1 rounded-lg">
                    {(["6M", "1Y"] as const).map((t) => (
                      <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${tab === t ? "bg-surface-container-lowest text-on-surface shadow-sm" : "text-outline hover:text-on-surface"}`}>{t}</button>
                    ))}
                  </div>
                </div>
              </div>
              <WeightChart data={chartPoints} />
            </div>

            {/* AI Insight */}
            <div className="bg-secondary-container/20 rounded-xl p-6 border border-secondary/10 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-secondary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                <h3 className="text-sm font-bold text-on-surface" style={{ fontFamily: "Manrope, sans-serif" }}>Clinical Insight</h3>
              </div>
              <p className="text-sm text-on-surface leading-relaxed flex-1">
                {patient.status === "Critical"
                  ? <><span className="font-bold text-error">Immediate attention required.</span> Elevated inflammatory markers detected.</>
                  : measurements.length >= 2
                  ? <><span className="font-bold">Progress on track.</span> Consistent improvements over the last {measurements.length} sessions.</>
                  : <><span className="font-bold">Baseline established.</span> Log more measurements to unlock AI trend analysis.</>}
              </p>
              {measurements.length >= 2 && (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {[
                    { label: "Fat Change", value: `${(measurements[0].fat - measurements[measurements.length - 1].fat).toFixed(1)}%`, positive: measurements[0].fat < measurements[measurements.length - 1].fat },
                    { label: "Muscle", value: `${measurements[0].muscle} kg`, positive: true },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-surface-container-lowest/60 rounded-lg p-3">
                      <p className="text-[10px] text-outline uppercase tracking-wider mb-1" style={{ fontFamily: "Inter, sans-serif" }}>{stat.label}</p>
                      <p className={`text-sm font-bold ${stat.positive ? "text-primary" : "text-error"}`} style={{ fontFamily: "Manrope, sans-serif" }}>{stat.value}</p>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4 pt-4 border-t border-secondary/10">
                <p className="text-[10px] text-secondary uppercase font-bold mb-2" style={{ fontFamily: "Inter, sans-serif" }}>Next Step</p>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-base">calendar_today</span>
                  <span className="text-xs font-medium">Dexa Scan — Week 12</span>
                </div>
              </div>
              <button onClick={() => router.push("/ai-analysis")} className="mt-4 w-full py-2 bg-secondary/10 text-secondary text-xs font-bold rounded-lg hover:bg-secondary/20 transition-colors">
                Run AI Analysis →
              </button>
            </div>
          </div>

          {/* Measurement History */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 overflow-hidden">
            <div className="p-6 flex justify-between items-center border-b border-outline-variant/10">
              <div>
                <h2 className="text-lg font-bold" style={{ fontFamily: "Manrope, sans-serif" }}>Measurement History</h2>
                <p className="text-xs text-outline mt-0.5">{measurements.length} records</p>
              </div>
              <button onClick={() => setShowLogData(true)} className="bg-primary text-white px-4 py-2 rounded-full font-bold text-xs flex items-center gap-2 transition-transform active:scale-95" style={{ fontFamily: "Manrope, sans-serif" }}>
                <span className="material-symbols-outlined text-sm">add</span> Log Data
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface-container-low/30 border-b border-outline-variant/10">
                    {["Date", "Weight (kg)", "Fat %", "Muscle (kg)", "BMI", ""].map((col, i) => (
                      <th key={i} className={`px-6 py-4 text-[10px] text-outline uppercase tracking-wider ${i === 5 ? "text-right" : ""}`} style={{ fontFamily: "Inter, sans-serif" }}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {measurements.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <span className="material-symbols-outlined text-outline text-4xl mb-3 block">table_chart</span>
                        <p className="text-sm text-outline mb-3">No measurements logged yet.</p>
                        <button onClick={() => setShowLogData(true)} className="text-xs font-bold text-primary hover:underline">Log the first measurement →</button>
                      </td>
                    </tr>
                  ) : measurements.map((m, idx) => {
                    const analysis = bodyAnalyses.find((ba) => ba.measurement_id === m.id) ?? null;
                    return (
                      <tr key={m.id ?? idx} className="hover:bg-primary/5 transition-colors border-b border-outline-variant/5 last:border-0">
                        <td className={`px-6 py-4 font-bold ${idx > 0 ? "text-on-surface/70" : ""}`}>{m.date}</td>
                        <td className={`px-6 py-4 ${idx > 0 ? "text-outline" : "font-semibold text-on-surface"}`}>{m.weight}</td>
                        <td className={`px-6 py-4 ${idx > 0 ? "text-outline" : "font-semibold text-on-surface"}`}>{m.fat}</td>
                        <td className={`px-6 py-4 ${idx > 0 ? "text-outline" : "font-semibold text-on-surface"}`}>{m.muscle}</td>
                        <td className={`px-6 py-4 ${idx > 0 ? "text-outline" : "font-semibold text-on-surface"}`}>{m.bmi}</td>
                        <td className="px-6 py-4 text-right relative">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setActiveMeasurement({ measurement: m, analysis })}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors bg-surface-container-high text-outline hover:bg-primary/10 hover:text-primary"
                              style={{ fontFamily: "Inter, sans-serif" }}
                            >
                              {analysis && <span className="material-symbols-outlined" style={{ fontSize: "11px" }}>auto_awesome</span>}
                              Detay
                            </button>
                            <button onClick={() => setOpenRowMenu(openRowMenu === idx ? null : idx)} className="text-outline hover:text-primary transition-colors">
                              <span className="material-symbols-outlined text-lg">more_horiz</span>
                            </button>
                          </div>
                          {openRowMenu === idx && (
                            <div className="absolute right-6 top-full mt-1 bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-lg py-1.5 z-50 min-w-[140px]">
                              <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-error hover:bg-error/5" onClick={() => handleDeleteRow(idx)}>
                                <span className="material-symbols-outlined text-error" style={{ fontSize: "16px" }}>delete</span> Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>

      {/* Log Data Modal */}
      {showLogData && (
        <Modal title="Log Measurement" onClose={() => setShowLogData(false)}>
          <form onSubmit={handleLogData} className="space-y-4">
            <div>
              <label className="text-[11px] text-outline uppercase tracking-wider font-bold block mb-1.5" style={{ fontFamily: "Inter, sans-serif" }}>Date</label>
              <input type="date" required value={logForm.date} onChange={e => setLogForm(p => ({ ...p, date: e.target.value }))} className="w-full bg-surface-container-highest rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: "weight", label: "Weight (kg)", placeholder: "70.4" },
                { key: "fat", label: "Body Fat %", placeholder: "22.4" },
                { key: "muscle", label: "Muscle Mass (kg)", placeholder: "51.2" },
                { key: "bmi", label: "BMI", placeholder: "23.8" },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="text-[11px] text-outline uppercase tracking-wider font-bold block mb-1.5" style={{ fontFamily: "Inter, sans-serif" }}>{label}</label>
                  <input type="number" step="0.1" required value={(logForm as Record<string, string>)[key]} onChange={e => setLogForm(p => ({ ...p, [key]: e.target.value }))} className="w-full bg-surface-container-highest rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder={placeholder} />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowLogData(false)} className="px-5 py-2.5 text-sm text-outline border border-outline-variant rounded-full hover:bg-surface-container-low transition-colors">Cancel</button>
              <button type="submit" disabled={saving} className="px-5 py-2.5 text-sm bg-primary text-white font-semibold rounded-full hover:bg-primary-container transition-colors disabled:opacity-60 flex items-center gap-2">
                {saving ? <><span className="material-symbols-outlined text-sm animate-spin" style={{ animationDuration: "1s" }}>progress_activity</span> Saving...</> : "Save Measurement"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Modal */}
      {showEdit && (
        <Modal title="Edit Patient Data" onClose={() => setShowEdit(false)}>
          <form onSubmit={handleEditSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] text-outline uppercase tracking-wider font-bold block mb-1.5" style={{ fontFamily: "Inter, sans-serif" }}>Resting HR (BPM)</label>
                <input type="number" value={editForm.restingHR} onChange={e => setEditForm(p => ({ ...p, restingHR: e.target.value }))} className="w-full bg-surface-container-highest rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="text-[11px] text-outline uppercase tracking-wider font-bold block mb-1.5" style={{ fontFamily: "Inter, sans-serif" }}>Blood Pressure</label>
                <input type="text" value={editForm.bp} onChange={e => setEditForm(p => ({ ...p, bp: e.target.value }))} className="w-full bg-surface-container-highest rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="118/76" />
              </div>
            </div>
            <div>
              <label className="text-[11px] text-outline uppercase tracking-wider font-bold block mb-1.5" style={{ fontFamily: "Inter, sans-serif" }}>Protocol</label>
              <select value={editForm.protocol} onChange={e => setEditForm(p => ({ ...p, protocol: e.target.value }))} className="w-full bg-surface-container-highest rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                {["Anti-Inflammatory Protocol", "Weight Management", "Diabetic Management", "Hypertension Diet", "Sports Nutrition", "GI Restoration", "Metabolic Reset"].map(pr => <option key={pr}>{pr}</option>)}
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowEdit(false)} className="px-5 py-2.5 text-sm text-outline border border-outline-variant rounded-full hover:bg-surface-container-low transition-colors">Cancel</button>
              <button type="submit" disabled={saving} className="px-5 py-2.5 text-sm bg-primary text-white font-semibold rounded-full hover:bg-primary-container transition-colors disabled:opacity-60 flex items-center gap-2">
                {saving ? <><span className="material-symbols-outlined text-sm animate-spin" style={{ animationDuration: "1s" }}>progress_activity</span> Saving...</> : "Save Changes"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Measurement Detail Modal */}
      {activeMeasurement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setActiveMeasurement(null)} />
          <div className="relative w-full max-w-3xl max-h-[88vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl z-10 bg-white dark:bg-gray-900">

            {/* Header */}
            <div className="bg-gradient-to-br from-indigo-600 to-violet-600 px-6 pt-5 pb-6">
              {/* Top row: badge + close */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/20 text-white uppercase tracking-wide">
                    {activeMeasurement.analysis ? `AI · ${activeMeasurement.analysis.data.device ?? "Body Analysis"}` : "Manuel Giriş"}
                  </span>
                  <span className="text-white/50 text-xs">{activeMeasurement.measurement.date}</span>
                </div>
                <button onClick={() => setActiveMeasurement(null)} className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors">
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-4 divide-x divide-white/20">
                {[
                  { label: "Kilo", value: activeMeasurement.measurement.weight, unit: "kg" },
                  { label: "Yağ Oranı", value: activeMeasurement.measurement.fat, unit: "%" },
                  { label: "Kas Kütlesi", value: activeMeasurement.measurement.muscle, unit: "kg" },
                  { label: "BMI", value: activeMeasurement.measurement.bmi, unit: "" },
                ].map((s) => (
                  <div key={s.label} className="px-4 first:pl-0 last:pr-0">
                    <p className="text-[10px] font-semibold text-white/50 uppercase tracking-widest mb-1">{s.label}</p>
                    <p className="text-2xl font-extrabold text-white leading-none">
                      {s.value ?? "—"}<span className="text-sm font-normal text-white/60 ml-1">{s.unit}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Body analysis sections */}
            {activeMeasurement.analysis ? (
              <div className="overflow-y-auto p-5 bg-gray-50 dark:bg-gray-900">
                <BodyAnalysisDetail data={activeMeasurement.analysis.data} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400 bg-white dark:bg-gray-900">
                <span className="material-symbols-outlined text-4xl mb-3 opacity-30">straighten</span>
                <p className="text-sm font-medium text-gray-500">Bu ölçüm manuel girildi.</p>
                <p className="text-xs mt-1 text-gray-400">AI analizi için rapor yükleyin.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {openRowMenu !== null && <div className="fixed inset-0 z-40" onClick={() => setOpenRowMenu(null)} />}
      <Toasts toasts={toasts} remove={remove} />
    </div>
  );
}
