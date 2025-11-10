import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { RouteRepository, VehicleEntity } from '../../infrastructure/repositories/route.repository';

@Injectable({
  providedIn: 'root'
})
export class GetAvailableVehiclesUseCase {
  private routeRepository = inject(RouteRepository);

  execute(distributionCenterId: number, date: string): Observable<VehicleEntity[]> {
    return this.routeRepository.getAvailableVehicles(distributionCenterId, date);
  }
}
