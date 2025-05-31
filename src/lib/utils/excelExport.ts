// src/lib/utils/excelExport.ts
import * as XLSX from 'xlsx';
import { Lead } from '@/lib/firebase/db';
import { getSaleByLeadId } from '@/lib/firebase/sales';
import { Sale } from '@/types/sales';
import { toJsDate } from '@/lib/utils';

export interface EnhancedLeadExportData {
  lead: Lead;
  sale?: Sale | null;
}

/**
 * Enhanced export function that includes payment data
 */
export const exportLeadsToExcel = async (
  leads: Lead[],
  filename?: string
): Promise<void> => {
  try {
    // Show loading indicator (you can implement this in the UI)
    console.log('Preparing export data...');

    // Fetch sale data for leads with sales
    const enhancedLeads: EnhancedLeadExportData[] = await Promise.all(
      leads.map(async (lead) => {
        let sale: Sale | null = null;
        
        if (lead.status === 'sale' && lead.saleId) {
          try {
            sale = await getSaleByLeadId(lead.id!);
          } catch (error) {
            console.warn(`Could not fetch sale data for lead ${lead.id}:`, error);
          }
        }
        
        return { lead, sale };
      })
    );

    // Prepare data for Excel
    const excelData = enhancedLeads.map((item) => {
      const { lead, sale } = item;
      
      // Basic lead data
      const baseData = {
        'Nombre': lead.name,
        'Email': lead.email,
        'Teléfono': lead.phone,
        'Estado': getStatusLabel(lead.status),
        'Rol': lead.role,
        'Nivel de Edición': lead.level,
        'Software': lead.software,
        'Origen de Clientes': lead.clients,
        'Capacidad de Inversión': lead.investment,
        'Fecha de Creación': lead.createdAt 
          ? formatDateForExcel(lead.createdAt)
          : 'N/A',
      };

      // Payment data (if sale exists)
      if (sale) {
        const paymentProgress = (sale.paidAmount / sale.totalAmount) * 100;
        const accessStatus = getAccessStatus(sale);
        
        return {
          ...baseData,
          'Plan de Pago': sale.paymentPlan.replace('_', ' ').toUpperCase(),
          'Monto Total': sale.totalAmount,
          'Monto Pagado': sale.paidAmount,
          'Monto Pendiente': sale.totalAmount - sale.paidAmount,
          'Porcentaje Pagado': Math.round(paymentProgress),
          'Comprobantes de Pago': sale.paymentProofs.length,
          'Acceso Otorgado': sale.accessGranted ? 'Sí' : 'No',
          'Estado de Acceso': getAccessStatusLabel(accessStatus),
          'Fecha de Inicio Acceso': sale.accessStartDate 
            ? formatDateForExcel(sale.accessStartDate) 
            : 'N/A',
          'Fecha de Fin Acceso': sale.accessEndDate 
            ? formatDateForExcel(sale.accessEndDate) 
            : 'N/A',
          'Días Restantes': sale.accessEndDate 
            ? getRemainingDays(sale) 
            : 'N/A',
          'Exención Otorgada': sale.exemptionGranted ? 'Sí' : 'No',
          'Fecha de Venta': formatDateForExcel(sale.createdAt),
        };
      } else {
        // No sale data - fill with empty values for consistent columns
        return {
          ...baseData,
          'Plan de Pago': '-',
          'Monto Total': '-',
          'Monto Pagado': '-',
          'Monto Pendiente': '-',
          'Porcentaje Pagado': '-',
          'Comprobantes de Pago': '-',
          'Acceso Otorgado': '-',
          'Estado de Acceso': '-',
          'Fecha de Inicio Acceso': '-',
          'Fecha de Fin Acceso': '-',
          'Días Restantes': '-',
          'Exención Otorgada': '-',
          'Fecha de Venta': '-',
        };
      }
    });

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Set column widths for better readability
    const columnWidths = [
      { wch: 20 }, // Nombre
      { wch: 25 }, // Email
      { wch: 15 }, // Teléfono
      { wch: 12 }, // Estado
      { wch: 15 }, // Rol
      { wch: 15 }, // Nivel de Edición
      { wch: 15 }, // Software
      { wch: 20 }, // Origen de Clientes
      { wch: 25 }, // Capacidad de Inversión
      { wch: 18 }, // Fecha de Creación
      { wch: 15 }, // Plan de Pago
      { wch: 12 }, // Monto Total
      { wch: 12 }, // Monto Pagado
      { wch: 12 }, // Monto Pendiente
      { wch: 12 }, // Porcentaje Pagado
      { wch: 15 }, // Comprobantes de Pago
      { wch: 12 }, // Acceso Otorgado
      { wch: 15 }, // Estado de Acceso
      { wch: 18 }, // Fecha de Inicio Acceso
      { wch: 18 }, // Fecha de Fin Acceso
      { wch: 12 }, // Días Restantes
      { wch: 15 }, // Exención Otorgada
      { wch: 18 }, // Fecha de Venta
    ];
    
    ws['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Leads');

    // Create additional summary sheet
    const summaryData = createSummaryData(enhancedLeads);
    const summaryWs = XLSX.utils.json_to_sheet(summaryData);
    summaryWs['!cols'] = [{ wch: 25 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Resumen');

    // Generate filename
    const defaultFilename = `leads_export_${new Date().toISOString().slice(0, 10)}.xlsx`;
    const finalFilename = filename || defaultFilename;

    // Save file
    XLSX.writeFile(wb, finalFilename);
    
    console.log('Export completed successfully!');
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw error;
  }
};

/**
 * Create summary statistics for the second sheet
 */
const createSummaryData = (enhancedLeads: EnhancedLeadExportData[]) => {
  const total = enhancedLeads.length;
  const leadCount = enhancedLeads.filter(item => item.lead.status === 'lead').length;
  const onboardingCount = enhancedLeads.filter(item => item.lead.status === 'onboarding').length;
  const saleCount = enhancedLeads.filter(item => item.lead.status === 'sale').length;
  const rejectedCount = enhancedLeads.filter(item => item.lead.status === 'rejected').length;

  const salesWithData = enhancedLeads.filter(item => item.sale);
  const totalRevenue = salesWithData.reduce((sum, item) => sum + (item.sale?.totalAmount || 0), 0);
  const totalPaid = salesWithData.reduce((sum, item) => sum + (item.sale?.paidAmount || 0), 0);
  const activeMembers = salesWithData.filter(item => 
    item.sale?.accessGranted && getAccessStatus(item.sale) === 'active'
  ).length;

  return [
    { 'Métrica': 'Total de Leads', 'Valor': total },
    { 'Métrica': 'Nuevos Leads', 'Valor': leadCount },
    { 'Métrica': 'En Onboarding', 'Valor': onboardingCount },
    { 'Métrica': 'Ventas Realizadas', 'Valor': saleCount },
    { 'Métrica': 'Leads Rechazados', 'Valor': rejectedCount },
    { 'Métrica': '', 'Valor': '' }, // Empty row
    { 'Métrica': 'Ingresos Totales', 'Valor': `$${totalRevenue.toLocaleString()}` },
    { 'Métrica': 'Monto Cobrado', 'Valor': `$${totalPaid.toLocaleString()}` },
    { 'Métrica': 'Monto Pendiente', 'Valor': `$${(totalRevenue - totalPaid).toLocaleString()}` },
    { 'Métrica': 'Miembros Activos', 'Valor': activeMembers },
    { 'Métrica': '', 'Valor': '' }, // Empty row
    { 'Métrica': 'Tasa de Conversión', 'Valor': `${((saleCount / total) * 100).toFixed(1)}%` },
    { 'Métrica': 'Tasa de Cobro', 'Valor': `${totalRevenue > 0 ? ((totalPaid / totalRevenue) * 100).toFixed(1) : 0}%` },
  ];
};

/**
 * Helper functions
 */
const formatDateForExcel = (date: any): string => {
  const jsDate = toJsDate(date);
  if (!jsDate) return 'N/A';
  
  return jsDate.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

const getStatusLabel = (status: Lead['status']): string => {
  switch (status) {
    case 'lead': return 'Nuevo Lead';
    case 'onboarding': return 'En Onboarding';
    case 'sale': return 'Venta';
    case 'rejected': return 'Rechazado';
    default: return status;
  }
};

const getAccessStatus = (sale: Sale): 'active' | 'pending' | 'expired' => {
  if (!sale.accessGranted) return 'pending';
  
  if (sale.accessEndDate) {
    const now = new Date();
    const endDate = toJsDate(sale.accessEndDate);
    if (!endDate) return 'pending';
    return now > endDate ? 'expired' : 'active';
  }
  
  return 'pending';
};

const getAccessStatusLabel = (status: 'active' | 'pending' | 'expired'): string => {
  switch (status) {
    case 'active': return 'Activo';
    case 'pending': return 'Pendiente';
    case 'expired': return 'Expirado';
    default: return 'Desconocido';
  }
};

const getRemainingDays = (sale: Sale): number => {
  if (!sale.accessEndDate) return 0;
  
  const now = new Date();
  const endDate = toJsDate(sale.accessEndDate);
  if (!endDate) return 0;
  
  const diffTime = endDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};