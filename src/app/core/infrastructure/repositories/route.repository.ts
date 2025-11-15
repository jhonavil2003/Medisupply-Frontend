import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment.development';

export interface VehicleEntity {
  id: number;
  plate: string;
  type: string;
  capacityKg: number;
  fuelType: string;
  status: 'available' | 'in_use' | 'maintenance';
  driver: {
    name: string;
    phone: string;
    licenseNumber: string;
  };
  distributionCenter: {
    id: number;
    code: string;
  };
  lastMaintenance: string;
  nextMaintenance: string;
}

export interface GenerateRoutesRequest {
  distributionCenterId: number;
  plannedDate: string;
  orderIds: number[];
  optimizationStrategy?: 'balanced' | 'minimize_distance' | 'minimize_time' | 'minimize_cost' | 'priority_first';
  forceRegenerate?: boolean;
  createdBy?: string;
}

export interface RouteVehicle {
  id: number;
  plate: string;
  type: string;
  capacityKg: number;
  driverName: string;
  driverPhone: string;
}

export interface GeneratedRoute {
  id: number;
  routeCode: string;
  vehicle: RouteVehicle;
  stopsCount: number;
  ordersCount: number;
  distanceKm: number;
  durationMinutes: number;
  fuelCostEstimate: number;
  status: string;
  plannedDeparture: string;
  estimatedReturn: string;
}

export interface GenerateRoutesResponse {
  status: 'success' | 'partial' | 'failed';
  message: string;
  summary: {
    routesGenerated: number;
    ordersAssigned: number;
    ordersUnassigned: number;
    totalDistanceKm: number;
    estimatedDurationHours: number;
    optimizationScore: number;
    fuelCostEstimate?: number;
    vehiclesUsed?: number;
  };
  routes: GeneratedRoute[];
  warnings?: string[];
  errors?: string[];
  computationTimeSeconds: number;
  generatedAt: string;
  unassignedOrders?: Array<{
    orderId: number;
    reason: string;
  }>;
}

interface BackendVehicle {
  id: number;
  plate: string;
  vehicle_type: string;
  brand: string;
  model: string;
  year: number;
  capacity: {
    kg: number;
    m3: number;
  };
  driver: {
    name: string;
    phone: string;
    license: string;
  };
  status: {
    is_active: boolean;
    is_available: boolean;
    is_ready_for_route: boolean;
  };
  features: {
    has_refrigeration: boolean;
    can_handle_cold_chain: boolean;
    temperature_min: number | null;
    temperature_max: number | null;
  };
  operations: {
    cost_per_km: number;
    avg_speed_kmh: number;
    max_stops_per_route: number;
  };
  maintenance: {
    last_date: string | null;
    next_date: string | null;
  };
  home_distribution_center_id: number;
  full_description: string;
  notes: string;
}

interface BackendGeneratedRoute {
  id: number;
  route_code: string;
  vehicle: {
    id: number;
    plate: string;
    type: string;
    capacity_kg: number;
    driver_name: string;
    driver_phone: string;
  };
  stops_count: number;
  orders_count: number;
  distance_km: number;
  duration_minutes: number;
  fuel_cost_estimate: number;
  status: string;
  planned_departure: string;
  estimated_return: string;
}

interface BackendGenerateRoutesResponse {
  status: string;
  message: string;
  summary: {
    routes_generated: number;
    orders_assigned: number;
    orders_unassigned: number;
    total_distance_km: number;
    estimated_duration_hours: number;
    optimization_score: number;
    fuel_cost_estimate?: number;
    vehicles_used?: number;
  };
  routes: BackendGeneratedRoute[];
  warnings?: string[];
  errors?: string[];
  computation_time_seconds: number;
  generated_at: string;
  unassigned_orders?: Array<{
    order_id: number;
    reason: string;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class RouteRepository {
  private http = inject(HttpClient);
  private apiUrl = `${environment.logisticsApiUrl}/routes`;
  private vehiclesUrl = `${environment.logisticsApiUrl}/vehicles`;

  private mapVehicleToDomain(backend: BackendVehicle): VehicleEntity {
    const getStatusLabel = (): 'available' | 'in_use' | 'maintenance' => {
      if (!backend.status.is_available) return 'maintenance';
      if (!backend.status.is_ready_for_route) return 'in_use';
      return 'available';
    };

    return {
      id: backend.id,
      plate: backend.plate,
      type: backend.vehicle_type,
      capacityKg: backend.capacity.kg,
      fuelType: 'diesel',
      status: getStatusLabel(),
      driver: {
        name: backend.driver.name,
        phone: backend.driver.phone,
        licenseNumber: backend.driver.license
      },
      distributionCenter: {
        id: backend.home_distribution_center_id,
        code: `CEDIS-${backend.home_distribution_center_id}`
      },
      lastMaintenance: backend.maintenance.last_date || '',
      nextMaintenance: backend.maintenance.next_date || ''
    };
  }

  private mapGeneratedRouteToDomain(backend: BackendGeneratedRoute): GeneratedRoute {
    return {
      id: backend.id,
      routeCode: backend.route_code,
      vehicle: {
        id: backend.vehicle.id,
        plate: backend.vehicle.plate,
        type: backend.vehicle.type,
        capacityKg: backend.vehicle.capacity_kg,
        driverName: backend.vehicle.driver_name,
        driverPhone: backend.vehicle.driver_phone
      },
      stopsCount: backend.stops_count,
      ordersCount: backend.orders_count,
      distanceKm: backend.distance_km,
      durationMinutes: backend.duration_minutes,
      fuelCostEstimate: backend.fuel_cost_estimate,
      status: backend.status,
      plannedDeparture: backend.planned_departure,
      estimatedReturn: backend.estimated_return
    };
  }

  getAvailableVehicles(distributionCenterId: number, date: string): Observable<VehicleEntity[]> {
    const params = new HttpParams()
      .set('distribution_center_id', distributionCenterId.toString())
      .set('date', date);

    return this.http.get<any>(`${this.vehiclesUrl}/available`, { params }).pipe(
      map(response => {
        console.log('Raw vehicles response:', response);
        
        const vehicles = response.vehicles || response.data || response;
        
        if (!Array.isArray(vehicles)) {
          console.error('Unexpected response format:', response);
          return [];
        }
        
        return vehicles.map((v: BackendVehicle) => this.mapVehicleToDomain(v));
      }),
      catchError(error => {
        console.error('Error fetching available vehicles:', error);
        if (error.status === 200) {
          console.error('Status 200 but parsing failed. Response body:', error.error);
        }
        throw error;
      })
    );
  }

  generateRoutes(request: GenerateRoutesRequest): Observable<GenerateRoutesResponse> {
    const backendRequest = {
      distribution_center_id: request.distributionCenterId,
      planned_date: request.plannedDate,
      order_ids: request.orderIds,
      optimization_strategy: request.optimizationStrategy || 'balanced',
      force_regenerate: request.forceRegenerate || false,
      created_by: request.createdBy || ''
    };

    return this.http.post<BackendGenerateRoutesResponse>(`${this.apiUrl}/generate`, backendRequest).pipe(
      map(response => ({
        status: response.status as any,
        message: response.message,
        summary: {
          routesGenerated: response.summary.routes_generated,
          ordersAssigned: response.summary.orders_assigned,
          ordersUnassigned: response.summary.orders_unassigned,
          totalDistanceKm: response.summary.total_distance_km,
          estimatedDurationHours: response.summary.estimated_duration_hours,
          optimizationScore: response.summary.optimization_score,
          fuelCostEstimate: response.summary.fuel_cost_estimate,
          vehiclesUsed: response.summary.vehicles_used
        },
        routes: response.routes.map(r => this.mapGeneratedRouteToDomain(r)),
        warnings: response.warnings,
        errors: response.errors,
        computationTimeSeconds: response.computation_time_seconds,
        generatedAt: response.generated_at,
        unassignedOrders: response.unassigned_orders?.map(uo => ({
          orderId: uo.order_id,
          reason: uo.reason
        }))
      })),
      catchError(error => {
        console.error('Error generating routes:', error);
        throw error;
      })
    );
  }
}
