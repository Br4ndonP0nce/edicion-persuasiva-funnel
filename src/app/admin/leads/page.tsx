"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { useAuth } from "@/hooks/useAuth";
import { getLeads, Lead } from "@/lib/firebase/db";
import { exportLeadsToExcel } from "@/lib/utils/excelExport";

import LeadTable from "@/components/ui/admin/LeadTable";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Search,
  Filter,
  Download,
  Lock,
  FileSpreadsheet,
  Loader2,
} from "lucide-react";

export default function LeadsPage() {
  const { hasPermission } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setIsLoading(true);
        const fetchedLeads = await getLeads();
        setLeads(fetchedLeads);
        setFilteredLeads(fetchedLeads);
      } catch (err) {
        console.error("Error fetching leads:", err);
        setError("Failed to load lead data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeads();
  }, []);

  useEffect(() => {
    let filtered = [...leads];

    if (activeTab !== "all") {
      filtered = filtered.filter((lead) => lead.status === activeTab);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (lead) =>
          lead.name.toLowerCase().includes(term) ||
          lead.email.toLowerCase().includes(term) ||
          lead.phone.toLowerCase().includes(term)
      );
    }

    setFilteredLeads(filtered);
  }, [leads, activeTab, searchTerm]);

  const handleStatusChange = async (
    leadId: string,
    newStatus: Lead["status"]
  ) => {
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === leadId ? { ...lead, status: newStatus } : lead
      )
    );
  };

  const handleExportToExcel = async () => {
    try {
      setIsExporting(true);
      setError(null);

      // Use filtered leads for export (respects current search/filter)
      await exportLeadsToExcel(filteredLeads);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      setError("Failed to export data to Excel");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <ProtectedRoute requiredPermissions={["leads:read"]}>
      <div className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold">Leads</h1>

          <div className="flex flex-col sm:flex-row gap-2 sm:items-center w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Buscar leads..."
                className="pl-9 w-full sm:w-auto min-w-[240px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Button
              variant="outline"
              onClick={handleExportToExcel}
              disabled={isExporting || filteredLeads.length === 0}
              className="relative"
            >
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exportando...
                </>
              ) : (
                <>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Exportar Excel
                </>
              )}
            </Button>

            <PermissionGate permissions={["leads:write"]}>
              <Button onClick={() => router.push("/admin/leads/new")}>
                <Plus className="mr-2 h-4 w-4" /> Nuevo Lead
              </Button>
            </PermissionGate>
          </div>
        </div>

        {/* Show access level indicator */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center text-blue-800">
            <Lock className="h-4 w-4 mr-2" />
            <span className="text-sm">
              Access Level:{" "}
              {hasPermission("leads:write")
                ? hasPermission("leads:delete")
                  ? "Full Access"
                  : "Read & Write"
                : "Read Only"}
            </span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6 flex items-between">
            <span className="flex-1">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-2 text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </div>
        )}

        {/* Export Status */}
        {isExporting && (
          <div className="bg-blue-100 text-blue-800 p-4 rounded-md mb-6 flex items-center">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <div>
              <p className="font-medium">Preparando reporte Excel...</p>
              <p className="text-sm">
                Recopilando datos de ventas y pagos. Esto puede tomar unos
                momentos.
              </p>
            </div>
          </div>
        )}

        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">Todos ({leads.length})</TabsTrigger>
            <TabsTrigger value="lead">
              Nuevos ({leads.filter((l) => l.status === "lead").length})
            </TabsTrigger>
            <TabsTrigger value="onboarding">
              Onboarding (
              {leads.filter((l) => l.status === "onboarding").length})
            </TabsTrigger>
            <TabsTrigger value="sale">
              Ventas ({leads.filter((l) => l.status === "sale").length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rechazados ({leads.filter((l) => l.status === "rejected").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                  </div>
                ) : (
                  <LeadTable
                    leads={filteredLeads}
                    onStatusChange={handleStatusChange}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {["lead", "onboarding", "sale", "rejected"].map((status) => (
            <TabsContent key={status} value={status} className="space-y-4">
              <Card>
                <CardContent className="p-0">
                  {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                    </div>
                  ) : (
                    <LeadTable
                      leads={filteredLeads}
                      onStatusChange={handleStatusChange}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Export Info */}
        {!isLoading && filteredLeads.length > 0 && (
          <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-600">
              <FileSpreadsheet className="inline h-4 w-4 mr-1" />
              El reporte incluye: datos del lead, información de ventas,
              progreso de pagos, estado de acceso al curso y estadísticas
              resumidas en una segunda hoja.
            </p>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
