"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-surface-container-low flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col justify-between p-12">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            <span
              className="material-symbols-outlined text-white"
              style={{ fontVariationSettings: "'FILL' 1", fontSize: "20px" }}
            >
              spa
            </span>
          </div>
          <span
            className="font-bold text-lg text-white"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            The Clinical Atelier
          </span>
        </Link>

        <div>
          <p
            className="text-4xl font-extrabold text-white leading-tight mb-4"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            "The most precise
            <br />
            nutrition platform
            <br />
            I&apos;ve ever used."
          </p>
          <p className="text-primary-fixed/70 text-sm mb-6">
            — Dr. Sarah Chen, Clinical Dietitian
          </p>
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <span
                key={i}
                className="material-symbols-outlined text-yellow-300"
                style={{ fontVariationSettings: "'FILL' 1", fontSize: "20px" }}
              >
                star
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { value: "142+", label: "Active Clients" },
            { value: "99.2%", label: "AI Accuracy" },
            { value: "94%", label: "Retention Rate" },
            { value: "40+", label: "Biomarkers Tracked" },
          ].map((s) => (
            <div key={s.label} className="bg-white/10 rounded-xl p-4">
              <p
                className="text-2xl font-bold text-white"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                {s.value}
              </p>
              <p
                className="text-xs text-primary-fixed/70 uppercase tracking-wider"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span
                className="material-symbols-outlined text-white text-base"
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

          <h1
            className="text-3xl font-extrabold text-on-surface mb-2"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            Welcome back
          </h1>
          <p className="text-outline text-sm mb-8">
            Sign in to your clinical workspace.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                className="text-[11px] text-outline uppercase tracking-wider font-bold block mb-1.5"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
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
            </div>

            {error && (
              <div className="bg-error-container rounded-xl px-4 py-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-on-error-container text-base">
                  error
                </span>
                <p
                  className="text-xs text-on-error-container"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {error}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded" />
                <span
                  className="text-sm text-outline"
                  style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
                >
                  Remember me
                </span>
              </label>
              <a
                href="#"
                className="text-sm text-primary hover:underline"
                style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
              >
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-primary text-white font-bold rounded-full text-sm hover:bg-primary-container transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              {loading ? (
                <>
                  <span
                    className="material-symbols-outlined text-base animate-spin"
                    style={{ animationDuration: "1s" }}
                  >
                    progress_activity
                  </span>
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p
            className="text-center text-sm text-outline mt-8"
            style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
          >
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-primary hover:underline font-semibold">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
