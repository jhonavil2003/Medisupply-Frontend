import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RouteViewRepository } from '../../domain/repositories/route-view.repository';
import { RoutesByDateResponse } from '../../domain/entities/route.entity';

@Injectable({
  providedIn: 'root'
})
export class GetRoutesByDateUseCase {
  private readonly repository = inject(RouteViewRepository);

  execute(date: string, distributionCenterId: number): Observable<RoutesByDateResponse> {
    return this.repository.getRoutesByDate(date, distributionCenterId);
  }
}
