import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RouteViewRepository } from '../../domain/repositories/route-view.repository';
import { 
  ListRoutesFilters, 
  ListRoutesResponse, 
  RoutesByDateResponse, 
  RouteSummary,
  RouteListItem
} from '../../domain/entities/route.entity';

// Interfaz para mapear la respuesta del backend
interface BackendRouteListItem {
  id: number;
  route_code: string;
  vehicle_id: number;
  driver: {
    name: string;
    phone: string;
  };
  dates: {
    generation_date: string;
    planned_date: string;
  };
  status: string;
  metrics: {
    total_distance_km: number;
    estimated_duration_minutes: number;
    actual_duration_minutes: number | null;
    total_orders: number;
    total_stops: number;
    total_weight_kg: number;
    total_volume_m3: number;
    completion_percentage: number;
  };
  optimization: {
    score: number;
    strategy: string;
    has_cold_chain_products: boolean;
  };
  distribution_center_id: number;
  times: {
    estimated_start: string;
    actual_start: string | null;
    estimated_end: string;
    actual_end: string | null;
  };
  costs: {
    estimated: number;
    actual: number | null;
  };
  notes: string | null;
  polyline: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
  vehicle: {
    id: number;
    plate: string;
    vehicle_type: string;
    capacity_kg: number;
    capacity_m3: number;
    cold_chain_capable: boolean;
    status: string;
    driver_name: string;
    driver_phone: string;
  };
}

interface BackendListRoutesResponse {
  status: string;
  routes: BackendRouteListItem[];
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

// Interfaces para el detalle de ruta (modo resumido)
interface BackendRouteSummaryResponse {
  status: string;
  route: {
    id: number;
    route_code: string;
    status: string;
    planned_date: string;
    distribution_center_id: number;
    vehicle: {
      id: number;
      plate: string;
      type: string;
      driver: string;
    };
    metrics: {
      total_stops: number;
      total_orders: number;
      total_distance_km: number;
      estimated_duration_minutes: number;
      total_weight_kg: number;
      total_volume_m3: number;
      completion_percentage: number;
    };
    stops: Array<{
      sequence: number;
      customer_name: string;
      address: string;
      city: string;
      coordinates: {
        lat: number;
        lng: number;
      };
      estimated_arrival: string | null;
      orders: Array<{
        order_id: number;
        order_number: string;
        customer_name: string;
        clinical_priority: string;
        requires_cold_chain: boolean;
      }>;
      status: string;
    }>;
    schedule: {
      start_time: string | null;
      end_time: string | null;
    };
    optimization_score: number | null;
    created_at: string;
    created_by: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class RouteViewHttpRepository extends RouteViewRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/routes';

  override getRoutes(filters?: ListRoutesFilters): Observable<ListRoutesResponse> {
    let params = new HttpParams();

    if (filters) {
      if (filters.distributionCenterId) {
        params = params.set('distribution_center_id', filters.distributionCenterId.toString());
      }
      if (filters.plannedDate) {
        params = params.set('planned_date', filters.plannedDate);
      }
      if (filters.status) {
        params = params.set('status', filters.status);
      }
      if (filters.vehicleId) {
        params = params.set('vehicle_id', filters.vehicleId.toString());
      }
      if (filters.page && filters.perPage) {
        // Convertir page/perPage a offset/limit
        const offset = (filters.page - 1) * filters.perPage;
        params = params.set('offset', offset.toString());
        params = params.set('limit', filters.perPage.toString());
      }
    }

    return this.http.get<BackendListRoutesResponse>(`${this.baseUrl}`, { params })
      .pipe(
        map(response => this.mapBackendResponseToDomain(response, filters))
      );
  }

  override getRouteById(routeId: number): Observable<RouteSummary> {
    const params = new HttpParams().set('summary', 'true');
    
    return this.http.get<BackendRouteSummaryResponse>(`${this.baseUrl}/${routeId}`, { params })
      .pipe(
        map(response => this.mapBackendRouteSummaryToDomain(response.route))
      );
  }

  override getRoutesByDate(date: string, distributionCenterId: number): Observable<RoutesByDateResponse> {
    const params = new HttpParams()
      .set('date', date)
      .set('distribution_center_id', distributionCenterId.toString());

    return this.http.get<RoutesByDateResponse>(`${this.baseUrl}/by-date`, { params });
  }

  private mapBackendResponseToDomain(
    backendResponse: BackendListRoutesResponse, 
    filters?: ListRoutesFilters
  ): ListRoutesResponse {
    const page = filters?.page || 1;
    const perPage = filters?.perPage || 10;

    return {
      routes: backendResponse.routes.map(route => this.mapBackendRouteToRouteListItem(route)),
      total: backendResponse.total,
      page: page,
      perPage: perPage,
      hasMore: backendResponse.has_more
    };
  }

  private mapBackendRouteToRouteListItem(backendRoute: BackendRouteListItem): RouteListItem {
    return {
      id: backendRoute.id,
      routeCode: backendRoute.route_code,
      vehicleId: backendRoute.vehicle_id,
      driver: {
        name: backendRoute.driver.name,
        phone: backendRoute.driver.phone
      },
      dates: {
        generationDate: backendRoute.dates.generation_date,
        plannedDate: backendRoute.dates.planned_date
      },
      status: backendRoute.status as any, // Type assertion para RouteStatus
      metrics: {
        totalDistanceKm: backendRoute.metrics.total_distance_km,
        estimatedDurationMinutes: backendRoute.metrics.estimated_duration_minutes,
        actualDurationMinutes: backendRoute.metrics.actual_duration_minutes,
        totalOrders: backendRoute.metrics.total_orders,
        totalStops: backendRoute.metrics.total_stops,
        totalWeightKg: backendRoute.metrics.total_weight_kg,
        totalVolumeM3: backendRoute.metrics.total_volume_m3,
        completionPercentage: backendRoute.metrics.completion_percentage
      },
      optimization: {
        score: backendRoute.optimization.score,
        strategy: backendRoute.optimization.strategy as any, // Type assertion para OptimizationStrategy
        hasColdChainProducts: backendRoute.optimization.has_cold_chain_products
      },
      distributionCenterId: backendRoute.distribution_center_id,
      times: {
        estimatedStart: backendRoute.times.estimated_start,
        actualStart: backendRoute.times.actual_start,
        estimatedEnd: backendRoute.times.estimated_end,
        actualEnd: backendRoute.times.actual_end
      },
      costs: {
        estimated: backendRoute.costs.estimated,
        actual: backendRoute.costs.actual
      },
      notes: backendRoute.notes,
      polyline: backendRoute.polyline,
      createdAt: backendRoute.created_at,
      updatedAt: backendRoute.updated_at,
      createdBy: backendRoute.created_by,
      vehicle: {
        id: backendRoute.vehicle.id,
        plate: backendRoute.vehicle.plate,
        vehicleType: backendRoute.vehicle.vehicle_type,
        capacityKg: backendRoute.vehicle.capacity_kg,
        capacityM3: backendRoute.vehicle.capacity_m3,
        coldChainCapable: backendRoute.vehicle.cold_chain_capable,
        status: backendRoute.vehicle.status,
        driverName: backendRoute.vehicle.driver_name,
        driverPhone: backendRoute.vehicle.driver_phone
      }
    };
  }

  private mapBackendRouteSummaryToDomain(backendRoute: BackendRouteSummaryResponse['route']): RouteSummary {
    return {
      id: backendRoute.id,
      routeCode: backendRoute.route_code,
      status: backendRoute.status as any,
      plannedDate: backendRoute.planned_date,
      distributionCenterId: backendRoute.distribution_center_id,
      vehicle: {
        id: backendRoute.vehicle.id,
        plate: backendRoute.vehicle.plate,
        type: backendRoute.vehicle.type,
        driver: backendRoute.vehicle.driver
      },
      metrics: {
        totalDistanceKm: backendRoute.metrics.total_distance_km,
        estimatedDurationMinutes: backendRoute.metrics.estimated_duration_minutes,
        actualDurationMinutes: null,
        totalOrders: backendRoute.metrics.total_orders,
        totalStops: backendRoute.metrics.total_stops,
        totalWeightKg: backendRoute.metrics.total_weight_kg,
        totalVolumeM3: backendRoute.metrics.total_volume_m3,
        completionPercentage: backendRoute.metrics.completion_percentage
      },
      stops: backendRoute.stops.map(stop => ({
        sequence: stop.sequence,
        customerName: stop.customer_name,
        address: stop.address,
        city: stop.city,
        coordinates: {
          lat: stop.coordinates.lat,
          lng: stop.coordinates.lng
        },
        estimatedArrival: stop.estimated_arrival,
        orders: stop.orders.map(order => ({
          orderId: order.order_id,
          orderNumber: order.order_number,
          customerName: order.customer_name,
          clinicalPriority: order.clinical_priority,
          requiresColdChain: order.requires_cold_chain
        })),
        status: stop.status as any
      })),
      schedule: {
        startTime: backendRoute.schedule.start_time,
        endTime: backendRoute.schedule.end_time
      },
      optimizationScore: backendRoute.optimization_score,
      createdAt: backendRoute.created_at,
      createdBy: backendRoute.created_by
    };
  }
}
