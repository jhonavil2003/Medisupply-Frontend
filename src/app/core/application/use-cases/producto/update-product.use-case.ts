import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductoRepository, UpdateProductRequest } from '../../../domain/repositories/producto.repository';
import { ProductoDetailedEntity } from '../../../domain/entities/producto.entity';

@Injectable({
  providedIn: 'root'
})
export class UpdateProductUseCase {
  private productoRepository = inject(ProductoRepository);

  execute(productId: number, productData: UpdateProductRequest): Observable<ProductoDetailedEntity> {
    return this.productoRepository.update(productId, productData);
  }
}