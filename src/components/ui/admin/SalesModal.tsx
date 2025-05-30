import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { createSale } from "@/lib/firebase/sales";
import { updateLead } from "@/lib/firebase/db";
import { PAYMENT_PLANS } from "@/types/sales";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DollarSign, CreditCard, AlertCircle } from "lucide-react";

interface SaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: {
    id: string;
    name: string;
    email: string;
    investment: string;
  };
  onSuccess: () => void;
}

export default function SaleModal({
  isOpen,
  onClose,
  lead,
  onSuccess,
}: SaleModalProps) {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<{
    product: "acceso_curso" | "others";
    paymentPlan: keyof typeof PAYMENT_PLANS;
    customAmount: string;
    initialPayment: string;
    notes: string;
  }>({
    product: "acceso_curso",
    paymentPlan: "1_pago",
    customAmount: "",
    initialPayment: "",
    notes: "",
  });

  const getRecommendedPlan = () => {
    const investment = lead.investment.toLowerCase();
    if (
      investment.includes("sí, tengo acceso") ||
      investment.includes("tengo dinero")
    ) {
      return "1_pago";
    } else if (investment.includes("puedo conseguirlo")) {
      return "2_pagos";
    } else {
      return "3_pagos";
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      const recommended = getRecommendedPlan();
      setFormData({
        product: "acceso_curso",
        paymentPlan: recommended as keyof typeof PAYMENT_PLANS,
        customAmount: "",
        initialPayment: "",
        notes: "",
      });
      setError(null);
    }
  }, [isOpen, lead.investment]);

  const getTotalAmount = () => {
    if (formData.customAmount) {
      return parseFloat(formData.customAmount) || 0;
    }
    return PAYMENT_PLANS[formData.paymentPlan].amount;
  };

  const getInitialPayment = () => {
    if (formData.initialPayment) {
      return parseFloat(formData.initialPayment) || 0;
    }

    const totalAmount = getTotalAmount();
    const plan = PAYMENT_PLANS[formData.paymentPlan];

    // Default initial payment based on plan
    switch (formData.paymentPlan) {
      case "1_pago":
        return totalAmount;
      case "2_pagos":
        return Math.round(totalAmount / 2);
      case "3_pagos":
        return Math.round(totalAmount / 3);
      default:
        return 0;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userProfile) {
      setError("Usuario no autenticado");
      return;
    }

    const totalAmount = getTotalAmount();
    const initialPayment = getInitialPayment();

    if (totalAmount <= 0) {
      setError("El monto total debe ser mayor a 0");
      return;
    }

    if (initialPayment > totalAmount) {
      setError("El pago inicial no puede ser mayor al monto total");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Create the sale
      const saleData = {
        leadId: lead.id,
        saleUserId: userProfile.uid,
        product: formData.product,
        paymentPlan: formData.paymentPlan,
        totalAmount,
        paidAmount: initialPayment,
        paymentProofs:
          initialPayment > 0
            ? [
                {
                  id: `initial_${Date.now()}`,
                  amount: initialPayment,
                  imageUrl: "", // Will be updated when proof is uploaded
                  uploadedAt: new Date(),
                  uploadedBy: userProfile.uid,
                  description:
                    "Pago inicial registrado en la creación de la venta",
                },
              ]
            : [],
        accessGranted: false,
        accessStartDate: null,
        accessEndDate: null,
        exemptionGranted: false,
      };

      const saleId = await createSale(saleData);

      // Update lead status to 'sale'
      await updateLead(
        lead.id,
        {
          status: "sale",
          saleId,
        },
        userProfile.uid
      );

      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error creating sale:", err);
      setError(err instanceof Error ? err.message : "Error al crear la venta");
    } finally {
      setLoading(false);
    }
  };

  const getInvestmentRecommendation = () => {
    const investment = lead.investment.toLowerCase();
    if (
      investment.includes("sí, tengo acceso") ||
      investment.includes("tengo dinero")
    ) {
      return {
        type: "success",
        message:
          "Cliente tiene acceso inmediato al dinero - Recomendado: 1 pago",
        plan: "1_pago",
      };
    } else if (investment.includes("puedo conseguirlo")) {
      return {
        type: "warning",
        message: "Cliente puede conseguir el dinero - Recomendado: 2 pagos",
        plan: "2_pagos",
      };
    } else {
      return {
        type: "info",
        message: "Cliente necesita tiempo - Recomendado: 3 pagos",
        plan: "3_pagos",
      };
    }
  };

  const recommendation = getInvestmentRecommendation();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <DollarSign className="mr-2 h-5 w-5 text-green-600" />
            Crear Venta
          </DialogTitle>
          <DialogDescription>
            Convertir lead a venta para {lead.name}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-md flex items-center text-sm">
            <AlertCircle className="mr-2 h-4 w-4" />
            {error}
          </div>
        )}

        {/* Investment Analysis */}
        <div
          className={`p-3 rounded-md text-sm ${
            recommendation.type === "success"
              ? "bg-green-50 text-green-800"
              : recommendation.type === "warning"
              ? "bg-yellow-50 text-yellow-800"
              : "bg-blue-50 text-blue-800"
          }`}
        >
          <p className="font-medium">Análisis de Inversión:</p>
          <p>"{lead.investment}"</p>
          <p className="mt-1 font-medium">{recommendation.message}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product Selection */}
          <div>
            <Label htmlFor="product">Producto</Label>
            <Select
              value={formData.product}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  product: value as "acceso_curso" | "others",
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="acceso_curso">
                  Acceso al Curso (120 días)
                </SelectItem>
                <SelectItem value="others">Otro Producto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payment Plan */}
          <div>
            <Label htmlFor="paymentPlan">Plan de Pago</Label>
            <Select
              value={formData.paymentPlan}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  paymentPlan: value as keyof typeof PAYMENT_PLANS,
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PAYMENT_PLANS).map(([key, plan]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center justify-between w-full">
                      <span>{plan.label}</span>
                      {key === recommendation.plan && (
                        <span className="ml-2 text-xs bg-green-100 text-green-600 px-1 rounded">
                          Recomendado
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Amount */}
          <div>
            <Label htmlFor="customAmount">Monto Personalizado (opcional)</Label>
            <Input
              id="customAmount"
              type="number"
              placeholder={`Predeterminado: $${
                PAYMENT_PLANS[formData.paymentPlan].amount
              }`}
              value={formData.customAmount}
              onChange={(e) =>
                setFormData({ ...formData, customAmount: e.target.value })
              }
              min="0"
              step="0.01"
            />
          </div>

          {/* Initial Payment */}
          <div>
            <Label htmlFor="initialPayment">Pago Inicial</Label>
            <Input
              id="initialPayment"
              type="number"
              placeholder={`Sugerido: $${getInitialPayment()}`}
              value={formData.initialPayment}
              onChange={(e) =>
                setFormData({ ...formData, initialPayment: e.target.value })
              }
              min="0"
              max={getTotalAmount()}
              step="0.01"
            />
            <p className="text-xs text-gray-500 mt-1">
              Monto total: ${getTotalAmount().toLocaleString()}
            </p>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Detalles adicionales sobre la venta..."
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>Creando...</>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Crear Venta
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
