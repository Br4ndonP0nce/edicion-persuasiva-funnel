import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Lead, updateLead } from "@/lib/firebase/db";
import { getSaleByLeadId } from "@/lib/firebase/sales";
import { Sale } from "@/types/sales";
import SaleModal from "./SalesModal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Eye,
  MoreVertical,
  DollarSign,
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  User,
  Edit2,
  FileText,
  Lock,
} from "lucide-react";

interface EnhancedLeadTableProps {
  leads: Lead[];
  onStatusChange: (leadId: string, newStatus: Lead["status"]) => void;
}

export default function EnhancedLeadTable({
  leads,
  onStatusChange,
}: EnhancedLeadTableProps) {
  const { hasPermission, userProfile } = useAuth();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [salesData, setSalesData] = useState<Record<string, Sale>>({});
  const [loadingSales, setLoadingSales] = useState<Record<string, boolean>>({});
  const [updatingStatus, setUpdatingStatus] = useState<Record<string, boolean>>(
    {}
  );

  // Handle actual database status updates
  const handleStatusChange = async (
    leadId: string,
    newStatus: Lead["status"]
  ) => {
    if (!userProfile || updatingStatus[leadId]) return;

    try {
      setUpdatingStatus((prev) => ({ ...prev, [leadId]: true }));

      // Update in database
      await updateLead(leadId, { status: newStatus }, userProfile.uid);

      // Update local state through parent component
      onStatusChange(leadId, newStatus);
    } catch (error) {
      console.error("Error updating lead status:", error);
      // Could add toast notification here
    } finally {
      setUpdatingStatus((prev) => ({ ...prev, [leadId]: false }));
    }
  };

  // Load sale data for leads with sales
  const loadSaleData = async (leadId: string) => {
    if (salesData[leadId] || loadingSales[leadId]) return;

    setLoadingSales((prev) => ({ ...prev, [leadId]: true }));
    try {
      const sale = await getSaleByLeadId(leadId);
      if (sale) {
        setSalesData((prev) => ({ ...prev, [leadId]: sale }));
      }
    } catch (error) {
      console.error("Error loading sale data:", error);
    } finally {
      setLoadingSales((prev) => ({ ...prev, [leadId]: false }));
    }
  };

  React.useEffect(() => {
    // Load sales data for leads with sale status
    leads.forEach((lead) => {
      if (lead.status === "sale" && lead.saleId) {
        loadSaleData(lead.id!);
      }
    });
  }, [leads]);

  const getStatusColor = (status: Lead["status"]) => {
    switch (status) {
      case "lead":
        return "bg-blue-100 text-blue-800";
      case "onboarding":
        return "bg-amber-100 text-amber-800";
      case "sale":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: Lead["status"]) => {
    switch (status) {
      case "lead":
        return <User className="h-3 w-3" />;
      case "onboarding":
        return <Clock className="h-3 w-3" />;
      case "sale":
        return <CheckCircle className="h-3 w-3" />;
      case "rejected":
        return <XCircle className="h-3 w-3" />;
      default:
        return <User className="h-3 w-3" />;
    }
  };

  const getStatusLabel = (status: Lead["status"]) => {
    switch (status) {
      case "lead":
        return "Nuevo Lead";
      case "onboarding":
        return "En Onboarding";
      case "sale":
        return "Venta";
      case "rejected":
        return "Rechazado";
      default:
        return status;
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat("es-MX", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const handleCreateSale = (lead: Lead) => {
    // If lead already has a sale, don't create another one
    if (lead.status === "sale" && lead.saleId) {
      return;
    }

    setSelectedLead(lead);
    setShowSaleModal(true);
  };

  const handleSaleCreated = () => {
    // Refresh the leads data through parent component
    // The parent should refetch the leads to get updated data
    window.location.reload(); // Simple refresh - in production, the parent should handle this
  };

  const getSaleInfo = (lead: Lead) => {
    if (lead.status !== "sale" || !lead.saleId) return null;
    return salesData[lead.id!];
  };

  const getPaymentProgress = (sale: Sale) => {
    return (sale.paidAmount / sale.totalAmount) * 100;
  };

  /**
   * Determine which status transitions are allowed based on current status
   */
  const getAllowedStatusTransitions = (
    currentStatus: Lead["status"]
  ): Lead["status"][] => {
    switch (currentStatus) {
      case "lead":
        return ["onboarding", "rejected"];
      case "onboarding":
        return ["lead", "rejected"]; // sale transition happens via "Create Sale" button
      case "sale":
        return []; // NO status changes allowed once it's a sale
      case "rejected":
        return ["lead", "onboarding"];
      default:
        return [];
    }
  };

  /**
   * Check if any status changes are allowed for this lead
   */
  const canChangeStatus = (lead: Lead): boolean => {
    // No status changes allowed for sales
    if (lead.status === "sale") return false;

    // Check if user has permission
    if (!hasPermission("leads:write")) return false;

    // Check if there are any allowed transitions
    return getAllowedStatusTransitions(lead.status).length > 0;
  };

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contacto</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Inversion/Ventas</TableHead>
              <TableHead>Rol/Software</TableHead>
              <TableHead>Creado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead) => {
              const sale = getSaleInfo(lead);
              const isLoadingSale = loadingSales[lead.id!];
              const allowedTransitions = getAllowedStatusTransitions(
                lead.status
              );

              return (
                <TableRow
                  key={lead.id}
                  className={`hover:bg-gray-50 ${
                    updatingStatus[lead.id!] ? "opacity-50" : ""
                  }`}
                >
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-purple-100 text-purple-700 text-xs">
                          {lead.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">{lead.name}</div>
                        <div className="text-xs text-gray-500">
                          {lead.email}
                        </div>
                        <div className="text-xs text-gray-500">
                          {lead.phone}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={`${getStatusColor(
                          lead.status
                        )} flex items-center gap-1 w-fit`}
                      >
                        {getStatusIcon(lead.status)}
                        {getStatusLabel(lead.status)}
                      </Badge>
                      {/* Show lock icon for sales to indicate no changes allowed */}
                      {lead.status === "sale" && (
                        <Lock className="h-3 w-3 text-gray-400" />
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-2">
                      {/* Investment Info (Lead Temperature) - Always Show */}
                      <div className="space-y-1">
                        <div className="text-xs text-gray-500">Inversión:</div>
                        <div className="text-xs text-gray-600 max-w-xs truncate">
                          {lead.investment}
                        </div>
                        <div
                          className={`text-xs px-2 py-1 rounded-full font-medium ${
                            lead.investment
                              .toLowerCase()
                              .includes("sí, tengo acceso") ||
                            lead.investment
                              .toLowerCase()
                              .includes("tengo dinero")
                              ? "bg-red-100 text-red-700" // Hot lead
                              : lead.investment
                                  .toLowerCase()
                                  .includes("puedo conseguirlo")
                              ? "bg-yellow-100 text-yellow-700" // Warm lead
                              : "bg-blue-100 text-blue-700" // Cold lead
                          }`}
                        >
                          {lead.investment
                            .toLowerCase()
                            .includes("sí, tengo acceso") ||
                          lead.investment.toLowerCase().includes("tengo dinero")
                            ? "🔥Alto"
                            : lead.investment
                                .toLowerCase()
                                .includes("puedo conseguirlo")
                            ? "🟡 Medio"
                            : "❄️ Bajo"}
                        </div>
                      </div>

                      {/* Sales Info - Only for sales */}
                      {lead.status === "sale" && (
                        <div className="border-t pt-2 space-y-1">
                          {isLoadingSale ? (
                            <div className="text-xs text-gray-500">
                              Cargando venta...
                            </div>
                          ) : sale ? (
                            <>
                              <div className="text-sm font-medium">
                                ${sale.totalAmount.toLocaleString()}
                              </div>
                              <div className="text-xs text-gray-600">
                                Plan:{" "}
                                {sale.paymentPlan
                                  .replace("_", " ")
                                  .toUpperCase()}
                              </div>
                              <div className="text-xs">
                                <div className="flex justify-between items-center">
                                  <span>
                                    Pagado: ${sale.paidAmount.toLocaleString()}
                                  </span>
                                  <span className="text-green-600">
                                    {getPaymentProgress(sale).toFixed(0)}%
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                                  <div
                                    className="bg-green-500 h-1 rounded-full"
                                    style={{
                                      width: `${Math.min(
                                        getPaymentProgress(sale),
                                        100
                                      )}%`,
                                    }}
                                  />
                                </div>
                              </div>
                              {sale.accessGranted && (
                                <Badge className="bg-green-100 text-green-800 text-xs">
                                  Acceso Otorgado
                                </Badge>
                              )}
                            </>
                          ) : (
                            <div className="text-xs text-red-500">
                              Error cargando venta
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{lead.role}</div>
                      <div className="text-xs text-gray-500">
                        {lead.software}
                      </div>
                      <div className="text-xs text-gray-500">
                        Nivel: {lead.level}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="text-xs text-gray-500">
                      {formatDate(lead.createdAt)}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      {/* View Button */}
                      <Button size="sm" variant="ghost" asChild>
                        <a href={`/admin/leads/${lead.id}`}>
                          <Eye className="h-4 w-4" />
                        </a>
                      </Button>

                      {/* Actions Dropdown */}
                      {hasPermission("leads:write") && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {/* Create Sale Option - Only for onboarding */}
                            {lead.status === "onboarding" && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => handleCreateSale(lead)}
                                  className="flex items-center"
                                >
                                  <DollarSign className="mr-2 h-4 w-4 text-green-600" />
                                  Crear Venta
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                              </>
                            )}

                            {/* Status Change Options - Only if transitions are allowed */}
                            {canChangeStatus(lead) &&
                              allowedTransitions.length > 0 && (
                                <>
                                  {allowedTransitions.map((targetStatus) => {
                                    const getStatusActionData = (
                                      status: Lead["status"]
                                    ) => {
                                      switch (status) {
                                        case "lead":
                                          return {
                                            icon: User,
                                            label: "Marcar como Lead",
                                            color: "text-blue-600",
                                          };
                                        case "onboarding":
                                          return {
                                            icon: Clock,
                                            label: "Iniciar Onboarding",
                                            color: "text-amber-600",
                                          };
                                        case "rejected":
                                          return {
                                            icon: XCircle,
                                            label: "Rechazar",
                                            color: "text-red-600",
                                          };
                                        default:
                                          return {
                                            icon: User,
                                            label: status,
                                            color: "text-gray-600",
                                          };
                                      }
                                    };

                                    const actionData =
                                      getStatusActionData(targetStatus);
                                    const IconComponent = actionData.icon;

                                    return (
                                      <DropdownMenuItem
                                        key={targetStatus}
                                        onClick={() =>
                                          handleStatusChange(
                                            lead.id!,
                                            targetStatus
                                          )
                                        }
                                        className={`flex items-center ${actionData.color}`}
                                        disabled={updatingStatus[lead.id!]}
                                      >
                                        <IconComponent className="mr-2 h-4 w-4" />
                                        {updatingStatus[lead.id!]
                                          ? "Actualizando..."
                                          : actionData.label}
                                      </DropdownMenuItem>
                                    );
                                  })}
                                  <DropdownMenuSeparator />
                                </>
                              )}

                            {/* Sale is locked - show info */}
                            {lead.status === "sale" && (
                              <>
                                <DropdownMenuItem
                                  disabled
                                  className="flex items-center text-gray-500"
                                >
                                  <Lock className="mr-2 h-4 w-4" />
                                  Estado bloqueado (venta)
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                              </>
                            )}

                            {/* Edit Notes */}
                            <DropdownMenuItem asChild>
                              <a
                                href={`/admin/leads/${lead.id}`}
                                className="flex items-center"
                              >
                                <Edit2 className="mr-2 h-4 w-4 text-gray-600" />
                                Editar Notas
                              </a>
                            </DropdownMenuItem>

                            {/* View Details */}
                            <DropdownMenuItem asChild>
                              <a
                                href={`/admin/leads/${lead.id}`}
                                className="flex items-center"
                              >
                                <FileText className="mr-2 h-4 w-4 text-gray-600" />
                                Ver Detalles
                              </a>
                            </DropdownMenuItem>

                            {/* View Sale Details - only show if there's sale data */}
                            {lead.status === "sale" && sale && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                  <a
                                    href={`/admin/activos`}
                                    className="flex items-center"
                                  >
                                    <CreditCard className="mr-2 h-4 w-4 text-purple-600" />
                                    Ver en Activos
                                  </a>
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Sale Creation Modal */}
      {selectedLead && (
        <SaleModal
          isOpen={showSaleModal}
          onClose={() => {
            setShowSaleModal(false);
            setSelectedLead(null);
          }}
          lead={{
            id: selectedLead.id!,
            name: selectedLead.name,
            email: selectedLead.email,
            investment: selectedLead.investment,
          }}
          onSuccess={handleSaleCreated}
        />
      )}

      {/* Empty State */}
      {leads.length === 0 && (
        <div className="text-center py-12">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay leads
          </h3>
          <p className="text-gray-500">
            Los leads aparecerán aquí una vez que se registren.
          </p>
        </div>
      )}
    </>
  );
}
