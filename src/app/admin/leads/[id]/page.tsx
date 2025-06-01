"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getLead, updateLead, Lead } from "@/lib/firebase/db";
import SalesInfoComponent from "@/components/ui/admin/SalesInfoComponent";
import LeadHistoryComponent from "@/components/ui/admin/LeadHistoryComponent";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Edit2,
  Save,
  ExternalLink,
  Mail,
  Phone,
  Calendar,
  Trash2,
} from "lucide-react";

export default function LeadDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState<Partial<Lead>>({});
  const [error, setError] = useState<string | null>(null);

  const leadId = params.id as string;

  useEffect(() => {
    const fetchLead = async () => {
      try {
        setIsLoading(true);
        const leadData = await getLead(leadId);
        setLead(leadData);
        setEditableData({
          name: leadData?.name,
          email: leadData?.email,
          phone: leadData?.phone,
          notes: leadData?.notes || "",
        });
      } catch (err) {
        console.error("Error fetching lead:", err);
        setError("Failed to load lead data");
      } finally {
        setIsLoading(false);
      }
    };

    if (leadId) {
      fetchLead();
    }
  }, [leadId]);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      await updateLead(leadId, editableData);
      // Update local state with new data
      setLead((prev) => (prev ? { ...prev, ...editableData } : null));
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating lead:", err);
      setError("Failed to update lead");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: Lead["status"]) => {
    switch (status) {
      case "lead":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "onboarding":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "sale":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="p-6">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver
        </Button>
        <div className="bg-red-100 text-red-700 p-4 rounded-md">
          {error || "Lead no encontrado"}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" onClick={() => router.push("/admin/leads")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Leads
        </Button>

        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" /> Guardar
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Edit2 className="mr-2 h-4 w-4" /> Editar
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main info card */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{lead.name}</CardTitle>
              <CardDescription>
                <Badge className={`mt-2 ${getStatusColor(lead.status)}`}>
                  {lead.status === "lead"
                    ? "Nuevo Lead"
                    : lead.status === "onboarding"
                    ? "En Onboarding"
                    : lead.status === "sale"
                    ? "Venta Realizada"
                    : "Rechazado"}
                </Badge>
              </CardDescription>
            </div>
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-purple-700 text-white">
                {lead.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm text-gray-500">
                  Información de Contacto
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 text-gray-500 mr-2" />
                  {isEditing ? (
                    <input
                      type="email"
                      value={editableData.email || ""}
                      onChange={(e) =>
                        setEditableData({
                          ...editableData,
                          email: e.target.value,
                        })
                      }
                      className="border rounded px-2 py-1 w-full"
                    />
                  ) : (
                    <a
                      href={`mailto:${lead.email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {lead.email}
                    </a>
                  )}
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 text-gray-500 mr-2" />
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editableData.phone || ""}
                      onChange={(e) =>
                        setEditableData({
                          ...editableData,
                          phone: e.target.value,
                        })
                      }
                      className="border rounded px-2 py-1 w-full"
                    />
                  ) : (
                    <a href={`tel:${lead.phone}`} className="hover:underline">
                      {lead.phone}
                    </a>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm text-gray-500">Fechas</div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                  <span>Creado: {formatDate(lead.createdAt)}</span>
                </div>
                {lead.updatedAt && (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                    <span>Actualizado: {formatDate(lead.updatedAt)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="text-sm text-gray-500 mb-2">Notas</div>
              {isEditing ? (
                <textarea
                  value={editableData.notes || ""}
                  onChange={(e) =>
                    setEditableData({
                      ...editableData,
                      notes: e.target.value,
                    })
                  }
                  className="w-full border rounded-md p-2 h-32 resize-none"
                  placeholder="Añadir notas sobre este lead..."
                />
              ) : (
                <p className="whitespace-pre-wrap">
                  {lead.notes || "No hay notas disponibles"}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Details sidebar */}
        <Card>
          <CardHeader>
            <CardTitle>Detalles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-gray-500 mb-1">Rol</div>
              <div className="font-medium">{lead.role}</div>
            </div>

            <div>
              <div className="text-sm text-gray-500 mb-1">Nivel de Edición</div>
              <div className="font-medium">{lead.level}</div>
            </div>

            <div>
              <div className="text-sm text-gray-500 mb-1">Software</div>
              <div className="font-medium">{lead.software}</div>
            </div>

            <div>
              <div className="text-sm text-gray-500 mb-1">
                Origen de Clientes
              </div>
              <div className="font-medium">{lead.clients}</div>
            </div>

            <div>
              <div className="text-sm text-gray-500 mb-1">
                Capacidad de Inversión
              </div>
              <div className="font-medium">{lead.investment}</div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-4">
            <Button
              variant="outline"
              className="w-full text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" /> Eliminar Lead
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Motivación</CardTitle>
          <CardDescription>
            Razón por la que desean acceder a la formación
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
            {lead.why}
          </div>
        </CardContent>
      </Card>
      <SalesInfoComponent
        lead={lead}
        isLoading={isLoading}
        onLeadUpdate={() => {
          // Optional: refetch lead if needed
        }}
      />
      <LeadHistoryComponent lead={lead} />
    </div>
  );
}
