import { supabase } from "./supabaseClient";
import { SEED_COMPANIES, SEED_CLIENTS } from "./seedData";

/* ---------------------------------------------------------------------
   Empresas
--------------------------------------------------------------------- */

export async function fetchCompanies() {
  const { data, error } = await supabase.from("companies").select("*").order("created_at", { ascending: true });
  if (error) throw error;
  return data.map((c) => ({ id: c.id, name: c.name }));
}

export async function createCompany(name) {
  const { data, error } = await supabase.from("companies").insert({ name }).select().single();
  if (error) throw error;
  return { id: data.id, name: data.name };
}

export async function renameCompany(id, name) {
  const { error } = await supabase.from("companies").update({ name }).eq("id", id);
  if (error) throw error;
}

export async function removeCompany(id) {
  const { error } = await supabase.from("companies").delete().eq("id", id);
  if (error) throw error;
}

/* ---------------------------------------------------------------------
   Clientes
--------------------------------------------------------------------- */

export async function fetchClients() {
  const { data, error } = await supabase.from("clients").select("*").order("created_at", { ascending: true });
  if (error) throw error;
  return data.map((c) => ({ id: c.id, companyId: c.company_id, name: c.name }));
}

export async function createClientRow(companyId, name) {
  const { data, error } = await supabase.from("clients").insert({ company_id: companyId, name }).select().single();
  if (error) throw error;
  return { id: data.id, companyId: data.company_id, name: data.name };
}

export async function renameClient(id, name) {
  const { error } = await supabase.from("clients").update({ name }).eq("id", id);
  if (error) throw error;
}

export async function removeClient(id) {
  const { error } = await supabase.from("clients").delete().eq("id", id);
  if (error) throw error;
}

/* ---------------------------------------------------------------------
   Actualizaciones
--------------------------------------------------------------------- */

export async function fetchUpdates() {
  const { data, error } = await supabase
    .from("updates")
    .select("*")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map((u) => ({
    id: u.id,
    companyId: u.company_id,
    clientId: u.client_id,
    note: u.note,
    date: u.date,
    createdAt: u.created_at,
  }));
}

export async function createUpdateRow({ companyId, clientId, note, date }) {
  const { data, error } = await supabase
    .from("updates")
    .insert({ company_id: companyId, client_id: clientId, note, date })
    .select()
    .single();
  if (error) throw error;
  return {
    id: data.id,
    companyId: data.company_id,
    clientId: data.client_id,
    note: data.note,
    date: data.date,
    createdAt: data.created_at,
  };
}

export async function editUpdateRow(id, { companyId, clientId, note, date }) {
  const { error } = await supabase
    .from("updates")
    .update({ company_id: companyId, client_id: clientId, note, date })
    .eq("id", id);
  if (error) throw error;
}

export async function removeUpdate(id) {
  const { error } = await supabase.from("updates").delete().eq("id", id);
  if (error) throw error;
}

/* ---------------------------------------------------------------------
   Datos iniciales (se insertan solo si la base de datos está vacía)
--------------------------------------------------------------------- */

export async function seedIfEmpty() {
  const { data, error } = await supabase
  .from("companies")
  .select("id");

if (error) throw error;

if (data && data.length > 0) return;

  for (const companyName of SEED_COMPANIES) {
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .insert({ name: companyName })
      .select()
      .single();
    if (companyError) throw companyError;

    const clientNames = SEED_CLIENTS[companyName] || [];
    if (clientNames.length > 0) {
      const { error: clientsError } = await supabase
        .from("clients")
        .insert(clientNames.map((name) => ({ company_id: company.id, name })));
      if (clientsError) throw clientsError;
    }
  }
}
