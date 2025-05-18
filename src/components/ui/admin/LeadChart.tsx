"use client";

import React, { useMemo } from "react";
import { Lead } from "@/lib/firebase/db";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface LeadChartProps {
  leads: Lead[];
}

const LeadChart: React.FC<LeadChartProps> = ({ leads }) => {
  // Transform leads data into chart format
  const chartData = useMemo(() => {
    const statusCounts = {
      lead: 0,
      onboarding: 0,
      sale: 0,
      rejected: 0,
    };

    leads.forEach((lead) => {
      if (lead.status in statusCounts) {
        statusCounts[lead.status as keyof typeof statusCounts]++;
      }
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
  }, [leads]);

  // Custom tooltip for the pie chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-md rounded-md">
          <p className="font-medium">{`${payload[0].name}: ${payload[0].value}`}</p>
          <p className="text-sm text-gray-500">{`${Math.round(
            (payload[0].value / leads.length) * 100
          )}% del total`}</p>
        </div>
      );
    }
    return null;
  };

  // Only show chart if there's data
  if (leads.length === 0 || chartData.every((item) => item.value === 0)) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-gray-500">
          No hay datos suficientes para mostrar el gráfico
        </p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
          label={({ name, percent }) =>
            `${name}: ${(percent * 100).toFixed(0)}%`
          }
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default LeadChart;
