"use client";

import React, { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { getSales } from "@/lib/firebase/sales";
import { getAllUsers, UserProfile } from "@/lib/firebase/rbac";
import { Sale } from "@/types/sales";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart3,
  DollarSign,
  TrendingUp,
  Users,
  Search,
  Eye,
  Calendar,
  CreditCard,
} from "lucide-react";

interface SalesUserData {
  userId: string;
  user: UserProfile | null;
  salesCount: number;
  totalAmount: number;
  paidAmount: number;
  sales: Sale[];
}

export default function VentasPage() {
  const { hasPermission } = useAuth();
  const [salesData, setSalesData] = useState<SalesUserData[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchSalesData();
  }, []);

  const fetchSalesData = async () => {
    try {
      setLoading(true);

      // Fetch all sales and users
      const [allSales, allUsers] = await Promise.all([
        getSales(),
        getAllUsers(),
      ]);

      setUsers(allUsers);

      // Group sales by saleUserId
      const salesByUser = new Map<string, Sale[]>();

      allSales.forEach((sale) => {
        const userId = sale.saleUserId;
        if (!salesByUser.has(userId)) {
          salesByUser.set(userId, []);
        }
        salesByUser.get(userId)!.push(sale);
      });

      // Create aggregated data
      const aggregatedData: SalesUserData[] = [];

      salesByUser.forEach((userSales, userId) => {
        const user = allUsers.find((u) => u.uid === userId) || null;
        const totalAmount = userSales.reduce(
          (sum, sale) => sum + sale.totalAmount,
          0
        );
        const paidAmount = userSales.reduce(
          (sum, sale) => sum + sale.paidAmount,
          0
        );

        aggregatedData.push({
          userId,
          user,
          salesCount: userSales.length,
          totalAmount,
          paidAmount,
          sales: userSales.sort((a, b) => {
            const dateA =
              a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
            const dateB =
              b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
            return dateB.getTime() - dateA.getTime();
          }),
        });
      });

      // Sort by total sales amount (descending)
      aggregatedData.sort((a, b) => b.totalAmount - a.totalAmount);

      setSalesData(aggregatedData);
    } catch (err) {
      console.error("Error fetching sales data:", err);
      setError("Failed to load sales data");
    } finally {
      setLoading(false);
    }
  };

  const filteredData = salesData.filter((data) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    const userName =
      data.user?.displayName || data.user?.email || "Usuario Desconocido";

    return (
      userName.toLowerCase().includes(searchLower) ||
      data.userId.toLowerCase().includes(searchLower)
    );
  });

  // Calculate totals
  const totals = salesData.reduce(
    (acc, data) => ({
      sales: acc.sales + data.salesCount,
      totalAmount: acc.totalAmount + data.totalAmount,
      paidAmount: acc.paidAmount + data.paidAmount,
    }),
    { sales: 0, totalAmount: 0, paidAmount: 0 }
  );

  const formatDate = (date: any): string => {
    if (!date) return "N/A";

    let jsDate: Date;
    if (typeof date === "object" && date !== null && "toDate" in date) {
      jsDate = date.toDate();
    } else if (date instanceof Date) {
      jsDate = date;
    } else {
      jsDate = new Date(date);
    }

    if (isNaN(jsDate.getTime())) return "Invalid Date";

    return jsDate.toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute requiredPermissions={["users:read"]}>
      <div className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold">Gestión de Ventas</h1>
            <p className="text-gray-600">Ventas por usuario del equipo</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
            {error}
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Vendedores Activos</p>
                  <p className="text-2xl font-bold">{salesData.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Ventas</p>
                  <p className="text-2xl font-bold">{totals.sales}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Ingresos Totales</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${totals.totalAmount.toLocaleString()}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Cobrado</p>
                  <p className="text-2xl font-bold text-purple-600">
                    ${totals.paidAmount.toLocaleString()}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Buscar por nombre o usuario..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Sales Table */}
        <Card>
          <CardHeader>
            <CardTitle>Ventas por Usuario</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Cantidad de Ventas</TableHead>
                    <TableHead>Monto Total</TableHead>
                    <TableHead>Monto Cobrado</TableHead>
                    <TableHead>% Cobrado</TableHead>
                    <TableHead>Última Venta</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((data) => {
                    const collectionRate =
                      data.totalAmount > 0
                        ? (data.paidAmount / data.totalAmount) * 100
                        : 0;

                    const lastSale = data.sales[0]; // Already sorted by date desc

                    return (
                      <TableRow key={data.userId}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {data.user?.displayName || "Usuario Desconocido"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {data.user?.email || data.userId}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center">
                            <CreditCard className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="font-medium">
                              {data.salesCount}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell>
                          <span className="font-medium text-green-600">
                            ${data.totalAmount.toLocaleString()}
                          </span>
                        </TableCell>

                        <TableCell>
                          <span className="font-medium">
                            ${data.paidAmount.toLocaleString()}
                          </span>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-500 h-2 rounded-full"
                                style={{
                                  width: `${Math.min(collectionRate, 100)}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium">
                              {collectionRate.toFixed(0)}%
                            </span>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="h-4 w-4 mr-1" />
                            {lastSale ? formatDate(lastSale.createdAt) : "N/A"}
                          </div>
                        </TableCell>

                        <TableCell>
                          <Button size="sm" variant="outline" asChild>
                            <a href={`/admin/ventas/${data.userId}`}>
                              <Eye className="h-4 w-4 mr-1" />
                              Ver Detalles
                            </a>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {filteredData.length === 0 && (
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay ventas
                </h3>
                <p className="text-gray-500">
                  {searchTerm
                    ? "No se encontraron ventas con los filtros aplicados."
                    : "Aún no se han registrado ventas en el sistema."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
