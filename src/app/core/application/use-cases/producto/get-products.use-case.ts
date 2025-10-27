import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductoRepository } from '../../../domain/repositories/producto.repository';
import { ProductListResponse, ProductQueryParams } from '../../../domain/entities/producto.entity';

@Injectable({ providedIn: 'root' })
export class GetAllProductosUseCase {
  constructor(private repository: ProductoRepository) {}
  
  execute(params?: ProductQueryParams): Observable<ProductListResponse> {
    return this.repository.getAll(params);
  }
}

@Injectable({ providedIn: 'root' })
export class GetActiveProductosUseCase {
  constructor(private repository: ProductoRepository) {}
  
  execute(page?: number, perPage?: number): Observable<ProductListResponse> {
    return this.repository.getActiveProducts(page, perPage);
  }
}

@Injectable({ providedIn: 'root' })
export class GetProductosByCategoryUseCase {
  constructor(private repository: ProductoRepository) {}
  
  execute(category: string, page?: number): Observable<ProductListResponse> {
    if (!category || category.trim().length === 0) {
      throw new Error('La categoría es requerida');
    }
    return this.repository.getProductsByCategory(category, page);
  }
}

@Injectable({ providedIn: 'root' })
export class GetColdChainProductosUseCase {
  constructor(private repository: ProductoRepository) {}
  
  execute(page?: number): Observable<ProductListResponse> {
    return this.repository.getColdChainProducts(page);
  }
}

@Injectable({ providedIn: 'root' })
export class GetProductosBySupplierUseCase {
  constructor(private repository: ProductoRepository) {}
  
  execute(supplierId: number, page?: number): Observable<ProductListResponse> {
    if (!supplierId) {
      throw new Error('El ID del proveedor es requerido');
    }
    return this.repository.getProductsBySupplier(supplierId, page);
  }
}
