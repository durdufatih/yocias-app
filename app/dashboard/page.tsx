"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import Modal from "../components/Modal";
import Toasts from "../components/Toast";
import { useToast } from "../lib/useToast";
import { patients, statusStyles, trendBarColor, trendTextColor, type Status } from "../lib/data";

const PAGE_SIZE = 5;
const ALL_STATUSES: Status[] = ["Active", "Maintenance", "Critical", "Inactive"];

export default function DashboardPage() {
  const router = useRouter();
  const { toasts, addToast, remove } = useToast();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<Status | "All">("All");
  const [showFilter, setShowFilter] = useState(false);
  const [page, setPage] = useState(1);
  const [showNewPatient, setShowNewPatient] = useState(false);
  const [newPatient, setNewPatient] = useState({ firstName: "", lastName: "", email: "", age: "", protocol: "" });

  const filtered = useMemo(() => {
    return patients.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.id.includes(search.toLowerCase());
      const matchStatus = filterStatus === "All" || p.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [search, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (val: string) => { setSearch(val); setPage(1); };
  const handleFilter = (status: Status | "All") => { setFilterStatus(status); setPage(1); setShowFilter(false); };

  const handleNewPatient = (e: React.FormEvent) => {
    e.preventDefault();
    addToast(`${newPatient.firstName} ${newPatient.lastName} added to directory.`);
    setShowNewPatient(false);
    setNewPatient({ firstName: "", lastName: "", email: "", age: "", protocol: "" });
  };

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
                Patient Directory
              </h2>
              <p className="text-outline text-sm">Manage clinical consultations and nutritional records.</p>
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <button
                  onClick={() => setShowFilter(!showFilter)}
                  className="px-5 py-2 text-sm bg-surface-container-low text-on-surface font-medium rounded-lg hover:bg-surface-container-high transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">filter_list</span>
                  {filterStatus === "All" ? "Filter Status" : filterStatus}
                  {filterStatus !== "All" && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
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
                        {filterStatus === s && <span className="material-symbols-outlined text-base text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowNewPatient(true)}
                className="px-5 py-2 text-sm bg-primary text-white font-semibold rounded-lg flex items-center gap-2 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-sm">person_add</span>
                New Client
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-8 mb-16">
            {[
              { label: "Active Patients", value: patients.filter(p => p.status === "Active").length.toString() },
              { label: "Today's Visits", value: "28" },
              { label: "Retention", value: "94%" },
              { label: "AI Confidence", value: "99.2%", highlight: true },
            ].map((stat) => (
              <div key={stat.label} className="p-2">
                <p className="text-outline text-[11px] uppercase tracking-widest mb-1 font-semibold" style={{ fontFamily: "Inter, sans-serif" }}>{stat.label}</p>
                <p className={`text-3xl font-bold ${stat.highlight ? "text-secondary" : "text-on-surface"}`} style={{ fontFamily: "Manrope, sans-serif" }}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/10">
                  {["Client Identity", "Clinical Status", "Last Visit", "Metabolic Trend", "Actions"].map((col, i) => (
                    <th key={col} className={`px-8 py-4 text-outline text-[10px] uppercase tracking-widest font-bold ${i === 4 ? "text-right" : ""}`} style={{ fontFamily: "Inter, sans-serif" }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-16 text-center text-outline text-sm">
                      No patients found matching &quot;{search}&quot;
                    </td>
                  </tr>
                ) : paginated.map((patient) => (
                  <tr key={patient.id} className="hover:bg-surface-container-low/30 transition-colors border-b border-outline-variant/5 last:border-0">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-sm">
                          {patient.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-on-surface">{patient.name}</p>
                          <p className="text-[11px] text-outline" style={{ fontFamily: "Inter, sans-serif" }}>ID: {patient.id.toUpperCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded ${statusStyles[patient.status]}`} style={{ fontFamily: "Inter, sans-serif" }}>
                        {patient.status}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm text-on-surface font-medium">{patient.lastVisit}</p>
                      <p className="text-[10px] text-outline" style={{ fontFamily: "Inter, sans-serif" }}>{patient.visitType}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-20 h-1 bg-surface-container-high rounded-full overflow-hidden">
                          <div className={`${trendBarColor[patient.trend]} h-full rounded-full`} style={{ width: `${patient.trendPct}%` }} />
                        </div>
                        <span className={`text-[11px] font-bold ${trendTextColor[patient.trend]}`} style={{ fontFamily: "Inter, sans-serif" }}>{patient.trend}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <Link href={`/clients/${patient.id}`} className="text-outline hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-xl">keyboard_arrow_right</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="px-8 py-6 flex justify-between items-center border-t border-outline-variant/5">
              <p className="text-[11px] text-outline font-medium" style={{ fontFamily: "Inter, sans-serif" }}>
                Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} clients
              </p>
              <div className="flex gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container-low text-outline disabled:opacity-30 transition-colors">
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold text-[11px] transition-colors ${page === p ? "bg-primary text-white" : "hover:bg-surface-container-low text-outline"}`}>
                    {p}
                  </button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container-low text-outline disabled:opacity-30 transition-colors">
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
            </div>
          </div>

          {/* AI Insight */}
          <div className="mt-12 p-8 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-primary mb-1" style={{ fontFamily: "Manrope, sans-serif" }}>Metabolic Trend Detected</h3>
                <p className="text-[13px] text-on-surface-variant max-w-xl">8.2% of your client base is showing markers of inflammatory response based on the last 14 days of data.</p>
              </div>
            </div>
            <button
              onClick={() => router.push("/reports")}
              className="px-6 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:shadow-lg transition-all active:scale-95"
            >
              Generate Report
            </button>
          </div>
        </section>
      </main>

      {/* New Patient Modal */}
      {showNewPatient && (
        <Modal title="New Patient" onClose={() => setShowNewPatient(false)} size="md">
          <form onSubmit={handleNewPatient} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] text-outline uppercase tracking-wider font-bold block mb-1.5" style={{ fontFamily: "Inter, sans-serif" }}>First Name</label>
                <input required value={newPatient.firstName} onChange={e => setNewPatient(p => ({ ...p, firstName: e.target.value }))} className="w-full bg-surface-container-highest rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Elena" />
              </div>
              <div>
                <label className="text-[11px] text-outline uppercase tracking-wider font-bold block mb-1.5" style={{ fontFamily: "Inter, sans-serif" }}>Last Name</label>
                <input required value={newPatient.lastName} onChange={e => setNewPatient(p => ({ ...p, lastName: e.target.value }))} className="w-full bg-surface-container-highest rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Vance" />
              </div>
            </div>
            <div>
              <label className="text-[11px] text-outline uppercase tracking-wider font-bold block mb-1.5" style={{ fontFamily: "Inter, sans-serif" }}>Email</label>
              <input type="email" required value={newPatient.email} onChange={e => setNewPatient(p => ({ ...p, email: e.target.value }))} className="w-full bg-surface-container-highest rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="patient@email.com" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] text-outline uppercase tracking-wider font-bold block mb-1.5" style={{ fontFamily: "Inter, sans-serif" }}>Age</label>
                <input type="number" required value={newPatient.age} onChange={e => setNewPatient(p => ({ ...p, age: e.target.value }))} className="w-full bg-surface-container-highest rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="34" min="1" max="120" />
              </div>
              <div>
                <label className="text-[11px] text-outline uppercase tracking-wider font-bold block mb-1.5" style={{ fontFamily: "Inter, sans-serif" }}>Protocol</label>
                <select value={newPatient.protocol} onChange={e => setNewPatient(p => ({ ...p, protocol: e.target.value }))} className="w-full bg-surface-container-highest rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="">Select...</option>
                  {["Anti-Inflammatory Protocol", "Weight Management", "Diabetic Management", "Hypertension Diet", "Sports Nutrition", "GI Restoration", "Metabolic Reset"].map(pr => <option key={pr}>{pr}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowNewPatient(false)} className="px-5 py-2.5 text-sm text-outline border border-outline-variant rounded-full hover:bg-surface-container-low transition-colors">Cancel</button>
              <button type="submit" className="px-5 py-2.5 text-sm bg-primary text-white font-semibold rounded-full hover:bg-primary-container transition-colors active:scale-95">Add Patient</button>
            </div>
          </form>
        </Modal>
      )}

      {showFilter && <div className="fixed inset-0 z-40" onClick={() => setShowFilter(false)} />}

      <Toasts toasts={toasts} remove={remove} />

      {/* FAB */}
      <button onClick={() => setShowNewPatient(true)} className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-white rounded-2xl shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-50">
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>person_add</span>
      </button>
    </div>
  );
}
