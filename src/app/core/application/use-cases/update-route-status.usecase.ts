import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RouteViewRepository, UpdateRouteStatusRequest, UpdateRouteStatusResponse } from '../../domain/repositories/route-view.repository';
import { RouteStatus } from '../../domain/entities/route.entity';

@Injectable({
  providedIn: 'root'
})
export class UpdateRouteStatusUseCase {
  private readonly repository = inject(RouteViewRepository);

  execute(
    routeId: number, 
    status: RouteStatus, 
    updatedBy?: string
  ): Observable<UpdateRouteStatusResponse> {
    const request: UpdateRouteStatusRequest = {
      status,
      updated_by: updatedBy || 'frontend-user'
    };

    return this.repository.updateRouteStatus(routeId, request);
  }

  /**
   * Método de conveniencia para activar una ruta (draft → active)
   */
  activateRoute(routeId: number, updatedBy?: string): Observable<UpdateRouteStatusResponse> {
    return this.execute(routeId, 'active', updatedBy);
  }

  /**
   * Valida si una transición de estado es válida
   */
  validateTransition(currentStatus: RouteStatus, newStatus: RouteStatus): {
    allowed: boolean;
    reason?: string;
  } {
    const validTransitions: Record<RouteStatus, RouteStatus[]> = {
      draft: ['active'],
      active: ['in_progress'],
      in_progress: ['completed'],
      completed: [],
      cancelled: [],
    };

    const allowed = validTransitions[currentStatus]?.includes(newStatus) || false;

    return {
      allowed,
      reason: allowed 
        ? undefined 
        : `No se puede cambiar de ${currentStatus} a ${newStatus}`
    };
  }
}
