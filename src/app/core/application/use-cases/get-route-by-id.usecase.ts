import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RouteViewRepository } from '../../domain/repositories/route-view.repository';
import { RouteSummary } from '../../domain/entities/route.entity';

@Injectable({
  providedIn: 'root'
})
export class GetRouteByIdUseCase {
  private readonly repository = inject(RouteViewRepository);

  execute(routeId: number): Observable<RouteSummary> {
    return this.repository.getRouteById(routeId);
  }
}
