export interface ProductoEntity {
  readonly id: number;
  readonly sku: string;
  readonly name: string;
  readonly description: string | null;
  readonly category: string;
  readonly subcategory: string | null;
  readonly unit_price: number;
  readonly currency: string;
  readonly unit_of_measure: string;
  readonly supplier_id: number;
  readonly supplier_name: string | null;
  readonly requires_cold_chain: boolean;
  readonly storage_conditions: StorageConditions;
  readonly regulatory_info: RegulatoryInfo;
  readonly physical_dimensions: PhysicalDimensions;
  readonly manufacturer: string | null;
  readonly country_of_origin: string | null;
  readonly barcode: string | null;
  readonly image_url: string | null;
  readonly is_active: boolean;
  readonly is_discontinued: boolean;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface ProductoDetailedEntity extends ProductoEntity {
  readonly certifications: Certification[];
  readonly regulatory_conditions: RegulatoryCondition[];
}

export interface StorageConditions {
  temperature_min: number | null;
  temperature_max: number | null;
  humidity_max: number | null;
}

export interface RegulatoryInfo {
  sanitary_registration: string | null;
  requires_prescription: boolean;
  regulatory_class: string | null;
}

export interface PhysicalDimensions {
  weight_kg: number | null;
  length_cm: number | null;
  width_cm: number | null;
  height_cm: number | null;
}

export interface Certification {
  id: number;
  certification_type: string;
  certification_number: string;
  certifying_body: string;
  issue_date: string;
  expiry_date: string | null;
  is_valid: boolean;
  created_at: string;
}

export interface RegulatoryCondition {
  id: number;
  condition_type: string;
  description: string;
  authority: string;
  reference_number: string;
  effective_date: string;
  expiry_date: string | null;
  is_active: boolean;
  created_at: string;
}

export interface ProductQueryParams {
  search?: string;
  sku?: string;
  category?: string;
  subcategory?: string;
  supplier_id?: number;
  is_active?: boolean;
  requires_cold_chain?: boolean;
  page?: number;
  per_page?: number;
}

export interface Pagination {
  page: number;
  per_page: number;
  total_pages: number;
  total_items: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface ProductListResponse {
  products: ProductoEntity[];
  pagination: Pagination;
}

export interface CreateProductoDto {
  sku: string;
  name: string;
  description?: string;
  category: string;
  subcategory?: string;
  unit_price: number;
  currency: string;
  unit_of_measure: string;
  supplier_id: number;
  requires_cold_chain?: boolean;
  manufacturer?: string;
  country_of_origin?: string;
  barcode?: string;
}

export interface UpdateProductoDto extends Partial<CreateProductoDto> {
  id: number;
}
