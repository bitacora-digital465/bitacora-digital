import { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { Field, Select } from "./ui.jsx";
import { todayStr } from "../utils/date";

// onSave recibe { companyId, clientId, note, date }. El componente padre
// decide si eso crea una actualización nueva o edita la existente
// (según si "initial" tenía datos), y es quien habla con Supabase.
export default function UpdateModal({ open, onClose, onSave, companies, clients, initial }) {
  const [companyId, setCompanyId] = useState("");
  const [clientId, setClientId] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(todayStr());
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setCompanyId(initial.companyId);
      setClientId(initial.clientId);
      setNote(initial.note);
      setDate(initial.date);
    } else {
      setCompanyId("");
      setClientId("");
      setNote("");
      setDate(todayStr());
    }
    setError("");
    setSaving(false);
    setTimeout(() => textareaRef.current?.focus(), 50);
  }, [open, initial]);

  const availableClients = useMemo(() => clients.filter((c) => c.companyId === companyId), [clients, companyId]);

  const handleCompanyChange = (val) => {
    setCompanyId(val);
    setClientId("");
  };

  const handleSubmit = async () => {
    if (!companyId) return setError("Selecciona una empresa.");
    if (!clientId) return setError("Selecciona un cliente.");
    if (!note.trim()) return setError("Escribe qué realizaste.");
    if (!date) return setError("Selecciona una fecha.");
    setError("");
    setSaving(true);
    try {
      await onSave({ companyId, clientId, note: note.trim(), date });
    } catch {
      setError("No se pudo guardar. Verifica tu conexión con Supabase e intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/65 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-t-3xl border border-white/10 bg-[#0d1420] p-5 shadow-2xl sm:rounded-2xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-[17px] font-medium text-slate-100">{initial ? "Editar actualización" : "Nueva actualización"}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-white/5 hover:text-slate-300">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <Field label="Empresa">
            <Select
              value={companyId}
              onChange={handleCompanyChange}
              options={companies.map((c) => ({ value: c.id, label: c.name }))}
              placeholder="Seleccionar empresa"
              light
            />
          </Field>

          <Field label="Cliente">
            <Select
              value={clientId}
              onChange={setClientId}
              options={availableClients.map((c) => ({ value: c.id, label: c.name }))}
              placeholder={companyId ? "Seleccionar cliente" : "Primero selecciona una empresa"}
              disabled={!companyId}
              light
            />
          </Field>

          <Field label="Nota">
            <textarea
              ref={textareaRef}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="¿Qué realizaste?"
              rows={3}
              style={{ color: "#111827" }}
              className="w-full resize-none rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-slate-500 hover:border-black/20 focus:border-cyan-500"
            />
          </Field>

          <Field label="Fecha">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{ color: "#111827" }}
              className="w-full rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm outline-none transition-colors [color-scheme:light] hover:border-black/20 focus:border-cyan-500"
            />
          </Field>

          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="mt-6 w-full rounded-xl bg-cyan-400 py-3 text-sm font-semibold text-[#04121a] transition-all hover:bg-cyan-300 active:scale-[0.99] disabled:opacity-60"
        >
          {saving ? "Guardando..." : "Guardar actualización"}
        </button>
      </div>
    </div>
  );
}
