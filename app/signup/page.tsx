"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

const roles = [
  "Clinical Dietitian",
  "Sports Nutritionist",
  "Pediatric Dietitian",
  "Oncology Dietitian",
  "Private Practice",
  "Other",
];

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "",
    clinic: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const update = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-surface-container-low flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-surface-container-lowest flex-col justify-between p-12 border-r border-outline-variant/20">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <span
              className="material-symbols-outlined text-white"
              style={{ fontVariationSettings: "'FILL' 1", fontSize: "20px" }}
            >
              spa
            </span>
          </div>
          <span
            className="font-bold text-lg text-on-surface"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            The Clinical Atelier
          </span>
        </Link>

        <div className="space-y-6">
          <h2
            className="text-3xl font-extrabold text-on-surface leading-tight"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            Everything your
            <br />
            practice needs.
          </h2>
          <div className="space-y-4">
            {[
              { icon: "psychology", title: "AI Lab Analysis", desc: "Parse biomarkers from any lab PDF in seconds." },
              { icon: "monitoring", title: "Metabolic Tracking", desc: "Weight, body composition, and trends — visualized." },
              { icon: "assessment", title: "Clinical Reports", desc: "Board-ready reports generated automatically." },
              { icon: "security", title: "HIPAA Compliant", desc: "Your patient data stays private and encrypted." },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-4">
                <div className="w-9 h-9 bg-primary/8 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span
                    className="material-symbols-outlined text-primary"
                    style={{ fontVariationSettings: "'FILL' 1", fontSize: "18px" }}
                  >
                    {item.icon}
                  </span>
                </div>
                <div>
                  <p
                    className="text-sm font-bold text-on-surface"
                    style={{ fontFamily: "Manrope, sans-serif" }}
                  >
                    {item.title}
                  </p>
                  <p className="text-xs text-outline mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p
          className="text-xs text-outline"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          Free 14-day trial • No credit card required • Cancel anytime
        </p>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span
                className="material-symbols-outlined text-white"
                style={{ fontVariationSettings: "'FILL' 1", fontSize: "18px" }}
              >
                spa
              </span>
            </div>
            <span
              className="font-bold text-on-surface"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              The Clinical Atelier
            </span>
          </Link>

          {/* Step indicator */}
          <div className="flex items-center gap-3 mb-8">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-3">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step >= s
                      ? "bg-primary text-white"
                      : "bg-surface-container-high text-outline"
                  }`}
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {step > s ? (
                    <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1", fontSize: "14px" }}>
                      check
                    </span>
                  ) : (
                    s
                  )}
                </div>
                {s < 2 && (
                  <div
                    className={`w-12 h-0.5 rounded-full transition-all ${
                      step > s ? "bg-primary" : "bg-surface-container-high"
                    }`}
                  />
                )}
              </div>
            ))}
            <p
              className="ml-2 text-xs text-outline"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Step {step} of 2
            </p>
          </div>

          {step === 1 ? (
            <>
              <h1
                className="text-3xl font-extrabold text-on-surface mb-2"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                Create your account
              </h1>
              <p className="text-outline text-sm mb-8">
                Start your 14-day free trial. No card needed.
              </p>

              <form onSubmit={handleStep1} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      className="text-[11px] text-outline uppercase tracking-wider font-bold block mb-1.5"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      First Name
                    </label>
                    <input
                      type="text"
                      value={form.firstName}
                      onChange={(e) => update("firstName", e.target.value)}
                      placeholder="Elena"
                      required
                      className="w-full bg-surface-container-highest rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                    />
                  </div>
                  <div>
                    <label
                      className="text-[11px] text-outline uppercase tracking-wider font-bold block mb-1.5"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={form.lastName}
                      onChange={(e) => update("lastName", e.target.value)}
                      placeholder="Thorne"
                      required
                      className="w-full bg-surface-container-highest rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label
                    className="text-[11px] text-outline uppercase tracking-wider font-bold block mb-1.5"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    Work Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="dr.thorne@clinic.com"
                    required
                    className="w-full bg-surface-container-highest rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  />
                </div>

                <div>
                  <label
                    className="text-[11px] text-outline uppercase tracking-wider font-bold block mb-1.5"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => update("password", e.target.value)}
                      placeholder="Min. 8 characters"
                      required
                      minLength={8}
                      className="w-full bg-surface-container-highest rounded-xl px-4 py-3 pr-12 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
                    >
                      <span className="material-symbols-outlined text-base">
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                  {form.password.length > 0 && (
                    <div className="mt-2 flex gap-1">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all ${
                            form.password.length > i * 3
                              ? form.password.length < 8
                                ? "bg-error"
                                : "bg-primary"
                              : "bg-surface-container-high"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-primary text-white font-bold rounded-full text-sm hover:bg-primary-container transition-all active:scale-95"
                  style={{ fontFamily: "Manrope, sans-serif" }}
                >
                  Continue →
                </button>
              </form>
            </>
          ) : (
            <>
              <h1
                className="text-3xl font-extrabold text-on-surface mb-2"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                Your practice
              </h1>
              <p className="text-outline text-sm mb-8">
                Help us personalize your workspace.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    className="text-[11px] text-outline uppercase tracking-wider font-bold block mb-1.5"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    Your Role
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {roles.map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => update("role", role)}
                        className={`px-3 py-2.5 rounded-xl text-xs font-medium text-left transition-all ${
                          form.role === role
                            ? "bg-primary text-white"
                            : "bg-surface-container-highest text-on-surface hover:bg-surface-container-high"
                        }`}
                        style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label
                    className="text-[11px] text-outline uppercase tracking-wider font-bold block mb-1.5"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    Clinic / Practice Name{" "}
                    <span className="normal-case tracking-normal font-normal text-outline/70">
                      (optional)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={form.clinic}
                    onChange={(e) => update("clinic", e.target.value)}
                    placeholder="Wellness & Nutrition Center"
                    className="w-full bg-surface-container-highest rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  />
                </div>

                <div className="bg-surface-container rounded-xl p-4 flex items-start gap-3">
                  <input type="checkbox" required className="mt-0.5 rounded" />
                  <p
                    className="text-xs text-outline"
                    style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
                  >
                    I agree to the{" "}
                    <a href="#" className="text-primary hover:underline">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-primary hover:underline">
                      Privacy Policy
                    </a>
                    . I understand this platform handles protected health
                    information.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-6 py-3.5 border border-outline-variant text-on-surface font-bold rounded-full text-sm hover:bg-surface-container transition-all"
                    style={{ fontFamily: "Manrope, sans-serif" }}
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3.5 bg-primary text-white font-bold rounded-full text-sm hover:bg-primary-container transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{ fontFamily: "Manrope, sans-serif" }}
                  >
                    {loading ? (
                      <>
                        <span
                          className="material-symbols-outlined text-base"
                          style={{
                            animation: "spin 1s linear infinite",
                            display: "inline-block",
                          }}
                        >
                          progress_activity
                        </span>
                        Creating account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </button>
                </div>
              </form>
            </>
          )}

          <p
            className="text-center text-sm text-outline mt-8"
            style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
          >
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
