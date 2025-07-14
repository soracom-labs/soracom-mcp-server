# Available Tools

## Command Naming Convention

All commands follow the pattern `Category_operationId` where:

- **Category** is the API category (e.g., Sim, Billing, Stats)
- **operationId** is the operation name from the SORACOM API

For example:

- `Sim_getSim` - Get SIM information
- `Billing_getLatestBilling` - Get latest billing information
- `Query_searchSims` - Search for SIMs

## SIM Management

### Sim_listSims

Returns a list of SIMs.

**Example:**

```json
{
  "limit": 10
}
```

**Parameters:**

- `limit` (number, optional): Maximum number of SIMs to return (default: 10).
- `last_evaluated_key` (string, optional): Key for pagination.

### Sim_getSim

Get detailed information about a specific IoT SIM.

**Example:**

```json
{
  "sim_id": "8981100000000000000"
}
```

**Parameters:**

- `sim_id` (string, required): SIM ID of the target SIM.

### Sim_listSimSessionEvents

Retrieve session event history for a specific SIM.

**Example:**

```json
{
  "sim_id": "8981100000000000000",
  "from": 1640995200000,
  "to": 1641081600000,
  "limit": 10
}
```

**Parameters:**

- `sim_id` (string, required): SIM ID of the target SIM
- `from` (number, optional): Start time (UNIX time in milliseconds)
- `to` (number, optional): End time (UNIX time in milliseconds)
- `limit` (number, optional): Maximum number of event histories to retrieve (default: 10)
- `last_evaluated_key` (string, optional): Key for pagination

### Sim_listSimStatusHistory

Get the status history for the specified SIM.

**Example:**

```json
{
  "sim_id": "8981100000000000000",
  "from": 1640995200000,
  "to": 1641081600000
}
```

**Parameters:**

- `sim_id` (string, required): SIM ID of the target SIM
- `from` (number, optional): Start time (UNIX time in milliseconds)
- `to` (number, optional): End time (UNIX time in milliseconds)
- `limit` (number, optional): Maximum number of items to retrieve (default: 10)
- `last_evaluated_key` (string, optional): Key for pagination

## Query

### Query_searchSims

Search for SIMs based on various criteria. Use searchTerm for general search across all fields, or use specific field parameters for targeted search.

**Example 1 - General search:**

```json
{
  "searchTerm": "tokyo"
}
```

**Example 2 - Specific field search:**

```json
{
  "status": "active",
  "subscription": "plan-D",
  "search_type": "and"
}
```

**Parameters:**

- `searchTerm` (string, optional): SPECIAL: Use this when you don't know which specific field to search. This searches across name, group, imsi, msisdn, iccid, serial_number, sim_id, and tag fields simultaneously
- `name` (string, optional): Search by SIM name.
- `group` (string, optional): Search by group name.
- `group_id` (string, optional): Search by group ID.
- `sim_id` (string, optional): Search by SIM ID.
- `imsi` (string, optional): Search by IMSI.
- `msisdn` (string, optional): Search by MSISDN.
- `iccid` (string, optional): Search by ICCID.
- `serial_number` (string, optional): Search by serial number.
- `tag` (string, optional): Search by tag values.
- `status` (string, optional): Filter by SIM status.
- `session_status` (string, optional): Filter by session status (NA, ONLINE, OFFLINE).
- `subscription` (string, optional): Filter by subscription plan.
- `module_type` (string, optional): Filter by module type.
- `bundles` (string, optional): Filter by bundles type.
- `search_type` (string, optional): Search logic - 'and' (all conditions must match) or 'or' (any condition matches). Default is 'and'
- `limit` (number, optional): Maximum number of results (default: 10)
- `last_evaluated_key` (string, optional): Key for pagination

## Groups

### Group_listGroups

Return a list of groups.

**Example:**

```json
{
  "tag_name": "environment",
  "tag_value": "production",
  "limit": 10
}
```

**Parameters:**

- `tag_name` (string, optional): Tag name of the group. Filters through all groups that exactly match the tag name. When tag_name is specified, tag_value is required
- `tag_value` (string, optional): Tag value of the groups.
- `tag_value_match_mode` (string, optional): Search criteria for tag strings (exact or prefix, default: exact).
- `limit` (number, optional): Maximum number of results per response page (default: 10).
- `last_evaluated_key` (string, optional): Key for pagination.

### Group_getGroup

Get information about a specific group.

**Example:**

```json
{
  "group_id": "abcdef12-3456-7890-abcd-ef1234567890"
}
```

**Parameters:**

- `group_id` (string, required): ID of the target Group.

## Statistics

### Stats_getAirStatsOfOperator

Get data usage statistics for Air service.

**Example:**

```json
{
  "from": 1640995200,
  "to": 1641081600,
  "period": "day"
}
```

**Parameters:**

- `from` (number, required): Start date (Unix timestamp in seconds).
- `to` (number, required): End date (Unix timestamp in seconds).
- `period` (string, required): Aggregation period (day or month).

### Stats_getAirStatsOfSim

Retrieve the usage report for the subscriber specified by the SIM ID.

**Example:**

```json
{
  "sim_id": "8981100000000000000",
  "from": 1640995200,
  "to": 1641081600,
  "period": "month"
}
```

**Parameters:**

- `sim_id` (string, required): SIM ID of the target SIM.
- `from` (number, required): Start time (Unix timestamp in seconds).
- `to` (number, required): End time (Unix timestamp in seconds).
- `period` (string, required): Aggregation period (day or month).

### Stats_getAirStatsOfGroup

Retrieves the usage report for the specified group.

**Example:**

```json
{
  "group_id": "abcdef12-3456-7890-abcd-ef1234567890",
  "from": 1640995200,
  "to": 1641081600,
  "period": "day"
}
```

**Parameters:**

- `group_id` (string, required): The Group ID.
- `from` (number, required): Start time (Unix timestamp in seconds).
- `to` (number, required): End time (Unix timestamp in seconds).
- `period` (string, required): Aggregation period (day or month).

## Billing

### Billing_getBillingHistory

Gets a list of finalized past billing history.

**Example:**

```json
{}
```

**Parameters:** None

### Billing_getBilling

Gets a finalized past billing history for the specified month.

**Example:**

```json
{
  "yearMonth": "202412"
}
```

**Parameters:**

- `yearMonth` (string, required): Billing year-month (YYYYMM format).

### Billing_getLatestBilling

Retrieves the preliminary usage fee for the current month.

**Example:**

```json
{}
```

**Parameters:** None

### Billing_getBillingSummaryOfBillItems

Get a billing summary of bill items for the last 4 months (this month to 3 months ago).

**Example:**

```json
{}
```

**Parameters:** None

### Billing_getBillingSummaryOfSims

Get a billing summary of SIMs for the last 4 months (current month to 3 months ago).

**Example:**

```json
{}
```

**Parameters:** None

## CellLocation

### CellLocation_batchGetCellLocations

Get location information for multiple cell towers in batch. For 3G networks, specify MCC, MNC, LAC, and CID. For 4G/LTE networks, specify MCC, MNC, TAC, and ECID. Uses OpenCelliD Project database.

**Example 1 - 3G Cell Tower:**

```json
{
  "cellIdentifiers": [
    {
      "mcc": "440",
      "mnc": "10",
      "lac": "195",
      "cid": "68485165",
      "identifier": "test001"
    }
  ]
}
```

**Example 2 - 4G Cell Tower:**

```json
{
  "cellIdentifiers": [
    {
      "mcc": "440",
      "mnc": "10",
      "tac": "5840",
      "ecid": "44668480",
      "identifier": "test002"
    }
  ]
}
```

**Example 3 - Multiple Cell Towers:**

```json
{
  "cellIdentifiers": [
    {
      "mcc": "440",
      "mnc": "10",
      "lac": "195",
      "cid": "68485165",
      "identifier": "3g_tower"
    },
    {
      "mcc": "440",
      "mnc": "10",
      "tac": "5840",
      "ecid": "44668480",
      "identifier": "4g_tower"
    }
  ]
}
```

**Parameters:**

- `cellIdentifiers` (array, required): Array of cell identifiers to get location information for.
  - `mcc` (string, required): Mobile Country Code.
  - `mnc` (string, required): Mobile Network Code.
  - `lac` (string, optional): Location Area Code (for 3G networks).
  - `cid` (string, optional): Cell ID (for 3G networks).
  - `tac` (string, optional): Tracking Area Code (for 4G/LTE networks).
  - `ecid` (string, optional): Enhanced Cell ID (for 4G/LTE networks).
  - `eci` (string, optional): Enhanced Cell ID alternative (same as ecid).
  - `identifier` (string, optional): Optional identifier to link request to response.

## Authentication

### Auth_logout

Clear cached authentication tokens.

**Example:**

```json
{}
```

**Parameters:** None
