// src/app/admin/stats/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { getLeads, Lead } from "@/lib/firebase/db";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
  User,
  DollarSign,
  Calendar,
} from "lucide-react";

// Helper function to safely convert any timestamp-like value to a Date
function toJsDate(timestamp: any): Date | null {
  if (!timestamp) return null;

  if (timestamp instanceof Date) return timestamp;

  // Firestore Timestamp
  if (
    typeof timestamp === "object" &&
    "toDate" in timestamp &&
    typeof timestamp.toDate === "function"
  ) {
    return timestamp.toDate();
  }

  // Try to create a Date from the value
  try {
    return new Date(timestamp);
  } catch (e) {
    console.error("Failed to convert to date:", timestamp);
    return null;
  }
}

export default function StatsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeFrame, setTimeFrame] = useState("all");

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

    fetchLeads();
  }, []);

  // Filter leads based on selected time frame
  const getFilteredLeads = () => {
    if (timeFrame === "all") return leads;

    const now = new Date();
    const cutoffDate = new Date();

    switch (timeFrame) {
      case "week":
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case "month":
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case "quarter":
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      default:
        return leads;
    }

    return leads.filter((lead) => {
      const leadDate = toJsDate(lead.createdAt);
      if (!leadDate) return false;
      return leadDate >= cutoffDate;
    });
  };

  // Prepare data for status distribution pie chart
  const getStatusDistribution = () => {
    const filteredLeads = getFilteredLeads();
    const statusCounts = {
      lead: 0,
      onboarding: 0,
      sale: 0,
      rejected: 0,
    };

    filteredLeads.forEach((lead) => {
      statusCounts[lead.status]++;
    });

    return [
      { name: "Nuevos", value: statusCounts.lead, color: "#3B82F6" },
      {
        name: "En Onboarding",
        value: statusCounts.onboarding,
        color: "#F59E0B",
      },
      { name: "Ventas", value: statusCounts.sale, color: "#10B981" },
      { name: "Rechazados", value: statusCounts.rejected, color: "#EF4444" },
    ];
  };

  // Prepare data for conversion funnel chart
  const getConversionData = () => {
    const filteredLeads = getFilteredLeads();
    return [
      { name: "Leads", count: filteredLeads.length, color: "#3B82F6" },
      {
        name: "Onboarding",
        count: filteredLeads.filter(
          (l) => l.status === "onboarding" || l.status === "sale"
        ).length,
        color: "#F59E0B",
      },
      {
        name: "Ventas",
        count: filteredLeads.filter((l) => l.status === "sale").length,
        color: "#10B981",
      },
    ];
  };

  // Prepare data for time-based lead trend chart
  const getLeadTrends = () => {
    const filteredLeads = getFilteredLeads();
    const dateMap = new Map();

    filteredLeads.forEach((lead) => {
      const date = toJsDate(lead.createdAt);
      if (!date) return;

      const dateString = date.toISOString().split("T")[0];

      if (!dateMap.has(dateString)) {
        dateMap.set(dateString, { date: dateString, count: 0 });
      }

      const entry = dateMap.get(dateString);
      entry.count += 1;
    });

    return Array.from(dateMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );
  };

  // Calculate some key metrics
  const getMetrics = () => {
    const filteredLeads = getFilteredLeads();
    const totalLeads = filteredLeads.length;
    const salesCount = filteredLeads.filter((l) => l.status === "sale").length;

    // Conversion rate (leads to sales)
    const conversionRate = totalLeads > 0 ? (salesCount / totalLeads) * 100 : 0;

    // Potential revenue (based on onboarding leads)
    const potentialRevenue = filteredLeads
      .filter((lead) => lead.status === "onboarding")
      .reduce((total, lead) => {
        if (lead.investment.includes("Sí, tengo acceso")) {
          return total + 1300;
        } else if (lead.investment.includes("puedo conseguirlo")) {
          return total + 800;
        }
        return total;
      }, 0);

    // Actual revenue (from sales)
    const actualRevenue = filteredLeads
      .filter((lead) => lead.status === "sale")
      .reduce((total, lead) => {
        if (lead.investment.includes("Sí, tengo acceso")) {
          return total + 1300;
        } else if (lead.investment.includes("puedo conseguirlo")) {
          return total + 800;
        }
        return total + 500; // Default minimum
      }, 0);

    return {
      totalLeads,
      salesCount,
      conversionRate,
      potentialRevenue,
      actualRevenue,
    };
  };

  const metrics = getMetrics();
  const statusDistribution = getStatusDistribution();
  const conversionData = getConversionData();
  const trendData = getLeadTrends();

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 text-red-700 p-4 rounded-md">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Estadísticas</h1>

        <div>
          <Tabs defaultValue="all" onValueChange={setTimeFrame}>
            <TabsList>
              <TabsTrigger value="all">Todo</TabsTrigger>
              <TabsTrigger value="week">Última Semana</TabsTrigger>
              <TabsTrigger value="month">Último Mes</TabsTrigger>
              <TabsTrigger value="quarter">Último Trimestre</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Metrics Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <User className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalLeads}</div>
            <p className="text-xs text-gray-500">Leads activos y potenciales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ventas</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.salesCount}</div>
            <p className="text-xs text-gray-500">Total de ventas realizadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Tasa de Conversión
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.conversionRate.toFixed(1)}%
            </div>
            <p className="text-xs text-gray-500">
              De leads a ventas realizadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${metrics.actualRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500">
              +${metrics.potentialRevenue.toLocaleString()} potencial
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Status Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChartIcon className="mr-2 h-5 w-5" /> Distribución de Estados
            </CardTitle>
            <CardDescription>
              Distribución de leads por estado actual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Conversion Funnel Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" /> Embudo de Conversión
            </CardTitle>
            <CardDescription>
              Seguimiento de leads a través del proceso de ventas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={conversionData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  {/* Fixed: Removed nameKey prop which doesn't exist on Bar */}
                  <Bar dataKey="count">
                    {conversionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trend Chart (Full Width) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5" /> Tendencia de Leads por
            Tiempo
          </CardTitle>
          <CardDescription>
            Evolución de la generación de leads a lo largo del tiempo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                  name="Nuevos Leads"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
