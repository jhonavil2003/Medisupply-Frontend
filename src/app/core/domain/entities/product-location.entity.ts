// Entidades para la localización de productos en bodega

export interface BatchInfo {
  readonly barcode: string;
  readonly batch_number: string;
  readonly internal_code: string;
  readonly qr_code: string;
  readonly quantity: number;
}

export interface BatchDates {
  readonly days_until_expiry: number;
  readonly expiry_date: string; // YYYY-MM-DD
  readonly manufactured_date: string; // YYYY-MM-DD
}

export interface BatchStatus {
  readonly expiry_status: 'valid' | 'near_expiry' | 'expired';
  readonly is_available: boolean;
  readonly is_expired: boolean;
  readonly is_near_expiry: boolean;
  readonly is_quarantine: boolean;
}

export interface TemperatureRequirements {
  readonly max: number | null;
  readonly min: number | null;
  readonly range: string | null;
}

export interface Batch {
  readonly id: number;
  readonly product_sku: string;
  readonly location_id: number;
  readonly distribution_center_id: number;
  readonly batch_info: BatchInfo;
  readonly dates: BatchDates;
  readonly status: BatchStatus;
  readonly temperature_requirements: TemperatureRequirements;
  readonly notes: string | null;
  readonly created_at: string; // ISO 8601
  readonly updated_at: string; // ISO 8601
  readonly created_by: string | null;
}

export interface PhysicalLocation {
  readonly location_code: string;
  readonly aisle: string;
  readonly shelf: string;
  readonly level_position: string;
  readonly zone_type: 'refrigerated' | 'ambient' | 'freezer';
  readonly is_refrigerated: boolean;
}

export interface DistributionCenter {
  readonly id: number;
  readonly code: string;
  readonly name: string;
  readonly city: string;
  readonly supports_cold_chain: boolean;
}

export interface ProductLocationItem {
  readonly batch: Batch;
  readonly physical_location: PhysicalLocation;
  readonly distribution_center: DistributionCenter;
}

export interface SearchCriteria {
  readonly search_term: string | null;
  readonly product_sku: string | null;
  readonly barcode: string | null;
  readonly qr_code: string | null;
  readonly internal_code: string | null;
  readonly batch_number: string | null;
  readonly distribution_center_id: number | null;
  readonly zone_type: string | null;
  readonly only_available: boolean;
  readonly include_expired: boolean;
  readonly include_quarantine: boolean;
  readonly expiry_date_from: string | null;
  readonly expiry_date_to: string | null;
}

export interface ProductLocationResponse {
  readonly found: boolean;
  readonly product_skus: string[];
  readonly total_locations: number;
  readonly total_quantity: number;
  readonly ordering: 'fefo' | 'fifo' | 'lifo';
  readonly locations: ProductLocationItem[];
  readonly search_criteria: SearchCriteria;
  readonly timestamp: string; // ISO 8601
}

export interface ProductLocationQueryParams {
  search_term?: string;
  product_sku?: string;
  barcode?: string;
  qr_code?: string;
  internal_code?: string;
  distribution_center_id?: number;
  batch_number?: string;
  zone_type?: 'refrigerated' | 'ambient' | 'freezer';
  expiry_date_from?: string; // YYYY-MM-DD
  expiry_date_to?: string; // YYYY-MM-DD
  include_expired?: boolean;
  include_quarantine?: boolean;
  only_available?: boolean;
  order_by?: 'fefo' | 'fifo' | 'lifo';
}

export interface StockLevel {
  readonly product_sku: string;
  readonly total_available: number;
  readonly total_reserved: number;
  readonly total_in_transit: number;
  readonly distribution_centers: DistributionCenterStock[];
  readonly timestamp: string; // ISO 8601
}

export interface DistributionCenterStock {
  readonly distribution_center_id: number;
  readonly distribution_center_code: string;
  readonly city: string;
  readonly quantity_available: number;
  readonly quantity_reserved?: number;
  readonly quantity_in_transit?: number;
}

export interface StockLevelsResponse {
  readonly product_sku?: string;
  readonly products?: StockLevel[];
  readonly total_available?: number;
  readonly total_reserved?: number;
  readonly total_in_transit?: number;
  readonly distribution_centers?: DistributionCenterStock[];
  readonly timestamp: string;
}
