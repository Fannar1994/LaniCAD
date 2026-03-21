-- LániCAD — Supabase PostgreSQL Schema
-- Run this in the Supabase SQL Editor to create all tables

-- ══════════════════════════════════════════
-- 1. PROFILES (extends Supabase auth.users)
-- ══════════════════════════════════════════
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  name text not null default '',
  role text not null default 'user' check (role in ('admin', 'user')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Users can read their own profile
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Users can update their own profile (but not role)
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Admins can read all profiles
create policy "Admins can read all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Admins can insert profiles (create users)
create policy "Admins can insert profiles"
  on public.profiles for insert
  with check (
    exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Admins can update any profile
create policy "Admins can update any profile"
  on public.profiles for update
  using (
    exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'user')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ══════════════════════════════════════════
-- 2. PROJECTS (saved calculator work)
-- ══════════════════════════════════════════
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  type text not null check (type in ('fence', 'scaffolding', 'formwork', 'rolling', 'ceiling')),
  client jsonb not null default '{}',
  data jsonb not null default '{}',
  line_items jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.projects enable row level security;

-- Users can CRUD their own projects
create policy "Users can read own projects"
  on public.projects for select
  using (auth.uid() = user_id);

create policy "Users can insert own projects"
  on public.projects for insert
  with check (auth.uid() = user_id);

create policy "Users can update own projects"
  on public.projects for update
  using (auth.uid() = user_id);

create policy "Users can delete own projects"
  on public.projects for delete
  using (auth.uid() = user_id);

-- Admins can read all projects
create policy "Admins can read all projects"
  on public.projects for select
  using (
    exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Auto-update updated_at
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger projects_updated_at
  before update on public.projects
  for each row execute function public.update_updated_at();

-- Index for fast user lookups
create index if not exists idx_projects_user_id on public.projects(user_id);
create index if not exists idx_projects_type on public.projects(type);


-- ══════════════════════════════════════════
-- 3. TEMPLATES (reusable equipment configs)
-- ══════════════════════════════════════════
create table if not exists public.templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  type text not null check (type in ('fence', 'scaffolding', 'formwork', 'rolling', 'ceiling')),
  name text not null,
  description text default '',
  config jsonb not null default '{}',
  is_public boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.templates enable row level security;

-- Users can read public templates and their own
create policy "Users can read accessible templates"
  on public.templates for select
  using (is_public = true or auth.uid() = user_id);

create policy "Users can insert own templates"
  on public.templates for insert
  with check (auth.uid() = user_id);

create policy "Users can update own templates"
  on public.templates for update
  using (auth.uid() = user_id);

create policy "Users can delete own templates"
  on public.templates for delete
  using (auth.uid() = user_id);


-- ══════════════════════════════════════════
-- 4. PRODUCTS (editable product catalog)
-- ══════════════════════════════════════════
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  calculator_type text not null check (calculator_type in ('fence', 'scaffolding', 'formwork', 'rolling', 'ceiling')),
  rental_no text not null,
  sale_no text default '',
  description text not null,
  category text default '',
  rates jsonb not null default '{}',
  sale_price numeric(12,2) default 0,
  weight numeric(8,2) default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products enable row level security;

-- Everyone can read active products
create policy "Anyone can read active products"
  on public.products for select
  using (active = true);

-- Admins can manage products
create policy "Admins can insert products"
  on public.products for insert
  with check (
    exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "Admins can update products"
  on public.products for update
  using (
    exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "Admins can delete products"
  on public.products for delete
  using (
    exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
    )
  );

create trigger products_updated_at
  before update on public.products
  for each row execute function public.update_updated_at();

create index if not exists idx_products_calculator_type on public.products(calculator_type);
create index if not exists idx_products_rental_no on public.products(rental_no);
