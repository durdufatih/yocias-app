"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";
import Toasts from "../../components/Toast";
import { useToast } from "../../lib/useToast";
import { useAuth } from "../../lib/useAuth";
import { createPatient } from "../../lib/db";

const PROTOCOLS = [
  "Anti-Inflammatory Protocol", "Weight Management", "Diabetic Management",
  "Hypertension Diet", "Sports Nutrition", "GI Restoration", "Metabolic Reset",
];
const BLOOD_TYPES = ["A RH+", "A RH-", "B RH+", "B RH-", "AB RH+", "AB RH-", "O RH+", "O RH-"];

export default function NewPatientPage() {
  const router = useRouter();
  const { loading: authLoading } = useAuth();
  const { toasts, addToast, remove } = useToast();

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    age: "", height: "", bloodType: "", protocol: "", notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const update = (key: string, val: string) => setForm((p) => ({ ...p, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createPatient({
        first_name: form.firstName,
        last_name: form.lastName,
        email: form.email || undefined,
        phone: form.phone || undefined,
        age: form.age ? parseInt(form.age) : undefined,
        height: form.height ? parseFloat(form.height) : undefined,
        blood_type: form.bloodType || undefined,
        protocol: form.protocol || undefined,
        notes: form.notes || undefined,
      });
      addToast(`${form.firstName} ${form.lastName} added to the directory.`);
      setTimeout(() => router.push("/dashboard"), 800);
    } catch {
      addToast("Failed to add patient. Please try again.", "info");
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
        <TopBar />
        <div className="p-8 max-w-3xl mx-auto">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-outline mb-8" style={{ fontFamily: "Inter, sans-serif" }}>
            <Link href="/dashboard" className="hover:text-primary transition-colors">Clients</Link>
            <span className="material-symbols-outlined text-[12px]">chevron_right</span>
            <span className="text-on-surface font-medium">New Patient</span>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-on-surface" style={{ fontFamily: "Manrope, sans-serif" }}>Add New Patient</h2>
            <p className="text-outline text-sm mt-1">Create a new clinical record and assign a nutritional protocol.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Info */}
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 p-6 space-y-5">
              <h3 className="text-sm font-bold text-on-surface" style={{ fontFamily: "Manrope, sans-serif" }}>Personal Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] text-outline uppercase tracking-wider font-bold block mb-1.5" style={{ fontFamily: "Inter, sans-serif" }}>First Name *</label>
                  <input required value={form.firstName} onChange={e => update("firstName", e.target.value)} placeholder="Elena" className="w-full bg-surface-container-highest rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="text-[11px] text-outline uppercase tracking-wider font-bold block mb-1.5" style={{ fontFamily: "Inter, sans-serif" }}>Last Name *</label>
                  <input required value={form.lastName} onChange={e => update("lastName", e.target.value)} placeholder="Vance" className="w-full bg-surface-container-highest rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="text-[11px] text-outline uppercase tracking-wider font-bold block mb-1.5" style={{ fontFamily: "Inter, sans-serif" }}>Email *</label>
                  <input type="email" required value={form.email} onChange={e => update("email", e.target.value)} placeholder="patient@email.com" className="w-full bg-surface-container-highest rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="text-[11px] text-outline uppercase tracking-wider font-bold block mb-1.5" style={{ fontFamily: "Inter, sans-serif" }}>Phone</label>
                  <input type="tel" value={form.phone} onChange={e => update("phone", e.target.value)} placeholder="+1 555 000 0000" className="w-full bg-surface-container-highest rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
              </div>
            </div>

            {/* Clinical Info */}
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 p-6 space-y-5">
              <h3 className="text-sm font-bold text-on-surface" style={{ fontFamily: "Manrope, sans-serif" }}>Clinical Data</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] text-outline uppercase tracking-wider font-bold block mb-1.5" style={{ fontFamily: "Inter, sans-serif" }}>Age *</label>
                  <input type="number" required value={form.age} onChange={e => update("age", e.target.value)} placeholder="34" min="1" max="120" className="w-full bg-surface-container-highest rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="text-[11px] text-outline uppercase tracking-wider font-bold block mb-1.5" style={{ fontFamily: "Inter, sans-serif" }}>Height (cm)</label>
                  <input type="number" value={form.height} onChange={e => update("height", e.target.value)} placeholder="172" className="w-full bg-surface-container-highest rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
              </div>
              <div>
                <label className="text-[11px] text-outline uppercase tracking-wider font-bold block mb-2" style={{ fontFamily: "Inter, sans-serif" }}>Blood Type</label>
                <div className="flex flex-wrap gap-2">
                  {BLOOD_TYPES.map((bt) => (
                    <button
                      key={bt}
                      type="button"
                      onClick={() => update("bloodType", bt)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${form.bloodType === bt ? "bg-primary text-white" : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest"}`}
                    >
                      {bt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Protocol */}
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 p-6 space-y-5">
              <h3 className="text-sm font-bold text-on-surface" style={{ fontFamily: "Manrope, sans-serif" }}>Nutritional Protocol</h3>
              <div className="grid grid-cols-2 gap-3">
                {PROTOCOLS.map((pr) => (
                  <button
                    key={pr}
                    type="button"
                    onClick={() => update("protocol", pr)}
                    className={`px-4 py-3 rounded-xl text-sm font-medium text-left transition-all flex items-center gap-3 ${form.protocol === pr ? "bg-primary text-white" : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest"}`}
                  >
                    <span className={`material-symbols-outlined text-base flex-shrink-0 ${form.protocol === pr ? "text-white" : "text-outline"}`} style={{ fontVariationSettings: form.protocol === pr ? "'FILL' 1" : "'FILL' 0", fontSize: "16px" }}>
                      {form.protocol === pr ? "radio_button_checked" : "radio_button_unchecked"}
                    </span>
                    {pr}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 p-6 space-y-4">
              <h3 className="text-sm font-bold text-on-surface" style={{ fontFamily: "Manrope, sans-serif" }}>Clinical Notes</h3>
              <textarea
                value={form.notes}
                onChange={e => update("notes", e.target.value)}
                rows={4}
                placeholder="Initial assessment notes, dietary restrictions, allergies, medical history..."
                className="w-full bg-surface-container-highest rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center">
              <Link href="/dashboard" className="px-6 py-3 text-sm text-outline border border-outline-variant rounded-full hover:bg-surface-container-low transition-colors" style={{ fontFamily: "Manrope, sans-serif" }}>
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-3 bg-primary text-white font-bold text-sm rounded-full hover:bg-primary-container transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                {submitting ? (
                  <><span className="material-symbols-outlined text-base animate-spin" style={{ animationDuration: "1s" }}>progress_activity</span> Adding Patient...</>
                ) : (
                  <><span className="material-symbols-outlined text-base">person_add</span> Add Patient</>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Toasts toasts={toasts} remove={remove} />
    </div>
  );
}
