"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { getSales } from "@/lib/firebase/sales";
import { getUserProfile } from "@/lib/firebase/rbac";
import { getLead } from "@/lib/firebase/db";
import { Sale } from "@/types/sales";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  ArrowLeft,
  DollarSign,
  Calendar,
  CreditCard,
  User,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
} from "lucide-react";

interface SaleWithLead extends Sale {
  leadData: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export default function VentasUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { hasPermission } = useAuth();
  const [sales, setSales] = useState<SaleWithLead[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = params.id as string;

  useEffect(() => {
    if (userId) {
      fetchUserSalesData();
    }
  }, [userId]);

  const fetchUserSalesData = async () => {
    try {
      setLoading(true);

      // Fetch user profile and sales
      const [userProfile, allSales] = await Promise.all([
        getUserProfile(userId),
        getSales({ saleUserId: userId }),
      ]);

      setUser(userProfile);

      // Get lead data for each sale
      const salesWithLeads = await Promise.all(
        allSales.map(async (sale) => {
          try {
            const leadData = await getLead(sale.leadId);
            return {
              ...sale,
              leadData: leadData
                ? {
                    id: leadData.id!,
                    name: leadData.name,
                    email: leadData.email,
                  }
                : null,
            };
          } catch (err) {
            console.error(`Error fetching lead ${sale.leadId}:`, err);
            return {
              ...sale,
              leadData: null,
            };
          }
        })
      );

      // Sort by creation date (newest first)
      salesWithLeads.sort((a, b) => {
        const dateA = toJsDate(a.createdAt);
        const dateB = toJsDate(b.createdAt);

        if (!dateA || !dateB) return 0;
        return dateB.getTime() - dateA.getTime();
      });

      setSales(salesWithLeads);
    } catch (err) {
      console.error("Error fetching user sales data:", err);
      setError("Failed to load sales data");
    } finally {
      setLoading(false);
    }
  };

  // Utility function to safely convert any date format to JavaScript Date
  const toJsDate = (date: any): Date | null => {
    if (!date) return null;

    if (typeof date === "object" && date !== null && "toDate" in date) {
      // Firestore Timestamp
      return date.toDate();
    } else if (date instanceof Date) {
      // JavaScript Date
      return date;
    } else {
      // String or number timestamp
      const jsDate = new Date(date);
      return isNaN(jsDate.getTime()) ? null : jsDate;
    }
  };

  const formatDate = (date: any): string => {
    const jsDate = toJsDate(date);
    if (!jsDate) return "N/A";

    return jsDate.toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPaymentStatus = (sale: Sale) => {
    const progress = (sale.paidAmount / sale.totalAmount) * 100;

    if (progress >= 100)
      return {
        status: "completed",
        label: "Pagado Completo",
        color: "bg-green-100 text-green-800",
      };
    if (progress >= 50)
      return {
        status: "partial",
        label: "Pago Parcial",
        color: "bg-yellow-100 text-yellow-800",
      };
    if (progress > 0)
      return {
        status: "started",
        label: "Pago Iniciado",
        color: "bg-blue-100 text-blue-800",
      };
    return {
      status: "pending",
      label: "Pago Pendiente",
      color: "bg-gray-100 text-gray-800",
    };
  };

  const getAccessStatus = (sale: Sale) => {
    if (!sale.accessGranted)
      return {
        status: "pending",
        label: "Sin Acceso",
        color: "bg-gray-100 text-gray-800",
      };

    if (sale.accessEndDate) {
      const endDate = toJsDate(sale.accessEndDate);

      if (endDate) {
        const now = new Date();
        if (now > endDate) {
          return {
            status: "expired",
            label: "Acceso Expirado",
            color: "bg-red-100 text-red-800",
          };
        } else {
          return {
            status: "active",
            label: "Acceso Activo",
            color: "bg-green-100 text-green-800",
          };
        }
      }
    }

    return {
      status: "granted",
      label: "Acceso Otorgado",
      color: "bg-blue-100 text-blue-800",
    };
  };

  // Calculate statistics
  const stats = sales.reduce(
    (acc, sale) => ({
      totalSales: acc.totalSales + 1,
      totalAmount: acc.totalAmount + sale.totalAmount,
      paidAmount: acc.paidAmount + sale.paidAmount,
      completedSales:
        acc.completedSales + (sale.paidAmount >= sale.totalAmount ? 1 : 0),
      activeMemberships:
        acc.activeMemberships +
        (sale.accessGranted && getAccessStatus(sale).status === "active"
          ? 1
          : 0),
    }),
    {
      totalSales: 0,
      totalAmount: 0,
      paidAmount: 0,
      completedSales: 0,
      activeMemberships: 0,
    }
  );

  const conversionRate =
    stats.totalSales > 0 ? (stats.completedSales / stats.totalSales) * 100 : 0;
  const collectionRate =
    stats.totalAmount > 0 ? (stats.paidAmount / stats.totalAmount) * 100 : 0;

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-6">
        <Button variant="outline" onClick={() => router.push("/admin/ventas")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Ventas
        </Button>
        <div className="bg-red-100 text-red-700 p-4 rounded-md mt-6">
          {error || "Usuario no encontrado"}
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute requiredPermissions={["users:read"]}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="outline"
            onClick={() => router.push("/admin/ventas")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Ventas
          </Button>
        </div>

        {/* User Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  {user.displayName || "Usuario Sin Nombre"}
                </h1>
                <p className="text-gray-600">{user.email}</p>
                <Badge className="mt-2 capitalize">
                  {user.role?.replace("_", " ") || "Sin Rol"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Ventas</p>
                  <p className="text-2xl font-bold">{stats.totalSales}</p>
                </div>
                <CreditCard className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Monto Total</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${stats.totalAmount.toLocaleString()}
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
                    ${stats.paidAmount.toLocaleString()}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">% Cobrado</p>
                  <p className="text-2xl font-bold">
                    {collectionRate.toFixed(0)}%
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Membresías Activas</p>
                  <p className="text-2xl font-bold">
                    {stats.activeMemberships}
                  </p>
                </div>
                <User className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sales Table */}
        <Card>
          <CardHeader>
            <CardTitle>Detalle de Ventas ({sales.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead>Plan de Pago</TableHead>
                    <TableHead>Progreso de Pago</TableHead>
                    <TableHead>Estado de Acceso</TableHead>
                    <TableHead>Fecha de Venta</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.map((sale) => {
                    const paymentStatus = getPaymentStatus(sale);
                    const accessStatus = getAccessStatus(sale);
                    const paymentProgress =
                      (sale.paidAmount / sale.totalAmount) * 100;

                    return (
                      <TableRow key={sale.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {sale.leadData?.name || "Cliente Desconocido"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {sale.leadData?.email || "Email no disponible"}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {sale.product === "acceso_curso"
                                ? "Acceso al Curso"
                                : "Otro Producto"}
                            </div>
                            <div className="text-sm text-gray-600">
                              ${sale.totalAmount.toLocaleString()}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge variant="outline">
                            {sale.paymentPlan.replace("_", " ").toUpperCase()}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>${sale.paidAmount.toLocaleString()}</span>
                              <span>{paymentProgress.toFixed(0)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-500 h-2 rounded-full"
                                style={{
                                  width: `${Math.min(paymentProgress, 100)}%`,
                                }}
                              />
                            </div>
                            <Badge
                              className={paymentStatus.color}
                              variant="outline"
                            >
                              {paymentStatus.label}
                            </Badge>
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge
                            className={accessStatus.color}
                            variant="outline"
                          >
                            {accessStatus.label}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center text-sm">
                            <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                            {formatDate(sale.createdAt)}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex gap-2">
                            {sale.leadData && (
                              <Button size="sm" variant="outline" asChild>
                                <a href={`/admin/leads/${sale.leadData.id}`}>
                                  <Eye className="h-4 w-4 mr-1" />
                                  Ver Lead
                                </a>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {sales.length === 0 && (
              <div className="text-center py-12">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay ventas registradas
                </h3>
                <p className="text-gray-500">
                  Este usuario aún no tiene ventas asociadas.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
