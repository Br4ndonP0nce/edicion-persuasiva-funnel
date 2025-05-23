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

    // Only include entries with values > 0
    const data = [
      { name: "Nuevos", value: statusCounts.lead, color: "#3B82F6" },
      {
        name: "En Onboarding",
        value: statusCounts.onboarding,
        color: "#F59E0B",
      },
      { name: "Ventas", value: statusCounts.sale, color: "#10B981" },
      { name: "Rechazados", value: statusCounts.rejected, color: "#EF4444" },
    ].filter((item) => item.value > 0); // Filter out zero values

    return data;
  }, [leads]);

  // Custom label function that only renders for significant slices
  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    name,
    value,
  }: any) => {
    // Only show label if percentage is >= 5% to avoid overlapping on small slices
    if (percent < 0.05) return null;

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize="12"
        fontWeight="500"
      >
        {`${value}`}
      </text>
    );
  };

  // Custom tooltip for the pie chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-md">
          <p className="font-medium text-gray-900">{`${data.name}: ${data.value}`}</p>
          <p className="text-sm text-gray-600">{`${Math.round(
            (data.value / leads.length) * 100
          )}% del total`}</p>
        </div>
      );
    }
    return null;
  };

  // Custom legend
  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload?.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-700">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  // Only show chart if there's data
  if (leads.length === 0 || chartData.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-gray-500">
          No hay datos suficientes para mostrar el gráfico
        </p>
      </div>
    );
  }

  // If only one data point, show a simple display instead of pie chart
  if (chartData.length === 1) {
    const singleData = chartData[0];
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
          style={{ backgroundColor: singleData.color }}
        >
          <span className="text-white font-bold text-xl">
            {singleData.value}
          </span>
        </div>
        <p className="text-gray-700 font-medium">{singleData.name}</p>
        <p className="text-gray-500 text-sm">100% del total</p>
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
          label={renderCustomLabel}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend content={<CustomLegend />} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default LeadChart;
