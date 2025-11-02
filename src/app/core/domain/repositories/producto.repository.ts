import { Observable } from 'rxjs';
import { 
  ProductoEntity, 
  ProductoDetailedEntity,
  ProductListResponse,
  ProductQueryParams
} from '../entities/producto.entity';

export interface CreateProductRequest {
  sku: string;
  name: string;
  category: string;
  unit_price: number;
  unit_of_measure: string;
  supplier_id: number;
  description?: string;
  subcategory?: string;
  currency?: string;
  requires_cold_chain?: boolean;
  storage_conditions?: any;
  regulatory_info?: any;
  physical_dimensions?: any;
  manufacturer?: string;
  country_of_origin?: string;
  barcode?: string;
  image_url?: string;
}

export abstract class ProductoRepository {
  abstract getAll(params?: ProductQueryParams): Observable<ProductListResponse>;
  
  abstract getBySku(sku: string): Observable<ProductoDetailedEntity>;
  
  abstract searchProducts(searchTerm: string, page?: number, perPage?: number): Observable<ProductListResponse>;
  
  abstract getActiveProducts(page?: number, perPage?: number): Observable<ProductListResponse>;
  
  abstract getProductsByCategory(category: string, page?: number): Observable<ProductListResponse>;
  
  abstract getColdChainProducts(page?: number): Observable<ProductListResponse>;
  
  abstract getProductsBySupplier(supplierId: number, page?: number): Observable<ProductListResponse>;
  
  abstract create(productData: CreateProductRequest): Observable<ProductoDetailedEntity>;
}
