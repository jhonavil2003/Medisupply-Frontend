import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductoRepository } from '../../../domain/repositories/producto.repository';
import { ProductoDetailedEntity } from '../../../domain/entities/producto.entity';

@Injectable({ providedIn: 'root' })
export class GetProductoBySkuUseCase {
  constructor(private repository: ProductoRepository) {}
  
  execute(sku: string): Observable<ProductoDetailedEntity> {
    if (!sku || sku.trim().length === 0) {
      throw new Error('El SKU del producto es requerido');
    }
    return this.repository.getBySku(sku);
  }
}
