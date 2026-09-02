import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // No lanzamos un error para que la app siga cargando en pantalla y el
  // mensaje sea visible, en vez de una pantalla en blanco.
  console.warn(
    "Faltan VITE_SUPABASE_URL y/o VITE_SUPABASE_ANON_KEY. " +
      "Copia .env.example a .env y coloca tus credenciales de Supabase."
  );
}

export const supabase = createClient(supabaseUrl ?? "", supabaseAnonKey ?? "");

export const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
