"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import Modal from "../components/Modal";
import Toasts from "../components/Toast";
import { useToast } from "../lib/useToast";
import { useAuth } from "../lib/useAuth";
import { getPatients, createPatient } from "../lib/db";
import { statusStyles, trendBarColor, trendTextColor, type Status, type Patient } from "../lib/data";
import { useI18n } from "../lib/i18n";
import posthog from "posthog-js";

const PAGE_SIZE = 5;
const ALL_STATUSES: Status[] = ["Active", "Maintenance", "Critical", "Inactive"];

export default function DashboardPage() {
  const router = useRouter();
  const { t } = useI18n();
  const { user, loading: authLoading } = useAuth();
  const { toasts, addToast, remove } = useToast();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<Status | "All">("All");
  const [showFilter, setShowFilter] = useState(false);
  const [page, setPage] = useState(1);
  const [showNewPatient, setShowNewPatient] = useState(false);
  const [newPatient, setNewPatient] = useState({ firstName: "", lastName: "", email: "", age: "", protocol: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (authLoading || !user) return;
    setLoadingData(true);
    getPatients()
      .then(setPatients)
      .catch(() => addToast("Failed to load patients.", "info"))
      .finally(() => setLoadingData(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user, refreshKey]);

  const filtered = useMemo(() => {
    return patients.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.id.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === "All" || p.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [patients, search, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (val: string) => { setSearch(val); setPage(1); };
  const handleFilter = (status: Status | "All") => { setFilterStatus(status); setPage(1); setShowFilter(false); };

  const handleNewPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createPatient({
        first_name: newPatient.firstName,
        last_name: newPatient.lastName,
        email: newPatient.email || undefined,
        age: newPatient.age ? parseInt(newPatient.age) : undefined,
        protocol: newPatient.protocol || undefined,
      });
      posthog.capture("patient_add_completed", { protocol: newPatient.protocol });
      addToast(`${newPatient.firstName} ${newPatient.lastName} added to directory.`);
      setShowNewPatient(false);
      setNewPatient({ firstName: "", lastName: "", email: "", age: "", protocol: "" });
      setRefreshKey((k) => k + 1);
    } catch {
      addToast("Failed to add patient.", "info");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <span className="material-symbols-outlined text-primary text-4xl animate-spin" style={{ animationDuration: "1s" }}>
          progress_activity
        </span>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <Sidebar />
      <main className="pl-64 min-h-screen">
        <TopBar search={search} onSearch={handleSearch} />
        <section className="p-10 max-w-7xl mx-auto">

          {/* Header */}
          <div className="flex justify-between items-start mb-12">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-on-background mb-1" style={{ fontFamily: "Manrope, sans-serif" }}>
                {t.dashboard.title}
              </h2>
              <p className="text-outline text-sm">{t.nav.clients}</p>
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <button
                  onClick={() => setShowFilter(!showFilter)}
                  className="px-5 py-2 text-sm bg-surface-container-low text-on-surface font-medium rounded-lg hover:bg-surface-container-high transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">filter_list</span>
                  {filterStatus === "All" ? t.dashboard.allStatuses : filterStatus}
                  {filterStatus !== "All" && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                </button>
                {showFilter && (
                  <div className="absolute top-full mt-2 right-0 bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-lg py-1.5 z-50 min-w-[160px]">
                    {(["All", ...ALL_STATUSES] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => handleFilter(s)}
                        className={`w-full px-4 py-2.5 text-sm text-left transition-colors flex items-center justify-between ${filterStatus === s ? "text-primary font-semibold" : "text-on-surface hover:bg-surface-container-low"}`}
                      >
                        {s}
                        {filterStatus === s && (
                          <span className="material-symbols-outlined text-base text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                            check
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => { posthog.capture("patient_add_started"); setShowNewPatient(true); }}
                className="px-5 py-2 text-sm bg-primary text-white font-semibold rounded-lg flex items-center gap-2 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-sm">person_add</span>
                {t.dashboard.addPatient}
              </button>
            </div>
          </div>


          {/* Table */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/10">
                  {[t.dashboard.patient, t.dashboard.status, t.dashboard.lastVisit, t.dashboard.trend, ""].map((col, i) => (
                    <th
                      key={col}
                      className={`px-8 py-4 text-outline text-[10px] uppercase tracking-widest font-bold ${i === 4 ? "text-right" : ""}`}
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loadingData ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-16 text-center">
                      <span className="material-symbols-outlined text-primary text-3xl animate-spin" style={{ animationDuration: "1s" }}>
                        progress_activity
                      </span>
                    </td>
                  </tr>
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-16 text-center text-outline text-sm">
                      {patients.length === 0
                        ? t.dashboard.noPatients
                        : `"${search}" — ${t.dashboard.noPatients}`}
                    </td>
                  </tr>
                ) : (
                  paginated.map((patient) => (
                    <tr
                      key={patient.id}
                      className="hover:bg-surface-container-low/30 transition-colors border-b border-outline-variant/5 last:border-0"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-sm">
                            {patient.name.split(" ").map((n) => n[0]).join("")}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-on-surface">{patient.name}</p>
                            <p className="text-[11px] text-outline" style={{ fontFamily: "Inter, sans-serif" }}>
                              ID: {patient.id.slice(0, 8).toUpperCase()}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span
                          className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded ${statusStyles[patient.status]}`}
                          style={{ fontFamily: "Inter, sans-serif" }}
                        >
                          {patient.status}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm text-on-surface font-medium">{patient.lastVisit ?? "—"}</p>
                        <p className="text-[10px] text-outline" style={{ fontFamily: "Inter, sans-serif" }}>
                          {patient.visitType ?? ""}
                        </p>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-20 h-1 bg-surface-container-high rounded-full overflow-hidden">
                            <div
                              className={`${trendBarColor[patient.trend]} h-full rounded-full`}
                              style={{ width: `${patient.trendPct}%` }}
                            />
                          </div>
                          <span
                            className={`text-[11px] font-bold ${trendTextColor[patient.trend]}`}
                            style={{ fontFamily: "Inter, sans-serif" }}
                          >
                            {patient.trend}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <Link href={`/clients/${patient.id}`} className="text-outline hover:text-primary transition-colors">
                          <span className="material-symbols-outlined text-xl">keyboard_arrow_right</span>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="px-8 py-6 flex justify-between items-center border-t border-outline-variant/5">
              <p className="text-[11px] text-outline font-medium" style={{ fontFamily: "Inter, sans-serif" }}>
                Showing {filtered.length === 0 ? 0 : Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–
                {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} clients
              </p>
              <div className="flex gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container-low text-outline disabled:opacity-30 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold text-[11px] transition-colors ${page === p ? "bg-primary text-white" : "hover:bg-surface-container-low text-outline"}`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container-low text-outline disabled:opacity-30 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
            </div>
          </div>

        </section>
      </main>

      {/* New Patient Modal */}
      {showNewPatient && (
        <Modal title={t.dashboard.addPatient} onClose={() => setShowNewPatient(false)} size="md">
          <form onSubmit={handleNewPatient} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] text-outline uppercase tracking-wider font-bold block mb-1.5" style={{ fontFamily: "Inter, sans-serif" }}>
                  {t.dashboard.firstName}
                </label>
                <input
                  required
                  value={newPatient.firstName}
                  onChange={(e) => setNewPatient((p) => ({ ...p, firstName: e.target.value }))}
                  className="w-full bg-surface-container-highest rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Elena"
                />
              </div>
              <div>
                <label className="text-[11px] text-outline uppercase tracking-wider font-bold block mb-1.5" style={{ fontFamily: "Inter, sans-serif" }}>
                  {t.dashboard.lastName}
                </label>
                <input
                  required
                  value={newPatient.lastName}
                  onChange={(e) => setNewPatient((p) => ({ ...p, lastName: e.target.value }))}
                  className="w-full bg-surface-container-highest rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Vance"
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] text-outline uppercase tracking-wider font-bold block mb-1.5" style={{ fontFamily: "Inter, sans-serif" }}>
                {t.dashboard.email}
              </label>
              <input
                type="email"
                required
                value={newPatient.email}
                onChange={(e) => setNewPatient((p) => ({ ...p, email: e.target.value }))}
                className="w-full bg-surface-container-highest rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="patient@email.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] text-outline uppercase tracking-wider font-bold block mb-1.5" style={{ fontFamily: "Inter, sans-serif" }}>
                  {t.dashboard.age}
                </label>
                <input
                  type="number"
                  required
                  value={newPatient.age}
                  onChange={(e) => setNewPatient((p) => ({ ...p, age: e.target.value }))}
                  className="w-full bg-surface-container-highest rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="34"
                  min="1"
                  max="120"
                />
              </div>
              <div>
                <label className="text-[11px] text-outline uppercase tracking-wider font-bold block mb-1.5" style={{ fontFamily: "Inter, sans-serif" }}>
                  {t.dashboard.protocol}
                </label>
                <select
                  value={newPatient.protocol}
                  onChange={(e) => setNewPatient((p) => ({ ...p, protocol: e.target.value }))}
                  className="w-full bg-surface-container-highest rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select...</option>
                  {["Anti-Inflammatory Protocol", "Weight Management", "Diabetic Management", "Hypertension Diet", "Sports Nutrition", "GI Restoration", "Metabolic Reset"].map(
                    (pr) => <option key={pr}>{pr}</option>
                  )}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowNewPatient(false)}
                className="px-5 py-2.5 text-sm text-outline border border-outline-variant rounded-full hover:bg-surface-container-low transition-colors"
              >
                {t.dashboard.cancel}
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 text-sm bg-primary text-white font-semibold rounded-full hover:bg-primary-container transition-colors active:scale-95 disabled:opacity-60 flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <span className="material-symbols-outlined text-sm animate-spin" style={{ animationDuration: "1s" }}>
                      progress_activity
                    </span>
                    {t.dashboard.adding}
                  </>
                ) : (
                  t.dashboard.add
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {showFilter && <div className="fixed inset-0 z-40" onClick={() => setShowFilter(false)} />}
      <Toasts toasts={toasts} remove={remove} />

      {/* FAB */}
      <button
        onClick={() => { posthog.capture("patient_add_started"); setShowNewPatient(true); }}
        className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-white rounded-2xl shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-50"
      >
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
          person_add
        </span>
      </button>
    </div>
  );
}
