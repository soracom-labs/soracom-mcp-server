export const mockAuthResponse = {
  apiKey: 'mock-api-key',
  operatorId: 'OP0123456789',
  token: 'mock-token',
  expires: Date.now() + 3600000,
};

export const mockSimListResponse = [
  {
    simId: 'sim-001',
    status: 'active',
    type: 'plan-D',
    iccid: '1234567890123456789',
    imsi: '440103123456789',
    msisdn: '08012345678',
    operatorId: 'OP0123456789',
    createdAt: Date.now() - 86400000,
    lastModifiedAt: Date.now() - 3600000,
  },
  {
    simId: 'sim-002',
    status: 'inactive',
    type: 'plan-D',
    iccid: '1234567890123456788',
    imsi: '440103123456788',
    msisdn: '08012345677',
    operatorId: 'OP0123456789',
    createdAt: Date.now() - 172800000,
    lastModifiedAt: Date.now() - 7200000,
  },
];

export const mockStatsResponse = {
  simId: 'sim-001',
  from: Date.now() - 86400000,
  to: Date.now(),
  period: 'day',
  dataTrafficStatsMap: {
    [String(Date.now() - 86400000)]: {
      uploadByteSizeTotal: 1024000,
      downloadByteSizeTotal: 5120000,
      uploadPacketSizeTotal: 1000,
      downloadPacketSizeTotal: 5000,
    },
    [String(Date.now())]: {
      uploadByteSizeTotal: 2048000,
      downloadByteSizeTotal: 10240000,
      uploadPacketSizeTotal: 2000,
      downloadPacketSizeTotal: 10000,
    },
  },
};
