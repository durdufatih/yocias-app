"use client";

import { useState, useEffect } from "react";
import { useI18n } from "../lib/i18n";

function PatientScreen({ d }: { d: ReturnType<typeof useI18n>["t"]["demo"] }) {
  const patients = [
    { name: "Ayşe Kaya",    status: d.statusGood,     color: "text-green-600 bg-green-50",   weight: "68.2 kg", progress: 78 },
    { name: "Mehmet Demir", status: d.statusMonitor,  color: "text-yellow-600 bg-yellow-50", weight: "92.5 kg", progress: 45 },
    { name: "Zeynep Çelik", status: d.statusCritical, color: "text-red-500 bg-red-50",       weight: "74.1 kg", progress: 22 },
    { name: "Ali Yıldız",   status: d.statusGood,     color: "text-green-600 bg-green-50",   weight: "81.0 kg", progress: 65 },
  ];

  return (
    <div className="flex h-full gap-4">
      <div className="w-56 flex flex-col gap-2">
        <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-1" style={{ fontFamily: "Inter, sans-serif" }}>{d.patients}</p>
        {patients.map((p, i) => (
          <div key={p.name} className={`rounded-xl p-3 border transition-all ${i === 0 ? "border-primary/30 bg-primary/5" : "border-outline-variant/15 bg-surface-container-lowest"}`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-on-surface" style={{ fontFamily: "Manrope, sans-serif" }}>{p.name}</p>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${p.color}`}>{p.status}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1 bg-outline-variant/20 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${p.progress}%`, transitionDelay: `${i * 150}ms` }} />
              </div>
              <p className="text-[10px] text-outline">{p.weight}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex-1 flex flex-col gap-3">
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: d.weight,   value: "68.2 kg", delta: "▼ 3.1 kg" },
            { label: d.bmi,      value: "24.1",    delta: "▼ 1.2"    },
            { label: d.fatRatio, value: "28.4%",   delta: "▼ 2.3%"   },
          ].map((s) => (
            <div key={s.label} className="bg-surface-container-lowest rounded-xl p-3 border border-outline-variant/15">
              <p className="text-[10px] text-outline mb-1" style={{ fontFamily: "Inter, sans-serif" }}>{s.label}</p>
              <p className="text-sm font-bold text-on-surface" style={{ fontFamily: "Manrope, sans-serif" }}>{s.value}</p>
              <p className="text-[10px] font-semibold text-green-600 mt-0.5">{s.delta}</p>
            </div>
          ))}
        </div>
        <div className="flex-1 bg-primary/5 border border-primary/15 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1", fontSize: "15px" }}>psychology</span>
            <p className="text-xs font-bold text-primary" style={{ fontFamily: "Manrope, sans-serif" }}>{d.clinicalSummary}</p>
          </div>
          <p className="text-xs text-on-surface/80 leading-relaxed">{d.aiText}</p>
        </div>
      </div>
    </div>
  );
}

function AIScreen({ d }: { d: ReturnType<typeof useI18n>["t"]["demo"] }) {
  const [phase, setPhase] = useState<"upload" | "analyzing" | "result">("upload");
  const [typed, setTyped] = useState("");
  const [barW, setBarW] = useState(0);

  useEffect(() => {
    setPhase("upload");
    setTyped("");
    setBarW(0);
    const t1 = setTimeout(() => setPhase("analyzing"), 300);
    const t2 = setTimeout(() => setBarW(100), 350);
    const t3 = setTimeout(() => setPhase("result"), 1200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  useEffect(() => {
    if (phase !== "result") return;
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setTyped(d.aiText.slice(0, i));
      if (i >= d.aiText.length) clearInterval(iv);
    }, 10);
    return () => clearInterval(iv);
  }, [phase, d.aiText]);

  return (
    <div className="flex h-full gap-4">
      <div className="w-48 flex flex-col gap-3">
        <div className={`rounded-xl border-2 border-dashed p-4 text-center transition-all ${phase === "upload" ? "border-primary/40 bg-primary/5" : "border-outline-variant/20 bg-surface-container-lowest"}`}>
          <span className="material-symbols-outlined text-primary block mx-auto mb-2" style={{ fontVariationSettings: "'FILL' 1", fontSize: "28px" }}>
            {phase === "upload" ? "upload_file" : "description"}
          </span>
          <p className="text-[10px] font-semibold text-on-surface" style={{ fontFamily: "Manrope, sans-serif" }}>tahlil_raporu.pdf</p>
          <p className="text-[10px] text-outline mt-0.5">248 KB • PDF</p>
        </div>
        {phase === "analyzing" && (
          <div className="rounded-xl bg-surface-container-lowest border border-outline-variant/15 p-3">
            <p className="text-[10px] font-semibold text-on-surface mb-2">{d.analyzing}</p>
            <div className="h-1.5 bg-outline-variant/20 rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-[900ms] ease-out" style={{ width: `${barW}%` }} />
            </div>
            <div className="mt-2 flex flex-col gap-1">
              {[d.step1, d.step2, d.step3].map((s, i) => (
                <div key={s} className="flex items-center gap-1.5">
                  <div className="w-1 h-1 rounded-full bg-primary animate-pulse" style={{ animationDelay: `${i * 300}ms` }} />
                  <p className="text-[9px] text-outline">{s}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {phase === "result" && (
          <div className="rounded-xl bg-surface-container-lowest border border-outline-variant/15 p-3 flex flex-col gap-1.5">
            {[
              { label: "Vitamin D", val: "18 ng/mL", flag: true },
              { label: "Ferritin",  val: "42 µg/L",  flag: false },
              { label: "TSH",       val: "2.1 mIU/L", flag: false },
              { label: "Glukoz",    val: "98 mg/dL",  flag: false },
            ].map((b) => (
              <div key={b.label} className="flex items-center justify-between">
                <p className="text-[10px] text-on-surface">{b.label}</p>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${b.flag ? "bg-red-50 text-red-500" : "bg-green-50 text-green-600"}`}>{b.val}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex-1 bg-surface-container-lowest rounded-xl border border-outline-variant/15 p-4 flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1", fontSize: "14px" }}>auto_awesome</span>
          </div>
          <p className="text-xs font-bold text-on-surface" style={{ fontFamily: "Manrope, sans-serif" }}>{d.tab2}</p>
          {phase === "analyzing" && (
            <div className="ml-auto flex gap-1">
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
              ))}
            </div>
          )}
        </div>
        <div className="flex-1 text-xs text-on-surface/80 leading-relaxed">
          {phase === "upload"    && <p className="text-outline italic">{d.uploadHint}</p>}
          {phase === "analyzing" && <p className="text-outline">{d.processingHint}</p>}
          {phase === "result"    && <span>{typed}<span className="inline-block w-0.5 h-3 bg-primary ml-0.5 animate-pulse" /></span>}
        </div>
        {phase === "result" && typed.length > 80 && (
          <button className="mt-3 self-start px-3 py-1.5 bg-primary text-white text-[10px] font-bold rounded-full">{d.saveToClient}</button>
        )}
      </div>
    </div>
  );
}

function ReportScreen({ d }: { d: ReturnType<typeof useI18n>["t"]["demo"] }) {
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDrawn(true), 300);
    return () => clearTimeout(t);
  }, []);

  const points = [92.1, 90.4, 88.8, 87.2, 86.0, 84.9];
  const W = 280, H = 100;
  const minY = 84, maxY = 93;
  const toX = (i: number) => (i / (points.length - 1)) * W;
  const toY = (v: number) => H - ((v - minY) / (maxY - minY)) * H;
  const pathD = points.map((v, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(v)}`).join(" ");
  const areaD = `${pathD} L ${W} ${H} L 0 ${H} Z`;

  return (
    <div className="flex h-full gap-4">
      <div className="flex-1 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-on-surface" style={{ fontFamily: "Manrope, sans-serif" }}>Mehmet Demir — {d.reportTitle}</p>
          <div className="flex gap-1">
            {["1W", "3W", "6W"].map((p, i) => (
              <button key={p} className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${i === 2 ? "bg-primary text-white" : "text-outline"}`}>{p}</button>
            ))}
          </div>
        </div>
        <div className="flex-1 bg-surface-container-lowest rounded-xl border border-outline-variant/15 p-4">
          <svg width="100%" viewBox={`0 0 ${W} ${H + 20}`} className="overflow-visible">
            {[0, 0.25, 0.5, 0.75, 1].map((t) => (
              <line key={t} x1={0} y1={H * t} x2={W} y2={H * t} stroke="currentColor" strokeWidth="0.5" className="text-outline-variant/20" />
            ))}
            <path d={areaD} fill="url(#chartGrad)" opacity={drawn ? 0.15 : 0} style={{ transition: "opacity 1s ease 0.5s" }} />
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#37602c" />
                <stop offset="100%" stopColor="#37602c" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={pathD} fill="none" stroke="#37602c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              strokeDasharray="400" strokeDashoffset={drawn ? 0 : 400} style={{ transition: "stroke-dashoffset 0.8s ease" }} />
            {points.map((v, i) => (
              <circle key={i} cx={toX(i)} cy={toY(v)} r="4" fill="white" stroke="#37602c" strokeWidth="2"
                opacity={drawn ? 1 : 0} style={{ transition: `opacity 0.3s ease ${0.5 + i * 0.08}s` }} />
            ))}
            {points.map((_, i) => (
              <text key={i} x={toX(i)} y={H + 14} textAnchor="middle" fontSize="8" fill="#888" fontFamily="Inter, sans-serif">W{i + 1}</text>
            ))}
          </svg>
        </div>
      </div>
      <div className="w-44 flex flex-col gap-2">
        <p className="text-[10px] font-bold text-outline uppercase tracking-widest" style={{ fontFamily: "Inter, sans-serif" }}>{d.summary}</p>
        {[
          { label: d.totalLoss, value: "−7.2 kg" },
          { label: d.weeklyAvg, value: "−1.2 kg" },
          { label: d.goal,      value: d.goalPct  },
          { label: d.bmiChange, value: "−2.5"     },
        ].map((s) => (
          <div key={s.label} className="bg-surface-container-lowest rounded-xl p-3 border border-outline-variant/15">
            <p className="text-[10px] text-outline" style={{ fontFamily: "Inter, sans-serif" }}>{s.label}</p>
            <p className="text-sm font-bold text-primary mt-0.5" style={{ fontFamily: "Manrope, sans-serif" }}>{s.value}</p>
          </div>
        ))}
        <div className="rounded-xl bg-green-50 border border-green-200 p-3 mt-1">
          <p className="text-[10px] font-bold text-green-700 mb-1">{d.onTrack}</p>
          <p className="text-[10px] text-green-600 leading-relaxed">{d.onTrackDesc}</p>
        </div>
      </div>
    </div>
  );
}

const ICONS = ["group", "auto_awesome", "monitoring"];
const INTERVAL = 3500;

export function AppDemo() {
  const { t } = useI18n();
  const d = t.demo;
  const TABS = [d.tab1, d.tab2, d.tab3];

  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setActive((a) => (a + 1) % 3);
        setVisible(true);
      }, 300);
    }, INTERVAL);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="rounded-2xl overflow-hidden border border-outline-variant/20 shadow-2xl shadow-primary/8">
      {/* Browser chrome */}
      <div className="bg-surface-container px-4 py-3 flex items-center gap-3 border-b border-outline-variant/20">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400/70" />
          <div className="w-3 h-3 rounded-full bg-yellow-400/70" />
          <div className="w-3 h-3 rounded-full bg-green-400/70" />
        </div>
        <div className="flex-1 bg-surface-container-low rounded-md px-3 py-1 text-xs text-outline text-center" style={{ fontFamily: "Inter, sans-serif" }}>
          app.yocias.com
        </div>
      </div>
      {/* App shell */}
      <div className="flex h-[400px] bg-background">
        {/* Sidebar */}
        <div className="w-14 bg-surface-container-low border-r border-outline-variant/15 flex flex-col items-center py-4 gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center mb-3">
            <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1", fontSize: "16px" }}>spa</span>
          </div>
          {ICONS.map((icon, i) => (
            <button key={icon} onClick={() => { setVisible(false); setTimeout(() => { setActive(i); setVisible(true); }, 300); }}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${active === i ? "bg-primary/10" : "hover:bg-surface-container"}`}>
              <span className={`material-symbols-outlined ${active === i ? "text-primary" : "text-outline"}`} style={{ fontSize: "18px" }}>{icon}</span>
            </button>
          ))}
        </div>
        {/* Main */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-5 py-3 border-b border-outline-variant/15 flex items-center justify-between">
            <p className="text-sm font-bold text-on-surface" style={{ fontFamily: "Manrope, sans-serif" }}>{TABS[active]}</p>
            <div className="flex items-center gap-2">
              {TABS.map((_, i) => (
                <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === active ? "w-6 bg-primary" : "w-1.5 bg-outline-variant/40"}`} />
              ))}
            </div>
          </div>
          <div className="flex-1 p-5 overflow-hidden transition-all duration-300"
            style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(8px)" }}>
            {active === 0 && <PatientScreen d={d} />}
            {active === 1 && <AIScreen key={visible ? "ai-v" : "ai-h"} d={d} />}
            {active === 2 && <ReportScreen key={visible ? "rep-v" : "rep-h"} d={d} />}
          </div>
        </div>
      </div>
    </div>
  );
}
