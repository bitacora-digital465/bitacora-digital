import { useMemo } from "react";
import { Plus } from "lucide-react";
import UpdateCard from "./UpdateCard.jsx";
import { currentMonthKey, dateLabel, monthKey } from "../utils/date";

// "updates" debe llegar ya enriquecido con companyName y clientName.
export default function InicioView({ updates, companies, onNew, onEdit, onDelete }) {
  const monthK = currentMonthKey();
  const stats = useMemo(() => {
    const thisMonth = updates.filter((u) => monthKey(u.date) === monthK);
    const byCompany = companies.map((c) => ({
      name: c.name,
      count: thisMonth.filter((u) => u.companyId === c.id).length,
    }));
    return { total: thisMonth.length, byCompany };
  }, [updates, companies, monthK]);

  const recent = useMemo(
    () => [...updates].sort((a, b) => (a.date === b.date ? b.createdAt.localeCompare(a.createdAt) : b.date.localeCompare(a.date))).slice(0, 12),
    [updates]
  );

  const grouped = useMemo(() => {
    const groups = [];
    let lastKey = null;
    for (const u of recent) {
      const key = dateLabel(u.date);
      if (key !== lastKey) {
        groups.push({ key, items: [u] });
        lastKey = key;
      } else {
        groups[groups.length - 1].items.push(u);
      }
    }
    return groups;
  }, [recent]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8">
        <h1 className="text-[32px] font-extrabold leading-[1.1] tracking-tight text-cyan-300 sm:text-[40px]">
          Bitácora digital
          <br />
          de actualizaciones
        </h1>
        <p className="mt-3 text-[16px] text-slate-300 sm:text-[17px]">Todo lo que haces. Todo en un solo lugar.</p>
      </div>

      <button
        onClick={onNew}
        className="mb-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 py-4 text-[15px] font-semibold text-[#04121a] shadow-[0_0_24px_rgba(34,211,238,0.18)] transition-all hover:bg-cyan-300 hover:shadow-[0_0_32px_rgba(34,211,238,0.28)] active:scale-[0.99]"
      >
        <Plus size={18} strokeWidth={2.5} />
        Nueva actualización
      </button>

      {updates.length > 0 && (
        <div className="mb-8 grid grid-cols-3 gap-2.5">
          <div className="rounded-xl border border-white/[0.06] bg-[#0b111c] p-3.5">
            <p className="text-[22px] font-semibold text-slate-50">{stats.total}</p>
            <p className="mt-0.5 text-[12px] text-slate-400">Este mes</p>
          </div>
          {stats.byCompany.slice(0, 2).map((c) => (
            <div key={c.name} className="rounded-xl border border-white/[0.06] bg-[#0b111c] p-3.5">
              <p className="text-[22px] font-semibold text-cyan-300">{c.count}</p>
              <p className="mt-0.5 truncate text-[12px] text-slate-400">{c.name}</p>
            </div>
          ))}
        </div>
      )}

      {updates.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 py-14 text-center">
          <p className="text-[16px] text-slate-300">Tu bitácora está esperando su primera actualización.</p>
          <button onClick={onNew} className="mt-4 text-[15px] font-medium text-cyan-300 hover:text-cyan-200">
            + Nueva actualización
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map((g) => (
            <div key={g.key}>
              <h2 className="mb-2.5 text-xs font-medium uppercase tracking-wider text-slate-400">{g.key}</h2>
              <div className="space-y-2.5">
                {g.items.map((u) => (
                  <UpdateCard key={u.id} update={u} onEdit={onEdit} onDelete={onDelete} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
