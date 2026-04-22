"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import Modal from "../components/Modal";
import Toasts from "../components/Toast";
import { useToast } from "../lib/useToast";
import { useAuth } from "../lib/useAuth";
import { getPatients, getAllMeasurementsWithPatient, getMeasurements, addMeasurement } from "../lib/db";
import type { Patient, Measurement } from "../lib/data";

type MeasurementWithPatient = Measurement & { patient: Patient };

export default function MeasurementsPage() {
  const { loading: authLoading } = useAuth();
  const { toasts, addToast, remove } = useToast();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [allRows, setAllRows] = useState<MeasurementWithPatient[]>([]);
  const [patientMeasurements, setPatientMeasurements] = useState<Measurement[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ date: "", weight: "", fat: "", muscle: "", bmi: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    Promise.all([getPatients(), getAllMeasurementsWithPatient()])
      .then(([pts, rows]) => { setPatients(pts); setAllRows(rows); })
      .finally(() => setLoadingData(false));
  }, [authLoading]);

  useEffect(() => {
    if (!selectedPatient) { setPatientMeasurements([]); return; }
    getMeasurements(selectedPatient).then(setPatientMeasurements);
  }, [selectedPatient]);

  const filteredPatients = useMemo(
    () => patients.filter((p) => p.name.toLowerCase().includes(search.toLowerCase())),
    [patients, search]
  );

  const currentPatient = patients.find((p) => p.id === selectedPatient);

  const measurementCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allRows.forEach((r) => { counts[r.patient.id] = (counts[r.patient.id] ?? 0) + 1; });
    return counts;
  }, [allRows]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;
    setSaving(true);
    try {
      const entry = await addMeasurement(selectedPatient, {
        date: form.date,
        weight: parseFloat(form.weight),
        fat: parseFloat(form.fat),
        muscle: parseFloat(form.muscle),
        bmi: parseFloat(form.bmi),
      });
      setPatientMeasurements((prev) => [entry, ...prev]);
      // Update allRows
      const patient = patients.find((p) => p.id === selectedPatient)!;
      setAllRows((prev) => [{ ...entry, patient }, ...prev]);
      addToast("Measurement logged successfully.");
      setShowAdd(false);
      setForm({ date: "", weight: "", fat: "", muscle: "", bmi: "" });
    } catch {
      addToast("Failed to log measurement.", "info");
    } finally {
      setSaving(false);
    }
  };

  const displayRows = selectedPatient
    ? patientMeasurements.map((m) => ({ ...m, patient: currentPatient! }))
    : allRows;

  const avgBmi = allRows.length ? (allRows.reduce((a, b) => a + b.bmi, 0) / allRows.length).toFixed(1) : "—";
  const avgFat = allRows.length ? (allRows.reduce((a, b) => a + b.fat, 0) / allRows.length).toFixed(1) + "%" : "—";

  if (authLoading || loadingData) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <span className="material-symbols-outlined text-primary text-4xl animate-spin" style={{ animationDuration: "1s" }}>progress_activity</span>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <Sidebar />
      <main className="pl-64 min-h-screen">
        <TopBar search={search} onSearch={setSearch} />
        <section className="p-10 max-w-7xl mx-auto">

          <div className="flex justify-between items-start mb-12">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-on-background mb-1" style={{ fontFamily: "Manrope, sans-serif" }}>Measurements</h2>
              <p className="text-outline text-sm">Anthropometric and clinical data across all clients.</p>
            </div>
            <button
              onClick={() => {
                if (!selectedPatient) { addToast("Select a patient to log measurements.", "info"); return; }
                setShowAdd(true);
              }}
              className="px-5 py-2 text-sm bg-primary text-white font-semibold rounded-lg flex items-center gap-2 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Log Measurement
            </button>
          </div>

          <div className="grid grid-cols-4 gap-8 mb-12">
            {[
              { label: "Total Records", value: allRows.length.toString() },
              { label: "Patients Tracked", value: Object.keys(measurementCounts).length.toString() },
              { label: "Avg BMI", value: avgBmi },
              { label: "Avg Fat %", value: avgFat },
            ].map((s) => (
              <div key={s.label} className="p-2">
                <p className="text-outline text-[11px] uppercase tracking-widest mb-1 font-semibold" style={{ fontFamily: "Inter, sans-serif" }}>{s.label}</p>
                <p className="text-3xl font-bold text-on-surface" style={{ fontFamily: "Manrope, sans-serif" }}>{s.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-12 gap-8">
            {/* Patient List */}
            <div className="col-span-3">
              <h3 className="text-xs font-bold text-outline uppercase tracking-widest mb-3" style={{ fontFamily: "Inter, sans-serif" }}>Select Patient</h3>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedPatient(null)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${!selectedPatient ? "bg-primary text-white" : "text-on-surface hover:bg-surface-container-low"}`}
                >
                  All Patients
                </button>
                {filteredPatients.map((p) => {
                  const count = measurementCounts[p.id] ?? 0;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPatient(p.id)}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all flex items-center justify-between group ${selectedPatient === p.id ? "bg-primary text-white font-semibold" : "text-on-surface hover:bg-surface-container-low"}`}
                    >
                      <span className="truncate">{p.name}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${selectedPatient === p.id ? "bg-white/20" : "bg-surface-container-high text-outline"}`} style={{ fontFamily: "Inter, sans-serif" }}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Table */}
            <div className="col-span-9">
              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-outline-variant/10 flex items-center justify-between">
                  <p className="text-sm font-bold text-on-surface" style={{ fontFamily: "Manrope, sans-serif" }}>
                    {currentPatient ? currentPatient.name : "All Records"}
                  </p>
                  <p className="text-xs text-outline" style={{ fontFamily: "Inter, sans-serif" }}>
                    {displayRows.length} records
                  </p>
                </div>
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-surface-container-low/30 border-b border-outline-variant/10">
                      {(!selectedPatient
                        ? ["Patient", "Date", "Weight (kg)", "Fat %", "Muscle (kg)", "BMI"]
                        : ["Date", "Weight (kg)", "Fat %", "Muscle (kg)", "BMI", ""]
                      ).map((col, i) => (
                        <th key={i} className="px-5 py-4 text-[10px] text-outline uppercase tracking-wider" style={{ fontFamily: "Inter, sans-serif" }}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-outline-variant/5">
                    {displayRows.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-16 text-center text-outline">
                          <span className="material-symbols-outlined text-4xl mb-3 block">straighten</span>
                          No measurements yet.{" "}
                          {selectedPatient ? (
                            <button onClick={() => setShowAdd(true)} className="text-primary hover:underline">Log the first one.</button>
                          ) : (
                            <span>Select a patient to begin.</span>
                          )}
                        </td>
                      </tr>
                    ) : displayRows.map((row, idx) => (
                      <tr key={row.id ?? idx} className="hover:bg-primary/5 transition-colors">
                        {!selectedPatient && (
                          <td className="px-5 py-4">
                            <Link href={`/clients/${row.patient.id}`} className="flex items-center gap-2 hover:text-primary transition-colors group">
                              <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center text-primary text-[10px] font-bold flex-shrink-0">
                                {row.patient.name.split(" ").map((n) => n[0]).join("")}
                              </div>
                              <span className="font-medium text-on-surface group-hover:text-primary transition-colors text-xs">{row.patient.name}</span>
                            </Link>
                          </td>
                        )}
                        <td className="px-5 py-4 font-medium text-on-surface">{row.date}</td>
                        <td className="px-5 py-4 text-outline">{row.weight}</td>
                        <td className="px-5 py-4 text-outline">{row.fat}</td>
                        <td className="px-5 py-4 text-outline">{row.muscle}</td>
                        <td className="px-5 py-4 text-outline">{row.bmi}</td>
                        {selectedPatient && (
                          <td className="px-5 py-4 text-right">
                            <Link href={`/clients/${selectedPatient}`} className="text-xs text-primary hover:underline" style={{ fontFamily: "Inter, sans-serif" }}>View profile →</Link>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </main>

      {showAdd && (
        <Modal title={`Log Measurement — ${currentPatient?.name}`} onClose={() => setShowAdd(false)}>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="text-[11px] text-outline uppercase tracking-wider font-bold block mb-1.5" style={{ fontFamily: "Inter, sans-serif" }}>Date</label>
              <input type="date" required value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} className="w-full bg-surface-container-highest rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
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
                  <input type="number" step="0.1" required value={(form as Record<string, string>)[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} className="w-full bg-surface-container-highest rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder={placeholder} />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowAdd(false)} className="px-5 py-2.5 text-sm text-outline border border-outline-variant rounded-full hover:bg-surface-container-low transition-colors">Cancel</button>
              <button type="submit" disabled={saving} className="px-5 py-2.5 text-sm bg-primary text-white font-semibold rounded-full hover:bg-primary-container transition-colors disabled:opacity-60 flex items-center gap-2">
                {saving ? <><span className="material-symbols-outlined text-sm animate-spin" style={{ animationDuration: "1s" }}>progress_activity</span> Saving...</> : "Save Measurement"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      <Toasts toasts={toasts} remove={remove} />
    </div>
  );
}
