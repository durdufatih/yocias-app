"use client";

import { useState, useEffect, useRef } from "react";
import { useI18n } from "../lib/i18n";

const STORAGE_KEY = "yocias_onboarding_v1";

interface Step {
  id: number;
  targetId?: string;
  titleKey: keyof ReturnType<typeof useI18n>["t"]["onboarding"];
  descKey: keyof ReturnType<typeof useI18n>["t"]["onboarding"];
  position?: "right" | "bottom" | "left" | "top";
}

const STEPS: Step[] = [
  { id: 1, titleKey: "step1Title", descKey: "step1Desc" },
  { id: 2, targetId: "tour-patient-table", titleKey: "step2Title", descKey: "step2Desc", position: "top" },
  { id: 3, targetId: "tour-add-patient", titleKey: "step3Title", descKey: "step3Desc", position: "bottom" },
  { id: 4, targetId: "tour-nav-ai", titleKey: "step4Title", descKey: "step4Desc", position: "right" },
  { id: 5, targetId: "tour-nav-reports", titleKey: "step5Title", descKey: "step5Desc", position: "right" },
  { id: 6, titleKey: "step6Title", descKey: "step6Desc" },
];

interface Rect { top: number; left: number; width: number; height: number; }

export default function OnboardingTour() {
  const { t } = useI18n();
  const o = t.onboarding;
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) setVisible(true);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const current = STEPS[step];
    if (!current?.targetId) { setTargetRect(null); return; }
    const el = document.getElementById(current.targetId);
    if (!el) { setTargetRect(null); return; }
    const rect = el.getBoundingClientRect();
    setTargetRect({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
  }, [step, visible]);

  const finish = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  if (!visible) return null;

  const current = STEPS[step];
  const isFirst = step === 0;
  const isLast = step === STEPS.length - 1;

  const getTooltipStyle = (): React.CSSProperties => {
    if (!targetRect) return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
    const pad = 16;
    const pos = current.position ?? "bottom";
    switch (pos) {
      case "right":
        return { top: targetRect.top - 20, left: targetRect.left + targetRect.width + pad };
      case "bottom":
        return { top: targetRect.top + targetRect.height + pad, left: Math.max(16, targetRect.left - 100) };
      case "top":
        return { bottom: window.innerHeight - targetRect.top + pad, left: Math.max(16, targetRect.left - 40) };
      case "left":
        return { top: targetRect.top - 20, right: window.innerWidth - targetRect.left + pad };
    }
  };

  const spotlightPad = 10;

  return (
    <>
      {/* Overlay with spotlight cutout */}
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

      {/* Tooltip card */}
      <div
        ref={tooltipRef}
        className="fixed z-[9999] w-80 bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-2xl p-6"
        style={getTooltipStyle()}
      >
        {/* Progress dots */}
        <div className="flex gap-1.5 mb-4">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? "bg-primary w-6" : i < step ? "bg-primary/40 w-1.5" : "bg-outline-variant/30 w-1.5"}`}
            />
          ))}
        </div>

        <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-2" style={{ fontFamily: "Inter, sans-serif" }}>
          {step + 1} {o.of} {STEPS.length}
        </p>
        <h3 className="text-base font-bold text-on-surface mb-2" style={{ fontFamily: "Manrope, sans-serif" }}>
          {o[current.titleKey]}
        </h3>
        <p className="text-sm text-outline leading-relaxed mb-5">
          {o[current.descKey]}
        </p>

        <div className="flex items-center justify-between">
          <button
            onClick={finish}
            className="text-xs text-outline hover:text-on-surface transition-colors"
          >
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
      </div>
    </>
  );
}
