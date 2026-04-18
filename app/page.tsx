import Link from "next/link";

const features = [
  {
    icon: "psychology",
    title: "AI-Powered Analysis",
    desc: "Extract biomarkers from lab reports automatically. Our model identifies 40+ clinical markers in seconds.",
  },
  {
    icon: "monitoring",
    title: "Metabolic Tracking",
    desc: "Visualize weight trends, body composition shifts, and metabolic adaptation across your entire client base.",
  },
  {
    icon: "group",
    title: "Patient Directory",
    desc: "A clean, clinical workspace for managing consultations, notes, and nutritional records at scale.",
  },
  {
    icon: "assessment",
    title: "Clinical Reports",
    desc: "Generate board-ready reports with a single click. Powered by real-time population trend analysis.",
  },
  {
    icon: "upload_file",
    title: "Lab Integration",
    desc: "Upload LabCorp, Quest, or any PDF lab report. AI parses values and flags anomalies instantly.",
  },
  {
    icon: "security",
    title: "HIPAA Compliant",
    desc: "End-to-end encryption, role-based access, and full audit trails built in from day one.",
  },
];

const plans = [
  {
    name: "Solo",
    price: "49",
    desc: "For independent dietitians just getting started.",
    features: ["Up to 50 active clients", "AI analysis (10/mo)", "Standard reports", "Email support"],
    cta: "Get started",
    highlight: false,
  },
  {
    name: "Clinical",
    price: "149",
    desc: "For growing practices that need the full picture.",
    features: ["Unlimited clients", "Unlimited AI analysis", "Advanced reports & insights", "Priority support", "Team access (3 seats)"],
    cta: "Start free trial",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    desc: "For clinics and hospital nutrition departments.",
    features: ["Everything in Clinical", "Unlimited seats", "Custom integrations", "Dedicated account manager", "SLA guarantee"],
    cta: "Contact sales",
    highlight: false,
  },
];

export default function LandingPage() {
  return (
    <div className="bg-background text-on-surface min-h-screen">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/20">
        <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span
                className="material-symbols-outlined text-white text-base"
                style={{ fontVariationSettings: "'FILL' 1", fontSize: "18px" }}
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
          </div>
          <div className="flex items-center gap-8">
            <a
              href="#features"
              className="text-sm text-outline hover:text-on-surface transition-colors"
              style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-sm text-outline hover:text-on-surface transition-colors"
              style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
            >
              Pricing
            </a>
            <Link
              href="/login"
              className="text-sm text-outline hover:text-on-surface transition-colors"
              style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-5 py-2 bg-primary text-white text-sm font-semibold rounded-full hover:bg-primary-container transition-colors"
              style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-8 pt-24 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/8 rounded-full mb-6">
              <span
                className="material-symbols-outlined text-primary text-sm"
                style={{ fontVariationSettings: "'FILL' 1", fontSize: "16px" }}
              >
                auto_awesome
              </span>
              <span
                className="text-[11px] font-bold text-primary uppercase tracking-widest"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                AI-Powered Nutrition Platform
              </span>
            </div>
            <h1
              className="text-5xl font-extrabold text-on-surface leading-[1.1] tracking-tight mb-6"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              The clinical workspace
              <br />
              <span className="text-primary">nutrition deserves.</span>
            </h1>
            <p className="text-lg text-outline leading-relaxed mb-10 max-w-lg">
              A high-precision platform for dietitians who demand more. Manage
              clients, analyze lab data with AI, and generate clinical reports —
              all in one beautifully crafted workspace.
            </p>
            <div className="flex gap-4">
              <Link
                href="/signup"
                className="px-8 py-3.5 bg-primary text-white font-semibold rounded-full hover:bg-primary-container transition-all active:scale-95 shadow-sm"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                Start free trial
              </Link>
              <Link
                href="/login"
                className="px-8 py-3.5 border border-outline-variant text-on-surface font-semibold rounded-full hover:bg-surface-container-low transition-all"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                View demo →
              </Link>
            </div>
            <p
              className="text-xs text-outline mt-4"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              No credit card required • 14-day free trial • HIPAA compliant
            </p>
          </div>

          {/* Hero Visual */}
          <div className="relative">
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-xl p-6 space-y-4">
              {/* Mini stat cards */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Active Clients", value: "142", icon: "group" },
                  { label: "AI Confidence", value: "99.2%", icon: "psychology", green: true },
                  { label: "Retention", value: "94%", icon: "trending_up" },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="bg-surface-container-low rounded-xl p-4"
                  >
                    <span
                      className={`material-symbols-outlined text-base mb-2 block ${s.green ? "text-secondary" : "text-outline"}`}
                      style={{ fontVariationSettings: "'FILL' 1", fontSize: "18px" }}
                    >
                      {s.icon}
                    </span>
                    <p
                      className={`text-xl font-bold ${s.green ? "text-secondary" : "text-on-surface"}`}
                      style={{ fontFamily: "Manrope, sans-serif" }}
                    >
                      {s.value}
                    </p>
                    <p
                      className="text-[10px] text-outline uppercase tracking-wider"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
              {/* Mini patient row */}
              <div className="bg-surface-container-low rounded-xl p-4">
                <p
                  className="text-[10px] text-outline uppercase tracking-widest mb-3 font-bold"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Recent Clients
                </p>
                {["Margot Sterling", "Julian Thorne", "Elena Vance"].map(
                  (name, i) => (
                    <div
                      key={name}
                      className="flex items-center justify-between py-2 border-b border-outline-variant/10 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center text-primary text-[10px] font-bold">
                          {name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <span className="text-sm font-medium text-on-surface">
                          {name}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${i === 0 ? "text-primary bg-primary/10" : i === 1 ? "text-secondary bg-secondary/10" : "text-primary bg-primary/10"}`}
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        {i === 0 ? "Active" : i === 1 ? "Optimal" : "Active"}
                      </span>
                    </div>
                  )
                )}
              </div>
              {/* AI Insight chip */}
              <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 flex items-center gap-3">
                <span
                  className="material-symbols-outlined text-primary"
                  style={{ fontVariationSettings: "'FILL' 1", fontSize: "20px" }}
                >
                  auto_awesome
                </span>
                <p className="text-xs text-on-surface-variant">
                  <span className="font-bold text-primary">AI Insight:</span>{" "}
                  8.2% of clients show inflammatory markers — review suggested.
                </p>
              </div>
            </div>
            {/* Floating badge */}
            <div className="absolute -top-4 -right-4 bg-secondary text-white px-4 py-2 rounded-full shadow-lg">
              <span
                className="text-xs font-bold"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                99.2% AI Accuracy
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-surface-container-low py-24">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <p
              className="text-[11px] font-bold text-primary uppercase tracking-widest mb-3"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Everything you need
            </p>
            <h2
              className="text-4xl font-extrabold text-on-surface"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              Built for clinical precision.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/15 hover:border-primary/20 hover:shadow-md transition-all group"
              >
                <div className="w-10 h-10 bg-primary/8 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/12 transition-colors">
                  <span
                    className="material-symbols-outlined text-primary"
                    style={{ fontVariationSettings: "'FILL' 1", fontSize: "20px" }}
                  >
                    {f.icon}
                  </span>
                </div>
                <h3
                  className="text-base font-bold text-on-surface mb-2"
                  style={{ fontFamily: "Manrope, sans-serif" }}
                >
                  {f.title}
                </h3>
                <p className="text-sm text-outline leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <p
              className="text-[11px] font-bold text-primary uppercase tracking-widest mb-3"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Simple pricing
            </p>
            <h2
              className="text-4xl font-extrabold text-on-surface"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              Invest in your practice.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 border flex flex-col ${
                  plan.highlight
                    ? "bg-primary text-white border-primary shadow-xl shadow-primary/20"
                    : "bg-surface-container-lowest border-outline-variant/20"
                }`}
              >
                <div className="mb-6">
                  <p
                    className={`text-[11px] font-bold uppercase tracking-widest mb-2 ${plan.highlight ? "text-primary-fixed" : "text-outline"}`}
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    {plan.name}
                  </p>
                  <div className="flex items-end gap-1 mb-2">
                    {plan.price !== "Custom" && (
                      <span
                        className={`text-sm font-bold ${plan.highlight ? "text-primary-fixed" : "text-outline"}`}
                      >
                        $
                      </span>
                    )}
                    <span
                      className="text-4xl font-extrabold"
                      style={{ fontFamily: "Manrope, sans-serif" }}
                    >
                      {plan.price}
                    </span>
                    {plan.price !== "Custom" && (
                      <span
                        className={`text-sm mb-1 ${plan.highlight ? "text-primary-fixed/70" : "text-outline"}`}
                      >
                        /mo
                      </span>
                    )}
                  </div>
                  <p
                    className={`text-sm ${plan.highlight ? "text-primary-fixed/80" : "text-outline"}`}
                  >
                    {plan.desc}
                  </p>
                </div>
                <ul className="space-y-3 flex-1 mb-8">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2.5">
                      <span
                        className={`material-symbols-outlined text-base flex-shrink-0 ${plan.highlight ? "text-primary-fixed" : "text-primary"}`}
                        style={{ fontVariationSettings: "'FILL' 1", fontSize: "16px" }}
                      >
                        check_circle
                      </span>
                      <span
                        className={`text-sm ${plan.highlight ? "text-white/90" : "text-on-surface"}`}
                      >
                        {feat}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`w-full py-3 rounded-full text-sm font-bold text-center transition-all active:scale-95 ${
                    plan.highlight
                      ? "bg-white text-primary hover:bg-primary-fixed"
                      : "bg-primary text-white hover:bg-primary-container"
                  }`}
                  style={{ fontFamily: "Manrope, sans-serif" }}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sign Up CTA Section */}
      <section id="signup" className="bg-surface-container-low py-24">
        <div className="max-w-xl mx-auto px-8 text-center">
          <span
            className="material-symbols-outlined text-primary text-4xl mb-4 block"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            spa
          </span>
          <h2
            className="text-4xl font-extrabold text-on-surface mb-4"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            Ready to start?
          </h2>
          <p className="text-outline mb-10">
            Join hundreds of dietitians already using The Clinical Atelier to
            deliver better outcomes.
          </p>
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-sm p-8 text-left">
            <h3
              className="text-lg font-bold text-on-surface mb-6 text-center"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              Create your free account
            </h3>
            <div className="space-y-4">
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
                    placeholder="Elena"
                    className="w-full bg-surface-container-highest rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 border-none"
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
                    placeholder="Thorne"
                    className="w-full bg-surface-container-highest rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 border-none"
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
                  placeholder="dr.thorne@clinic.com"
                  className="w-full bg-surface-container-highest rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 border-none"
                />
              </div>
              <div>
                <label
                  className="text-[11px] text-outline uppercase tracking-wider font-bold block mb-1.5"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-surface-container-highest rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 border-none"
                />
              </div>
              <Link
                href="/signup"
                className="w-full block py-3.5 bg-primary text-white font-bold rounded-full text-sm text-center hover:bg-primary-container transition-colors active:scale-95"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                Create account — it&apos;s free
              </Link>
              <p
                className="text-center text-xs text-outline"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-outline-variant/20 py-12">
        <div className="max-w-7xl mx-auto px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <span
                className="material-symbols-outlined text-white"
                style={{ fontVariationSettings: "'FILL' 1", fontSize: "16px" }}
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
          </div>
          <p
            className="text-xs text-outline"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            © 2024 The Clinical Atelier. All rights reserved.
          </p>
          <div className="flex gap-6">
            {["Privacy", "Terms", "Security"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-xs text-outline hover:text-on-surface transition-colors"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
