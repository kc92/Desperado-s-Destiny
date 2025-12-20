/**
 * Property Tax Service
 * API client for property tax management operations
 */

import api from './api';
import type {
  PropertyTaxRecord,
  TaxCalculation,
  OwnerTaxSummary,
  PropertySize,
  TaxPaymentStatus,
  SpecialTaxType,
} from '@desperados/shared';

// ===== Request/Response Types =====

export interface CalculateTaxesResponse {
  calculation: TaxCalculation;
  propertyId: string;
  propertyType: string;
  propertySize: PropertySize;
  propertyValue: number;
  propertyTier: number;
  weeklyIncome: number;
}

export interface PayTaxesRequest {
  payerId: string;
  amount: number;
}

export interface PayTaxesResponse {
  taxRecord: PropertyTaxRecord;
  message: string;
}

export interface SetAutoPayRequest {
  ownerId: string;
  enabled: boolean;
}

export interface ProcessAutoPaymentsResponse {
  processed: number;
  successful: number;
  failed: number;
  errors?: Array<{
    propertyId: string;
    error: string;
  }>;
}

export interface SendRemindersResponse {
  remindersSent: number;
}

// ===== Property Tax Service =====

/**
 * Calculate taxes for a specific property
 */
export async function calculateTaxes(propertyId: string): Promise<CalculateTaxesResponse> {
  const response = await api.get<{ data: CalculateTaxesResponse }>(
    `/property-tax/${propertyId}/calculate`
  );
  return response.data.data;
}

/**
 * Get tax summary for an owner
 */
export async function getOwnerTaxSummary(ownerId: string): Promise<OwnerTaxSummary> {
  const response = await api.get<{ data: OwnerTaxSummary }>('/property-tax/summary', {
    params: { ownerId },
  });
  return response.data.data;
}

/**
 * Pay taxes for a property
 */
export async function payTaxes(
  propertyId: string,
  request: PayTaxesRequest
): Promise<PayTaxesResponse> {
  const response = await api.post<{ data: PayTaxesResponse }>(
    `/property-tax/${propertyId}/pay`,
    request
  );
  return response.data.data;
}

/**
 * Enable or disable auto-pay for a property
 */
export async function setAutoPay(
  propertyId: string,
  request: SetAutoPayRequest
): Promise<PropertyTaxRecord> {
  const response = await api.post<{ data: PropertyTaxRecord }>(
    `/property-tax/${propertyId}/auto-pay`,
    request
  );
  return response.data.data;
}

/**
 * Create or update tax record for a gang base
 */
export async function createGangBaseTaxRecord(gangBaseId: string): Promise<PropertyTaxRecord> {
  const response = await api.post<{ data: PropertyTaxRecord }>(
    `/property-tax/gang-base/${gangBaseId}/create`
  );
  return response.data.data;
}

/**
 * Process all pending auto-payments (Admin/System)
 */
export async function processAutoPayments(): Promise<ProcessAutoPaymentsResponse> {
  const response = await api.post<{ data: ProcessAutoPaymentsResponse }>(
    '/property-tax/process-auto-payments'
  );
  return response.data.data;
}

/**
 * Send tax due reminders (Admin/System)
 */
export async function sendReminders(): Promise<SendRemindersResponse> {
  const response = await api.post<{ data: SendRemindersResponse }>(
    '/property-tax/send-reminders'
  );
  return response.data.data;
}

// ===== Convenience Methods =====

/**
 * Check if property tax is overdue
 */
export function isTaxOverdue(taxRecord: PropertyTaxRecord): boolean {
  const now = new Date();
  const dueDate = new Date(taxRecord.dueDate);
  return now > dueDate && taxRecord.paymentStatus !== TaxPaymentStatus.PAID;
}

/**
 * Calculate days overdue for a tax record
 */
export function getDaysOverdue(taxRecord: PropertyTaxRecord): number {
  if (!isTaxOverdue(taxRecord)) {
    return 0;
  }

  const now = new Date();
  const dueDate = new Date(taxRecord.dueDate);
  const diffMs = now.getTime() - dueDate.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Calculate days until due
 */
export function getDaysUntilDue(taxRecord: PropertyTaxRecord): number {
  const now = new Date();
  const dueDate = new Date(taxRecord.dueDate);
  const diffMs = dueDate.getTime() - now.getTime();
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(0, days);
}

/**
 * Check if tax is due soon (within 24 hours)
 */
export function isTaxDueSoon(taxRecord: PropertyTaxRecord): boolean {
  const daysUntilDue = getDaysUntilDue(taxRecord);
  return daysUntilDue <= 1 && taxRecord.paymentStatus !== TaxPaymentStatus.PAID;
}

/**
 * Get payment status label
 */
export function getPaymentStatusLabel(status: TaxPaymentStatus): string {
  const labels: Record<TaxPaymentStatus, string> = {
    [TaxPaymentStatus.PAID]: 'Paid',
    [TaxPaymentStatus.PENDING]: 'Pending',
    [TaxPaymentStatus.LATE]: 'Late',
    [TaxPaymentStatus.DELINQUENT]: 'Delinquent',
    [TaxPaymentStatus.FORECLOSED]: 'Foreclosed',
  };
  return labels[status] || 'Unknown';
}

/**
 * Get payment status color/severity
 */
export function getPaymentStatusColor(
  status: TaxPaymentStatus
): 'success' | 'warning' | 'error' | 'info' {
  const colors: Record<TaxPaymentStatus, 'success' | 'warning' | 'error' | 'info'> = {
    [TaxPaymentStatus.PAID]: 'success',
    [TaxPaymentStatus.PENDING]: 'info',
    [TaxPaymentStatus.LATE]: 'warning',
    [TaxPaymentStatus.DELINQUENT]: 'error',
    [TaxPaymentStatus.FORECLOSED]: 'error',
  };
  return colors[status] || 'info';
}

/**
 * Get special tax type label
 */
export function getSpecialTaxTypeLabel(type: SpecialTaxType): string {
  const labels: Record<SpecialTaxType, string> = {
    [SpecialTaxType.NONE]: 'None',
    [SpecialTaxType.FRONTIER]: 'Frontier Protection Tax',
    [SpecialTaxType.COALITION]: 'Coalition Tribute',
    [SpecialTaxType.MILITARY]: 'Military Levy',
  };
  return labels[type] || 'Unknown';
}

/**
 * Format tax amount with currency
 */
export function formatTaxAmount(amount: number): string {
  return `${amount.toLocaleString()} gold`;
}

/**
 * Calculate total taxes owed across multiple properties
 */
export function calculateTotalTaxesOwed(taxRecords: PropertyTaxRecord[]): number {
  return taxRecords.reduce((total, record) => {
    if (record.paymentStatus !== TaxPaymentStatus.PAID) {
      return total + record.taxCalculation.totalTax;
    }
    return total;
  }, 0);
}

/**
 * Filter tax records by payment status
 */
export function filterByStatus(
  taxRecords: PropertyTaxRecord[],
  status: TaxPaymentStatus
): PropertyTaxRecord[] {
  return taxRecords.filter(record => record.paymentStatus === status);
}

/**
 * Filter overdue tax records
 */
export function filterOverdue(taxRecords: PropertyTaxRecord[]): PropertyTaxRecord[] {
  return taxRecords.filter(record => isTaxOverdue(record));
}

/**
 * Sort tax records by due date
 */
export function sortByDueDate(
  taxRecords: PropertyTaxRecord[],
  ascending: boolean = true
): PropertyTaxRecord[] {
  return [...taxRecords].sort((a, b) => {
    const dateA = new Date(a.dueDate).getTime();
    const dateB = new Date(b.dueDate).getTime();
    return ascending ? dateA - dateB : dateB - dateA;
  });
}

/**
 * Sort tax records by amount owed
 */
export function sortByAmount(
  taxRecords: PropertyTaxRecord[],
  ascending: boolean = true
): PropertyTaxRecord[] {
  return [...taxRecords].sort((a, b) => {
    const amountA = a.taxCalculation.totalTax;
    const amountB = b.taxCalculation.totalTax;
    return ascending ? amountA - amountB : amountB - amountA;
  });
}

/**
 * Check if can afford to pay tax
 */
export function canAffordTax(currentGold: number, taxAmount: number): boolean {
  return currentGold >= taxAmount;
}

/**
 * Get tax breakdown as array for display
 */
export function getTaxBreakdownArray(calculation: TaxCalculation): Array<{
  label: string;
  amount: number;
}> {
  return [
    { label: 'Property Tax', amount: calculation.propertyTax },
    { label: 'Income Tax', amount: calculation.incomeTax },
    { label: 'Upkeep Costs', amount: calculation.upkeepCosts },
    { label: 'Special Tax', amount: calculation.specialTax },
  ].filter(item => item.amount > 0);
}

/**
 * Calculate percentage of each tax component
 */
export function getTaxBreakdownPercentages(calculation: TaxCalculation): {
  propertyTax: number;
  incomeTax: number;
  upkeepCosts: number;
  specialTax: number;
} {
  const total = calculation.totalTax;
  if (total === 0) {
    return {
      propertyTax: 0,
      incomeTax: 0,
      upkeepCosts: 0,
      specialTax: 0,
    };
  }

  return {
    propertyTax: Math.round((calculation.propertyTax / total) * 100),
    incomeTax: Math.round((calculation.incomeTax / total) * 100),
    upkeepCosts: Math.round((calculation.upkeepCosts / total) * 100),
    specialTax: Math.round((calculation.specialTax / total) * 100),
  };
}

/**
 * Check if property has auto-pay enabled
 */
export function hasAutoPay(taxRecord: PropertyTaxRecord): boolean {
  return taxRecord.autoPayEnabled;
}

/**
 * Get most urgent tax record (closest to foreclosure)
 */
export function getMostUrgentTax(taxRecords: PropertyTaxRecord[]): PropertyTaxRecord | null {
  const overdueTaxes = filterOverdue(taxRecords);
  if (overdueTaxes.length === 0) {
    return null;
  }

  return overdueTaxes.reduce((mostUrgent, current) => {
    const mostUrgentDays = getDaysOverdue(mostUrgent);
    const currentDays = getDaysOverdue(current);
    return currentDays > mostUrgentDays ? current : mostUrgent;
  });
}

/**
 * Default service object with all methods
 */
export const propertyTaxService = {
  // API methods
  calculateTaxes,
  getOwnerTaxSummary,
  payTaxes,
  setAutoPay,
  createGangBaseTaxRecord,
  processAutoPayments,
  sendReminders,

  // Convenience methods
  isTaxOverdue,
  getDaysOverdue,
  getDaysUntilDue,
  isTaxDueSoon,
  getPaymentStatusLabel,
  getPaymentStatusColor,
  getSpecialTaxTypeLabel,
  formatTaxAmount,
  calculateTotalTaxesOwed,
  filterByStatus,
  filterOverdue,
  sortByDueDate,
  sortByAmount,
  canAffordTax,
  getTaxBreakdownArray,
  getTaxBreakdownPercentages,
  hasAutoPay,
  getMostUrgentTax,
};

export default propertyTaxService;
