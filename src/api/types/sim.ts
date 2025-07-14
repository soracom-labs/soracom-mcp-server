export interface Sim {
  simId: string;
  status: string;
  msisdn?: string;
  imsi: string;
  iccid?: string;
  serialNumber?: string;
  speedClass: string;
  subscription: string;
  moduleType: string;
  createdAt: number;
  lastModifiedAt: number;
  operatorId: string;
  plan?: number;
  sessionStatus?: {
    lastUpdatedAt?: number;
    imei?: string;
    location?: string;
    ueIpAddress?: string;
    dnsServers?: string[];
    online?: boolean;
  };
  tags?: { [key: string]: string };
}

export interface ListSimsParams {
  status_filter?: string;
  speed_class_filter?: string;
  tag_name?: string;
  tag_value?: string;
  tag_value_match_mode?: string;
  limit?: number;
  last_evaluated_key?: string;
  sort?: 'name' | 'createdTime' | 'lastModifiedTime';
  order?: 'asc' | 'desc';
}

export interface SimSessionEvent {
  event: string;
  timestamp: number;
  imsi: string;
  simId: string;
  operatorId: string;
  properties?: {
    [key: string]: unknown;
  };
}

export interface ListSimSessionEventsParams {
  from?: number;
  to?: number;
  limit?: number;
  last_evaluated_key?: string;
}

export interface SimStatusHistory {
  status: string;
  timestamp: number;
  previousStatus?: string;
  operatorId: string;
}

export interface ListSimStatusHistoryParams {
  from?: number;
  to?: number;
  limit?: number;
  last_evaluated_key?: string;
}

export interface SearchSimsParams {
  // Search parameters
  name?: string;
  group?: string;
  group_id?: string;
  sim_id?: string;
  imsi?: string;
  msisdn?: string;
  iccid?: string;
  serial_number?: string;
  tag?: string;
  status?: string;
  session_status?: string;
  subscription?: string;
  module_type?: string;
  bundles?: string;

  // Search behavior
  search_type?: 'and' | 'or';

  // Pagination
  limit?: number;
  last_evaluated_key?: string;
}
