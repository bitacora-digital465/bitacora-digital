-- ============================================================
-- Bitácora Digital de Actualizaciones — esquema de Supabase
-- Ejecuta este archivo completo en: Supabase → tu proyecto →
-- SQL Editor → New query → pega esto → Run.
-- ============================================================

-- Extensión necesaria para generar UUIDs (normalmente ya viene
-- habilitada en los proyectos de Supabase).
create extension if not exists "pgcrypto";

-- ---------- EMPRESAS ----------
create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

-- ---------- CLIENTES ----------
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete restrict,
  name text not null,
  created_at timestamptz not null default now()
);

-- ---------- ACTUALIZACIONES ----------
create table if not exists updates (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete restrict,
  -- Si se elimina un cliente, sus actualizaciones pasadas se conservan
  -- (client_id queda en null) en vez de borrarse, tal como pide la app.
  client_id uuid references clients(id) on delete set null,
  note text not null,
  date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Mantiene "updated_at" al día automáticamente en cada edición.
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_updates_updated_at on updates;
create trigger trg_updates_updated_at
before update on updates
for each row execute function set_updated_at();

-- Índices para que los filtros y la búsqueda sean rápidos.
create index if not exists idx_clients_company_id on clients(company_id);
create index if not exists idx_updates_company_id on updates(company_id);
create index if not exists idx_updates_client_id on updates(client_id);
create index if not exists idx_updates_date on updates(date desc);

-- ------------------------------------------------------------
-- Seguridad (RLS)
-- ------------------------------------------------------------
-- Esta es una herramienta personal SIN login: la propia app usa
-- la clave "anon" para leer y escribir. Por eso se habilita RLS
-- con una política abierta para esa clave (equivalente, en la
-- práctica, a no tener RLS). Si en el futuro agregas autenticación,
-- reemplaza estas políticas por unas basadas en auth.uid().
--
-- IMPORTANTE: mientras uses estas políticas, cualquiera que tenga
-- tu URL y tu clave "anon" podría leer o modificar los datos. Para
-- un uso 100% personal esto suele ser aceptable, pero tenlo en cuenta
-- antes de compartir el enlace de la app públicamente.

alter table companies enable row level security;
alter table clients enable row level security;
alter table updates enable row level security;

create policy "Acceso total anon - companies" on companies for all using (true) with check (true);
create policy "Acceso total anon - clients" on clients for all using (true) with check (true);
create policy "Acceso total anon - updates" on updates for all using (true) with check (true);

-- ------------------------------------------------------------
-- Nota sobre los datos iniciales (TREXDI, SCRAV y sus clientes):
-- NO se insertan aquí por SQL. La propia aplicación los crea
-- automáticamente la primera vez que se conecta a una base de
-- datos vacía (ver src/lib/api.js -> seedIfEmpty(), que usa los
-- datos de src/lib/seedData.js). Así evitas insertarlos dos veces
-- si ya ejecutaste este script antes.
-- ------------------------------------------------------------
