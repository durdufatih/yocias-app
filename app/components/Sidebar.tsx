"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "../lib/i18n";

export default function Sidebar() {
  const pathname = usePathname();
  const { t } = useI18n();

  const navItems = [
    { href: "/dashboard", icon: "group", label: t.nav.clients, matchPaths: ["/dashboard", "/clients"] },
    { href: "/ai-analysis", icon: "auto_awesome", label: t.nav.aiAnalysis, matchPaths: ["/ai-analysis"] },
    { href: "/reports", icon: "assessment", label: t.nav.reports, matchPaths: ["/reports"] },
  ];

  const isActive = (matchPaths: string[]) =>
    matchPaths.some((p) => pathname === p || pathname.startsWith(p + "/"));

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
            Yocias
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
        <a
          href="mailto:support@yocias.com"
          className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-outline hover:bg-surface-container-lowest/50 rounded-xl"
        >
          <span className="material-symbols-outlined">help</span>
          <span>{t.nav.support}</span>
        </a>
      </div>
    </aside>
  );
}
