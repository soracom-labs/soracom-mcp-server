import { AxiosInstance } from 'axios';
import { get } from './api-utils.js';
import { Sim, SearchSimsParams } from '../api/types/sim.js';

export async function searchSims(client: AxiosInstance, params?: SearchSimsParams): Promise<Sim[]> {
  return get<Sim[]>(client, '/query/sims', params);
}
