"use client";

import { useState, useMemo } from "react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import Toasts from "../components/Toast";
import { useToast } from "../lib/useToast";
import { patients } from "../lib/data";

type Period = "Last 30 Days" | "Last Quarter" | "Last Year";

const chartData: Record<Period, { label: string; height: number; current?: boolean }[]> = {
  "Last 30 Days": [
    { label: "W1", height: 40 }, { label: "W2", height: 65 },
    { label: "W3", height: 55 }, { label: "W4", height: 85, current: true },
  ],
  "Last Quarter": [
    { label: "M1", height: 52 }, { label: "M2", height: 68 },
    { label: "M3", height: 80, current: true },
  ],
  "Last Year": [
    { label: "Q1", height: 45 }, { label: "Q2", height: 60 },
    { label: "Q3", height: 72 }, { label: "Q4", height: 88, current: true },
  ],
};

const successRate: Record<Period, string> = {
  "Last 30 Days": "94.2",
  "Last Quarter": "91.8",
  "Last Year": "89.4",
};

const PAGE_SIZE = 5;

export default function ReportsPage() {
  const { toasts, addToast, remove } = useToast();

  const [period, setPeriod] = useState<Period>("Last 30 Days");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showInsight, setShowInsight] = useState(true);

  const filtered = useMemo(() => {
    if (!search) return patients;
    return patients.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.protocol.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (val: string) => { setSearch(val); setPage(1); };

  const handleDownload = (name: string) => {
    addToast(`Downloading report for ${name}...`, "info");
    setTimeout(() => addToast(`${name}'s report downloaded.`), 1200);
  };

  const handleGenerate = () => {
    addToast("Generating impact report...", "info");
    setTimeout(() => addToast("Impact report generated and saved."), 1500);
  };

  const chart = chartData[period];

  return (
    <div className="bg-surface min-h-screen">
      <Sidebar />
      <main className="ml-64 min-h-screen">
        <TopBar title="Clinical Reports" />

        <div className="p-10 max-w-6xl mx-auto space-y-10">
          {/* Hero Grid */}
          <div className="grid grid-cols-3 gap-8">
            {/* Chart */}
            <div className="col-span-2 bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/20 shadow-sm">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h3 className="text-sm font-semibold text-outline uppercase tracking-wider mb-1" style={{ fontFamily: "Inter, sans-serif" }}>Patient Success Rate</h3>
                  <p className="text-2xl font-bold" style={{ fontFamily: "Manrope, sans-serif" }}>Monthly Trend</p>
                </div>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value as Period)}
                  className="text-xs font-bold bg-surface-container border-none rounded-lg py-1.5 px-3 focus:outline-none text-on-surface cursor-pointer"
                >
                  {(["Last 30 Days", "Last Quarter", "Last Year"] as Period[]).map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div className="h-40 flex items-end justify-between gap-6">
                {chart.map((bar, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                    <div
                      className={`w-full rounded-t-lg transition-all hover:opacity-80 cursor-pointer ${bar.current ? "bg-primary" : "bg-surface-container hover:bg-primary/20"}`}
                      style={{ height: `${bar.height}%` }}
                      onClick={() => addToast(`${bar.label}: ${bar.height}% success rate`, "info")}
                    />
                    <span className={`text-[10px] font-medium transition-colors ${bar.current ? "font-bold text-primary" : "text-outline"}`} style={{ fontFamily: "Inter, sans-serif" }}>
                      {bar.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Success Card */}
            <div className="bg-primary p-8 rounded-2xl flex flex-col justify-between text-white shadow-lg shadow-primary/10">
              <div>
                <span className="text-xs font-bold opacity-70 tracking-widest uppercase" style={{ fontFamily: "Inter, sans-serif" }}>Global Success</span>
                <h4 className="text-5xl font-extrabold mt-2" style={{ fontFamily: "Manrope, sans-serif" }}>
                  {successRate[period]}<span className="text-2xl opacity-60">%</span>
                </h4>
                <div className="flex items-center gap-1.5 mt-2 text-xs font-medium bg-white/10 w-fit px-2 py-1 rounded-md">
                  <span className="material-symbols-outlined text-sm">trending_up</span>
                  <span>+2.4%</span>
                </div>
                <p className="text-xs opacity-60 mt-3" style={{ fontFamily: "Inter, sans-serif" }}>{period}</p>
              </div>
              <button
                onClick={handleGenerate}
                className="w-full py-2.5 bg-white text-primary text-xs font-bold rounded-lg hover:bg-primary-fixed transition-colors active:scale-95"
              >
                GENERATE REPORT
              </button>
            </div>
          </div>

          {/* Patient Summaries */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-sm overflow-hidden">
            <div className="p-8 flex justify-between items-center border-b border-outline-variant/20">
              <h3 className="text-lg font-bold" style={{ fontFamily: "Manrope, sans-serif" }}>Patient Summaries</h3>
              <div className="flex gap-4">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">search</span>
                  <input
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="bg-surface border-none rounded-lg pl-9 pr-4 py-2 text-xs w-56 focus:outline-none focus:ring-1 focus:ring-primary/20"
                    placeholder="Search by name or protocol..."
                    type="text"
                  />
                </div>
                <button
                  onClick={() => addToast("Advanced filters coming soon.", "info")}
                  className="px-4 py-2 bg-surface text-outline rounded-lg text-xs font-bold hover:text-on-surface transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">tune</span>
                  Filters
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-bold text-outline uppercase tracking-wider border-b border-outline-variant/10" style={{ fontFamily: "Inter, sans-serif" }}>
                    <th className="px-8 py-4 font-semibold">Patient</th>
                    <th className="px-8 py-4 font-semibold">Protocol</th>
                    <th className="px-8 py-4 font-semibold">Last Visit</th>
                    <th className="px-8 py-4 font-semibold">Status</th>
                    <th className="px-8 py-4 font-semibold text-right">Report</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {paginated.length === 0 ? (
                    <tr><td colSpan={5} className="px-8 py-16 text-center text-outline text-sm">No patients found.</td></tr>
                  ) : paginated.map((patient) => (
                    <tr key={patient.id} className="hover:bg-surface transition-colors group">
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-primary text-xs font-bold">
                            {patient.name.split(" ").map((n) => n[0]).join("")}
                          </div>
                          <span className="text-sm font-semibold">{patient.name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-4 text-xs font-medium text-outline">{patient.protocol}</td>
                      <td className="px-8 py-4 text-xs text-outline">{patient.lastVisit}</td>
                      <td className="px-8 py-4">
                        <div className={`w-1.5 h-1.5 rounded-full ${patient.status === "Inactive" ? "bg-outline-variant" : "bg-primary"}`} />
                      </td>
                      <td className="px-8 py-4 text-right">
                        <button
                          onClick={() => handleDownload(patient.name)}
                          className="text-primary opacity-0 group-hover:opacity-100 transition-opacity hover:text-primary-container"
                        >
                          <span className="material-symbols-outlined text-xl">download</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-8 py-4 flex justify-between items-center bg-surface/30">
              <span className="text-[10px] font-bold text-outline" style={{ fontFamily: "Inter, sans-serif" }}>
                PAGE {page} OF {totalPages} — {filtered.length} patients
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded border border-outline-variant/30 text-outline hover:text-on-surface disabled:opacity-30 transition-colors"
                >
                  <span className="material-symbols-outlined text-base">chevron_left</span>
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded border border-outline-variant/30 text-outline hover:text-on-surface disabled:opacity-30 transition-colors"
                >
                  <span className="material-symbols-outlined text-base">chevron_right</span>
                </button>
              </div>
            </div>
          </div>

          {/* Intelligence Insight */}
          {showInsight && (
            <div className="bg-primary/5 border border-primary/10 p-8 rounded-2xl flex items-start gap-8">
              <div className="p-3 bg-primary/10 rounded-xl text-primary">
                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-bold text-primary" style={{ fontFamily: "Manrope, sans-serif" }}>Intelligence Insight</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-primary/10 text-primary rounded tracking-wider uppercase" style={{ fontFamily: "Inter, sans-serif" }}>Experimental</span>
                </div>
                <p className="text-sm text-outline leading-relaxed max-w-2xl">
                  A significant <span className="font-bold text-on-surface">12% positive shift</span> in metabolic markers has been detected. We recommend generating a summary for your next clinical board review.
                </p>
                <div className="mt-6 flex gap-6">
                  <button onClick={handleGenerate} className="text-xs font-bold text-primary hover:underline" style={{ fontFamily: "Inter, sans-serif" }}>
                    GENERATE IMPACT REPORT
                  </button>
                  <button onClick={() => setShowInsight(false)} className="text-xs font-bold text-outline hover:text-on-surface" style={{ fontFamily: "Inter, sans-serif" }}>
                    DISMISS
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Toasts toasts={toasts} remove={remove} />
    </div>
  );
}
