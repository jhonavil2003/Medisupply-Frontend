import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductoRepository } from '../../../domain/repositories/producto.repository';

@Injectable({
  providedIn: 'root'
})
export class DeleteProductUseCase {
  private productoRepository = inject(ProductoRepository);

  execute(productId: number): Observable<void> {
    return this.productoRepository.delete(productId);
  }
}