import { Observable } from 'rxjs';
import { OrderEntity, OrdersListResponse, GetOrdersFilters } from '../entities/order.entity';

/**
 * Contrato del repositorio de Órdenes
 */
export abstract class OrderRepository {
  /**
   * Obtiene la lista de órdenes con filtros y paginación
   */
  abstract getOrders(filters?: GetOrdersFilters): Observable<OrdersListResponse>;

  /**
   * Obtiene una orden específica por ID
   */
  abstract getById(id: number): Observable<OrderEntity | null>;

  /**
   * Obtiene órdenes de un vendedor específico
   */
  abstract getOrdersBySeller(sellerId: string, page?: number, perPage?: number): Observable<OrdersListResponse>;

  /**
   * Obtiene órdenes de un cliente específico
   */
  abstract getOrdersByCustomer(customerId: number, page?: number, perPage?: number): Observable<OrdersListResponse>;

  /**
   * Obtiene órdenes por estado
   */
  abstract getOrdersByStatus(status: string, page?: number, perPage?: number): Observable<OrdersListResponse>;
}
