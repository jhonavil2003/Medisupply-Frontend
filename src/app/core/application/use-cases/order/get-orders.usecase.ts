import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { OrderRepository } from '../../../domain/repositories/order.repository';
import { OrdersListResponse, GetOrdersFilters } from '../../../domain/entities/order.entity';

/**
 * Caso de uso: Obtener lista de órdenes
 * 
 * Este caso de uso maneja la lógica de negocio para obtener
 * la lista de órdenes con filtros y paginación.
 */
@Injectable({
  providedIn: 'root'
})
export class GetOrdersUseCase {
  private orderRepository = inject(OrderRepository);

  /**
   * Ejecuta el caso de uso para obtener órdenes
   * 
   * @param filters - Filtros opcionales para la búsqueda
   * @returns Observable con la respuesta paginada de órdenes
   */
  execute(filters?: GetOrdersFilters): Observable<OrdersListResponse> {
    // Valores por defecto para la paginación
    const defaultFilters: GetOrdersFilters = {
      page: filters?.page ?? 1,
      perPage: filters?.perPage ?? 20,
      includeDetails: filters?.includeDetails ?? false,
      ...filters
    };

    return this.orderRepository.getOrders(defaultFilters);
  }
}
