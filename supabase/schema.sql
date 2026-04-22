-- Run this in Supabase SQL Editor

create table if not exists public.patients (
  id uuid default gen_random_uuid() primary key,
  dietitian_id uuid references auth.users(id) on delete cascade not null,
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  age integer,
  height numeric,
  blood_type text,
  protocol text,
  resting_hr integer,
  bp text,
  status text default 'Active' check (status in ('Active', 'Maintenance', 'Critical', 'Inactive')),
  trend text default 'Stable' check (trend in ('Stable', 'Optimal', 'Warning', 'Improving')),
  trend_pct numeric default 0,
  last_visit date,
  visit_type text,
  join_date date default current_date,
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.measurements (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references public.patients(id) on delete cascade not null,
  date date not null default current_date,
  weight numeric,
  fat numeric,
  muscle numeric,
  bmi numeric,
  created_at timestamptz default now()
);

alter table public.patients enable row level security;
alter table public.measurements enable row level security;

create policy "own patients select" on public.patients for select using (auth.uid() = dietitian_id);
create policy "own patients insert" on public.patients for insert with check (auth.uid() = dietitian_id);
create policy "own patients update" on public.patients for update using (auth.uid() = dietitian_id);
create policy "own patients delete" on public.patients for delete using (auth.uid() = dietitian_id);

create policy "own measurements select" on public.measurements for select
  using (exists (select 1 from public.patients where id = patient_id and dietitian_id = auth.uid()));
create policy "own measurements insert" on public.measurements for insert
  with check (exists (select 1 from public.patients where id = patient_id and dietitian_id = auth.uid()));
create policy "own measurements update" on public.measurements for update
  using (exists (select 1 from public.patients where id = patient_id and dietitian_id = auth.uid()));
create policy "own measurements delete" on public.measurements for delete
  using (exists (select 1 from public.patients where id = patient_id and dietitian_id = auth.uid()));

-- Body Analyses table — one column per measurement field
create table if not exists public.body_analyses (
  id                     uuid default gen_random_uuid() primary key,
  patient_id             uuid references public.patients(id) on delete cascade not null,
  dietitian_id           uuid references auth.users(id) on delete cascade not null,
  measurement_id         uuid references public.measurements(id) on delete set null,
  date                   date not null,

  -- Basic
  weight                 numeric,
  height                 numeric,
  age                    integer,
  gender                 text,
  body_type              text,
  whr                    numeric,

  -- Fat
  fat_kg                 numeric,
  fat_pct                numeric,
  fat_free_kg            numeric,

  -- Fluid
  fluid_kg               numeric,
  fluid_pct              numeric,
  intracellular_fluid_kg numeric,
  extracellular_fluid_kg numeric,

  -- Muscle & Tissue
  lean_mass_kg           numeric,
  skeletal_muscle_kg     numeric,
  bone_mass_kg           numeric,
  cell_mass_kg           numeric,
  protein_kg             numeric,
  protein_pct            numeric,

  -- Metabolism
  bmi                    numeric,
  bmr_kcal               numeric,
  bmr_kj                 numeric,
  metabolic_age          integer,
  bmr_per_kg             numeric,
  ideal_weight_kg        numeric,
  obesity_degree_pct     numeric,
  visceral_fat_level     numeric,
  body_density           numeric,

  -- Meta
  device                 text,
  patient_name_on_report text,

  created_at             timestamptz default now()
);

alter table public.body_analyses enable row level security;

create policy "own body_analyses select" on public.body_analyses for select using (auth.uid() = dietitian_id);
create policy "own body_analyses insert" on public.body_analyses for insert with check (auth.uid() = dietitian_id);
create policy "own body_analyses update" on public.body_analyses for update using (auth.uid() = dietitian_id);
create policy "own body_analyses delete" on public.body_analyses for delete using (auth.uid() = dietitian_id);
