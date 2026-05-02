"use client";

import { useState, useEffect, useCallback } from "react";
import { useI18n } from "../lib/i18n";

const STORAGE_KEY = "yocias_onboarding_v1";

interface Step {
  id: number;
  desktopTargetId?: string;
  mobileTargetId?: string;
  titleKey: string;
  descKey: string;
  position?: "right" | "bottom" | "top";
}

const STEPS: Step[] = [
  { id: 1, titleKey: "step1Title", descKey: "step1Desc" },
  { id: 2, desktopTargetId: "tour-patient-table", titleKey: "step2Title", descKey: "step2Desc", position: "top" },
  { id: 3, desktopTargetId: "tour-add-patient", mobileTargetId: "tour-add-patient", titleKey: "step3Title", descKey: "step3Desc", position: "bottom" },
  { id: 4, desktopTargetId: "tour-nav-ai", titleKey: "step4Title", descKey: "step4Desc", position: "right" },
  { id: 5, desktopTargetId: "tour-nav-reports", titleKey: "step5Title", descKey: "step5Desc", position: "right" },
  { id: 6, titleKey: "step6Title", descKey: "step6Desc" },
];

interface Rect { top: number; left: number; width: number; height: number; }

export default function OnboardingTour() {
  const { t } = useI18n();
  const o = t.onboarding;
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) setVisible(true);
    setIsMobile(window.innerWidth < 768);
  }, []);

  const updateRect = useCallback(() => {
    const current = STEPS[step];
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);
    const targetId = mobile ? current.mobileTargetId : current.desktopTargetId;
    if (!targetId) { setTargetRect(null); return; }
    const el = document.getElementById(targetId);
    if (!el) { setTargetRect(null); return; }
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) { setTargetRect(null); return; }
    setTargetRect({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
  }, [step]);

  useEffect(() => {
    if (!visible) return;
    updateRect();
    window.addEventListener("resize", updateRect);
    return () => window.removeEventListener("resize", updateRect);
  }, [step, visible, updateRect]);

  const finish = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  if (!visible) return null;

  const current = STEPS[step];
  const isFirst = step === 0;
  const isLast = step === STEPS.length - 1;
  const spotlightPad = 10;

  const getDesktopTooltipStyle = (): React.CSSProperties => {
    if (!targetRect) return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
    const pad = 16;
    const vw = window.innerWidth;
    const tooltipW = 320;
    const pos = current.position ?? "bottom";
    let style: React.CSSProperties = {};
    switch (pos) {
      case "right":
        style = { top: Math.max(16, targetRect.top - 20), left: targetRect.left + targetRect.width + pad };
        break;
      case "bottom":
        style = { top: targetRect.top + targetRect.height + pad, left: Math.min(vw - tooltipW - 16, Math.max(16, targetRect.left - 80)) };
        break;
      case "top":
        style = { bottom: window.innerHeight - targetRect.top + pad, left: Math.min(vw - tooltipW - 16, Math.max(16, targetRect.left - 40)) };
        break;
    }
    return style;
  };

  const TooltipContent = () => (
    <>
      <div className="flex gap-1.5 mb-4">
        {STEPS.map((_, i) => (
          <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? "bg-primary w-6" : i < step ? "bg-primary/40 w-1.5" : "bg-outline-variant/30 w-1.5"}`} />
        ))}
      </div>
      <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-2" style={{ fontFamily: "Inter, sans-serif" }}>
        {step + 1} {o.of} {STEPS.length}
      </p>
      <h3 className="text-base font-bold text-on-surface mb-2" style={{ fontFamily: "Manrope, sans-serif" }}>
        {(o as Record<string, string>)[current.titleKey]}
      </h3>
      <p className="text-sm text-outline leading-relaxed mb-5">
        {(o as Record<string, string>)[current.descKey]}
      </p>
      <div className="flex items-center justify-between">
        <button onClick={finish} className="text-xs text-outline hover:text-on-surface transition-colors py-2 px-1">
          {o.skip}
        </button>
        <div className="flex gap-2">
          {!isFirst && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="px-4 py-2 text-xs font-semibold text-on-surface border border-outline-variant/30 rounded-lg hover:bg-surface-container transition-colors"
            >
              {o.back}
            </button>
          )}
          <button
            onClick={() => isLast ? finish() : setStep((s) => s + 1)}
            className="px-4 py-2 text-xs font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
          >
            {isLast ? o.finish : o.next}
          </button>
        </div>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <>
        <div className="fixed inset-0 z-[9998] bg-black/60" onClick={finish} />
        <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-surface-container-lowest rounded-t-3xl border-t border-outline-variant/20 shadow-2xl p-6 pb-8">
          <div className="w-10 h-1 bg-outline-variant/40 rounded-full mx-auto mb-5" />
          <TooltipContent />
        </div>
      </>
    );
  }

  return (
    <>
      {/* Desktop overlay with spotlight */}
      <div className="fixed inset-0 z-[9998] pointer-events-none">
        {targetRect ? (
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              <mask id="spotlight-mask">
                <rect width="100%" height="100%" fill="white" />
                <rect
                  x={targetRect.left - spotlightPad}
                  y={targetRect.top - spotlightPad}
                  width={targetRect.width + spotlightPad * 2}
                  height={targetRect.height + spotlightPad * 2}
                  rx="12"
                  fill="black"
                />
              </mask>
            </defs>
            <rect width="100%" height="100%" fill="rgba(0,0,0,0.65)" mask="url(#spotlight-mask)" className="pointer-events-auto" onClick={finish} />
          </svg>
        ) : (
          <div className="absolute inset-0 bg-black/65 pointer-events-auto" onClick={finish} />
        )}
        {targetRect && (
          <div
            className="absolute rounded-xl pointer-events-none"
            style={{
              top: targetRect.top - spotlightPad,
              left: targetRect.left - spotlightPad,
              width: targetRect.width + spotlightPad * 2,
              height: targetRect.height + spotlightPad * 2,
              boxShadow: "0 0 0 3px rgba(55,96,44,0.8)",
            }}
          />
        )}
      </div>

      {/* Desktop tooltip card */}
      <div
        className="fixed z-[9999] w-80 bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-2xl p-6"
        style={getDesktopTooltipStyle()}
      >
        <TooltipContent />
      </div>
    </>
  );
}
