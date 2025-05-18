"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthChange } from "@/lib/firebase/auth";
import { getLeads, Lead } from "@/lib/firebase/db";
import DashboardLayout from "@/components/ui/admin/DashboardLayout";
import LeadStatusCard from "@/components/ui/admin/LeadStatusCard";
import LeadTable from "@/components/ui/admin/LeadTable";
import LeadChart from "@/components/ui/admin/LeadChart";

export default function AdminDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  // Check authentication
  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setUser(user);
      if (!user) {
        router.push("/admin/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Fetch leads data
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setIsLoading(true);
        const fetchedLeads = await getLeads();
        setLeads(fetchedLeads);
      } catch (err) {
        console.error("Error fetching leads:", err);
        setError("Failed to load lead data");
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchLeads();
    }
  }, [user]);

  // Calculate statistics
  const leadCount = leads.length;
  const leadsByStatus = {
    lead: leads.filter((lead) => lead.status === "lead").length,
    onboarding: leads.filter((lead) => lead.status === "onboarding").length,
    sale: leads.filter((lead) => lead.status === "sale").length,
    rejected: leads.filter((lead) => lead.status === "rejected").length,
  };

  // Calculate potential revenue (based on leads in onboarding and their investment level)
  const potentialRevenue = leads
    .filter((lead) => lead.status === "onboarding")
    .reduce((total, lead) => {
      // Estimate based on investment level
      if (lead.investment.includes("Sí, tengo acceso")) {
        return total + 1300; // High estimate
      } else if (lead.investment.includes("puedo conseguirlo")) {
        return total + 800; // Low estimate
      }
      return total;
    }, 0);

  // Calculate actual revenue from sales
  const actualRevenue = leads
    .filter((lead) => lead.status === "sale")
    .reduce((total, lead) => {
      // Estimate based on investment level
      if (lead.investment.includes("Sí, tengo acceso")) {
        return total + 1300;
      } else if (lead.investment.includes("puedo conseguirlo")) {
        return total + 800;
      }
      return total + 500; // Default minimum
    }, 0);

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 text-red-700 p-4 rounded-md">{error}</div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <LeadStatusCard
              title="Total Leads"
              count={leadCount}
              icon="users"
              color="blue"
            />
            <LeadStatusCard
              title="En Onboarding"
              count={leadsByStatus.onboarding}
              icon="refresh-cw"
              color="amber"
            />
            <LeadStatusCard
              title="Ventas"
              count={leadsByStatus.sale}
              icon="check-circle"
              color="green"
            />
            <LeadStatusCard
              title="Ingresos"
              count={`$${actualRevenue.toLocaleString()}`}
              subtitle={`+$${potentialRevenue.toLocaleString()} potencial`}
              icon="dollar-sign"
              color="purple"
            />
          </div>

          {/* Lead Status Chart */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-lg font-medium mb-4">Estado de Leads</h2>
            <div className="h-64">
              <LeadChart leads={leads} />
            </div>
          </div>

          {/* Recent Leads Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-medium">Leads Recientes</h2>
            </div>
            <LeadTable
              leads={leads.slice(0, 5)}
              onStatusChange={() => {
                // Refresh leads after status change
                getLeads().then(setLeads);
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}
