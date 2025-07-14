import { AxiosInstance } from 'axios';
import { get } from './api-utils.js';
import {
  AirStatsResponse,
  GetAirStatsOfOperatorParams,
  GetAirStatsOfSimParams,
  GetAirStatsOfGroupParams,
} from '../api/types/air-stats.js';

export async function getAirStatsOfOperator(
  client: AxiosInstance,
  operatorId: string,
  params: GetAirStatsOfOperatorParams,
): Promise<AirStatsResponse> {
  return get<AirStatsResponse>(client, `/stats/air/operators/${operatorId}`, {
    from: params.from,
    to: params.to,
    period: params.period,
  });
}

export async function getAirStatsOfSim(
  client: AxiosInstance,
  params: GetAirStatsOfSimParams,
): Promise<AirStatsResponse> {
  return get<AirStatsResponse>(client, `/stats/air/sims/${params.simId}`, {
    from: params.from,
    to: params.to,
    period: params.period,
  });
}

export async function getAirStatsOfGroup(
  client: AxiosInstance,
  params: GetAirStatsOfGroupParams,
): Promise<AirStatsResponse> {
  return get<AirStatsResponse>(client, `/stats/air/groups/${params.groupId}`, {
    from: params.from,
    to: params.to,
    period: params.period,
  });
}
