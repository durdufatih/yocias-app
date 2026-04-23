"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { useI18n, type Lang } from "../lib/i18n";

interface TopBarProps {
  title?: string;
  search?: string;
  onSearch?: (val: string) => void;
}

const langOptions: { code: Lang; flag: string; label: string }[] = [
  { code: "tr", flag: "🇹🇷", label: "Türkçe" },
  { code: "en", flag: "🇬🇧", label: "English" },
  { code: "es", flag: "🇪🇸", label: "Español" },
  { code: "fr", flag: "🇫🇷", label: "Français" },
];

export default function TopBar({ title, search, onSearch }: TopBarProps) {
  const { t, lang, setLang } = useI18n();
  const router = useRouter();
  const [showLang, setShowLang] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  const displayName = user?.user_metadata?.first_name
    ? `${user.user_metadata.first_name} ${user.user_metadata.last_name ?? ""}`.trim()
    : user?.email?.split("@")[0] ?? "Dr. Thorne";

  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const currentLang = langOptions.find((l) => l.code === lang)!;

  return (
    <>
      <header className="w-full h-16 sticky top-0 z-40 bg-surface/80 backdrop-blur-xl flex justify-between items-center px-8 border-b border-outline-variant/20">
        {/* Left */}
        <div className="flex items-center gap-4 flex-1 max-w-md">
          {title ? (
            <h2 className="text-lg font-bold text-on-surface" style={{ fontFamily: "Manrope, sans-serif" }}>{title}</h2>
          ) : (
            <div className="relative w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">search</span>
              <input
                className="w-full bg-surface-container-low border-none rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
                placeholder={t.topbar.search}
                value={search ?? ""}
                onChange={(e) => onSearch?.(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">

          {/* Language picker */}
          <div className="relative">
            <button
              onClick={() => setShowLang(!showLang)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-surface-container-low transition-colors border border-outline-variant/20"
            >
              <span className="text-base leading-none">{currentLang.flag}</span>
              <span className="text-xs font-semibold text-on-surface uppercase">{currentLang.code}</span>
              <span className="material-symbols-outlined text-outline" style={{ fontSize: "16px" }}>expand_more</span>
            </button>
            {showLang && (
              <div className="absolute top-full mt-2 right-0 w-44 bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-xl z-50 py-1.5 overflow-hidden">
                {langOptions.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => { setLang(l.code); setShowLang(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                      lang === l.code
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-on-surface hover:bg-surface-container-low"
                    }`}
                  >
                    <span className="text-base">{l.flag}</span>
                    <span>{l.label}</span>
                    {lang === l.code && (
                      <span className="material-symbols-outlined text-primary ml-auto" style={{ fontSize: "16px", fontVariationSettings: "'FILL' 1" }}>check</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

{/* User */}
          <div className="relative flex items-center gap-3 pl-4 border-l border-outline-variant/20">
            <button onClick={() => { setShowUser(!showUser); setShowLang(false); }} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="text-right">
                <p className="text-sm font-semibold text-on-surface leading-none" style={{ fontFamily: "Manrope, sans-serif" }}>{displayName}</p>
                <p className="text-[10px] text-outline uppercase tracking-wider mt-0.5" style={{ fontFamily: "Inter, sans-serif" }}>{t.topbar.clinicalDirector}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                {initials}
              </div>
            </button>
            {showUser && (
              <div className="absolute top-full mt-2 right-0 w-44 bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-xl z-50 py-1.5 overflow-hidden">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-error hover:bg-error/5 transition-colors"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>logout</span>
                  {t.nav.signOut}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {(showLang || showUser) && (
        <div className="fixed inset-0 z-30" onClick={() => { setShowLang(false); setShowUser(false); }} />
      )}
    </>
  );
}
