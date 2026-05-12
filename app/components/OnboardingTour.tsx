"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useI18n } from "../lib/i18n";

const DONE_KEY = "yocias_onboarding_v1";
const STEP_KEY = "yocias_onboarding_step";

interface Step {
  id: number;
  route: string;
  targetId?: string;
  position?: "right" | "bottom" | "top" | "left";
  titleKey: string;
  descKey: string;
}

const STEPS: Step[] = [
  { id: 1, route: "/dashboard", titleKey: "step1Title", descKey: "step1Desc" },
  { id: 2, route: "/dashboard", targetId: "tour-patient-table", position: "top", titleKey: "step2Title", descKey: "step2Desc" },
  { id: 3, route: "/dashboard", targetId: "tour-add-patient", position: "bottom", titleKey: "step3Title", descKey: "step3Desc" },
  { id: 4, route: "/ai-analysis", targetId: "tour-upload-area", position: "top", titleKey: "step4Title", descKey: "step4Desc" },
  { id: 5, route: "/reports", targetId: "tour-reports-stats", position: "top", titleKey: "step5Title", descKey: "step5Desc" },
  { id: 6, route: "/reports", titleKey: "step6Title", descKey: "step6Desc" },
];

interface Rect { top: number; left: number; width: number; height: number; }

export default function OnboardingTour() {
  const { t } = useI18n();
  const o = t.onboarding;
  const router = useRouter();
  const pathname = usePathname();
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem(DONE_KEY);
    if (done) return;
    // Only activate when already on an app page (logged-in area)
    const appRoutes = ["/dashboard", "/ai-analysis", "/reports", "/clients"];
    if (!appRoutes.some((r) => pathname.startsWith(r))) return;
    const saved = parseInt(localStorage.getItem(STEP_KEY) ?? "0", 10);
    setStep(isNaN(saved) ? 0 : saved);
    setVisible(true);
    setIsMobile(window.innerWidth < 768);
  }, [pathname]);

  const resolveRect = useCallback(() => {
    const current = STEPS[step];
    if (!current?.targetId) { setTargetRect(null); return; }
    const el = document.getElementById(current.targetId);
    if (!el) { setTargetRect(null); return; }
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) { setTargetRect(null); return; }
    setTargetRect({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
  }, [step]);

  // When pathname matches the step's route, resolve the target element
  useEffect(() => {
    if (!visible) return;
    const current = STEPS[step];
    if (!current) return;
    if (pathname !== current.route) return;
    // Small delay to let the page render
    const t = setTimeout(resolveRect, 150);
    return () => clearTimeout(t);
  }, [pathname, step, visible, resolveRect]);

  // Navigate when step changes and route differs
  useEffect(() => {
    if (!visible) return;
    const current = STEPS[step];
    if (!current) return;
    if (pathname !== current.route) {
      router.push(current.route);
    }
  }, [step, visible]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const goToStep = (next: number) => {
    localStorage.setItem(STEP_KEY, String(next));
    setTargetRect(null);
    setStep(next);
  };

  const finish = () => {
    localStorage.setItem(DONE_KEY, "1");
    localStorage.removeItem(STEP_KEY);
    setVisible(false);
  };

  if (!visible) return null;

  // Only show on app pages (not landing/login/signup)
  const appRoutes = ["/dashboard", "/ai-analysis", "/reports", "/clients"];
  if (!appRoutes.some((r) => pathname.startsWith(r))) return null;

  const current = STEPS[step];
  if (!current) return null;
  const isFirst = step === 0;
  const isLast = step === STEPS.length - 1;
  const spotlightPad = 10;

  const getDesktopTooltipStyle = (): React.CSSProperties => {
    if (!targetRect) return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
    const pad = 16;
    const vw = window.innerWidth;
    const tooltipW = 320;
    const pos = current.position ?? "bottom";
    switch (pos) {
      case "right":
        return { top: Math.max(16, targetRect.top - 20), left: Math.min(vw - tooltipW - 16, targetRect.left + targetRect.width + pad) };
      case "bottom":
        return { top: targetRect.top + targetRect.height + pad, left: Math.min(vw - tooltipW - 16, Math.max(16, targetRect.left)) };
      case "top":
        return { bottom: window.innerHeight - targetRect.top + pad, left: Math.min(vw - tooltipW - 16, Math.max(16, targetRect.left)) };
      case "left":
        return { top: Math.max(16, targetRect.top - 20), right: window.innerWidth - targetRect.left + pad };
    }
  };

  const StepIndicator = () => (
    <div className="flex gap-1.5 mb-4">
      {STEPS.map((_, i) => (
        <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? "bg-primary w-6" : i < step ? "bg-primary/40 w-1.5" : "bg-outline-variant/30 w-1.5"}`} />
      ))}
    </div>
  );

  const TooltipBody = () => (
    <>
      <StepIndicator />
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
              onClick={() => goToStep(step - 1)}
              className="px-4 py-2 text-xs font-semibold text-on-surface border border-outline-variant/30 rounded-lg hover:bg-surface-container transition-colors"
            >
              {o.back}
            </button>
          )}
          <button
            onClick={() => isLast ? finish() : goToStep(step + 1)}
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
        <div className="fixed inset-0 z-[9998] bg-black/60" />
        <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-surface-container-lowest rounded-t-3xl border-t border-outline-variant/20 shadow-2xl p-6 pb-safe-area-inset-bottom">
          <div className="pb-6">
            <div className="w-10 h-1 bg-outline-variant/40 rounded-full mx-auto mb-5" />
            <TooltipBody />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Overlay + spotlight */}
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

      {/* Tooltip */}
      <div
        className="fixed z-[9999] w-80 bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-2xl p-6"
        style={getDesktopTooltipStyle()}
      >
        <TooltipBody />
      </div>
    </>
  );
}
