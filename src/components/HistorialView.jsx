import { useMemo, useState } from "react";
import { Search, Download } from "lucide-react";
import * as XLSX from "xlsx";
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

  // Mes independiente para el reporte Excel.
  const [reportMonth, setReportMonth] = useState(currentMonthKey());

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
      list = list.filter(
        (u) =>
          (u.note || "").toLowerCase().includes(q) ||
          (u.clientName || "").toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) =>
      a.date === b.date
        ? (b.createdAt || "").localeCompare(a.createdAt || "")
        : b.date.localeCompare(a.date)
    );
  }, [updates, companyFilter, clientFilter, monthMode, specificMonth, specificDate, search]);

  const monthOptions = [
    { value: "all", label: "Todo el historial" },
    { value: "this", label: "Este mes" },
    { value: "prev", label: "Mes anterior" },
    { value: "month", label: "Un mes específico" },
    { value: "date", label: "Una fecha específica" },
  ];

  // Genera un Excel con una hoja por empresa.
  // El reporte utiliza todas las actualizaciones del mes seleccionado,
  // independientemente de los filtros visibles del historial.
  const downloadMonthlyReport = () => {
    const companyNamesById = new Map(
      companies.map((company) => [
        company.id,
        (company.name || "").trim().toUpperCase(),
      ])
    );

    const monthlyUpdates = updates.filter((update) => monthKey(update.date) === reportMonth);

    const getCompanyName = (update) =>
      companyNamesById.get(update.companyId) ||
      (update.companyName || "").trim().toUpperCase();

    const toExcelRows = (companyName) =>
      monthlyUpdates
        .filter((update) => getCompanyName(update) === companyName)
        .sort((a, b) => {
          const dateComparison = (a.date || "").localeCompare(b.date || "");
          if (dateComparison !== 0) return dateComparison;
          return (a.createdAt || "").localeCompare(b.createdAt || "");
        })
        .map((update) => ({
          Fecha: update.date || "",
          Cliente: update.clientName || "",
          Actualización: update.note || "",
        }));

    const workbook = XLSX.utils.book_new();

    const trexdiSheet = XLSX.utils.json_to_sheet(toExcelRows("TREXDI"));
    const scravSheet = XLSX.utils.json_to_sheet(toExcelRows("SCRAV"));

    XLSX.utils.book_append_sheet(workbook, trexdiSheet, "TREXDI");
    XLSX.utils.book_append_sheet(workbook, scravSheet, "SCRAV");

    const fileName = `Reporte_Bitacora_${reportMonth}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="mb-6 text-[22px] font-semibold text-slate-50">Historial</h1>

      <div className="relative mb-4">
        <Search
          size={16}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
        />
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
          options={[
            { value: "", label: "Todas las empresas" },
            ...companies.map((c) => ({ value: c.id, label: c.name })),
          ]}
          placeholder="Empresa"
        />
        <Select
          value={clientFilter}
          onChange={setClientFilter}
          options={[
            { value: "", label: "Todos los clientes" },
            ...availableClients.map((c) => ({ value: c.id, label: c.name })),
          ]}
          placeholder="Cliente"
        />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <Select
          value={monthMode}
          onChange={setMonthMode}
          options={monthOptions}
          placeholder="Periodo"
        />

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

      {/* Descarga del reporte mensual */}
      <div className="mb-6 rounded-2xl border border-white/10 bg-[#0b1220] p-4">
        <h2 className="mb-2 text-sm font-semibold text-slate-100">
          Reporte mensual en Excel
        </h2>

        <p className="mb-3 text-xs leading-relaxed text-slate-400">
          Descarga las actualizaciones del mes seleccionado, organizadas en dos hojas:
          TREXDI y SCRAV.
        </p>

        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="month"
            value={reportMonth}
            onChange={(e) => setReportMonth(e.target.value)}
            className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#0b111c] px-3.5 py-2.5 text-sm text-slate-100 outline-none [color-scheme:dark] hover:border-white/20 focus:border-cyan-400/60"
            aria-label="Mes del reporte Excel"
          />

          <button
            type="button"
            onClick={downloadMonthlyReport}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-400"
          >
            <Download size={16} />
            Descargar Excel
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 py-14 text-center">
          <p className="text-[15px] text-slate-400">
            No se encontraron actualizaciones con estos filtros.
          </p>
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
