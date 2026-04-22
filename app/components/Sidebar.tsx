"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import { useI18n, type Lang } from "../lib/i18n";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t, lang, setLang } = useI18n();

  const navItems = [
    { href: "/dashboard", icon: "group", label: t.nav.clients, matchPaths: ["/dashboard", "/clients"] },
    { href: "/ai-analysis", icon: "auto_awesome", label: t.nav.aiAnalysis, matchPaths: ["/ai-analysis"] },
    { href: "/reports", icon: "assessment", label: t.nav.reports, matchPaths: ["/reports"] },
  ];

  const isActive = (matchPaths: string[]) =>
    matchPaths.some((p) => pathname === p || pathname.startsWith(p + "/"));

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-surface-container-low flex flex-col p-4 gap-2 z-50">
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-3 px-2 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
          <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
            spa
          </span>
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight text-on-surface" style={{ fontFamily: "Manrope, sans-serif" }}>
            The Clinical Atelier
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-outline" style={{ fontFamily: "Inter, sans-serif" }}>
            Precision Nutrition
          </p>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-1">
        {navItems.map((item) => {
          const active = isActive(item.matchPaths);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                active
                  ? "text-primary bg-surface-container-lowest shadow-sm"
                  : "text-outline hover:bg-surface-container-lowest/50"
              }`}
              style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
            >
              <span className="material-symbols-outlined" style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="mt-auto flex flex-col gap-2">
        {/* Language switcher */}
        <div className="grid grid-cols-4 gap-1 px-2 mb-1">
          {(["tr", "en", "es", "fr"] as Lang[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`py-1.5 text-xs font-bold rounded-lg transition-colors ${
                lang === l
                  ? "bg-primary text-white"
                  : "text-outline hover:bg-surface-container-lowest"
              }`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>

        <Link
          href="/clients/new"
          className="mb-2 bg-primary text-white rounded-xl py-3 px-4 flex items-center justify-center gap-2 font-semibold text-sm active:scale-95 transition-transform"
          style={{ fontFamily: "Manrope, sans-serif" }}
        >
          <span className="material-symbols-outlined text-sm">add</span>
          {t.nav.newPatient}
        </Link>
        <a
          href="mailto:support@clinicalatelier.com"
          className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-outline hover:bg-surface-container-lowest/50 rounded-xl"
        >
          <span className="material-symbols-outlined">help</span>
          <span>{t.nav.support}</span>
        </a>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-outline hover:bg-surface-container-lowest/50 rounded-xl w-full text-left"
        >
          <span className="material-symbols-outlined">logout</span>
          <span>{t.nav.signOut}</span>
        </button>
      </div>
    </aside>
  );
}
