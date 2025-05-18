// src/components/admin/LeadTable.tsx

import React, { useState } from "react";
import { Lead, updateLead } from "@/lib/firebase/db";
import {
  MoreHorizontal,
  Check,
  X,
  RefreshCw,
  Trash2,
  Edit,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
interface LeadTableProps {
  leads: Lead[];
  onStatusChange: (leadId: string, newStatus: Lead["status"]) => void;
}

const LeadTable: React.FC<LeadTableProps> = ({ leads, onStatusChange }) => {
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState<{
    id: string;
    notes: string;
  } | null>(null);

  const getStatusBadge = (status: Lead["status"]) => {
    const statusConfig = {
      lead: { color: "bg-blue-100 text-blue-800", label: "Nuevo" },
      onboarding: {
        color: "bg-yellow-100 text-yellow-800",
        label: "Onboarding",
      },
      sale: { color: "bg-green-100 text-green-800", label: "Venta" },
      rejected: { color: "bg-red-100 text-red-800", label: "Rechazado" },
    };

    const config = statusConfig[status];
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const getInvestmentIndicator = (investment: string) => {
    if (investment.includes("Sí, tengo acceso")) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Alto
        </span>
      );
    } else if (investment.includes("puedo conseguirlo")) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Medio
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Bajo
        </span>
      );
    }
  };

  const handleStatusChange = async (
    leadId: string,
    newStatus: Lead["status"]
  ) => {
    try {
      await updateLead(leadId, { status: newStatus });
      onStatusChange(leadId, newStatus);
      setActionMenuOpen(null);
    } catch (error) {
      console.error("Error updating lead status:", error);
      alert("Failed to update lead status");
    }
  };

  const handleNotesChange = async () => {
    if (!editNotes) return;

    try {
      await updateLead(editNotes.id, { notes: editNotes.notes });
      onStatusChange(editNotes.id, "lead"); // Just to trigger refresh
      setEditNotes(null);
    } catch (error) {
      console.error("Error updating notes:", error);
      alert("Failed to update notes");
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Nombre
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Contacto
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Nivel
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Inversión
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Estado
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Fecha
            </th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {leads.length === 0 ? (
            <tr>
              <td
                colSpan={7}
                className="px-6 py-4 text-center text-sm text-gray-500"
              >
                No hay leads disponibles
              </td>
            </tr>
          ) : (
            leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {lead.name}
                  </div>
                  {lead.notes && (
                    <div className="text-xs text-gray-500 mt-1 max-w-xs truncate">
                      {lead.notes}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{lead.email}</div>
                  <div className="text-xs text-gray-500">{lead.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{lead.level}</div>
                  <div className="text-xs text-gray-500">{lead.software}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getInvestmentIndicator(lead.investment)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(lead.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(lead.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                  <button
                    onClick={() =>
                      setActionMenuOpen(
                        actionMenuOpen === lead.id ? null : lead.id ?? null
                      )
                    }
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <MoreHorizontal className="h-5 w-5" />
                  </button>

                  {/* Action menu */}
                  {actionMenuOpen === lead.id && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                      <div
                        className="py-1"
                        role="menu"
                        aria-orientation="vertical"
                      >
                        {/* Status change options */}
                        <button
                          onClick={() => handleStatusChange(lead.id!, "lead")}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                          <RefreshCw className="mr-2 h-4 w-4 text-blue-500" />{" "}
                          Marcar como Lead
                        </button>
                        <button
                          onClick={() =>
                            handleStatusChange(lead.id!, "onboarding")
                          }
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                          <RefreshCw className="mr-2 h-4 w-4 text-yellow-500" />{" "}
                          Iniciar Onboarding
                        </button>
                        <button
                          onClick={() => handleStatusChange(lead.id!, "sale")}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                          <Check className="mr-2 h-4 w-4 text-green-500" />{" "}
                          Marcar como Venta
                        </button>
                        <button
                          onClick={() =>
                            handleStatusChange(lead.id!, "rejected")
                          }
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                          <X className="mr-2 h-4 w-4 text-red-500" /> Rechazar
                        </button>

                        <div className="border-t border-gray-100 my-1"></div>

                        {/* Other actions */}
                        <button
                          onClick={() =>
                            setEditNotes({
                              id: lead.id!,
                              notes: lead.notes || "",
                            })
                          }
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                          <Edit className="mr-2 h-4 w-4 text-gray-500" /> Editar
                          Notas
                        </button>
                        <Link
                          href={`/admin/leads/${lead.id}`}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                          <ExternalLink className="mr-2 h-4 w-4 text-gray-500" />{" "}
                          Ver Detalles
                        </Link>
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Edit notes modal */}
      {editNotes && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              onClick={() => setEditNotes(null)}
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Editar Notas
                </h3>
                <textarea
                  rows={4}
                  className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Añadir notas sobre este lead..."
                  value={editNotes.notes}
                  onChange={(e) =>
                    setEditNotes({ ...editNotes, notes: e.target.value })
                  }
                ></textarea>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleNotesChange}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={() => setEditNotes(null)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadTable;
