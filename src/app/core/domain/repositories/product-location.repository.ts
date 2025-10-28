import { Observable } from 'rxjs';
import {
  ProductLocationResponse,
  ProductLocationQueryParams,
  StockLevelsResponse
} from '../entities/product-location.entity';

export abstract class ProductLocationRepository {
  /**
   * Obtiene la ubicación física de productos en bodega
   */
  abstract getProductLocation(params: ProductLocationQueryParams): Observable<ProductLocationResponse>;

  /**
   * Obtiene los niveles de stock por centro de distribución
   */
  abstract getStockLevels(productSku: string, distributionCenterId?: number): Observable<StockLevelsResponse>;

  /**
   * Obtiene ubicación por SKU (método conveniente)
   */
  abstract getLocationBySku(sku: string, orderBy?: 'fefo' | 'fifo' | 'lifo'): Observable<ProductLocationResponse>;

  /**
   * Obtiene ubicación por código de barras (método conveniente)
   */
  abstract getLocationByBarcode(barcode: string): Observable<ProductLocationResponse>;

  /**
   * Busca productos por término general (método conveniente)
   */
  abstract searchProductLocation(searchTerm: string, onlyAvailable?: boolean): Observable<ProductLocationResponse>;
}
