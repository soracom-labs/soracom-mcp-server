import { AxiosInstance } from 'axios';
import { get } from './api-utils.js';
import { Group, ListGroupsParams } from '../api/types/group.js';

export async function getGroup(client: AxiosInstance, groupId: string): Promise<Group> {
  return get<Group>(client, `/groups/${groupId}`, undefined);
}

export async function listGroups(
  client: AxiosInstance,
  params?: ListGroupsParams,
): Promise<Group[]> {
  return get<Group[]>(client, '/groups', params);
}
