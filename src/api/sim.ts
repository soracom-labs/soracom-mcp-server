import { AxiosInstance } from 'axios';
import { get } from './api-utils.js';
import {
  Sim,
  ListSimsParams,
  SimSessionEvent,
  ListSimSessionEventsParams,
  SimStatusHistory,
  ListSimStatusHistoryParams,
} from '../api/types/sim.js';

export async function getSim(client: AxiosInstance, simId: string): Promise<Sim> {
  return get<Sim>(client, `/sims/${simId}`);
}

export async function listSims(client: AxiosInstance, params?: ListSimsParams): Promise<Sim[]> {
  return get<Sim[]>(client, '/sims', params);
}

export async function listSimSessionEvents(
  client: AxiosInstance,
  simId: string,
  params?: ListSimSessionEventsParams,
): Promise<SimSessionEvent[]> {
  return get<SimSessionEvent[]>(client, `/sims/${simId}/events/sessions`, params);
}

export async function listSimStatusHistory(
  client: AxiosInstance,
  simId: string,
  params?: ListSimStatusHistoryParams,
): Promise<SimStatusHistory[]> {
  return get<SimStatusHistory[]>(client, `/sims/${simId}/statuses/history`, params);
}
