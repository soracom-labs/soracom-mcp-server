import { http, HttpResponse } from 'msw';

const SORACOM_API_URL = 'https://api.soracom.io/v1';

export const handlers = [
  // Auth endpoints
  http.post(`${SORACOM_API_URL}/auth`, () => {
    return HttpResponse.json({
      apiKey: 'mock-api-key',
      operatorId: 'OP0123456789',
      token: 'mock-token',
      expires: Date.now() + 3600000,
    });
  }),

  // SIM endpoints
  http.get(`${SORACOM_API_URL}/sims`, () => {
    return HttpResponse.json([
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
    ]);
  }),

  http.get(`${SORACOM_API_URL}/sims/:simId`, ({ params }) => {
    const { simId } = params;
    return HttpResponse.json({
      simId,
      status: 'active',
      type: 'plan-D',
      iccid: '1234567890123456789',
      imsi: '440103123456789',
      msisdn: '08012345678',
      operatorId: 'OP0123456789',
      createdAt: Date.now() - 86400000,
      lastModifiedAt: Date.now() - 3600000,
    });
  }),

  // Stats endpoints
  http.get(`${SORACOM_API_URL}/stats/air/sims/:simId`, ({ params, request }) => {
    const { simId } = params;
    const url = new URL(request.url);
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');
    const period = url.searchParams.get('period') || 'day';

    return HttpResponse.json({
      simId,
      from: Number(from),
      to: Number(to),
      period,
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
    });
  }),

  // Operator endpoints
  http.get(`${SORACOM_API_URL}/operators/:operatorId`, ({ params }) => {
    const { operatorId } = params;
    return HttpResponse.json({
      operatorId,
      email: 'test@example.com',
      description: 'Test Operator',
      createdAt: Date.now() - 2592000000,
      lastModifiedAt: Date.now() - 86400000,
    });
  }),

  // Error handling
  http.get(`${SORACOM_API_URL}/error/*`, () => {
    return HttpResponse.json(
      {
        code: 'API0001',
        message: 'Invalid request',
      },
      { status: 400 },
    );
  }),
];
