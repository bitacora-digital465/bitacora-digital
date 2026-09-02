import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import UpdateCard from "./UpdateCard.jsx";
import { Select } from "./ui.jsx";
import { currentMonthKey, monthKey, prevMonthKey, todayStr } from "../utils/date";

// "updates" debe llegar ya enriquecido con companyName y clientName.
export default function HistorialView({ updates, companies, clients, onEdit, onDelete }) {
  const [search, setSearch] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [clientFilter, setClientFilter] = useState("");
  const [monthMode, setMonthMode] = useState("all");
  const [specificMonth, setSpecificMonth] = useState(currentMonthKey());
  const [specificDate, setSpecificDate] = useState(todayStr());

  const availableClients = useMemo(
    () => (companyFilter ? clients.filter((c) => c.companyId === companyFilter) : clients),
    [clients, companyFilter]
  );

  const filtered = useMemo(() => {
    let list = [...updates];
    if (companyFilter) list = list.filter((u) => u.companyId === companyFilter);
    if (clientFilter) list = list.filter((u) => u.clientId === clientFilter);

    if (monthMode === "this") list = list.filter((u) => monthKey(u.date) === currentMonthKey());
    else if (monthMode === "prev") list = list.filter((u) => monthKey(u.date) === prevMonthKey());
    else if (monthMode === "month") list = list.filter((u) => monthKey(u.date) === specificMonth);
    else if (monthMode === "date") list = list.filter((u) => u.date === specificDate);

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((u) => u.note.toLowerCase().includes(q) || u.clientName.toLowerCase().includes(q));
    }

    return list.sort((a, b) => (a.date === b.date ? b.createdAt.localeCompare(a.createdAt) : b.date.localeCompare(a.date)));
  }, [updates, companyFilter, clientFilter, monthMode, specificMonth, specificDate, search]);

  const monthOptions = [
    { value: "all", label: "Todo el historial" },
    { value: "this", label: "Este mes" },
    { value: "prev", label: "Mes anterior" },
    { value: "month", label: "Un mes específico" },
    { value: "date", label: "Una fecha específica" },
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="mb-6 text-[22px] font-semibold text-slate-50">Historial</h1>

      <div className="relative mb-4">
        <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar actualización..."
          className="w-full rounded-xl border border-white/10 bg-[#0b111c] py-2.5 pl-10 pr-3.5 text-sm text-slate-100 outline-none transition-colors placeholder:text-slate-600 hover:border-white/20 focus:border-cyan-400/60"
        />
      </div>

      <div className="mb-2 grid grid-cols-2 gap-2.5">
        <Select
          value={companyFilter}
          onChange={(v) => {
            setCompanyFilter(v);
            setClientFilter("");
          }}
          options={[{ value: "", label: "Todas las empresas" }, ...companies.map((c) => ({ value: c.id, label: c.name }))]}
          placeholder="Empresa"
        />
        <Select
          value={clientFilter}
          onChange={setClientFilter}
          options={[{ value: "", label: "Todos los clientes" }, ...availableClients.map((c) => ({ value: c.id, label: c.name }))]}
          placeholder="Cliente"
        />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <Select value={monthMode} onChange={setMonthMode} options={monthOptions} placeholder="Periodo" />
        {monthMode === "month" && (
          <input
            type="month"
            value={specificMonth}
            onChange={(e) => setSpecificMonth(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#0b1220] px-3.5 py-2.5 text-sm text-slate-100 outline-none [color-scheme:dark] hover:border-white/20 focus:border-cyan-400/60"
          />
        )}
        {monthMode === "date" && (
          <input
            type="date"
            value={specificDate}
            onChange={(e) => setSpecificDate(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#0b1220] px-3.5 py-2.5 text-sm text-slate-100 outline-none [color-scheme:dark] hover:border-white/20 focus:border-cyan-400/60"
          />
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 py-14 text-center">
          <p className="text-[15px] text-slate-400">No se encontraron actualizaciones con estos filtros.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((u) => (
            <UpdateCard key={u.id} update={u} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
