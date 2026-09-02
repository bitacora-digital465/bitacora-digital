import { Pencil, Trash2 } from "lucide-react";
import { formatDateShort } from "../utils/date";

export default function UpdateCard({ update, onEdit, onDelete }) {
  return (
    <div className="group rounded-2xl border border-white/[0.06] bg-[#0b111c] p-4 transition-colors hover:border-white/[0.12]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-cyan-400/10 px-2 py-0.5 text-[11px] font-medium tracking-wide text-cyan-300">
              {update.companyName}
            </span>
            <span className="text-xs text-slate-500">{formatDateShort(update.date)}</span>
          </div>
          <p className="text-[13px] font-medium text-slate-300">{update.clientName}</p>
          <p className="mt-1 whitespace-pre-wrap break-words text-[15px] leading-snug text-slate-100">{update.note}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          <button
            onClick={() => onEdit(update)}
            className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-white/5 hover:text-cyan-300"
            aria-label="Editar"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => onDelete(update)}
            className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-white/5 hover:text-red-400"
            aria-label="Eliminar"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
