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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  Filter,
  Download,
  Lock,
  FileSpreadsheet,
  Loader2,
  ChevronDown,
  Calendar,
  BarChart3,
} from "lucide-react";

// Month filtering utilities
interface MonthOption {
  value: string;
  label: string;
  count: number;
}

const getCurrentMonth = (): string => {
  return new Date().toISOString().slice(0, 7); // YYYY-MM format
};

const getMonthLabel = (monthValue: string): string => {
  const [year, month] = monthValue.split("-");
  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  return `${monthNames[parseInt(month) - 1]} ${year}`;
};

const filterLeadsByMonth = (leads: Lead[], monthValue: string): Lead[] => {
  if (monthValue === "all") return leads;

  return leads.filter((lead) => {
    if (!lead.createdAt) return false;

    // Handle Firestore Timestamp - same pattern as your formatDate function
    const date = lead.createdAt.toDate
      ? lead.createdAt.toDate()
      : new Date(lead.createdAt as any);
    const leadMonth = date.toISOString().slice(0, 7);
    return leadMonth === monthValue;
  });
};

const getAvailableMonths = (leads: Lead[]): MonthOption[] => {
  const monthCounts = new Map<string, number>();

  leads.forEach((lead) => {
    if (!lead.createdAt) return;

    // Same pattern as your existing formatDate function
    const date = lead.createdAt.toDate
      ? lead.createdAt.toDate()
      : new Date(lead.createdAt as any);
    const month = date.toISOString().slice(0, 7);
    monthCounts.set(month, (monthCounts.get(month) || 0) + 1);
  });

  const months = Array.from(monthCounts.entries())
    .map(([month, count]) => ({
      value: month,
      label: getMonthLabel(month),
      count,
    }))
    .sort((a, b) => b.value.localeCompare(a.value)); // Most recent first

  return [
    { value: "all", label: "Todos los meses", count: leads.length },
    ...months,
  ];
};

export default function EnhancedLeadsPage() {
  const { hasPermission } = useAuth();
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonth());
  const [isExporting, setIsExporting] = useState(false);
  const [availableMonths, setAvailableMonths] = useState<MonthOption[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setIsLoading(true);
        const fetchedLeads = await getLeads();
        setAllLeads(fetchedLeads);
        setAvailableMonths(getAvailableMonths(fetchedLeads));
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
    let filtered = [...allLeads];

    // Apply month filter first
    filtered = filterLeadsByMonth(filtered, selectedMonth);

    // Apply status filter
    if (activeTab !== "all") {
      filtered = filtered.filter((lead) => lead.status === activeTab);
    }

    // Apply search filter
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
  }, [allLeads, selectedMonth, activeTab, searchTerm]);

  const handleStatusChange = async (
    leadId: string,
    newStatus: Lead["status"]
  ) => {
    setAllLeads((prev) =>
      prev.map((lead) =>
        lead.id === leadId ? { ...lead, status: newStatus } : lead
      )
    );
  };

  const handleExportToExcel = async (
    exportType: "filtered" | "all" | "month"
  ) => {
    try {
      setIsExporting(true);
      setError(null);

      let leadsToExport: Lead[];
      let filename: string;

      switch (exportType) {
        case "filtered":
          leadsToExport = filteredLeads;
          filename = `leads_filtered_${new Date()
            .toISOString()
            .slice(0, 10)}.xlsx`;
          break;
        case "all":
          leadsToExport = allLeads;
          filename = `leads_all_${new Date().toISOString().slice(0, 10)}.xlsx`;
          break;
        case "month":
          leadsToExport = filterLeadsByMonth(allLeads, selectedMonth);
          const monthLabel =
            selectedMonth === "all"
              ? "todos"
              : getMonthLabel(selectedMonth).toLowerCase().replace(" ", "_");
          filename = `leads_${monthLabel}_${new Date()
            .toISOString()
            .slice(0, 10)}.xlsx`;
          break;
        default:
          leadsToExport = filteredLeads;
          filename = `leads_export_${new Date()
            .toISOString()
            .slice(0, 10)}.xlsx`;
      }

      await exportLeadsToExcel(leadsToExport, filename);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      setError("Failed to export data to Excel");
    } finally {
      setIsExporting(false);
    }
  };

  // Get counts for current filters
  const monthFilteredLeads = filterLeadsByMonth(allLeads, selectedMonth);
  const getStatusCount = (status: Lead["status"] | "all") => {
    if (status === "all") return monthFilteredLeads.length;
    return monthFilteredLeads.filter((l) => l.status === status).length;
  };

  return (
    <ProtectedRoute requiredPermissions={["leads:read"]}>
      <div className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold">Leads</h1>
            {selectedMonth !== "all" && (
              <p className="text-sm text-gray-600 mt-1">
                Mostrando leads de {getMonthLabel(selectedMonth)}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:items-center w-full sm:w-auto">
            {/* Month Filter */}
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Seleccionar mes" />
              </SelectTrigger>
              <SelectContent>
                {availableMonths.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label} ({month.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Search */}
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

            {/* Export Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  disabled={isExporting || allLeads.length === 0}
                  className="relative min-w-[140px]"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Exportando...
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet className="mr-2 h-4 w-4" />
                      Exportar
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem
                  onClick={() => handleExportToExcel("filtered")}
                  disabled={filteredLeads.length === 0}
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Vista actual ({filteredLeads.length} leads)
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => handleExportToExcel("month")}
                  disabled={monthFilteredLeads.length === 0}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {selectedMonth === "all"
                    ? `Todos los meses (${allLeads.length} leads)`
                    : `${getMonthLabel(selectedMonth)} (${
                        monthFilteredLeads.length
                      } leads)`}
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => handleExportToExcel("all")}
                  disabled={allLeads.length === 0}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Todos los leads ({allLeads.length})
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <PermissionGate permissions={["leads:write"]}>
              <Button onClick={() => router.push("/admin/leads/new")}>
                <Plus className="mr-2 h-4 w-4" /> Nuevo Lead
              </Button>
            </PermissionGate>
          </div>
        </div>

        {/* Access Level Indicator */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between text-blue-800">
            <div className="flex items-center">
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
            {selectedMonth !== "all" && (
              <div className="text-sm">
                {monthFilteredLeads.length} leads en{" "}
                {getMonthLabel(selectedMonth)}
              </div>
            )}
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
            <TabsTrigger value="all">
              Todos ({getStatusCount("all")})
            </TabsTrigger>
            <TabsTrigger value="lead">
              Nuevos ({getStatusCount("lead")})
            </TabsTrigger>
            <TabsTrigger value="onboarding">
              Onboarding ({getStatusCount("onboarding")})
            </TabsTrigger>
            <TabsTrigger value="sale">
              Ventas ({getStatusCount("sale")})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rechazados ({getStatusCount("rejected")})
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
            {selectedMonth !== "all" && (
              <p className="text-xs text-gray-500 mt-1">
                Mostrando {filteredLeads.length} de {monthFilteredLeads.length}{" "}
                leads para {getMonthLabel(selectedMonth)}
              </p>
            )}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredLeads.length === 0 && allLeads.length > 0 && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron leads
            </h3>
            <p className="text-gray-500 mb-4">
              No hay leads que coincidan con los filtros aplicados.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setActiveTab("all");
                setSelectedMonth("all");
              }}
            >
              Limpiar filtros
            </Button>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
