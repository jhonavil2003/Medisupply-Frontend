import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RouteViewRepository } from '../../domain/repositories/route-view.repository';
import { ListRoutesFilters, ListRoutesResponse } from '../../domain/entities/route.entity';

@Injectable({
  providedIn: 'root'
})
export class GetRoutesUseCase {
  private readonly repository = inject(RouteViewRepository);

  execute(filters?: ListRoutesFilters): Observable<ListRoutesResponse> {
    return this.repository.getRoutes(filters);
  }
}
