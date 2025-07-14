export interface BillingInfo {
  currency: string;
  totalAmount: number;
  billingYearMonth: string;
  state: 'preparing' | 'confirmed';
}

export interface DetailedBillingInfo extends BillingInfo {
  details: BillingDetail[];
}

export interface BillingDetail {
  productCategory: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  currency: string;
  tags?: { [key: string]: string };
}

export interface GetBillingParams {
  billing_year_month: string;
}

export interface BillingSummaryItem {
  billItemName: string;
  currency: string;
  amount: number;
  taxAmount: number;
  count?: number;
}

export interface SimBillingSummary {
  simId: string;
  name?: string;
  tags?: { [key: string]: string };
  currency: string;
  amount: number;
  taxAmount: number;
}
