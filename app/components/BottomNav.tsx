"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "../lib/i18n";

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useI18n();

  const items = [
    { href: "/dashboard",   icon: "group",        label: t.nav.clients    },
    { href: "/ai-analysis", icon: "auto_awesome", label: t.nav.aiAnalysis },
    { href: "/reports",     icon: "assessment",   label: t.nav.reports    },
  ];

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface-container-low border-t border-outline-variant/20 flex">
      {items.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
              active ? "text-primary" : "text-outline"
            }`}
          >
            <span
              className="material-symbols-outlined text-2xl"
              style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {item.icon}
            </span>
            <span className="text-[10px] font-semibold" style={{ fontFamily: "Inter, sans-serif" }}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
