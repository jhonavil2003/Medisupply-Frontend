import { Observable } from 'rxjs';
import { 
  ProductoEntity, 
  ProductoDetailedEntity,
  ProductListResponse,
  ProductQueryParams
} from '../entities/producto.entity';

export abstract class ProductoRepository {
  abstract getAll(params?: ProductQueryParams): Observable<ProductListResponse>;
  
  abstract getBySku(sku: string): Observable<ProductoDetailedEntity>;
  
  abstract searchProducts(searchTerm: string, page?: number, perPage?: number): Observable<ProductListResponse>;
  
  abstract getActiveProducts(page?: number, perPage?: number): Observable<ProductListResponse>;
  
  abstract getProductsByCategory(category: string, page?: number): Observable<ProductListResponse>;
  
  abstract getColdChainProducts(page?: number): Observable<ProductListResponse>;
  
  abstract getProductsBySupplier(supplierId: number, page?: number): Observable<ProductListResponse>;
}
