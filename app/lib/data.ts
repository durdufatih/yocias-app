export type Status = "Active" | "Maintenance" | "Critical" | "Inactive";
export type Trend = "Stable" | "Optimal" | "Warning" | "Improving";

export interface Patient {
  id: string;
  name: string;
  status: Status;
  lastVisit: string;
  visitType: string;
  trend: Trend;
  trendPct: number;
  age: number;
  height: number;
  bloodType: string;
  protocol: string;
  restingHR: number;
  bp: string;
  joinDate: string;
}

export interface Measurement {
  date: string;
  weight: number;
  fat: number;
  muscle: number;
  bmi: number;
}

export const patients: Patient[] = [
  { id: "clin-0294", name: "Margot Sterling", status: "Active", lastVisit: "Oct 24, 2023", visitType: "Lab Update", trend: "Stable", trendPct: 75, age: 41, height: 168, bloodType: "A RH+", protocol: "Anti-Inflammatory Protocol", restingHR: 72, bp: "122/78", joinDate: "Mar 2023" },
  { id: "clin-1102", name: "Julian Thorne", status: "Maintenance", lastVisit: "Oct 21, 2023", visitType: "Follow-up", trend: "Optimal", trendPct: 90, age: 35, height: 182, bloodType: "O RH+", protocol: "Weight Management", restingHR: 65, bp: "118/72", joinDate: "Jan 2023" },
  { id: "clin-0553", name: "Sasha Vane", status: "Critical", lastVisit: "Oct 19, 2023", visitType: "Intake", trend: "Warning", trendPct: 30, age: 29, height: 160, bloodType: "B RH-", protocol: "Metabolic Reset", restingHR: 88, bp: "138/90", joinDate: "Oct 2023" },
  { id: "clin-0821", name: "Elena Vance", status: "Active", lastVisit: "Oct 17, 2023", visitType: "Check-in", trend: "Stable", trendPct: 68, age: 34, height: 172, bloodType: "A RH+", protocol: "Anti-Inflammatory Protocol", restingHR: 68, bp: "118/76", joinDate: "Oct 2023" },
  { id: "clin-0332", name: "Arthur Morgan", status: "Active", lastVisit: "Oct 15, 2023", visitType: "Lab Update", trend: "Improving", trendPct: 60, age: 52, height: 178, bloodType: "AB RH+", protocol: "Diabetic Management", restingHR: 74, bp: "130/84", joinDate: "Jun 2023" },
  { id: "clin-0445", name: "Sarah Jenkins", status: "Active", lastVisit: "Oct 14, 2023", visitType: "Follow-up", trend: "Stable", trendPct: 72, age: 44, height: 165, bloodType: "O RH+", protocol: "Hypertension Diet", restingHR: 71, bp: "128/82", joinDate: "Apr 2023" },
  { id: "clin-0671", name: "David Miller", status: "Inactive", lastVisit: "Oct 10, 2023", visitType: "Check-in", trend: "Stable", trendPct: 55, age: 38, height: 175, bloodType: "A RH-", protocol: "GI Restoration", restingHR: 69, bp: "120/76", joinDate: "Feb 2023" },
  { id: "clin-0902", name: "Lena Park", status: "Active", lastVisit: "Oct 8, 2023", visitType: "Intake", trend: "Improving", trendPct: 80, age: 27, height: 162, bloodType: "B RH+", protocol: "Sports Nutrition", restingHR: 58, bp: "112/70", joinDate: "Sep 2023" },
];

export const measurementsByPatient: Record<string, Measurement[]> = {
  "clin-0294": [
    { date: "Oct 24, 2023", weight: 72.1, fat: 28.4, muscle: 47.2, bmi: 25.6 },
    { date: "Sep 18, 2023", weight: 73.5, fat: 29.1, muscle: 46.8, bmi: 26.1 },
    { date: "Aug 12, 2023", weight: 75.0, fat: 30.2, muscle: 46.2, bmi: 26.6 },
  ],
  "clin-1102": [
    { date: "Oct 21, 2023", weight: 81.2, fat: 16.2, muscle: 63.1, bmi: 24.5 },
    { date: "Sep 15, 2023", weight: 82.0, fat: 16.8, muscle: 62.5, bmi: 24.8 },
  ],
  "clin-0553": [
    { date: "Oct 19, 2023", weight: 95.4, fat: 38.2, muscle: 52.1, bmi: 37.3 },
    { date: "Sep 20, 2023", weight: 96.1, fat: 38.8, muscle: 51.8, bmi: 37.6 },
  ],
  "clin-0821": [
    { date: "Mar 12, 2024", weight: 70.4, fat: 22.4, muscle: 51.2, bmi: 23.8 },
    { date: "Feb 15, 2024", weight: 71.8, fat: 23.1, muscle: 50.8, bmi: 24.2 },
    { date: "Jan 10, 2024", weight: 72.9, fat: 24.0, muscle: 50.1, bmi: 24.6 },
    { date: "Dec 05, 2023", weight: 74.1, fat: 24.8, muscle: 49.5, bmi: 25.0 },
  ],
  "clin-0332": [
    { date: "Oct 15, 2023", weight: 88.3, fat: 26.1, muscle: 58.4, bmi: 27.9 },
    { date: "Sep 12, 2023", weight: 89.5, fat: 26.8, muscle: 57.9, bmi: 28.3 },
  ],
  "clin-0445": [
    { date: "Oct 14, 2023", weight: 74.2, fat: 31.2, muscle: 46.8, bmi: 27.3 },
  ],
  "clin-0671": [
    { date: "Oct 10, 2023", weight: 78.6, fat: 22.1, muscle: 56.2, bmi: 25.7 },
  ],
  "clin-0902": [
    { date: "Oct 8, 2023", weight: 61.4, fat: 18.2, muscle: 46.8, bmi: 23.4 },
  ],
};

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
