"use client";

import Link from "next/link";
import posthog from "posthog-js";
import { useEffect } from "react";
import { AppDemo } from "./components/AppDemo";
import { useI18n } from "./lib/i18n";

export default function LandingPage() {
  const { t, lang, setLang } = useI18n();

  useEffect(() => {
    if (localStorage.getItem("lang")) return;
    const browser = navigator.language.split("-")[0];
    if (["tr", "en", "es", "fr"].includes(browser)) setLang(browser as import("./lib/i18n").Lang);
    else setLang("en");
  }, []);
  const l = t.landing;

  const features = [
    { icon: "psychology",   title: l.f1Title, desc: l.f1Desc },
    { icon: "monitoring",   title: l.f2Title, desc: l.f2Desc },
    { icon: "group",        title: l.f3Title, desc: l.f3Desc },
    { icon: "assessment",   title: l.f4Title, desc: l.f4Desc },
    { icon: "translate",    title: l.f5Title, desc: l.f5Desc },
    { icon: "security",     title: l.f6Title, desc: l.f6Desc },
  ];

  const steps = [
    { num: "01", title: l.s1Title, desc: l.s1Desc },
    { num: "02", title: l.s2Title, desc: l.s2Desc },
    { num: "03", title: l.s3Title, desc: l.s3Desc },
  ];

  return (
    <div className="bg-background text-on-surface min-h-screen">

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/20">
        <div className="max-w-6xl mx-auto px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1", fontSize: "18px" }}>spa</span>
            </div>
            <span className="font-bold text-lg text-on-surface" style={{ fontFamily: "Manrope, sans-serif" }}>Yocias</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-outline hover:text-on-surface transition-colors" style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}>{l.featuresNav}</a>
            <a href="#how-it-works" className="text-sm text-outline hover:text-on-surface transition-colors" style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}>{l.howItWorksNav}</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="px-5 py-2 text-sm font-semibold text-on-surface border border-outline-variant/40 rounded-full hover:bg-surface-container-low transition-colors" style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}>
              {l.signInAccount}
            </Link>
            <Link href="/signup" className="px-5 py-2 bg-primary text-white text-sm font-semibold rounded-full hover:bg-primary-container transition-colors" style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}>
              {l.startFree.replace(" →", "")}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-8 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/8 rounded-full mb-8">
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1", fontSize: "16px" }}>auto_awesome</span>
          <span className="text-[11px] font-bold text-primary uppercase tracking-widest" style={{ fontFamily: "Inter, sans-serif" }}>{l.badge}</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-on-surface leading-[1.1] tracking-tight mb-6 max-w-3xl mx-auto" style={{ fontFamily: "Manrope, sans-serif" }}>
          {l.heroTitle1}<br />
          <span className="text-primary">{l.heroTitle2}</span>
        </h1>
        <p className="text-lg text-outline leading-relaxed mb-10 max-w-xl mx-auto">{l.heroDesc}</p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/signup" onClick={() => posthog.capture("hero_cta_clicked")} className="px-8 py-3.5 bg-primary text-white font-bold rounded-full hover:bg-primary-container transition-all active:scale-95 shadow-sm text-sm" style={{ fontFamily: "Manrope, sans-serif" }}>
            {l.startFree}
          </Link>
          <Link href="/login" className="px-8 py-3.5 border border-outline-variant text-on-surface font-semibold rounded-full hover:bg-surface-container-low transition-all text-sm" style={{ fontFamily: "Manrope, sans-serif" }}>
            {l.signInAccount}
          </Link>
        </div>
        <p className="text-xs text-outline mt-5" style={{ fontFamily: "Inter, sans-serif" }}>{l.noCard}</p>
      </section>

      {/* Demo */}
      <section className="max-w-5xl mx-auto px-8 pb-20">
        <AppDemo />
      </section>

      {/* Stats bar */}
      <section className="border-y border-outline-variant/20 bg-surface-container-low/50">
        <div className="max-w-6xl mx-auto px-8 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "40+",   label: l.biomarkersLabel },
            { value: "< 5s",  label: l.aiTimeLabel },
            { value: "4",     label: l.languagesLabel },
            { value: "100%",  label: l.dataLabel },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-extrabold text-primary mb-1" style={{ fontFamily: "Manrope, sans-serif" }}>{s.value}</p>
              <p className="text-xs text-outline uppercase tracking-wider" style={{ fontFamily: "Inter, sans-serif" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center mb-16">
            <p className="text-[11px] font-bold text-primary uppercase tracking-widest mb-3" style={{ fontFamily: "Inter, sans-serif" }}>{l.featuresLabel}</p>
            <h2 className="text-4xl font-extrabold text-on-surface" style={{ fontFamily: "Manrope, sans-serif" }}>{l.featuresTitle}</h2>
            <p className="text-outline mt-4 max-w-md mx-auto text-sm leading-relaxed">{l.featuresDesc}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div key={f.title} className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/15 hover:border-primary/20 hover:shadow-md transition-all group">
                <div className="w-10 h-10 bg-primary/8 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/12 transition-colors">
                  <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1", fontSize: "20px" }}>{f.icon}</span>
                </div>
                <h3 className="text-base font-bold text-on-surface mb-2" style={{ fontFamily: "Manrope, sans-serif" }}>{f.title}</h3>
                <p className="text-sm text-outline leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-surface-container-low py-24">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center mb-16">
            <p className="text-[11px] font-bold text-primary uppercase tracking-widest mb-3" style={{ fontFamily: "Inter, sans-serif" }}>{l.workflowLabel}</p>
            <h2 className="text-4xl font-extrabold text-on-surface" style={{ fontFamily: "Manrope, sans-serif" }}>{l.workflowTitle}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.num}>
                <div className="text-5xl font-extrabold text-primary/10 mb-4" style={{ fontFamily: "Manrope, sans-serif" }}>{step.num}</div>
                <h3 className="text-lg font-bold text-on-surface mb-2" style={{ fontFamily: "Manrope, sans-serif" }}>{step.title}</h3>
                <p className="text-sm text-outline leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-2xl mx-auto px-8 text-center">
          <span className="material-symbols-outlined text-primary text-5xl mb-6 block" style={{ fontVariationSettings: "'FILL' 1" }}>spa</span>
          <h2 className="text-4xl font-extrabold text-on-surface mb-4" style={{ fontFamily: "Manrope, sans-serif" }}>{l.ctaTitle}</h2>
          <p className="text-outline mb-10 text-sm leading-relaxed">{l.ctaDesc}</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/signup" className="px-10 py-4 bg-primary text-white font-bold rounded-full hover:bg-primary-container transition-all active:scale-95 shadow-sm text-sm" style={{ fontFamily: "Manrope, sans-serif" }}>
              {l.createAccount}
            </Link>
            <Link href="/login" className="px-10 py-4 border border-outline-variant text-on-surface font-semibold rounded-full hover:bg-surface-container-low transition-all text-sm" style={{ fontFamily: "Manrope, sans-serif" }}>
              {l.signInAccount}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-outline-variant/20 py-10">
        <div className="max-w-6xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1", fontSize: "16px" }}>spa</span>
            </div>
            <span className="font-bold text-on-surface" style={{ fontFamily: "Manrope, sans-serif" }}>Yocias</span>
          </div>
          <p className="text-xs text-outline" style={{ fontFamily: "Inter, sans-serif" }}>© 2025 Yocias. {l.rights}</p>
          <div className="flex gap-6">
            {[l.privacy, l.terms, l.contact].map((item) => (
              <a key={item} href="#" className="text-xs text-outline hover:text-on-surface transition-colors" style={{ fontFamily: "Inter, sans-serif" }}>{item}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
