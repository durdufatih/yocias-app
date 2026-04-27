"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useI18n } from "../lib/i18n";
import posthog from "posthog-js";

interface Props {
  type: "demo_request" | "detail_click";
  onClose: () => void;
}

export function LeadModal({ type, onClose }: Props) {
  const { t } = useI18n();
  const l = t.lead;

  const [form, setForm] = useState({ name: "", email: "", phone: "", clinic: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.name || !form.email) return;
    setLoading(true);
    setError("");
    const { error: err } = await supabase.from("leads").insert({ ...form, type });
    setLoading(false);
    if (err) { setError(l.errorMsg); return; }
    posthog.capture("lead_submitted", { type, email: form.email, clinic: form.clinic });
    setDone(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-background rounded-2xl shadow-2xl w-full max-w-md border border-outline-variant/20 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-outline-variant/15">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1", fontSize: "15px" }}>spa</span>
                </div>
                <span className="text-sm font-bold text-primary" style={{ fontFamily: "Manrope, sans-serif" }}>Yocias</span>
              </div>
              <h2 className="text-xl font-extrabold text-on-surface" style={{ fontFamily: "Manrope, sans-serif" }}>
                {type === "demo_request" ? l.titleDemo : l.titleDetail}
              </h2>
              <p className="text-sm text-outline mt-1">{l.subtitle}</p>
            </div>
            <button onClick={onClose} className="text-outline hover:text-on-surface transition-colors mt-1">
              <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>close</span>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-6">
          {done ? (
            <div className="text-center py-8">
              <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-green-600" style={{ fontVariationSettings: "'FILL' 1", fontSize: "28px" }}>check_circle</span>
              </div>
              <h3 className="text-lg font-bold text-on-surface mb-2" style={{ fontFamily: "Manrope, sans-serif" }}>{l.successTitle}</h3>
              <p className="text-sm text-outline">{l.successDesc}</p>
              <button onClick={onClose} className="mt-6 px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-full" style={{ fontFamily: "Manrope, sans-serif" }}>
                {l.close}
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-outline uppercase tracking-wide mb-1.5 block" style={{ fontFamily: "Inter, sans-serif" }}>{l.name} *</label>
                  <input value={form.name} onChange={set("name")} required placeholder={l.namePlaceholder}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/30 bg-surface-container-lowest text-sm text-on-surface placeholder:text-outline/50 focus:outline-none focus:border-primary/50 transition-colors" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-outline uppercase tracking-wide mb-1.5 block" style={{ fontFamily: "Inter, sans-serif" }}>{l.email} *</label>
                  <input value={form.email} onChange={set("email")} required type="email" placeholder={l.emailPlaceholder}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/30 bg-surface-container-lowest text-sm text-on-surface placeholder:text-outline/50 focus:outline-none focus:border-primary/50 transition-colors" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-outline uppercase tracking-wide mb-1.5 block" style={{ fontFamily: "Inter, sans-serif" }}>{l.phone}</label>
                  <input value={form.phone} onChange={set("phone")} placeholder={l.phonePlaceholder}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/30 bg-surface-container-lowest text-sm text-on-surface placeholder:text-outline/50 focus:outline-none focus:border-primary/50 transition-colors" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-outline uppercase tracking-wide mb-1.5 block" style={{ fontFamily: "Inter, sans-serif" }}>{l.clinic}</label>
                  <input value={form.clinic} onChange={set("clinic")} placeholder={l.clinicPlaceholder}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/30 bg-surface-container-lowest text-sm text-on-surface placeholder:text-outline/50 focus:outline-none focus:border-primary/50 transition-colors" />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-outline uppercase tracking-wide mb-1.5 block" style={{ fontFamily: "Inter, sans-serif" }}>{l.message}</label>
                <textarea value={form.message} onChange={set("message")} rows={3} placeholder={l.messagePlaceholder}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/30 bg-surface-container-lowest text-sm text-on-surface placeholder:text-outline/50 focus:outline-none focus:border-primary/50 transition-colors resize-none" />
              </div>
              {error && <p className="text-xs text-red-500">{error}</p>}
              <button type="submit" disabled={loading}
                className="w-full py-3 bg-primary text-white font-bold rounded-full text-sm hover:bg-primary-container transition-all active:scale-95 disabled:opacity-60"
                style={{ fontFamily: "Manrope, sans-serif" }}>
                {loading ? l.sending : l.send}
              </button>
              <p className="text-[11px] text-outline text-center">{l.privacy}</p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
