import { Observable } from 'rxjs';
import { 
  RouteSummary, 
  RouteListItem, 
  ListRoutesFilters, 
  ListRoutesResponse,
  RoutesByDateResponse
} from '../entities/route.entity';

export abstract class RouteViewRepository {
  abstract getRoutes(filters?: ListRoutesFilters): Observable<ListRoutesResponse>;
  abstract getRouteById(routeId: number): Observable<RouteSummary>;
  abstract getRoutesByDate(date: string, distributionCenterId: number): Observable<RoutesByDateResponse>;
}
