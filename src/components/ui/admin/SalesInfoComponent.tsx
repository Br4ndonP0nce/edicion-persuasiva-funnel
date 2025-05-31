import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Lead } from "@/lib/firebase/db";
import { getSaleByLeadId, addPaymentProof } from "@/lib/firebase/sales";
import { uploadPaymentProof } from "@/lib/firebase/storage";
import { Sale, PaymentProof } from "@/types/sales";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/ui/FileUpload";
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
  DollarSign,
  CreditCard,
  Calendar,
  FileImage,
  CheckCircle,
  Clock,
  Upload,
  Eye,
  AlertCircle,
  TrendingUp,
  UserCheck,
} from "lucide-react";

interface SalesInfoComponentProps {
  lead: Lead | null;
  onLeadUpdate?: () => void;
  isLoading?: boolean;
}

export default function SalesInfoComponent({
  lead,
  onLeadUpdate,
  isLoading = false,
}: SalesInfoComponentProps) {
  const { userProfile, hasPermission } = useAuth();
  const [sale, setSale] = useState<Sale | null>(null);
  const [loadingSale, setLoadingSale] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [uploadingPayment, setUploadingPayment] = useState(false);

  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    description: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

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

  const loadSaleData = async () => {
    if (!lead?.id) return;

    try {
      setLoadingSale(true);
      const saleData = await getSaleByLeadId(lead.id);
      setSale(saleData);
    } catch (error) {
      console.error("Error loading sale data:", error);
    } finally {
      setLoadingSale(false);
    }
  };

  // Load sale data when lead changes and has sale status
  useEffect(() => {
    if (lead && lead.status === "sale" && lead.saleId) {
      loadSaleData();
    } else {
      setSale(null);
    }
  }, [lead?.id, lead?.status, lead?.saleId]);

  const canEditPayments = () => {
    if (!userProfile || !sale) return false;

    // Super admin and admin can always edit
    if (userProfile.role === "super_admin" || userProfile.role === "admin") {
      return true;
    }

    // Check if current user is the one who made the sale
    if (sale.saleUserId === userProfile.uid) {
      return true;
    }

    return false;
  };

  const handleAddPaymentProof = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!sale || !userProfile || !paymentForm.amount || !selectedFile) {
      setUploadError("Por favor completa todos los campos requeridos");
      return;
    }

    try {
      setUploadingPayment(true);
      setUploadingFile(true);
      setUploadError(null);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Upload file to Firebase Storage
      const imageUrl = await uploadPaymentProof(
        selectedFile,
        sale.id!,
        userProfile.uid
      );

      // Complete progress
      clearInterval(progressInterval);
      setUploadProgress(100);

      const paymentProof: Omit<PaymentProof, "id" | "uploadedAt"> = {
        amount: parseFloat(paymentForm.amount),
        imageUrl,
        uploadedBy: userProfile.uid,
        description: paymentForm.description,
      };

      await addPaymentProof(sale.id!, paymentProof, userProfile.uid);

      // Reload sale data
      await loadSaleData();

      // Reset form and close modal
      setPaymentForm({ amount: "", description: "" });
      setSelectedFile(null);
      setUploadProgress(0);
      setShowPaymentModal(false);

      if (onLeadUpdate) onLeadUpdate();
    } catch (error) {
      console.error("Error adding payment proof:", error);
      setUploadError(
        error instanceof Error ? error.message : "Failed to add payment"
      );
    } finally {
      setUploadingPayment(false);
      setUploadingFile(false);
    }
  };

  const formatDate = (date: any): string => {
    const jsDate = toJsDate(date);
    if (!jsDate) return "N/A";

    return jsDate.toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPaymentProgress = () => {
    if (!sale) return 0;
    return (sale.paidAmount / sale.totalAmount) * 100;
  };

  const getRemainingAmount = () => {
    if (!sale) return 0;
    return sale.totalAmount - sale.paidAmount;
  };

  const getAccessStatus = () => {
    if (!sale) return null;

    if (!sale.accessGranted) return "pending";

    if (sale.accessEndDate) {
      const endDate = toJsDate(sale.accessEndDate);
      if (endDate) {
        const now = new Date();
        return now > endDate ? "expired" : "active";
      }
    }

    return "granted_no_date";
  };

  const getRemainingDays = () => {
    if (!sale?.accessEndDate) return null;

    const endDate = toJsDate(sale.accessEndDate);
    if (!endDate) return null;

    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getAccessStatusBadge = () => {
    const status = getAccessStatus();
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800">Acceso Activo</Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            Pendiente de Acceso
          </Badge>
        );
      case "expired":
        return (
          <Badge className="bg-red-100 text-red-800">Acceso Expirado</Badge>
        );
      case "granted_no_date":
        return (
          <Badge className="bg-blue-100 text-blue-800">Acceso Otorgado</Badge>
        );
      default:
        return null;
    }
  };

  // Show loading state if parent is still loading the lead
  if (isLoading) {
    return (
      <Card className="mt-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
            <span className="ml-2">Cargando información...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Early return if lead doesn't exist
  if (!lead) {
    return null;
  }

  // If lead is not a sale, return basic info
  if (lead.status !== "sale") {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5" />
            Información de Venta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-gray-500">
            <CreditCard className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>Este lead aún no ha sido convertido a venta.</p>
            {lead.status === "onboarding" && hasPermission("leads:write") && (
              <p className="text-sm mt-2">
                Puedes crear una venta desde la tabla de leads.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loadingSale) {
    return (
      <Card className="mt-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
            <span className="ml-2">Cargando información de venta...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!sale) {
    return (
      <Card className="mt-6">
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>Error al cargar la información de venta.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mt-6 space-y-6">
      {/* Sale Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <DollarSign className="mr-2 h-5 w-5 text-green-600" />
              Información de Venta
            </div>
            {getAccessStatusBadge()}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Payment Progress */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>Progreso de Pago</Label>
              <span className="text-sm font-medium">
                ${sale.paidAmount.toLocaleString()} / $
                {sale.totalAmount.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
              <div
                className="bg-green-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(getPaymentProgress(), 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>{getPaymentProgress().toFixed(1)}% completado</span>
              <span>Falta: ${getRemainingAmount().toLocaleString()}</span>
            </div>
          </div>

          {/* Sale Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-gray-500">Producto</Label>
                <p className="font-medium">
                  {sale.product === "acceso_curso"
                    ? "Acceso al Curso (120 días)"
                    : "Otro Producto"}
                </p>
              </div>

              <div>
                <Label className="text-sm text-gray-500">Plan de Pago</Label>
                <p className="font-medium">
                  {sale.paymentPlan.replace("_", " ").toUpperCase()}
                </p>
              </div>

              <div>
                <Label className="text-sm text-gray-500">Monto Total</Label>
                <p className="font-medium text-lg text-green-600">
                  ${sale.totalAmount.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm text-gray-500">Fecha de Venta</Label>
                <p className="font-medium">{formatDate(sale.createdAt)}</p>
              </div>

              <div>
                <Label className="text-sm text-gray-500">
                  Estado de Acceso
                </Label>
                <div className="space-y-1">
                  {getAccessStatusBadge()}
                  {sale.accessStartDate && (
                    <p className="text-sm text-gray-600">
                      Inicio: {formatDate(sale.accessStartDate)}
                    </p>
                  )}
                  {sale.accessEndDate && (
                    <p className="text-sm text-gray-600">
                      {getAccessStatus() === "active"
                        ? `Faltan ${getRemainingDays()} días`
                        : `Expiró: ${formatDate(sale.accessEndDate)}`}
                    </p>
                  )}
                </div>
              </div>

              {sale.exemptionGranted && (
                <div>
                  <Label className="text-sm text-gray-500">
                    Exención Otorgada
                  </Label>
                  <div className="space-y-1">
                    <Badge className="bg-blue-100 text-blue-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Exención Activa
                    </Badge>
                    {sale.exemptionReason && (
                      <p className="text-sm text-gray-600">
                        {sale.exemptionReason}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Proofs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <FileImage className="mr-2 h-5 w-5" />
              Comprobantes de Pago ({sale.paymentProofs.length})
            </div>
            {canEditPayments() && (
              <Dialog
                open={showPaymentModal}
                onOpenChange={setShowPaymentModal}
              >
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Upload className="mr-2 h-4 w-4" />
                    Agregar Comprobante
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Agregar Comprobante de Pago</DialogTitle>
                    <DialogDescription>
                      Registra un nuevo pago para {lead.name}
                    </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleAddPaymentProof} className="space-y-4">
                    <div>
                      <Label htmlFor="amount">Monto del Pago</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        value={paymentForm.amount}
                        onChange={(e) =>
                          setPaymentForm({
                            ...paymentForm,
                            amount: e.target.value,
                          })
                        }
                        placeholder="0.00"
                        required
                        disabled={uploadingPayment}
                      />
                    </div>

                    <div>
                      <Label htmlFor="paymentProof">Comprobante de Pago</Label>
                      <FileUpload
                        onFileSelected={(file) => {
                          setSelectedFile(file);
                          setUploadError(null);
                        }}
                        onFileRemoved={() => {
                          setSelectedFile(null);
                          setUploadError(null);
                        }}
                        isUploading={uploadingFile}
                        uploadProgress={uploadProgress}
                        disabled={uploadingPayment}
                        maxSize={5}
                        placeholder="Selecciona el comprobante de pago"
                        error={uploadError || undefined}
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">
                        Descripción (opcional)
                      </Label>
                      <Textarea
                        id="description"
                        value={paymentForm.description}
                        onChange={(e) =>
                          setPaymentForm({
                            ...paymentForm,
                            description: e.target.value,
                          })
                        }
                        placeholder="Detalles del pago..."
                        rows={3}
                        disabled={uploadingPayment}
                      />
                    </div>

                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowPaymentModal(false);
                          setPaymentForm({ amount: "", description: "" });
                          setSelectedFile(null);
                          setUploadProgress(0);
                          setUploadError(null);
                        }}
                        disabled={uploadingPayment}
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        disabled={
                          uploadingPayment ||
                          !selectedFile ||
                          !paymentForm.amount
                        }
                      >
                        {uploadingPayment
                          ? "Guardando..."
                          : "Guardar Comprobante"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sale.paymentProofs.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <FileImage className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No hay comprobantes de pago registrados.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sale.paymentProofs.map((proof, index) => (
                <div
                  key={proof.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium">
                        ${proof.amount.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(proof.uploadedAt)}
                      </div>
                      {proof.description && (
                        <div className="text-sm text-gray-600 mt-1">
                          {proof.description}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {proof.imageUrl && (
                      <Button size="sm" variant="outline" asChild>
                        <a
                          href={proof.imageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver Imagen
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      {hasPermission("active_members:read") && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <UserCheck className="h-5 w-5 text-purple-600" />
                <div>
                  <div className="font-medium">Gestión de Miembros Activos</div>
                  <div className="text-sm text-gray-500">
                    Ver y gestionar el acceso al curso
                  </div>
                </div>
              </div>
              <Button variant="outline" asChild>
                <a href="/admin/activos">Ver en Activos</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
