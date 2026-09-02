import { useCallback, useEffect, useMemo, useState } from "react";
import { Home, History, Users, Plus } from "lucide-react";
import { NavItem, Toast, ConfirmDialog } from "./components/ui.jsx";
import UpdateModal from "./components/UpdateModal.jsx";
import InicioView from "./components/InicioView.jsx";
import HistorialView from "./components/HistorialView.jsx";
import ClientesView from "./components/ClientesView.jsx";
import { supabaseConfigured } from "./lib/supabaseClient";
import {
  fetchCompanies,
  fetchClients,
  fetchUpdates,
  createCompany,
  renameCompany,
  removeCompany,
  createClientRow,
  renameClient,
  removeClient,
  createUpdateRow,
  editUpdateRow,
  removeUpdate,
  seedIfEmpty,
} from "./lib/api";

export default function App() {
  const [status, setStatus] = useState("loading"); // loading | ready | error | unconfigured
  const [errorMsg, setErrorMsg] = useState("");

  const [companies, setCompanies] = useState([]);
  const [clients, setClients] = useState([]);
  const [updates, setUpdates] = useState([]);

  const [view, setView] = useState("inicio");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "" });

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: "" }), 2200);
  };

  const loadAll = useCallback(async () => {
    const [c, cl, u] = await Promise.all([fetchCompanies(), fetchClients(), fetchUpdates()]);
    setCompanies(c);
    setClients(cl);
    setUpdates(u);
  }, []);

  useEffect(() => {
    if (!supabaseConfigured) {
      setStatus("unconfigured");
      return;
    }
    (async () => {
      try {
        await seedIfEmpty();
        await loadAll();
        setStatus("ready");
      } catch (err) {
        console.error(err);
        setErrorMsg(err.message || "Error desconocido al conectar con Supabase.");
        setStatus("error");
      }
    })();
  }, [loadAll]);

  // Actualizaciones enriquecidas con el nombre de empresa/cliente para
  // mostrarlas en pantalla (la tabla "updates" solo guarda los ids).
  const enrichedUpdates = useMemo(
    () =>
      updates.map((u) => ({
        ...u,
        companyName: companies.find((c) => c.id === u.companyId)?.name ?? "Empresa eliminada",
        clientName: clients.find((c) => c.id === u.clientId)?.name ?? "Cliente eliminado",
      })),
    [updates, companies, clients]
  );

  const openNew = () => {
    setEditingUpdate(null);
    setModalOpen(true);
  };
  const openEdit = (u) => {
    setEditingUpdate(u);
    setModalOpen(true);
  };

  const handleSaveUpdate = async (fields) => {
    if (editingUpdate) {
      await editUpdateRow(editingUpdate.id, fields);
    } else {
      await createUpdateRow(fields);
    }
    await loadAll();
    setModalOpen(false);
    showToast("Actualización guardada ✓");
  };

  const handleDeleteUpdate = async () => {
    try {
      await removeUpdate(deleteTarget.id);
      await loadAll();
      showToast("Actualización eliminada");
    } catch (err) {
      console.error(err);
      showToast("No se pudo eliminar. Intenta de nuevo.");
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleAddCompany = async (name) => {
    try {
      await createCompany(name);
      await loadAll();
    } catch (err) {
      console.error(err);
      showToast("No se pudo agregar la empresa.");
    }
  };
  const handleEditCompany = async (id, name) => {
    try {
      await renameCompany(id, name);
      await loadAll();
    } catch (err) {
      console.error(err);
      showToast("No se pudo renombrar la empresa.");
    }
  };
  const handleDeleteCompany = async (id) => {
    try {
      await removeCompany(id);
      await loadAll();
    } catch (err) {
      console.error(err);
      showToast("No se pudo eliminar la empresa.");
    }
  };

  const handleAddClient = async (companyId, name) => {
    try {
      await createClientRow(companyId, name);
      await loadAll();
    } catch (err) {
      console.error(err);
      showToast("No se pudo agregar el cliente.");
    }
  };
  const handleEditClient = async (id, name) => {
    try {
      await renameClient(id, name);
      await loadAll();
    } catch (err) {
      console.error(err);
      showToast("No se pudo renombrar el cliente.");
    }
  };
  const handleDeleteClient = async (id) => {
    try {
      await removeClient(id);
      await loadAll();
    } catch (err) {
      console.error(err);
      showToast("No se pudo eliminar el cliente.");
    } finally {
      setDeleteTarget(null);
    }
  };

  if (status === "unconfigured") {
    return (
      <FullScreenMessage
        title="Falta configurar Supabase"
        detail={
          <>
            Copia <code className="rounded bg-white/10 px-1.5 py-0.5">.env.example</code> a{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5">.env</code> y coloca ahí tu{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5">VITE_SUPABASE_URL</code> y{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5">VITE_SUPABASE_ANON_KEY</code>. Revisa el README para el resto de los pasos.
          </>
        }
      />
    );
  }

  if (status === "error") {
    return (
      <FullScreenMessage
        title="No se pudo conectar con Supabase"
        detail={
          <>
            <p className="mb-2">{errorMsg}</p>
            <p>Verifica que ejecutaste el SQL de <code className="rounded bg-white/10 px-1.5 py-0.5">supabase/schema.sql</code> y que las credenciales del archivo <code className="rounded bg-white/10 px-1.5 py-0.5">.env</code> son correctas.</p>
          </>
        }
      />
    );
  }

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#05070c]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-400/30 border-t-cyan-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070c] font-sans antialiased">
      <div className="mx-auto flex max-w-5xl">
        <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col border-r border-white/[0.06] px-3 py-6 sm:flex">
          <div className="mb-8 px-2.5">
            <p className="text-[16px] font-semibold tracking-tight text-cyan-300">Bitácora digital</p>
            <p className="text-[13px] text-slate-400">de actualizaciones</p>
          </div>
          <nav className="flex flex-col gap-1">
            <NavItem icon={Home} label="Inicio" active={view === "inicio"} onClick={() => setView("inicio")} />
            <NavItem icon={History} label="Historial" active={view === "historial"} onClick={() => setView("historial")} />
            <NavItem icon={Users} label="Clientes" active={view === "clientes"} onClick={() => setView("clientes")} />
          </nav>
        </aside>

        <main className="min-h-screen flex-1 pb-24 sm:pb-0">
          {view === "inicio" && (
            <InicioView updates={enrichedUpdates} companies={companies} onNew={openNew} onEdit={openEdit} onDelete={setDeleteTarget} />
          )}
          {view === "historial" && (
            <HistorialView updates={enrichedUpdates} companies={companies} clients={clients} onEdit={openEdit} onDelete={setDeleteTarget} />
          )}
          {view === "clientes" && (
            <ClientesView
              companies={companies}
              clients={clients}
              updates={updates}
              onAddCompany={handleAddCompany}
              onDeleteCompany={handleDeleteCompany}
              onEditCompany={handleEditCompany}
              onAddClient={handleAddClient}
              onDeleteClient={handleDeleteClient}
              onEditClient={handleEditClient}
            />
          )}
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-white/[0.06] bg-[#05070c]/95 px-2 py-1.5 backdrop-blur sm:hidden">
        <NavItem icon={Home} label="Inicio" active={view === "inicio"} onClick={() => setView("inicio")} />
        <NavItem icon={History} label="Historial" active={view === "historial"} onClick={() => setView("historial")} />
        <NavItem icon={Users} label="Clientes" active={view === "clientes"} onClick={() => setView("clientes")} />
      </nav>

      {view !== "inicio" && (
        <button
          onClick={openNew}
          className="fixed bottom-20 right-5 z-40 flex h-13 w-13 items-center justify-center rounded-full bg-cyan-400 p-3.5 text-[#04121a] shadow-[0_4px_20px_rgba(34,211,238,0.35)] transition-transform active:scale-95 sm:hidden"
          aria-label="Nueva actualización"
        >
          <Plus size={22} strokeWidth={2.5} />
        </button>
      )}

      <UpdateModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveUpdate}
        companies={companies}
        clients={clients}
        initial={editingUpdate}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title={deleteTarget?.note ? "Eliminar actualización" : "Confirmar eliminación"}
        message={deleteTarget?.note ? "¿Eliminar esta actualización? Esta acción no se puede deshacer." : ""}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteUpdate}
      />

      <Toast show={toast.show} message={toast.message} />
    </div>
  );
}

function FullScreenMessage({ title, detail }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#05070c] px-6">
      <div className="max-w-md rounded-2xl border border-white/10 bg-[#0d1420] p-6">
        <h1 className="mb-2 text-[17px] font-medium text-cyan-300">{title}</h1>
        <div className="text-sm leading-relaxed text-slate-400">{detail}</div>
      </div>
    </div>
  );
}
