import { Observable } from 'rxjs';
import { 
  RouteSummary, 
  RouteListItem, 
  ListRoutesFilters, 
  ListRoutesResponse,
  RoutesByDateResponse,
  RouteStatus
} from '../entities/route.entity';

export interface UpdateRouteStatusRequest {
  status: RouteStatus;
  updated_by?: string;
}

export interface UpdateRouteStatusResponse {
  status: 'success' | 'error';
  message: string;
  route?: RouteSummary;
}

export abstract class RouteViewRepository {
  abstract getRoutes(filters?: ListRoutesFilters): Observable<ListRoutesResponse>;
  abstract getRouteById(routeId: number): Observable<RouteSummary>;
  abstract getRoutesByDate(date: string, distributionCenterId: number): Observable<RoutesByDateResponse>;
  abstract updateRouteStatus(routeId: number, request: UpdateRouteStatusRequest): Observable<UpdateRouteStatusResponse>;
}
