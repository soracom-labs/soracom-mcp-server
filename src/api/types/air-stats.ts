export interface AirStats {
  date: string;
  unixtime: number;
  dataTrafficStatsMap: {
    [key: string]: {
      downloadByteSizeTotal: number;
      downloadPacketSizeTotal: number;
      uploadByteSizeTotal: number;
      uploadPacketSizeTotal: number;
    };
  };
}

export interface GetAirStatsOfOperatorParams {
  from: number;
  to: number;
  period: 'day' | 'month';
}

export interface GetAirStatsOfSimParams {
  from: number;
  to: number;
  period: 'minutes' | 'day' | 'month';
  simId: string;
}

export interface GetAirStatsOfGroupParams {
  from: number;
  to: number;
  period: 'day' | 'month';
  groupId: string;
}

export interface AirStatsResponse {
  [date: string]: AirStats;
}
