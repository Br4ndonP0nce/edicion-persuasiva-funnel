"use client";

import React, { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { useAuth } from "@/hooks/useAuth";
import {
  getActiveMembers,
  grantCourseAccess,
  updateCourseAccess,
  revokeCourseAccess,
  addPaymentProof,
} from "@/lib/firebase/sales";
import { Sale, PaymentProof } from "@/types/sales";
import { toJsDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import {
  Users,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Key,
  FileText,
  CreditCard,
  Upload,
  Plus,
  Edit3,
  UserMinus,
  Shield,
} from "lucide-react";

interface ActiveMember extends Sale {
  leadData: {
    id: string;
    name: string;
    email: string;
    phone: string;
    createdAt: any;
  };
}

export default function ActivosPage() {
  const { userProfile, hasPermission } = useAuth();
  const [activeMembers, setActiveMembers] = useState<ActiveMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "pending" | "expired"
  >("all");

  // Grant Access Modal State
  const [grantingAccess, setGrantingAccess] = useState(false);
  const [selectedMemberForGrant, setSelectedMemberForGrant] =
    useState<ActiveMember | null>(null);
  const [accessStartDate, setAccessStartDate] = useState("");

  // Update Access Modal State
  const [updatingAccess, setUpdatingAccess] = useState(false);
  const [selectedMemberForUpdate, setSelectedMemberForUpdate] =
    useState<ActiveMember | null>(null);
  const [newAccessStartDate, setNewAccessStartDate] = useState("");
  const [showUpdateAccessModal, setShowUpdateAccessModal] = useState(false);

  // Revoke Access State
  const [revokingAccess, setRevokingAccess] = useState(false);
  const [selectedMemberForRevoke, setSelectedMemberForRevoke] =
    useState<ActiveMember | null>(null);
  const [revokeReason, setRevokeReason] = useState("");
  const [showRevokeDialog, setShowRevokeDialog] = useState(false);

  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [addingPayment, setAddingPayment] = useState(false);
  const [selectedMemberForPayment, setSelectedMemberForPayment] =
    useState<ActiveMember | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    imageUrl: "",
    description: "",
  });

  useEffect(() => {
    fetchActiveMembers();
  }, []);

  const fetchActiveMembers = async () => {
    try {
      setLoading(true);
      const members = await getActiveMembers();
      setActiveMembers(members);
    } catch (err) {
      console.error("Error fetching active members:", err);
      setError("Failed to load active members");
    } finally {
      setLoading(false);
    }
  };

  const handleGrantAccess = async () => {
    if (!selectedMemberForGrant || !accessStartDate || !userProfile) return;

    try {
      setGrantingAccess(true);
      const startDate = new Date(accessStartDate);
      await grantCourseAccess(
        selectedMemberForGrant.id!,
        startDate,
        userProfile.uid
      );

      // Refresh the data
      await fetchActiveMembers();
      setSelectedMemberForGrant(null);
      setAccessStartDate("");
    } catch (err) {
      console.error("Error granting access:", err);
      setError("Failed to grant course access");
    } finally {
      setGrantingAccess(false);
    }
  };

  const handleUpdateAccess = async () => {
    if (!selectedMemberForUpdate || !newAccessStartDate || !userProfile) return;

    try {
      setUpdatingAccess(true);
      const startDate = new Date(newAccessStartDate);
      await updateCourseAccess(
        selectedMemberForUpdate.id!,
        startDate,
        userProfile.uid
      );

      // Refresh the data
      await fetchActiveMembers();
      setSelectedMemberForUpdate(null);
      setNewAccessStartDate("");
      setShowUpdateAccessModal(false);
    } catch (err) {
      console.error("Error updating access:", err);
      setError("Failed to update course access");
    } finally {
      setUpdatingAccess(false);
    }
  };

  const handleRevokeAccess = async () => {
    if (!selectedMemberForRevoke || !userProfile) return;

    try {
      setRevokingAccess(true);
      await revokeCourseAccess(
        selectedMemberForRevoke.id!,
        userProfile.uid,
        revokeReason || undefined
      );

      // Refresh the data
      await fetchActiveMembers();
      setSelectedMemberForRevoke(null);
      setRevokeReason("");
      setShowRevokeDialog(false);
    } catch (err) {
      console.error("Error revoking access:", err);
      setError("Failed to revoke course access");
    } finally {
      setRevokingAccess(false);
    }
  };

  const canEditPayments = (member: ActiveMember) => {
    if (!userProfile) return false;

    // Super admin and admin can always edit
    if (userProfile.role === "super_admin" || userProfile.role === "admin") {
      return true;
    }

    // Check if current user is the one who made the sale
    if (member.saleUserId === userProfile.uid) {
      return true;
    }

    return false;
  };

  const canManageAccess = () => {
    return hasPermission("active_members:write");
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !selectedMemberForPayment ||
      !userProfile ||
      !paymentForm.amount ||
      !paymentForm.imageUrl
    ) {
      return;
    }

    try {
      setAddingPayment(true);

      const paymentProof: Omit<PaymentProof, "id" | "uploadedAt"> = {
        amount: parseFloat(paymentForm.amount),
        imageUrl: paymentForm.imageUrl,
        uploadedBy: userProfile.uid,
        description: paymentForm.description,
      };

      await addPaymentProof(
        selectedMemberForPayment.id!,
        paymentProof,
        userProfile.uid
      );

      // Refresh the data
      await fetchActiveMembers();

      // Reset form and close modal
      setPaymentForm({ amount: "", imageUrl: "", description: "" });
      setShowPaymentModal(false);
      setSelectedMemberForPayment(null);
    } catch (error) {
      console.error("Error adding payment:", error);
      setError("Failed to add payment");
    } finally {
      setAddingPayment(false);
    }
  };

  const getAccessStatus = (member: ActiveMember) => {
    if (!member.accessGranted) return "pending";

    if (member.accessEndDate) {
      const now = new Date();
      const endDate = new Date(member.accessEndDate);
      return now > endDate ? "expired" : "active";
    }

    return "pending";
  };

  const getRemainingDays = (member: ActiveMember): number => {
    if (!member.accessEndDate) return 0;

    const now = new Date();
    const endDate = toJsDate(member.accessEndDate);

    if (!endDate) return 0;

    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Activo</Badge>;
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
        );
      case "expired":
        return <Badge className="bg-red-100 text-red-800">Expirado</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Desconocido</Badge>;
    }
  };

  const formatDate = (date: any): string => {
    const jsDate = toJsDate(date);
    if (!jsDate) return "N/A";

    return jsDate.toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getPaymentProgress = (member: ActiveMember): number => {
    return (member.paidAmount / member.totalAmount) * 100;
  };

  const getRemainingAmount = (member: ActiveMember): number => {
    return member.totalAmount - member.paidAmount;
  };

  // Filter members based on search and status
  const filteredMembers = activeMembers.filter((member) => {
    const matchesSearch =
      member.leadData.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.leadData.email.toLowerCase().includes(searchTerm.toLowerCase());
    const memberStatus = getAccessStatus(member);
    const matchesFilter =
      filterStatus === "all" || memberStatus === filterStatus;

    return matchesSearch && matchesFilter;
  });

  // Calculate statistics
  const stats = {
    total: activeMembers.length,
    active: activeMembers.filter((m) => getAccessStatus(m) === "active").length,
    pending: activeMembers.filter((m) => getAccessStatus(m) === "pending")
      .length,
    expired: activeMembers.filter((m) => getAccessStatus(m) === "expired")
      .length,
    totalRevenue: activeMembers.reduce((sum, m) => sum + m.paidAmount, 0),
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute requiredPermissions={["active_members:read"]}>
      <div className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold">Miembros Activos</h1>
            <p className="text-gray-600">
              Gestiona el acceso al curso de los miembros pagados
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6 flex items-center">
            <AlertCircle className="mr-2 h-4 w-4" />
            {error}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setError(null)}
              className="ml-auto"
            >
              ×
            </Button>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Activos</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.active}
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
                  <p className="text-sm text-gray-600">Pendientes</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {stats.pending}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Expirados</p>
                  <p className="text-2xl font-bold text-red-600">
                    {stats.expired}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Ingresos</p>
                  <p className="text-2xl font-bold text-purple-600">
                    ${stats.totalRevenue.toLocaleString()}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Buscar por nombre o email..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="pending">Pendientes</option>
            <option value="expired">Expirados</option>
          </select>
        </div>

        {/* Members Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Miembro</TableHead>
                    <TableHead>Plan de Pago</TableHead>
                    <TableHead>Progreso de Pago</TableHead>
                    <TableHead>Estado de Acceso</TableHead>
                    <TableHead>Fecha de Inicio</TableHead>
                    <TableHead>Días Restantes</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member) => {
                    const status = getAccessStatus(member);
                    const paymentProgress = getPaymentProgress(member);
                    const remainingDays = getRemainingDays(member);

                    return (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {member.leadData.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {member.leadData.email}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="text-sm">
                            <div>
                              {member.paymentPlan
                                .replace("_", " ")
                                .toUpperCase()}
                            </div>
                            <div className="text-gray-500">
                              ${member.totalAmount.toLocaleString()}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>${member.paidAmount.toLocaleString()}</span>
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
                          </div>
                        </TableCell>

                        <TableCell>{getStatusBadge(status)}</TableCell>

                        <TableCell>
                          {formatDate(member.accessStartDate)}
                        </TableCell>

                        <TableCell>
                          {status === "active" ? (
                            <span className="text-green-600 font-medium">
                              {remainingDays} días
                            </span>
                          ) : status === "expired" ? (
                            <span className="text-red-600 font-medium">
                              Expirado
                            </span>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </TableCell>

                        <TableCell>
                          <div className="flex gap-2 flex-wrap">
                            {/* Add Payment Button - for users with payment edit permissions */}
                            {canEditPayments(member) &&
                              getRemainingAmount(member) > 0 && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedMemberForPayment(member);
                                    setShowPaymentModal(true);
                                  }}
                                >
                                  <Plus className="h-4 w-4 mr-1" />
                                  Agregar Pago
                                </Button>
                              )}

                            {/* Grant Access Button - Only if access not granted */}
                            {!member.accessGranted && canManageAccess() && (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      setSelectedMemberForGrant(member)
                                    }
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <Key className="h-4 w-4 mr-1" />
                                    Otorgar Acceso
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>
                                      Otorgar Acceso al Curso
                                    </DialogTitle>
                                    <DialogDescription>
                                      Otorgar acceso de 120 días al curso para{" "}
                                      {member.leadData.name}
                                    </DialogDescription>
                                  </DialogHeader>

                                  <div className="space-y-4">
                                    <div>
                                      <Label htmlFor="startDate">
                                        Fecha de Inicio
                                      </Label>
                                      <Input
                                        id="startDate"
                                        type="date"
                                        value={accessStartDate}
                                        onChange={(e) =>
                                          setAccessStartDate(e.target.value)
                                        }
                                        min={
                                          new Date().toISOString().split("T")[0]
                                        }
                                      />
                                    </div>

                                    <div className="bg-blue-50 p-3 rounded-md">
                                      <p className="text-sm text-blue-800">
                                        El acceso expirará automáticamente 120
                                        días después de la fecha de inicio.
                                      </p>
                                    </div>
                                  </div>

                                  <DialogFooter>
                                    <Button
                                      onClick={handleGrantAccess}
                                      disabled={
                                        grantingAccess || !accessStartDate
                                      }
                                    >
                                      {grantingAccess
                                        ? "Otorgando..."
                                        : "Otorgar Acceso"}
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            )}

                            {/* Update Access Button - Only if access already granted */}
                            {member.accessGranted && canManageAccess() && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedMemberForUpdate(member);
                                  // Set current start date as default
                                  if (member.accessStartDate) {
                                    const currentDate = toJsDate(
                                      member.accessStartDate
                                    );
                                    if (currentDate) {
                                      setNewAccessStartDate(
                                        currentDate.toISOString().split("T")[0]
                                      );
                                    }
                                  }
                                  setShowUpdateAccessModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <Edit3 className="h-4 w-4 mr-1" />
                                Modificar Acceso
                              </Button>
                            )}

                            {/* Revoke Access Button - Only if access granted */}
                            {member.accessGranted && canManageAccess() && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedMemberForRevoke(member);
                                  setShowRevokeDialog(true);
                                }}
                                className="text-red-600 hover:text-red-700"
                              >
                                <UserMinus className="h-4 w-4 mr-1" />
                                Revocar Acceso
                              </Button>
                            )}

                            <Button size="sm" variant="outline" asChild>
                              <a href={`/admin/leads/${member.leadId}`}>
                                <FileText className="h-4 w-4 mr-1" />
                                Ver Lead
                              </a>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {filteredMembers.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay miembros
                </h3>
                <p className="text-gray-500">
                  {searchTerm || filterStatus !== "all"
                    ? "No se encontraron miembros con los filtros aplicados."
                    : "Aún no hay miembros activos en el sistema."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Update Access Modal */}
        <Dialog
          open={showUpdateAccessModal}
          onOpenChange={setShowUpdateAccessModal}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modificar Acceso al Curso</DialogTitle>
              <DialogDescription>
                {selectedMemberForUpdate && (
                  <>
                    Actualizar las fechas de acceso para{" "}
                    {selectedMemberForUpdate.leadData.name}
                  </>
                )}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="newStartDate">Nueva Fecha de Inicio</Label>
                <Input
                  id="newStartDate"
                  type="date"
                  value={newAccessStartDate}
                  onChange={(e) => setNewAccessStartDate(e.target.value)}
                />
              </div>

              <div className="bg-amber-50 p-3 rounded-md">
                <p className="text-sm text-amber-800">
                  <Shield className="h-4 w-4 inline mr-1" />
                  Esto actualizará la fecha de inicio y recalculará
                  automáticamente la fecha de expiración (120 días después).
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowUpdateAccessModal(false);
                  setSelectedMemberForUpdate(null);
                  setNewAccessStartDate("");
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleUpdateAccess}
                disabled={updatingAccess || !newAccessStartDate}
              >
                {updatingAccess ? "Actualizando..." : "Actualizar Acceso"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Revoke Access Alert Dialog */}
        <AlertDialog open={showRevokeDialog} onOpenChange={setShowRevokeDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Revocar Acceso al Curso?</AlertDialogTitle>
              <AlertDialogDescription>
                {selectedMemberForRevoke && (
                  <>
                    Esta acción revocará el acceso al curso para{" "}
                    {selectedMemberForRevoke.leadData.name}. Esta acción no se
                    puede deshacer fácilmente.
                  </>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="revokeReason">Razón (opcional)</Label>
                <Textarea
                  id="revokeReason"
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  placeholder="Explicar por qué se revoca el acceso..."
                  rows={3}
                />
              </div>
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  setShowRevokeDialog(false);
                  setSelectedMemberForRevoke(null);
                  setRevokeReason("");
                }}
              >
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleRevokeAccess}
                disabled={revokingAccess}
                className="bg-red-600 hover:bg-red-700"
              >
                {revokingAccess ? "Revocando..." : "Revocar Acceso"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Payment Modal */}
        <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Pago</DialogTitle>
              <DialogDescription>
                {selectedMemberForPayment && (
                  <>
                    Registrar nuevo pago para{" "}
                    {selectedMemberForPayment.leadData.name}
                    <br />
                    <span className="text-sm text-gray-600">
                      Falta por pagar: $
                      {getRemainingAmount(
                        selectedMemberForPayment
                      ).toLocaleString()}
                    </span>
                  </>
                )}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleAddPayment} className="space-y-4">
              <div>
                <Label htmlFor="paymentAmount">Monto del Pago</Label>
                <Input
                  id="paymentAmount"
                  type="number"
                  step="0.01"
                  value={paymentForm.amount}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, amount: e.target.value })
                  }
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <Label htmlFor="paymentImageUrl">URL del Comprobante</Label>
                <Input
                  id="paymentImageUrl"
                  type="url"
                  value={paymentForm.imageUrl}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, imageUrl: e.target.value })
                  }
                  placeholder="https://..."
                  required
                />
              </div>

              <div>
                <Label htmlFor="paymentDescription">
                  Descripción (opcional)
                </Label>
                <Input
                  id="paymentDescription"
                  value={paymentForm.description}
                  onChange={(e) =>
                    setPaymentForm({
                      ...paymentForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Detalles del pago..."
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedMemberForPayment(null);
                    setPaymentForm({
                      amount: "",
                      imageUrl: "",
                      description: "",
                    });
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={addingPayment}>
                  {addingPayment ? "Guardando..." : "Agregar Pago"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}
