"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getLeads, Lead } from "@/lib/firebase/db";

import LeadTable from "@/components/ui/admin/LeadTable";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, Download } from "lucide-react";

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
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
    // Filter leads when tab or search term changes
    let filtered = [...leads];

    // Filter by status (tab)
    if (activeTab !== "all") {
      filtered = filtered.filter((lead) => lead.status === activeTab);
    }

    // Filter by search term
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
    // Optimistic UI update
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === leadId ? { ...lead, status: newStatus } : lead
      )
    );

    // Actual fetch would happen in the LeadTable component
  };

  const exportToCsv = () => {
    // Implementation for export functionality
    const headers = ["Nombre", "Email", "Teléfono", "Estado", "Fecha"];
    const csvContent = [
      headers.join(","),
      ...filteredLeads.map((lead) =>
        [
          `"${lead.name}"`,
          `"${lead.email}"`,
          `"${lead.phone}"`,
          `"${lead.status}"`,
          `"${
            lead.createdAt
              ? new Date(lead.createdAt.seconds * 1000).toLocaleString()
              : "N/A"
          }"`,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `leads_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
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

          <Button variant="outline" onClick={exportToCsv}>
            <Download className="mr-2 h-4 w-4" /> Exportar
          </Button>

          <Button onClick={() => router.push("/admin/leads/new")}>
            <Plus className="mr-2 h-4 w-4" /> Nuevo Lead
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="lead">Nuevos</TabsTrigger>
          <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
          <TabsTrigger value="sale">Ventas</TabsTrigger>
          <TabsTrigger value="rejected">Rechazados</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                </div>
              ) : error ? (
                <div className="bg-red-100 text-red-700 p-4 rounded-md">
                  {error}
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

        {/* All other tabs show the same content but filtered by the tab status */}
        {["lead", "onboarding", "sale", "rejected"].map((status) => (
          <TabsContent key={status} value={status} className="space-y-4">
            <Card>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                  </div>
                ) : error ? (
                  <div className="bg-red-100 text-red-700 p-4 rounded-md">
                    {error}
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
    </div>
  );
}
