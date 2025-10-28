import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductLocationRepository } from '../../../domain/repositories/product-location.repository';
import { ProductLocationResponse, ProductLocationQueryParams } from '../../../domain/entities/product-location.entity';

@Injectable({ providedIn: 'root' })
export class GetProductLocationUseCase {
  constructor(private repository: ProductLocationRepository) {}

  execute(params: ProductLocationQueryParams): Observable<ProductLocationResponse> {
    // Validaciones de negocio
    if (!params.search_term && !params.product_sku && !params.barcode && !params.qr_code && !params.internal_code) {
      throw new Error('Se requiere al menos un criterio de búsqueda');
    }

    return this.repository.getProductLocation(params);
  }
}

@Injectable({ providedIn: 'root' })
export class SearchProductLocationUseCase {
  constructor(private repository: ProductLocationRepository) {}

  execute(searchTerm: string, onlyAvailable: boolean = true): Observable<ProductLocationResponse> {
    if (!searchTerm || searchTerm.trim().length === 0) {
      throw new Error('El término de búsqueda es requerido');
    }

    if (searchTerm.trim().length < 3) {
      throw new Error('El término de búsqueda debe tener al menos 3 caracteres');
    }

    return this.repository.searchProductLocation(searchTerm.trim(), onlyAvailable);
  }
}

@Injectable({ providedIn: 'root' })
export class GetLocationBySkuUseCase {
  constructor(private repository: ProductLocationRepository) {}

  execute(sku: string, orderBy: 'fefo' | 'fifo' | 'lifo' = 'fefo'): Observable<ProductLocationResponse> {
    if (!sku || sku.trim().length === 0) {
      throw new Error('El SKU es requerido');
    }

    return this.repository.getLocationBySku(sku.trim(), orderBy);
  }
}

@Injectable({ providedIn: 'root' })
export class GetLocationByBarcodeUseCase {
  constructor(private repository: ProductLocationRepository) {}

  execute(barcode: string): Observable<ProductLocationResponse> {
    if (!barcode || barcode.trim().length === 0) {
      throw new Error('El código de barras es requerido');
    }

    return this.repository.getLocationByBarcode(barcode.trim());
  }
}

@Injectable({ providedIn: 'root' })
export class GetStockLevelsUseCase {
  constructor(private repository: ProductLocationRepository) {}

  execute(productSku: string, distributionCenterId?: number): Observable<any> {
    if (!productSku || productSku.trim().length === 0) {
      throw new Error('El SKU del producto es requerido');
    }

    return this.repository.getStockLevels(productSku.trim(), distributionCenterId);
  }
}
