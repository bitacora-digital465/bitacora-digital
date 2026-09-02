import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, X, AlertTriangle } from "lucide-react";

export function Toast({ message, show }) {
  return (
    <div
      className={`fixed left-1/2 top-6 z-[100] -translate-x-1/2 transition-all duration-300 ${
        show ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0 pointer-events-none"
      }`}
    >
      <div className="flex items-center gap-2 rounded-full border border-cyan-400/30 bg-[#0c1420] px-4 py-2.5 shadow-[0_0_0_1px_rgba(34,211,238,0.08),0_8px_24px_rgba(0,0,0,0.5)]">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-400/15">
          <Check size={13} className="text-cyan-300" />
        </span>
        <span className="text-sm text-slate-100">{message}</span>
      </div>
    </div>
  );
}

export function Select({ value, onChange, options, placeholder, disabled, light }) {
  return (
    <div className="relative">
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        style={light ? { color: "#111827" } : undefined}
        className={
          light
            ? `w-full appearance-none rounded-xl border px-3.5 py-2.5 pr-9 text-sm outline-none transition-colors ${
                disabled
                  ? "cursor-not-allowed border-black/5 bg-slate-100 text-slate-400"
                  : "border-black/10 bg-white text-[#111827] hover:border-black/20 focus:border-cyan-500"
              }`
            : `w-full appearance-none rounded-xl border bg-[#0b1220] px-3.5 py-2.5 pr-9 text-sm text-slate-100 outline-none transition-colors ${
                disabled
                  ? "cursor-not-allowed border-white/5 text-slate-600"
                  : "border-white/10 hover:border-white/20 focus:border-cyan-400/60"
              }`
        }
      >
        <option value="" disabled style={light ? { color: "#6b7280" } : undefined}>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o.value} value={o.value} style={light ? { color: "#111827" } : undefined}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
    </div>
  );
}

export function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium tracking-wide text-slate-400">{label}</label>
      {children}
    </div>
  );
}

export function ConfirmDialog({ open, title, message, confirmLabel = "Eliminar", danger = true, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm" onClick={onCancel}>
      <div
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0d1420] p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-400/10">
            <AlertTriangle size={17} className="text-amber-400" />
          </span>
          <div>
            <h3 className="text-[15px] font-medium text-slate-100">{title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-400">{message}</p>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
              danger ? "bg-red-500/90 text-white hover:bg-red-500" : "bg-cyan-400 text-[#04121a] hover:bg-cyan-300"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function EditInline({ initial, onSave, onCancel }) {
  const [val, setVal] = useState(initial);
  const ref = useRef(null);
  useEffect(() => ref.current?.focus(), []);
  return (
    <div className="flex flex-1 items-center gap-2">
      <input
        ref={ref}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && val.trim()) onSave(val.trim());
          if (e.key === "Escape") onCancel();
        }}
        className="flex-1 rounded-lg border border-cyan-400/40 bg-[#0b1220] px-2.5 py-1.5 text-sm text-slate-100 outline-none"
      />
      <button onClick={() => val.trim() && onSave(val.trim())} className="rounded-lg p-1.5 text-cyan-300 hover:bg-white/5">
        <Check size={14} />
      </button>
      <button onClick={onCancel} className="rounded-lg p-1.5 text-slate-500 hover:bg-white/5">
        <X size={14} />
      </button>
    </div>
  );
}

export function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-1 flex-col items-center gap-1 rounded-xl py-2.5 text-[11px] font-medium transition-colors sm:flex-row sm:justify-start sm:gap-3 sm:px-3.5 sm:py-2.5 sm:text-[15px] ${
        active ? "text-cyan-300 sm:bg-cyan-400/10" : "text-slate-400 hover:text-slate-200"
      }`}
    >
      <Icon size={20} strokeWidth={active ? 2.4 : 2} />
      {label}
    </button>
  );
}
