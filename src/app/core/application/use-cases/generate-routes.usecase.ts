import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { RouteRepository, GenerateRoutesRequest, GenerateRoutesResponse } from '../../infrastructure/repositories/route.repository';

@Injectable({
  providedIn: 'root'
})
export class GenerateRoutesUseCase {
  private routeRepository = inject(RouteRepository);

  execute(request: GenerateRoutesRequest): Observable<GenerateRoutesResponse> {
    return this.routeRepository.generateRoutes(request);
  }
}
