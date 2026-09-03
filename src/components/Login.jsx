import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Correo o contraseña incorrectos.");
      setLoading(false);
      return;
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#05070c] px-6">
      <div className="w-full max-w-md">

        <div className="mb-8 text-center">
          <p className="mb-2 text-[16px] font-semibold tracking-tight text-cyan-300">
            Bitácora digital
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-white">
            Iniciar sesión
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Accede a tu bitácora de actualizaciones
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="rounded-2xl border border-white/10 bg-[#0d1420] p-6 shadow-2xl"
        >
          <div className="mb-5">
            <label className="mb-2 block text-sm text-slate-300">
              Correo electrónico
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu correo"
              required
              autoComplete="email"
              className="w-full rounded-lg border border-gray-700 bg-[#060a11] px-4 py-3 text-white outline-none transition focus:border-cyan-400"
            />
          </div>

          <div className="mb-5">
            <label className="mb-2 block text-sm text-slate-300">
              Contraseña
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tu contraseña"
              required
              autoComplete="current-password"
              className="w-full rounded-lg border border-gray-700 bg-[#060a11] px-4 py-3 text-white outline-none transition focus:border-cyan-400"
            />
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-cyan-400 py-3 font-semibold text-black transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-600">
          Bitácora Digital
        </p>

      </div>
    </div>
  );
}
