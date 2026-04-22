import { supabase } from "./supabase";
import type { Patient, Measurement, Status, Trend } from "./data";

export interface BodyAnalysisData {
  weight?: number; height?: number; age?: number; gender?: string; body_type?: string;
  whr?: number;
  fat_kg?: number; fat_pct?: number;
  fat_free_kg?: number;
  fluid_kg?: number; fluid_pct?: number;
  lean_mass_kg?: number; skeletal_muscle_kg?: number; bone_mass_kg?: number;
  cell_mass_kg?: number; intracellular_fluid_kg?: number; extracellular_fluid_kg?: number;
  protein_kg?: number; protein_pct?: number;
  bmi?: number; bmr_kcal?: number; bmr_kj?: number; metabolic_age?: number; bmr_per_kg?: number;
  ideal_weight_kg?: number; obesity_degree_pct?: number; visceral_fat_level?: number; body_density?: number;
  date?: string; patient_name?: string; device?: string;
}

export interface BodyAnalysis {
  id: string;
  patient_id: string;
  measurement_id: string | null;
  date: string;
  data: BodyAnalysisData;
  created_at: string;
}

function fmtDate(iso: string | undefined): string | undefined {
  if (!iso) return undefined;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function fmtMonthYear(iso: string | undefined): string | undefined {
  if (!iso) return undefined;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapPatient(row: any): Patient {
  return {
    id: row.id,
    name: `${row.first_name} ${row.last_name}`,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    age: row.age ?? undefined,
    height: row.height ?? undefined,
    bloodType: row.blood_type ?? undefined,
    protocol: row.protocol ?? undefined,
    restingHR: row.resting_hr ?? undefined,
    bp: row.bp ?? undefined,
    status: (row.status as Status) ?? "Active",
    trend: (row.trend as Trend) ?? "Stable",
    trendPct: row.trend_pct ?? 0,
    lastVisit: fmtDate(row.last_visit),
    visitType: row.visit_type ?? undefined,
    joinDate: fmtMonthYear(row.join_date),
    notes: row.notes ?? undefined,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapMeasurement(row: any): Measurement {
  return {
    id: row.id,
    date: fmtDate(row.date) ?? row.date,
    weight: row.weight,
    fat: row.fat,
    muscle: row.muscle,
    bmi: row.bmi,
  };
}

export async function getPatients(): Promise<Patient[]> {
  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapPatient);
}

export async function getPatient(id: string): Promise<Patient | null> {
  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return mapPatient(data);
}

export async function createPatient(input: {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  age?: number;
  height?: number;
  blood_type?: string;
  protocol?: string;
  notes?: string;
}): Promise<Patient> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data, error } = await supabase
    .from("patients")
    .insert({ ...input, dietitian_id: user.id })
    .select()
    .single();
  if (error) throw error;
  return mapPatient(data);
}

export async function updatePatient(id: string, updates: Record<string, unknown>): Promise<void> {
  const { error } = await supabase.from("patients").update(updates).eq("id", id);
  if (error) throw error;
}

export async function getMeasurements(patientId: string): Promise<Measurement[]> {
  const { data, error } = await supabase
    .from("measurements")
    .select("*")
    .eq("patient_id", patientId)
    .order("date", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapMeasurement);
}

export async function getAllMeasurementsWithPatient(): Promise<
  Array<Measurement & { patient: Patient }>
> {
  const { data, error } = await supabase
    .from("measurements")
    .select("*, patients(*)")
    .order("date", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    ...mapMeasurement(row),
    patient: mapPatient(row.patients),
  }));
}

export async function addMeasurement(
  patientId: string,
  input: { date: string; weight: number; fat: number; muscle: number; bmi: number }
): Promise<Measurement> {
  const { data, error } = await supabase
    .from("measurements")
    .insert({ ...input, patient_id: patientId })
    .select()
    .single();
  if (error) throw error;
  await supabase
    .from("patients")
    .update({ last_visit: input.date, visit_type: "Check-in" })
    .eq("id", patientId);
  return mapMeasurement(data);
}

export async function deleteMeasurement(id: string): Promise<void> {
  const { error } = await supabase.from("measurements").delete().eq("id", id);
  if (error) throw error;
}

export async function saveBodyAnalysis(
  patientId: string,
  measurementId: string | null,
  date: string,
  d: BodyAnalysisData
): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data: row, error } = await supabase
    .from("body_analyses")
    .insert({
      patient_id: patientId,
      dietitian_id: user.id,
      measurement_id: measurementId,
      date,
      weight: d.weight ?? null,
      height: d.height ?? null,
      age: d.age ?? null,
      gender: d.gender ?? null,
      body_type: d.body_type ?? null,
      whr: d.whr ?? null,
      fat_kg: d.fat_kg ?? null,
      fat_pct: d.fat_pct ?? null,
      fat_free_kg: d.fat_free_kg ?? null,
      fluid_kg: d.fluid_kg ?? null,
      fluid_pct: d.fluid_pct ?? null,
      intracellular_fluid_kg: d.intracellular_fluid_kg ?? null,
      extracellular_fluid_kg: d.extracellular_fluid_kg ?? null,
      lean_mass_kg: d.lean_mass_kg ?? null,
      skeletal_muscle_kg: d.skeletal_muscle_kg ?? null,
      bone_mass_kg: d.bone_mass_kg ?? null,
      cell_mass_kg: d.cell_mass_kg ?? null,
      protein_kg: d.protein_kg ?? null,
      protein_pct: d.protein_pct ?? null,
      bmi: d.bmi ?? null,
      bmr_kcal: d.bmr_kcal ?? null,
      bmr_kj: d.bmr_kj ?? null,
      metabolic_age: d.metabolic_age ?? null,
      bmr_per_kg: d.bmr_per_kg ?? null,
      ideal_weight_kg: d.ideal_weight_kg ?? null,
      obesity_degree_pct: d.obesity_degree_pct ?? null,
      visceral_fat_level: d.visceral_fat_level ?? null,
      body_density: d.body_density ?? null,
      device: d.device ?? null,
      patient_name_on_report: d.patient_name ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return row.id;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapBodyAnalysis(row: any): BodyAnalysis {
  return {
    id: row.id,
    patient_id: row.patient_id,
    measurement_id: row.measurement_id,
    date: row.date,
    created_at: row.created_at,
    data: {
      weight: row.weight, height: row.height, age: row.age,
      gender: row.gender, body_type: row.body_type, whr: row.whr,
      fat_kg: row.fat_kg, fat_pct: row.fat_pct, fat_free_kg: row.fat_free_kg,
      fluid_kg: row.fluid_kg, fluid_pct: row.fluid_pct,
      intracellular_fluid_kg: row.intracellular_fluid_kg,
      extracellular_fluid_kg: row.extracellular_fluid_kg,
      lean_mass_kg: row.lean_mass_kg, skeletal_muscle_kg: row.skeletal_muscle_kg,
      bone_mass_kg: row.bone_mass_kg, cell_mass_kg: row.cell_mass_kg,
      protein_kg: row.protein_kg, protein_pct: row.protein_pct,
      bmi: row.bmi, bmr_kcal: row.bmr_kcal, bmr_kj: row.bmr_kj,
      metabolic_age: row.metabolic_age, bmr_per_kg: row.bmr_per_kg,
      ideal_weight_kg: row.ideal_weight_kg, obesity_degree_pct: row.obesity_degree_pct,
      visceral_fat_level: row.visceral_fat_level, body_density: row.body_density,
      device: row.device, patient_name: row.patient_name_on_report,
    },
  };
}

export async function getBodyAnalyses(patientId: string): Promise<BodyAnalysis[]> {
  const { data, error } = await supabase
    .from("body_analyses")
    .select("*")
    .eq("patient_id", patientId)
    .order("date", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapBodyAnalysis);
}
