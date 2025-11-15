import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { OrderRepository } from '../../../domain/repositories/order.repository';

@Injectable({
  providedIn: 'root'
})
export class UpdateMultipleOrdersStatusUseCase {
  private orderRepository = inject(OrderRepository);

  execute(orderIds: number[], newStatus: string): Observable<{ success: boolean; updatedCount: number }> {
    return this.orderRepository.updateMultipleOrdersStatus(orderIds, newStatus);
  }
}
