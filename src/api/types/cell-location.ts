/**
 * Cell identifier for 3G and 4G networks
 */
export interface CellIdentifier {
  /** Mobile Country Code */
  mcc: string;
  /** Mobile Network Code */
  mnc: string;
  /** Location Area Code (for 3G) */
  lac?: string;
  /** Cell ID (for 3G) */
  cid?: string;
  /** Tracking Area Code (for 4G) */
  tac?: string;
  /** Enhanced Cell ID (for 4G) */
  ecid?: string;
  /** Enhanced Cell ID alternative (for 4G) - same as ecid */
  eci?: string;
  /** Optional identifier to link request to response */
  identifier?: string;
}

/**
 * Cell location information
 */
export interface CellLocation {
  /** Latitude */
  lat: number;
  /** Longitude */
  lon: number;
  /** Estimate of radio range (radius in meters) */
  range?: number;
  /** Total number of observations used to calculate the estimated position */
  samples?: number;
  /** Timestamp when this record was first created */
  created?: string;
  /** Timestamp when this record was most recently modified */
  updated?: string;
  /** Average signal strength from all observations (in dBm) */
  avg_strength?: number;
  /** Whether this is an exact location (1) or estimate (0) */
  exact?: number;
  /** Unique identifier assigned by the client */
  identifier?: string;
}

/**
 * Parameters for batch get cell locations request
 */
export type BatchGetCellLocationsParams = CellIdentifier[];
