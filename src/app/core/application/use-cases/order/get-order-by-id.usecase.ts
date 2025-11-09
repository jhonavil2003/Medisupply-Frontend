import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { OrderRepository } from '../../../domain/repositories/order.repository';
import { OrderEntity } from '../../../domain/entities/order.entity';

/**
 * Caso de uso: Obtener orden por ID
 * 
 * Este caso de uso maneja la lógica de negocio para obtener
 * una orden específica por su ID.
 */
@Injectable({
  providedIn: 'root'
})
export class GetOrderByIdUseCase {
  private orderRepository = inject(OrderRepository);

  /**
   * Ejecuta el caso de uso para obtener una orden por ID
   * 
   * @param id - ID de la orden
   * @returns Observable con la orden o null si no existe
   */
  execute(id: number): Observable<OrderEntity | null> {
    if (!id || id <= 0) {
      throw new Error('ID de orden inválido');
    }

    return this.orderRepository.getById(id);
  }
}
