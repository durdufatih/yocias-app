export type Status = "Active" | "Maintenance" | "Critical" | "Inactive";
export type Trend = "Stable" | "Optimal" | "Warning" | "Improving";

export interface Patient {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  status: Status;
  lastVisit?: string;
  visitType?: string;
  trend: Trend;
  trendPct: number;
  age?: number;
  height?: number;
  bloodType?: string;
  protocol?: string;
  restingHR?: number;
  bp?: string;
  joinDate?: string;
  notes?: string;
}

export interface Measurement {
  id?: string;
  date: string;
  weight: number;
  fat: number;
  muscle: number;
  bmi: number;
}

export const statusStyles: Record<Status, string> = {
  Active: "text-primary bg-primary/10",
  Maintenance: "text-outline bg-surface-container-high",
  Critical: "text-error bg-error/10",
  Inactive: "text-outline bg-surface-container-high",
};

export const trendBarColor: Record<Trend, string> = {
  Stable: "bg-primary",
  Optimal: "bg-secondary",
  Warning: "bg-error",
  Improving: "bg-tertiary-fixed-dim",
};

export const trendTextColor: Record<Trend, string> = {
  Stable: "text-primary",
  Optimal: "text-secondary",
  Warning: "text-error",
  Improving: "text-outline",
};
