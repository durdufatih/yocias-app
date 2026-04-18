"use client";

import { useState } from "react";
import Modal from "./Modal";

interface TopBarProps {
  title?: string;
  search?: string;
  onSearch?: (val: string) => void;
}

export default function TopBar({ title, search, onSearch }: TopBarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const notifications = [
    { icon: "warning", color: "text-error", text: "Sasha Vane — Critical status requires attention.", time: "2m ago" },
    { icon: "auto_awesome", color: "text-secondary", text: "AI analysis complete for Eleanor Thorne.", time: "18m ago" },
    { icon: "calendar_today", color: "text-primary", text: "Upcoming: Julian Thorne check-in tomorrow.", time: "1h ago" },
    { icon: "trending_up", color: "text-primary", text: "Margot Sterling reached 3-month goal.", time: "3h ago" },
  ];

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
                placeholder="Search patients..."
                value={search ?? ""}
                onChange={(e) => onSearch?.(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Right */}
        <div className="flex items-center gap-6">
          <div className="flex gap-2">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => { setShowNotifications(!showNotifications); setShowSettings(false); }}
                className="p-2 text-outline hover:bg-surface-container-low rounded-lg transition-colors relative"
              >
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full" />
              </button>
              {showNotifications && (
                <div className="absolute top-full mt-2 right-0 w-80 bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-outline-variant/10 flex items-center justify-between">
                    <p className="text-sm font-bold text-on-surface" style={{ fontFamily: "Manrope, sans-serif" }}>Notifications</p>
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full" style={{ fontFamily: "Inter, sans-serif" }}>
                      {notifications.length} new
                    </span>
                  </div>
                  {notifications.map((n, i) => (
                    <div key={i} className="flex items-start gap-3 px-4 py-3 hover:bg-surface-container-low transition-colors border-b border-outline-variant/5 last:border-0 cursor-pointer">
                      <span className={`material-symbols-outlined text-base flex-shrink-0 mt-0.5 ${n.color}`} style={{ fontVariationSettings: "'FILL' 1", fontSize: "18px" }}>{n.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-on-surface leading-snug">{n.text}</p>
                        <p className="text-[10px] text-outline mt-1" style={{ fontFamily: "Inter, sans-serif" }}>{n.time}</p>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="w-full py-3 text-xs text-primary font-bold hover:bg-surface-container-low transition-colors"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    MARK ALL AS READ
                  </button>
                </div>
              )}
            </div>

            {/* Settings */}
            <div className="relative">
              <button
                onClick={() => { setShowSettings(!showSettings); setShowNotifications(false); }}
                className="p-2 text-outline hover:bg-surface-container-low rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined">settings</span>
              </button>
              {showSettings && (
                <div className="absolute top-full mt-2 right-0 w-52 bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-xl z-50 py-1.5">
                  {[
                    { icon: "person", label: "Profile Settings" },
                    { icon: "palette", label: "Appearance" },
                    { icon: "privacy_tip", label: "Privacy & Security" },
                    { icon: "notifications", label: "Notification Prefs" },
                    { icon: "help", label: "Help & Support" },
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={() => setShowSettings(false)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-low transition-colors"
                    >
                      <span className="material-symbols-outlined text-outline text-base" style={{ fontSize: "18px" }}>{item.icon}</span>
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 pl-4 border-l border-outline-variant/20">
            <div className="text-right">
              <p className="text-sm font-semibold text-on-surface leading-none" style={{ fontFamily: "Manrope, sans-serif" }}>Dr. Elena Thorne</p>
              <p className="text-[10px] text-outline uppercase tracking-wider mt-0.5" style={{ fontFamily: "Inter, sans-serif" }}>Clinical Director</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm cursor-pointer hover:bg-primary/30 transition-colors">
              ET
            </div>
          </div>
        </div>
      </header>

      {/* Click outside to close */}
      {(showNotifications || showSettings) && (
        <div className="fixed inset-0 z-30" onClick={() => { setShowNotifications(false); setShowSettings(false); }} />
      )}
    </>
  );
}
