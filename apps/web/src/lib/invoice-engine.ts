/**
 * PlumbCore AI — Invoice Generation Engine
 * Calculates invoice amounts from job data and pricebook items
 */

import { pricebook } from './pricebook-data';

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  type: 'labor' | 'part' | 'fee';
}

export interface InvoiceCalculation {
  lineItems: InvoiceLineItem[];
  subtotal: number;
  tax: number;
  taxRate: number;
  serviceFee: number;
  total: number;
}

export interface InvoiceWithDeposit extends InvoiceCalculation {
  depositCreditApplied: boolean;
  customerBalanceDue: number;
}

export interface JobInvoiceInput {
  jobTitle: string;
  description: string;
  estimatedCost: number;
  laborCost?: number;
  partsCost?: number;
  hourlyRate: number;
  estimatedHours?: number;
  serviceFeePercent: number;
  taxRate: number;
  selectedParts?: { pricebookId: string; quantity: number }[];
  selectedRepairs?: { pricebookId: string; quantity: number }[];
}

/**
 * Generate invoice line items from a job
 */
export function generateInvoice(input: JobInvoiceInput): InvoiceCalculation {
  const lineItems: InvoiceLineItem[] = [];
  const {
    hourlyRate,
    serviceFeePercent,
    taxRate,
    selectedParts = [],
    selectedRepairs = [],
  } = input;

  // Add labor line items from selected repair types
  for (const repair of selectedRepairs) {
    const item = pricebook.find((p) => p.id === repair.pricebookId);
    if (item) {
      const total = item.unitPrice * repair.quantity;
      lineItems.push({
        description: item.name + (item.description ? ` — ${item.description}` : ''),
        quantity: repair.quantity,
        unitPrice: item.unitPrice,
        total,
        type: 'labor',
      });
    }
  }

  // If no specific repairs selected, use estimated labor
  if (selectedRepairs.length === 0 && input.estimatedHours) {
    const laborTotal = hourlyRate * input.estimatedHours;
    lineItems.push({
      description: `Labor — ${input.jobTitle}`,
      quantity: input.estimatedHours,
      unitPrice: hourlyRate,
      total: laborTotal,
      type: 'labor',
    });
  }

  // Add part line items
  for (const part of selectedParts) {
    const item = pricebook.find((p) => p.id === part.pricebookId);
    if (item) {
      const total = item.unitPrice * part.quantity;
      lineItems.push({
        description: item.name,
        quantity: part.quantity,
        unitPrice: item.unitPrice,
        total,
        type: 'part',
      });
    }
  }

  // Calculate totals
  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
  const serviceFee = subtotal * (serviceFeePercent / 100);
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + serviceFee + tax;

  // Add service fee as a line item
  if (serviceFee > 0) {
    lineItems.push({
      description: `Service Fee (${serviceFeePercent}%)`,
      quantity: 1,
      unitPrice: serviceFee,
      total: serviceFee,
      type: 'fee',
    });
  }

  return {
    lineItems,
    subtotal,
    tax,
    taxRate,
    serviceFee,
    total,
  };
}

/**
 * Add a deposit credit to an invoice calculation.
 * Inserts a deposit credit line item and adjusts the total.
 */
export function addDepositCredit(
  invoice: InvoiceCalculation,
  depositCents: number
): InvoiceWithDeposit {
  const depositLine: InvoiceLineItem = {
    description: 'Deposit (paid via PlumbCore)',
    quantity: 1,
    unitPrice: -depositCents,
    total: -depositCents,
    type: 'fee',
  };

  const lineItems = [...invoice.lineItems, depositLine];
  const total = invoice.subtotal + invoice.tax + invoice.serviceFee - depositCents;

  return {
    ...invoice,
    lineItems,
    total,
    depositCreditApplied: true,
    customerBalanceDue: Math.max(total, 0),
  };
}

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Generate invoice number
 */
export function generateInvoiceNumber(companySlug: string, count: number): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${companySlug.toUpperCase()}-${year}${month}-${String(count).padStart(4, '0')}`;
}

/**
 * Calculate due date (net 30 by default)
 */
export function calculateDueDate(issuedDate: Date, netDays = 30): Date {
  const due = new Date(issuedDate);
  due.setDate(due.getDate() + netDays);
  return due;
}
