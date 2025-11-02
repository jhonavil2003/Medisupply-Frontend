import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductoRepository } from '../../../domain/repositories/producto.repository';
import { ProductoDetailedEntity } from '../../../domain/entities/producto.entity';

@Injectable({
  providedIn: 'root'
})
export class GetProductByIdUseCase {
  private productoRepository = inject(ProductoRepository);

  execute(id: number): Observable<ProductoDetailedEntity> {
    return this.productoRepository.getById(id);
  }
}