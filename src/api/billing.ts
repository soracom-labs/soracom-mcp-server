import { AxiosInstance } from 'axios';
import { get } from './api-utils.js';
import {
  BillingInfo,
  DetailedBillingInfo,
  GetBillingParams,
  BillingSummaryItem,
  SimBillingSummary,
} from '../api/types/billing.js';

export async function getBillingHistory(client: AxiosInstance): Promise<BillingInfo[]> {
  return get<BillingInfo[]>(client, '/bills');
}

export async function getBilling(
  client: AxiosInstance,
  params: GetBillingParams,
): Promise<DetailedBillingInfo> {
  return get<DetailedBillingInfo>(client, `/bills/${params.billing_year_month}`);
}

export async function getBillingSummaryOfBillItems(
  client: AxiosInstance,
): Promise<BillingSummaryItem[]> {
  return get<BillingSummaryItem[]>(client, '/bills/summaries/bill_items');
}

export async function getBillingSummaryOfSims(client: AxiosInstance): Promise<SimBillingSummary[]> {
  return get<SimBillingSummary[]>(client, '/bills/summaries/sims');
}

export async function getLatestBilling(client: AxiosInstance): Promise<BillingInfo> {
  return get<BillingInfo>(client, '/bills/latest');
}
