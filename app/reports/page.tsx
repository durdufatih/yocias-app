"use client";

import { useState, useMemo, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import Toasts from "../components/Toast";
import { useToast } from "../lib/useToast";
import { useAuth } from "../lib/useAuth";
import { getPatients, getAllMeasurementsWithPatient } from "../lib/db";
import type { Patient, Measurement } from "../lib/data";

const PAGE_SIZE = 8;

function StatCard({ label, value, sub, icon, accent }: { label: string; value: string | number; sub?: string; icon: string; accent?: string }) {
  return (
    <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/20 flex items-start gap-4">
      <div className={`p-3 rounded-xl ${accent ?? "bg-primary/10"}`}>
        <span className="material-symbols-outlined text-xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
      </div>
      <div>
        <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-1" style={{ fontFamily: "Inter, sans-serif" }}>{label}</p>
        <p className="text-2xl font-extrabold text-on-surface" style={{ fontFamily: "Manrope, sans-serif" }}>{value}</p>
        {sub && <p className="text-xs text-outline mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const { loading: authLoading } = useAuth();
  const { toasts, addToast, remove } = useToast();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [allMeasurements, setAllMeasurements] = useState<Array<Measurement & { patient: Patient }>>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (authLoading) return;
    Promise.all([getPatients(), getAllMeasurementsWithPatient()]).then(([p, m]) => {
      setPatients(p);
      setAllMeasurements(m);
      setLoading(false);
    });
  }, [authLoading]);

  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const stats = useMemo(() => {
    const active = patients.filter((p) => p.status === "Active").length;
    const critical = patients.filter((p) => p.status === "Critical").length;
    const maintenance = patients.filter((p) => p.status === "Maintenance").length;
    const inactive = patients.filter((p) => p.status === "Inactive").length;

    const measThisMonth = allMeasurements.filter((m) => {
      const raw = m.date ?? "";
      return raw.startsWith(thisMonth) || (m.date ?? "").includes(thisMonth.replace("-", " "));
    }).length;

    const bmis = allMeasurements.map((m) => m.bmi).filter((b): b is number => !!b);
    const avgBmi = bmis.length ? (bmis.reduce((a, b) => a + b, 0) / bmis.length).toFixed(1) : "—";

    const weights = allMeasurements.map((m) => m.weight).filter((w): w is number => !!w);
    const avgWeight = weights.length ? (weights.reduce((a, b) => a + b, 0) / weights.length).toFixed(1) : "—";

    return { active, critical, maintenance, inactive, measThisMonth, avgBmi, avgWeight, total: patients.length, totalMeas: allMeasurements.length };
  }, [patients, allMeasurements, thisMonth]);

  const statusDist = [
    { label: "Aktif", count: stats.active, color: "bg-primary" },
    { label: "Maintenance", count: stats.maintenance, color: "bg-secondary" },
    { label: "Kritik", count: stats.critical, color: "bg-error" },
    { label: "İnaktif", count: stats.inactive, color: "bg-outline-variant" },
  ];

  const filtered = useMemo(() => {
    if (!search) return patients;
    return patients.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.protocol ?? "").toLowerCase().includes(search.toLowerCase())
    );
  }, [patients, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="bg-surface min-h-screen">
      <Sidebar />
      <main className="ml-64 min-h-screen">
        <TopBar title="Klinik Raporları" />

        <div className="p-10 max-w-6xl mx-auto space-y-8">

          {/* Stat Cards */}
          <div className="grid grid-cols-4 gap-5">
            <StatCard label="Toplam Danışan" value={loading ? "…" : stats.total} icon="group" sub={`${stats.active} aktif`} />
            <StatCard label="Toplam Ölçüm" value={loading ? "…" : stats.totalMeas} icon="straighten" sub={`${stats.measThisMonth} bu ay`} />
            <StatCard label="Ort. BMI" value={loading ? "…" : stats.avgBmi} icon="monitor_weight" sub="tüm ölçümler" />
            <StatCard label="Ort. Kilo" value={loading ? "…" : `${stats.avgWeight} kg`} icon="fitness_center" sub="tüm ölçümler" />
          </div>

          {/* Status Distribution + Recent Measurements */}
          <div className="grid grid-cols-3 gap-6">

            {/* Status breakdown */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/20">
              <h3 className="text-sm font-bold text-on-surface mb-5" style={{ fontFamily: "Manrope, sans-serif" }}>Danışan Durumları</h3>
              <div className="space-y-4">
                {statusDist.map((s) => (
                  <div key={s.label}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs text-outline">{s.label}</span>
                      <span className="text-xs font-bold text-on-surface">{s.count}</span>
                    </div>
                    <div className="h-1.5 bg-outline-variant/15 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${s.color} transition-all duration-500`}
                        style={{ width: stats.total ? `${(s.count / stats.total) * 100}%` : "0%" }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-5 border-t border-outline-variant/10 grid grid-cols-2 gap-3">
                <div className="bg-surface-container rounded-xl p-3 text-center">
                  <p className="text-[10px] text-outline uppercase tracking-wider mb-1">Kritik</p>
                  <p className="text-xl font-extrabold text-error">{stats.critical}</p>
                </div>
                <div className="bg-surface-container rounded-xl p-3 text-center">
                  <p className="text-[10px] text-outline uppercase tracking-wider mb-1">Aktif Oran</p>
                  <p className="text-xl font-extrabold text-primary">
                    {stats.total ? `${Math.round((stats.active / stats.total) * 100)}%` : "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Measurements */}
            <div className="col-span-2 bg-surface-container-lowest rounded-2xl border border-outline-variant/20 overflow-hidden">
              <div className="px-6 py-5 border-b border-outline-variant/10">
                <h3 className="text-sm font-bold text-on-surface" style={{ fontFamily: "Manrope, sans-serif" }}>Son Ölçümler</h3>
              </div>
              <div className="divide-y divide-outline-variant/10">
                {loading ? (
                  <p className="text-sm text-outline text-center py-10">Yükleniyor…</p>
                ) : allMeasurements.slice(0, 6).map((m, i) => (
                  <div key={i} className="flex items-center justify-between px-6 py-3.5 hover:bg-surface/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold">
                        {m.patient.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-on-surface">{m.patient.name}</p>
                        <p className="text-[10px] text-outline">{m.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-right">
                      <div>
                        <p className="text-[10px] text-outline">Kilo</p>
                        <p className="text-sm font-bold">{m.weight ?? "—"} kg</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-outline">Yağ</p>
                        <p className="text-sm font-bold">{m.fat ?? "—"}%</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-outline">BMI</p>
                        <p className="text-sm font-bold">{m.bmi ?? "—"}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {!loading && allMeasurements.length === 0 && (
                  <p className="text-sm text-outline text-center py-10">Henüz ölçüm yok.</p>
                )}
              </div>
            </div>
          </div>

          {/* Patient Table */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 overflow-hidden">
            <div className="p-6 flex justify-between items-center border-b border-outline-variant/10">
              <h3 className="text-lg font-bold" style={{ fontFamily: "Manrope, sans-serif" }}>Danışan Listesi</h3>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">search</span>
                <input
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="bg-surface border-none rounded-lg pl-9 pr-4 py-2 text-xs w-56 focus:outline-none focus:ring-1 focus:ring-primary/20"
                  placeholder="İsim veya protokol ara…"
                  type="text"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-bold text-outline uppercase tracking-wider border-b border-outline-variant/10" style={{ fontFamily: "Inter, sans-serif" }}>
                    <th className="px-6 py-4">Danışan</th>
                    <th className="px-6 py-4">Protokol</th>
                    <th className="px-6 py-4">Son Ziyaret</th>
                    <th className="px-6 py-4">Durum</th>
                    <th className="px-6 py-4">Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {loading ? (
                    <tr><td colSpan={5} className="px-6 py-12 text-center text-outline text-sm">Yükleniyor…</td></tr>
                  ) : paginated.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-12 text-center text-outline text-sm">Danışan bulunamadı.</td></tr>
                  ) : paginated.map((p) => {
                    const statusColor: Record<string, string> = {
                      Active: "text-primary bg-primary/10",
                      Maintenance: "text-secondary bg-secondary/10",
                      Critical: "text-error bg-error/10",
                      Inactive: "text-outline bg-outline-variant/10",
                    };
                    const trendIcon: Record<string, string> = {
                      Improving: "trending_up", Stable: "trending_flat",
                      Optimal: "star", Warning: "warning",
                    };
                    return (
                      <tr key={p.id} className="hover:bg-surface/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                              {p.name.split(" ").map((n) => n[0]).join("")}
                            </div>
                            <div>
                              <p className="text-sm font-semibold">{p.name}</p>
                              {p.age && <p className="text-[10px] text-outline">{p.age} yaş</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-outline">{p.protocol ?? "—"}</td>
                        <td className="px-6 py-4 text-xs text-outline">{p.lastVisit ?? "—"}</td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor[p.status] ?? "text-outline bg-outline-variant/10"}`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="material-symbols-outlined text-base text-outline">
                            {trendIcon[p.trend] ?? "trending_flat"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 flex justify-between items-center border-t border-outline-variant/10">
              <span className="text-[10px] font-bold text-outline">
                {filtered.length} danışan — Sayfa {page} / {totalPages}
              </span>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-1.5 rounded border border-outline-variant/30 text-outline hover:text-on-surface disabled:opacity-30">
                  <span className="material-symbols-outlined text-base">chevron_left</span>
                </button>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="p-1.5 rounded border border-outline-variant/30 text-outline hover:text-on-surface disabled:opacity-30">
                  <span className="material-symbols-outlined text-base">chevron_right</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>
      <Toasts toasts={toasts} remove={remove} />
    </div>
  );
}
