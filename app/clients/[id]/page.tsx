"use client";

import { useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";
import Modal from "../../components/Modal";
import Toasts from "../../components/Toast";
import { useToast } from "../../lib/useToast";
import { patients, measurementsByPatient } from "../../lib/data";

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

  const W = 560;
  const H = 160;
  const PAD = { top: 16, right: 24, bottom: 32, left: 44 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const weights = data.map((d) => d.weight);
  const minW = Math.min(...weights) - 1.5;
  const maxW = Math.max(...weights) + 1.5;

  const xOf = (i: number) => PAD.left + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
  const yOf = (w: number) => PAD.top + innerH - ((w - minW) / (maxW - minW)) * innerH;

  // Build smooth polyline path
  const points = data.map((d, i) => `${xOf(i)},${yOf(d.weight)}`).join(" ");

  // Area fill path
  const areaPath = [
    `M ${xOf(0)} ${yOf(data[0].weight)}`,
    ...data.map((d, i) => `L ${xOf(i)} ${yOf(d.weight)}`),
    `L ${xOf(data.length - 1)} ${H - PAD.bottom}`,
    `L ${xOf(0)} ${H - PAD.bottom}`,
    "Z",
  ].join(" ");

  // Y-axis grid lines
  const yTicks = 4;
  const yTickValues = Array.from({ length: yTicks + 1 }, (_, i) =>
    minW + ((maxW - minW) / yTicks) * i
  );

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height: "192px" }}
        onMouseLeave={() => setHovered(null)}
      >
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

        {/* Grid lines */}
        {yTickValues.map((val, i) => (
          <g key={i}>
            <line
              x1={PAD.left} y1={yOf(val)}
              x2={W - PAD.right} y2={yOf(val)}
              stroke="#c2c9bb" strokeWidth="0.5" strokeDasharray="4,4"
            />
            <text
              x={PAD.left - 6} y={yOf(val) + 4}
              textAnchor="end" fontSize="9" fill="#73796d"
              fontFamily="Inter, sans-serif"
            >
              {val.toFixed(1)}
            </text>
          </g>
        ))}

        {/* X-axis labels */}
        {data.map((d, i) => {
          const label = d.date.split(",")[0].slice(0, 6); // "Mar 12"
          return (
            <text
              key={i}
              x={xOf(i)} y={H - 6}
              textAnchor="middle" fontSize="9" fill={i === data.length - 1 ? "#37602c" : "#73796d"}
              fontWeight={i === data.length - 1 ? "700" : "400"}
              fontFamily="Inter, sans-serif"
            >
              {label}
            </text>
          );
        })}

        {/* Area fill */}
        <path d={areaPath} fill="url(#areaGrad)" />

        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke="url(#lineGrad)"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Data points */}
        {data.map((d, i) => (
          <g key={i} onMouseEnter={() => setHovered(i)} style={{ cursor: "pointer" }}>
            {/* Larger invisible hit area */}
            <circle cx={xOf(i)} cy={yOf(d.weight)} r="12" fill="transparent" />
            {/* Visible dot */}
            <circle
              cx={xOf(i)} cy={yOf(d.weight)}
              r={hovered === i ? 5 : i === data.length - 1 ? 4 : 3}
              fill={i === data.length - 1 ? "#37602c" : "#ffffff"}
              stroke="#37602c"
              strokeWidth={i === data.length - 1 ? 0 : 2}
              style={{ transition: "r 0.15s" }}
            />
            {/* Tooltip */}
            {hovered === i && (
              <g>
                <rect
                  x={xOf(i) - 28}
                  y={yOf(d.weight) - 32}
                  width="56" height="22" rx="6"
                  fill="#37602c"
                />
                <text
                  x={xOf(i)} y={yOf(d.weight) - 16}
                  textAnchor="middle" fontSize="10" fill="white"
                  fontWeight="700" fontFamily="Manrope, sans-serif"
                >
                  {d.weight} kg
                </text>
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
  const { toasts, addToast, remove } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const patientId = params.id as string;
  const patient = patients.find((p) => p.id === patientId);

  const [tab, setTab] = useState<"6M" | "1Y">("6M");
  const [measurements, setMeasurements] = useState(measurementsByPatient[patientId] ?? []);
  const [showLogData, setShowLogData] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [openRowMenu, setOpenRowMenu] = useState<number | null>(null);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [logForm, setLogForm] = useState({ date: "", weight: "", fat: "", muscle: "", bmi: "" });
  const [editForm, setEditForm] = useState({
    restingHR: patient?.restingHR.toString() ?? "",
    bp: patient?.bp ?? "",
    protocol: patient?.protocol ?? "",
  });

  if (!patient) {
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

  // Derive chart data from real measurements, filtered by tab
  const sortedMeasurements = [...measurements].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const chartPoints = tab === "6M"
    ? sortedMeasurements.slice(-6).map((m) => ({ date: m.date, weight: m.weight }))
    : sortedMeasurements.map((m) => ({ date: m.date, weight: m.weight }));

  const handleLogData = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry = {
      date: new Date(logForm.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      weight: parseFloat(logForm.weight),
      fat: parseFloat(logForm.fat),
      muscle: parseFloat(logForm.muscle),
      bmi: parseFloat(logForm.bmi),
    };
    setMeasurements([newEntry, ...measurements]);
    addToast("Measurement logged successfully.");
    setShowLogData(false);
    setLogForm({ date: "", weight: "", fat: "", muscle: "", bmi: "" });
  };

  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    addToast("Patient data updated.");
    setShowEdit(false);
  };

  const handleDeleteRow = (idx: number) => {
    setMeasurements((prev) => prev.filter((_, i) => i !== idx));
    setOpenRowMenu(null);
    addToast("Measurement deleted.", "info");
  };

  const handleFile = (file: File) => {
    setUploadedFile(file.name);
    addToast(`"${file.name}" uploaded — AI analysis ready.`);
  };

  const latestWeight = measurements[0]?.weight;
  const prevWeight = measurements[1]?.weight;
  const weightDelta = latestWeight && prevWeight ? (latestWeight - prevWeight).toFixed(1) : null;

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
                <p className="text-sm text-outline mt-0.5">ID: #{patient.id.toUpperCase()} • Joined {patient.joinDate}</p>
                <div className="flex gap-4 mt-3 flex-wrap">
                  <span className="text-xs font-semibold text-primary py-1 px-3 bg-primary/5 rounded-full">{editForm.protocol}</span>
                  <span className="text-xs text-outline uppercase tracking-wider mt-1" style={{ fontFamily: "Inter, sans-serif" }}>
                    {patient.age} YRS • {patient.height} CM • {patient.bloodType}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-8 px-8 border-l border-outline-variant/10">
              <div className="text-center">
                <p className="text-[10px] text-outline uppercase" style={{ fontFamily: "Inter, sans-serif" }}>Resting HR</p>
                <p className="text-xl font-bold" style={{ fontFamily: "Manrope, sans-serif" }}>{editForm.restingHR} <span className="text-xs font-normal text-outline">BPM</span></p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-outline uppercase" style={{ fontFamily: "Inter, sans-serif" }}>BP</p>
                <p className="text-xl font-bold" style={{ fontFamily: "Manrope, sans-serif" }}>{editForm.bp}</p>
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
            {/* Weight Chart */}
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
                      <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${tab === t ? "bg-surface-container-lowest text-on-surface shadow-sm" : "text-outline hover:text-on-surface"}`}
                      >
                        {t}
                      </button>
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
                  ? <><span className="font-bold text-error">Immediate attention required.</span> Elevated inflammatory markers detected. Recommend protocol adjustment.</>
                  : measurements.length >= 2
                  ? <><span className="font-bold">Progress on track.</span> Consistent improvements in metabolic markers over the last {measurements.length} sessions.</>
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
              <button
                onClick={() => router.push("/ai-analysis")}
                className="mt-4 w-full py-2 bg-secondary/10 text-secondary text-xs font-bold rounded-lg hover:bg-secondary/20 transition-colors"
              >
                Run AI Analysis →
              </button>
            </div>
          </div>

          {/* Measurement History */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 overflow-hidden">
            <div className="p-6 flex justify-between items-center border-b border-outline-variant/10">
              <div>
                <h2 className="text-lg font-bold" style={{ fontFamily: "Manrope, sans-serif" }}>Measurement History</h2>
                <p className="text-xs text-outline mt-0.5">{measurements.length} records — chart updates automatically</p>
              </div>
              <button
                onClick={() => setShowLogData(true)}
                className="bg-primary text-white px-4 py-2 rounded-full font-bold text-xs flex items-center gap-2 transition-transform active:scale-95"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                <span className="material-symbols-outlined text-sm">add</span>
                Log Data
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
                        <button onClick={() => setShowLogData(true)} className="text-xs font-bold text-primary hover:underline">
                          Log the first measurement →
                        </button>
                      </td>
                    </tr>
                  ) : measurements.map((m, idx) => (
                    <tr key={idx} className="hover:bg-primary/5 transition-colors border-b border-outline-variant/5 last:border-0">
                      <td className={`px-6 py-4 font-bold ${idx > 0 ? "text-on-surface/70" : ""}`}>{m.date}</td>
                      <td className={`px-6 py-4 ${idx > 0 ? "text-outline" : "font-semibold text-on-surface"}`}>{m.weight}</td>
                      <td className={`px-6 py-4 ${idx > 0 ? "text-outline" : "font-semibold text-on-surface"}`}>{m.fat}</td>
                      <td className={`px-6 py-4 ${idx > 0 ? "text-outline" : "font-semibold text-on-surface"}`}>{m.muscle}</td>
                      <td className={`px-6 py-4 ${idx > 0 ? "text-outline" : "font-semibold text-on-surface"}`}>{m.bmi}</td>
                      <td className="px-6 py-4 text-right relative">
                        <button onClick={() => setOpenRowMenu(openRowMenu === idx ? null : idx)} className="text-outline hover:text-primary transition-colors">
                          <span className="material-symbols-outlined text-lg">more_horiz</span>
                        </button>
                        {openRowMenu === idx && (
                          <div className="absolute right-6 top-full mt-1 bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-lg py-1.5 z-50 min-w-[140px]">
                            <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-low" onClick={() => { addToast("Edit mode coming soon.", "info"); setOpenRowMenu(null); }}>
                              <span className="material-symbols-outlined text-outline" style={{ fontSize: "16px" }}>edit</span> Edit
                            </button>
                            <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-error hover:bg-error/5" onClick={() => handleDeleteRow(idx)}>
                              <span className="material-symbols-outlined text-error" style={{ fontSize: "16px" }}>delete</span> Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Upload Area */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
            className={`rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all border-2 border-dashed ${isDragging ? "bg-secondary-container/30 border-secondary/50" : uploadedFile ? "bg-primary/5 border-primary/30" : "bg-surface-container-low border-outline-variant/30 hover:border-primary/40"}`}
            onClick={() => fileRef.current?.click()}
          >
            <input ref={fileRef} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            {uploadedFile ? (
              <>
                <span className="material-symbols-outlined text-primary text-3xl mb-3" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
                <p className="text-sm font-semibold text-primary">{uploadedFile}</p>
                <p className="text-xs text-outline mt-1 mb-4">File ready for AI analysis</p>
                <button onClick={(e) => { e.stopPropagation(); router.push("/ai-analysis"); }} className="text-xs font-bold text-white px-6 py-2 bg-primary rounded-full shadow-sm hover:bg-primary-container transition-all">
                  Analyse with AI →
                </button>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-outline text-3xl mb-3">upload_file</span>
                <p className="text-sm font-semibold text-on-surface">Upload lab results or body scans</p>
                <p className="text-xs text-outline mt-1 mb-4">Drag & drop or click to browse — PDF or JPEG (Max 50MB)</p>
                <span className="text-xs font-bold text-primary px-6 py-2 bg-surface-container-lowest rounded-full border border-primary/10 shadow-sm">Select Files</span>
              </>
            )}
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
              <button type="submit" className="px-5 py-2.5 text-sm bg-primary text-white font-semibold rounded-full hover:bg-primary-container transition-colors">Save Measurement</button>
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
              <button type="submit" className="px-5 py-2.5 text-sm bg-primary text-white font-semibold rounded-full hover:bg-primary-container transition-colors">Save Changes</button>
            </div>
          </form>
        </Modal>
      )}

      {openRowMenu !== null && <div className="fixed inset-0 z-40" onClick={() => setOpenRowMenu(null)} />}
      <Toasts toasts={toasts} remove={remove} />
    </div>
  );
}
