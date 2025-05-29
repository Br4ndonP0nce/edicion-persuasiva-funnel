// src/components/ui/admin/SaleModal.tsx
"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { createSale, addPaymentProof } from "@/lib/firebase/sales";
import { PAYMENT_PLANS } from "@/types/sales";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Upload, DollarSign, CreditCard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadId: string;
  leadName: string;
  onSaleCreated: () => void;
}

interface PaymentProofData {
  amount: number;
  imageFile: File | null;
  description: string;
}

export const SaleModal: React.FC<SaleModalProps> = ({
  isOpen,
  onClose,
  leadId,
  leadName,
  onSaleCreated,
}) => {
  const { userProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form data
  const [product, setProduct] = useState<"acceso_curso" | "others">(
    "acceso_curso"
  );
  const [paymentPlan, setPaymentPlan] = useState<
    "1_pago" | "2_pagos" | "3_pagos"
  >("1_pago");
  const [customAmount, setCustomAmount] = useState<number>(0);
  const [paymentProofs, setPaymentProofs] = useState<PaymentProofData[]>([
    { amount: 0, imageFile: null, description: "" },
  ]);

  const resetForm = () => {
    setStep(1);
    setProduct("acceso_curso");
    setPaymentPlan("1_pago");
    setCustomAmount(0);
    setPaymentProofs([{ amount: 0, imageFile: null, description: "" }]);
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const getTotalAmount = () => {
    if (product === "others") return customAmount;
    return PAYMENT_PLANS[paymentPlan].amount;
  };

  const getMinimumPaymentRequired = () => {
    const total = getTotalAmount();
    return Math.ceil(total * 0.5); // At least 50%
  };

  const getTotalPaymentAmount = () => {
    return paymentProofs.reduce((sum, proof) => sum + (proof.amount || 0), 0);
  };

  const addPaymentProof = () => {
    setPaymentProofs([
      ...paymentProofs,
      { amount: 0, imageFile: null, description: "" },
    ]);
  };

  const removePaymentProof = (index: number) => {
    if (paymentProofs.length > 1) {
      setPaymentProofs(paymentProofs.filter((_, i) => i !== index));
    }
  };

  const updatePaymentProof = (
    index: number,
    field: keyof PaymentProofData,
    value: any
  ) => {
    const updated = [...paymentProofs];
    updated[index] = { ...updated[index], [field]: value };
    setPaymentProofs(updated);
  };

  const handleFileUpload = async (file: File): Promise<string> => {
    // In a real implementation, you'd upload to Firebase Storage or similar
    // For now, we'll simulate with a placeholder
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`/uploads/payment_proof_${Date.now()}_${file.name}`);
      }, 1000);
    });
  };

  const validateStep1 = () => {
    if (product === "others" && customAmount <= 0) {
      setError("Please enter a valid amount for custom product");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const totalPayment = getTotalPaymentAmount();
    const minimumRequired = getMinimumPaymentRequired();

    if (totalPayment < minimumRequired) {
      setError(`Minimum payment required: $${minimumRequired} (50% of total)`);
      return false;
    }

    // Check that all proofs have files
    const hasAllFiles = paymentProofs.every(
      (proof) => proof.imageFile !== null && proof.amount > 0
    );
    if (!hasAllFiles) {
      setError("Please provide amount and upload proof image for all payments");
      return false;
    }

    return true;
  };

  const handleNext = () => {
    setError(null);
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep2() || !userProfile) return;

    setIsLoading(true);
    setError(null);

    try {
      // Upload payment proof images
      const uploadedProofs = await Promise.all(
        paymentProofs.map(async (proof) => {
          if (!proof.imageFile) throw new Error("Missing payment proof file");

          const imageUrl = await handleFileUpload(proof.imageFile);
          return {
            amount: proof.amount,
            imageUrl,
            description: proof.description,
            uploadedBy: userProfile.uid,
          };
        })
      );

      const totalPaid = uploadedProofs.reduce(
        (sum, proof) => sum + proof.amount,
        0
      );

      // Create sale
      const saleData = {
        leadId,
        saleUserId: userProfile.uid,
        product,
        paymentPlan: product === "others" ? "custom" : paymentPlan,
        totalAmount: getTotalAmount(),
        paidAmount: totalPaid,
        paymentProofs: uploadedProofs.map((proof, index) => ({
          id: `proof_${Date.now()}_${index}`,
          ...proof,
          uploadedAt: new Date(),
        })),
        accessGranted: false,
        accessStartDate: null,
        accessEndDate: null,
        exemptionGranted: false,
      };

      await createSale(saleData);
      onSaleCreated();
      handleClose();
    } catch (err) {
      console.error("Error creating sale:", err);
      setError(err instanceof Error ? err.message : "Failed to create sale");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl">
                Create Sale - {leadName}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Progress indicator */}
              <div className="flex items-center space-x-4">
                <div
                  className={`flex items-center ${
                    step >= 1 ? "text-blue-600" : "text-gray-400"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                      step >= 1
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-gray-300"
                    }`}
                  >
                    1
                  </div>
                  <span className="ml-2">Product & Payment</span>
                </div>
                <div className="flex-1 h-0.5 bg-gray-200">
                  <div
                    className={`h-full transition-all duration-300 ${
                      step >= 2 ? "bg-blue-600 w-full" : "bg-gray-200 w-0"
                    }`}
                  />
                </div>
                <div
                  className={`flex items-center ${
                    step >= 2 ? "text-blue-600" : "text-gray-400"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                      step >= 2
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-gray-300"
                    }`}
                  >
                    2
                  </div>
                  <span className="ml-2">Payment Proof</span>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                  {error}
                </div>
              )}

              {/* Step 1: Product Selection */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="product">Product</Label>
                    <select
                      id="product"
                      value={product}
                      onChange={(e) =>
                        setProduct(e.target.value as "acceso_curso" | "others")
                      }
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="acceso_curso">Acceso a Curso</option>
                      <option value="others">Others</option>
                    </select>
                  </div>

                  {product === "acceso_curso" && (
                    <div>
                      <Label htmlFor="paymentPlan">Payment Plan</Label>
                      <div className="grid grid-cols-1 gap-3 mt-2">
                        {Object.entries(PAYMENT_PLANS).map(([key, plan]) => (
                          <label
                            key={key}
                            className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                              paymentPlan === key
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <input
                              type="radio"
                              name="paymentPlan"
                              value={key}
                              checked={paymentPlan === key}
                              onChange={(e) =>
                                setPaymentPlan(e.target.value as any)
                              }
                              className="mr-3"
                            />
                            <div className="flex items-center">
                              <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                              <div>
                                <div className="font-medium">{plan.label}</div>
                                <div className="text-sm text-gray-500">
                                  {plan.payments} payment
                                  {plan.payments > 1 ? "s" : ""}
                                </div>
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {product === "others" && (
                    <div>
                      <Label htmlFor="customAmount">Custom Amount ($)</Label>
                      <Input
                        id="customAmount"
                        type="number"
                        value={customAmount}
                        onChange={(e) =>
                          setCustomAmount(Number(e.target.value))
                        }
                        placeholder="Enter amount"
                        className="mt-1"
                      />
                    </div>
                  )}

                  <div className="bg-blue-50 p-4 rounded-md">
                    <div className="flex items-center text-blue-800">
                      <CreditCard className="h-5 w-5 mr-2" />
                      <div>
                        <div className="font-medium">
                          Total Amount: ${getTotalAmount()}
                        </div>
                        <div className="text-sm">
                          Minimum payment required: $
                          {getMinimumPaymentRequired()} (50%)
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Payment Proofs */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Payment Proofs</h3>
                    <div className="space-y-4">
                      {paymentProofs.map((proof, index) => (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium">Payment {index + 1}</h4>
                            {paymentProofs.length > 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removePaymentProof(index)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor={`amount-${index}`}>
                                Amount ($)
                              </Label>
                              <Input
                                id={`amount-${index}`}
                                type="number"
                                value={proof.amount || ""}
                                onChange={(e) =>
                                  updatePaymentProof(
                                    index,
                                    "amount",
                                    Number(e.target.value)
                                  )
                                }
                                placeholder="0"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`description-${index}`}>
                                Description (Optional)
                              </Label>
                              <Input
                                id={`description-${index}`}
                                value={proof.description}
                                onChange={(e) =>
                                  updatePaymentProof(
                                    index,
                                    "description",
                                    e.target.value
                                  )
                                }
                                placeholder="e.g., First payment"
                              />
                            </div>
                          </div>

                          <div className="mt-4">
                            <Label htmlFor={`file-${index}`}>
                              Payment Proof Image
                            </Label>
                            <div className="mt-2 flex items-center space-x-4">
                              <input
                                id={`file-${index}`}
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0] || null;
                                  updatePaymentProof(index, "imageFile", file);
                                }}
                                className="hidden"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                  document
                                    .getElementById(`file-${index}`)
                                    ?.click()
                                }
                                className="flex items-center"
                              >
                                <Upload className="h-4 w-4 mr-2" />
                                {proof.imageFile
                                  ? "Change Image"
                                  : "Upload Image"}
                              </Button>
                              {proof.imageFile && (
                                <span className="text-sm text-green-600">
                                  ✓ {proof.imageFile.name}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      onClick={addPaymentProof}
                      className="w-full mt-4"
                    >
                      Add Another Payment Proof
                    </Button>
                  </div>

                  <div className="bg-green-50 p-4 rounded-md">
                    <div className="flex items-center justify-between text-green-800">
                      <div>
                        <div className="font-medium">
                          Total Payments: ${getTotalPaymentAmount()}
                        </div>
                        <div className="text-sm">
                          Required: ${getMinimumPaymentRequired()} | Total Sale:
                          ${getTotalAmount()}
                        </div>
                      </div>
                      {getTotalPaymentAmount() >=
                        getMinimumPaymentRequired() && (
                        <div className="text-green-600">✓ Minimum Met</div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex justify-between pt-6 border-t">
                <div>
                  {step === 2 && (
                    <Button variant="outline" onClick={() => setStep(1)}>
                      Back
                    </Button>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                  {step === 1 ? (
                    <Button onClick={handleNext}>Next</Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={isLoading}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isLoading ? "Creating Sale..." : "Create Sale"}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
