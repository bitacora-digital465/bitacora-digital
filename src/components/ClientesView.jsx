import { useState } from "react";
import { Building2, Pencil, Trash2, Users } from "lucide-react";
import { ConfirmDialog, EditInline } from "./ui.jsx";

export default function ClientesView({
  companies,
  clients,
  updates,
  onAddCompany,
  onDeleteCompany,
  onAddClient,
  onDeleteClient,
  onEditClient,
  onEditCompany,
}) {
  const [newCompany, setNewCompany] = useState("");
  const [newClientName, setNewClientName] = useState({});
  const [editingCompany, setEditingCompany] = useState(null);
  const [editingClient, setEditingClient] = useState(null);
  const [confirmTarget, setConfirmTarget] = useState(null); // {type, item, message}

  const clientCountByCompany = (companyId) => clients.filter((c) => c.companyId === companyId).length;
  const updateCountByCompany = (companyId) => updates.filter((u) => u.companyId === companyId).length;
  const updateCountByClient = (clientId) => updates.filter((u) => u.clientId === clientId).length;

  const handleAddCompany = () => {
    const name = newCompany.trim();
    if (!name) return;
    onAddCompany(name);
    setNewCompany("");
  };

  const handleAddClient = (companyId) => {
    const name = (newClientName[companyId] || "").trim();
    if (!name) return;
    onAddClient(companyId, name);
    setNewClientName((s) => ({ ...s, [companyId]: "" }));
  };

  const requestDeleteCompany = (company) => {
    const clientsN = clientCountByCompany(company.id);
    const updatesN = updateCountByCompany(company.id);
    if (clientsN > 0 || updatesN > 0) {
      const parts = [];
      if (clientsN > 0) parts.push(`${clientsN} cliente${clientsN === 1 ? "" : "s"} asociado${clientsN === 1 ? "" : "s"}`);
      if (updatesN > 0) parts.push(`${updatesN} actualización${updatesN === 1 ? "" : "es"} registrada${updatesN === 1 ? "" : "s"}`);
      setConfirmTarget({
        type: "company-blocked",
        item: company,
        message: `No puedes eliminar ${company.name} porque tiene ${parts.join(" y ")}. Elimina o reasigna esos registros primero.`,
      });
      return;
    }
    setConfirmTarget({ type: "company", item: company, message: `¿Eliminar la empresa ${company.name}? Esta acción no se puede deshacer.` });
  };

  const requestDeleteClient = (client) => {
    const n = updateCountByClient(client.id);
    setConfirmTarget({
      type: "client",
      item: client,
      message:
        n > 0
          ? `${client.name} tiene ${n} actualización${n === 1 ? "" : "es"} en el historial. Se conservarán, pero el cliente ya no estará disponible para nuevas actualizaciones. ¿Eliminar cliente?`
          : `¿Eliminar el cliente ${client.name}?`,
    });
  };

  const handleConfirm = () => {
    if (confirmTarget.type === "company") onDeleteCompany(confirmTarget.item.id);
    if (confirmTarget.type === "client") onDeleteClient(confirmTarget.item.id);
    setConfirmTarget(null);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="mb-1 text-[22px] font-semibold text-slate-50">Clientes</h1>
      <p className="mb-7 text-sm text-slate-500">Administra tus empresas y clientes.</p>

      <section className="mb-8">
        <h2 className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500">
          <Building2 size={13} /> Empresas
        </h2>
        <div className="space-y-2">
          {companies.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-[#0b111c] px-4 py-3">
              {editingCompany === c.id ? (
                <EditInline
                  initial={c.name}
                  onCancel={() => setEditingCompany(null)}
                  onSave={(name) => {
                    onEditCompany(c.id, name);
                    setEditingCompany(null);
                  }}
                />
              ) : (
                <>
                  <div>
                    <p className="text-sm font-medium text-slate-100">{c.name}</p>
                    <p className="text-xs text-slate-500">
                      {clientCountByCompany(c.id)} cliente{clientCountByCompany(c.id) === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingCompany(c.id)}
                      className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-white/5 hover:text-cyan-300"
                      aria-label="Editar empresa"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => requestDeleteCompany(c)}
                      className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-white/5 hover:text-red-400"
                      aria-label="Eliminar empresa"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
        <div className="mt-2.5 flex gap-2">
          <input
            value={newCompany}
            onChange={(e) => setNewCompany(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddCompany()}
            placeholder="Nombre de la empresa"
            className="flex-1 rounded-xl border border-white/10 bg-[#0b1220] px-3.5 py-2.5 text-sm text-slate-100 outline-none placeholder:text-slate-600 hover:border-white/20 focus:border-cyan-400/60"
          />
          <button
            onClick={handleAddCompany}
            className="shrink-0 rounded-xl bg-white/[0.06] px-4 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10"
          >
            Agregar
          </button>
        </div>
      </section>

      <section className="space-y-7">
        <h2 className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500">
          <Users size={13} /> Clientes por empresa
        </h2>
        {companies.map((company) => (
          <div key={company.id}>
            <p className="mb-2.5 text-sm font-medium text-cyan-300">{company.name}</p>
            <div className="space-y-2">
              {clients
                .filter((cl) => cl.companyId === company.id)
                .map((cl) => (
                  <div key={cl.id} className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-[#0b111c] px-4 py-2.5">
                    {editingClient === cl.id ? (
                      <EditInline
                        initial={cl.name}
                        onCancel={() => setEditingClient(null)}
                        onSave={(name) => {
                          onEditClient(cl.id, name);
                          setEditingClient(null);
                        }}
                      />
                    ) : (
                      <>
                        <p className="text-sm text-slate-200">{cl.name}</p>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditingClient(cl.id)}
                            className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-white/5 hover:text-cyan-300"
                            aria-label="Editar cliente"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => requestDeleteClient(cl)}
                            className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-white/5 hover:text-red-400"
                            aria-label="Eliminar cliente"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              {clients.filter((cl) => cl.companyId === company.id).length === 0 && (
                <p className="text-xs text-slate-600">Sin clientes todavía.</p>
              )}
            </div>
            <div className="mt-2 flex gap-2">
              <input
                value={newClientName[company.id] || ""}
                onChange={(e) => setNewClientName((s) => ({ ...s, [company.id]: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && handleAddClient(company.id)}
                placeholder="Nombre del cliente"
                className="flex-1 rounded-xl border border-white/10 bg-[#0b1220] px-3.5 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-600 hover:border-white/20 focus:border-cyan-400/60"
              />
              <button
                onClick={() => handleAddClient(company.id)}
                className="shrink-0 rounded-xl bg-white/[0.06] px-4 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10"
              >
                Agregar
              </button>
            </div>
          </div>
        ))}
      </section>

      <ConfirmDialog
        open={!!confirmTarget}
        title={confirmTarget?.type === "company-blocked" ? "No se puede eliminar" : "Confirmar eliminación"}
        message={confirmTarget?.message ?? ""}
        confirmLabel={confirmTarget?.type === "company-blocked" ? "Entendido" : "Eliminar"}
        danger={confirmTarget?.type !== "company-blocked"}
        onCancel={() => setConfirmTarget(null)}
        onConfirm={confirmTarget?.type === "company-blocked" ? () => setConfirmTarget(null) : handleConfirm}
      />
    </div>
  );
}
