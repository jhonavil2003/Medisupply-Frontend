import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { OrderRepository } from '../../../domain/repositories/order.repository';
import { OrderEntity } from '../../../domain/entities/order.entity';

@Injectable({
  providedIn: 'root'
})
export class UpdateOrderStatusUseCase {
  private orderRepository = inject(OrderRepository);

  execute(orderId: number, newStatus: string): Observable<OrderEntity> {
    return this.orderRepository.updateOrderStatus(orderId, newStatus);
  }
}
