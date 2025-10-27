import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductoRepository } from '../../../domain/repositories/producto.repository';
import { ProductListResponse } from '../../../domain/entities/producto.entity';

@Injectable({ providedIn: 'root' })
export class SearchProductosUseCase {
  constructor(private repository: ProductoRepository) {}
  
  execute(searchTerm: string, page?: number, perPage?: number): Observable<ProductListResponse> {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return this.repository.getActiveProducts(page, perPage);
    }
    return this.repository.searchProducts(searchTerm.trim(), page, perPage);
  }
}
