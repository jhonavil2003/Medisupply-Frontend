import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductoRepository, CreateProductRequest } from '../../../domain/repositories/producto.repository';
import { ProductoDetailedEntity } from '../../../domain/entities/producto.entity';

@Injectable({
  providedIn: 'root'
})
export class CreateProductUseCase {
  private productoRepository = inject(ProductoRepository);

  execute(productData: CreateProductRequest): Observable<ProductoDetailedEntity> {
    return this.productoRepository.create(productData);
  }
}