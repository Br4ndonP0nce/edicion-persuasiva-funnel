// src/app/admin/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { useAuth } from "@/hooks/useAuth";
import { getLeads, Lead } from "@/lib/firebase/db";

// Import the new feature announcement modal
import FeatureAnnouncementModal from "@/components/ui/admin/FeatureAnnouncementModal";

import LeadStatusCard from "@/components/ui/admin/LeadStatusCard";
import LeadTable from "@/components/ui/admin/LeadTable";
import LeadChart from "@/components/ui/admin/LeadChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Lock,
  TrendingUp,
  Users,
  DollarSign,
  Sparkles,
  Bell,
} from "lucide-react";

export default function AdminDashboard() {
  const { userProfile, hasPermission } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);

  // Fetch leads data if user has permission
  useEffect(() => {
    const fetchLeads = async () => {
      if (!hasPermission("leads:read")) {
        setIsLoading(false);
        return;
      }

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

    fetchLeads();
  }, [hasPermission]);

  // Show feature announcements after a short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAnnouncementModal(true);
    }, 1000); // 1 second delay to let the dashboard load

    return () => clearTimeout(timer);
  }, []);

  // Calculate statistics
  const leadCount = leads.length;
  const leadsByStatus = {
    lead: leads.filter((lead) => lead.status === "lead").length,
    onboarding: leads.filter((lead) => lead.status === "onboarding").length,
    sale: leads.filter((lead) => lead.status === "sale").length,
    rejected: leads.filter((lead) => lead.status === "rejected").length,
  };

  // Calculate potential revenue
  const potentialRevenue = leads
    .filter((lead) => lead.status === "onboarding")
    .reduce((total, lead) => {
      if (lead.investment.includes("Sí, tengo acceso")) {
        return total + 1300;
      } else if (lead.investment.includes("puedo conseguirlo")) {
        return total + 800;
      }
      return total;
    }, 0);

  // Calculate actual revenue from sales
  const actualRevenue = leads
    .filter((lead) => lead.status === "sale")
    .reduce((total, lead) => {
      if (lead.investment.includes("Sí, tengo acceso")) {
        return total + 1300;
      } else if (lead.investment.includes("puedo conseguirlo")) {
        return total + 800;
      }
      return total + 500;
    }, 0);

  return (
    <ProtectedRoute requiredPermissions={["dashboard:read"]}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-gray-600">
              Welcome back, {userProfile?.displayName || userProfile?.email}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Manual Feature Announcements Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAnnouncementModal(true)}
              className="flex items-center space-x-2"
            >
              <Sparkles className="h-4 w-4" />
              <span>Novedades</span>
            </Button>

            {/* Role indicator */}
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-gray-500" />
              <Badge variant="outline" className="capitalize">
                {userProfile?.role?.replace("_", " ")}
              </Badge>
            </div>
          </div>
        </div>

        {/* Feature Announcement Modal */}
        {showAnnouncementModal && (
          <FeatureAnnouncementModal
            userRole={userProfile?.role}
            onClose={() => setShowAnnouncementModal(false)}
          />
        )}

        {/* Permission-based content */}
        <PermissionGate
          permissions={["leads:read"]}
          fallback={
            <Card className="mb-8">
              <CardContent className="flex items-center justify-center h-32">
                <div className="text-center">
                  <Lock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">
                    You need leads access to view statistics
                  </p>
                </div>
              </CardContent>
            </Card>
          }
        >
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
              {error}
            </div>
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
                  count={`${actualRevenue.toLocaleString()}`}
                  subtitle={`+${potentialRevenue.toLocaleString()} potencial`}
                  icon="dollar-sign"
                  color="purple"
                />
              </div>

              {/* Charts - Only show if user has stats access */}
              <PermissionGate permissions={["stats:read"]}>
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                  <h2 className="text-lg font-medium mb-4">Estado de Leads</h2>
                  <div className="h-64">
                    <LeadChart leads={leads} />
                  </div>
                </div>
              </PermissionGate>

              {/* Recent Leads Table */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b">
                  <h2 className="text-lg font-medium">Leads Recientes</h2>
                </div>
                <LeadTable
                  leads={leads.slice(0, 5)}
                  onStatusChange={() => {
                    // Refresh leads after status change
                    if (hasPermission("leads:read")) {
                      getLeads().then(setLeads);
                    }
                  }}
                />
              </div>
            </>
          )}
        </PermissionGate>

        {/* Quick Actions based on permissions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <PermissionGate permissions={["leads:write"]}>
            <Card
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => (window.location.href = "/admin/leads")}
            >
              <CardContent className="flex items-center p-4">
                <Users className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <h3 className="font-medium">Manage Leads</h3>
                  <p className="text-sm text-gray-600">View and edit leads</p>
                </div>
              </CardContent>
            </Card>
          </PermissionGate>

          <PermissionGate permissions={["stats:read"]}>
            <Card
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => (window.location.href = "/admin/stats")}
            >
              <CardContent className="flex items-center p-4">
                <TrendingUp className="h-8 w-8 text-green-500 mr-3" />
                <div>
                  <h3 className="font-medium">View Analytics</h3>
                  <p className="text-sm text-gray-600">Detailed statistics</p>
                </div>
              </CardContent>
            </Card>
          </PermissionGate>

          <PermissionGate permissions={["content:read"]}>
            <Card
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => (window.location.href = "/admin/content")}
            >
              <CardContent className="flex items-center p-4">
                <DollarSign className="h-8 w-8 text-purple-500 mr-3" />
                <div>
                  <h3 className="font-medium">Content Management</h3>
                  <p className="text-sm text-gray-600">Edit site content</p>
                </div>
              </CardContent>
            </Card>
          </PermissionGate>
        </div>
      </div>
    </ProtectedRoute>
  );
}
