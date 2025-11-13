export type RouteStatus = 'draft' | 'active' | 'in_progress' | 'completed' | 'cancelled';
export type StopStatus = 'pending' | 'in_progress' | 'completed' | 'failed';
export type OptimizationStrategy = 'balanced' | 'minimize_distance' | 'minimize_time' | 'minimize_cost' | 'priority_first';

export interface RouteDriver {
  name: string;
  phone: string;
}

export interface RouteMetrics {
  totalDistanceKm: number;
  estimatedDurationMinutes: number;
  actualDurationMinutes: number | null;
  totalOrders: number;
  totalStops: number;
  totalWeightKg: number;
  totalVolumeM3: number;
  completionPercentage: number;
}

export interface RouteVehicle {
  id: number;
  plate: string;
  type: string;
  driver: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface RouteOrder {
  orderId: number;
  orderNumber: string;
  customerName: string;
  clinicalPriority: string;
  requiresColdChain: boolean;
}

export interface RouteStop {
  sequence: number;
  customerName: string;
  address: string;
  city: string;
  coordinates: Coordinates;
  estimatedArrival: string | null;
  orders: RouteOrder[];
  status: StopStatus;
}

export interface RouteSchedule {
  startTime: string | null;
  endTime: string | null;
}

export interface RouteSummary {
  id: number;
  routeCode: string;
  status: RouteStatus;
  plannedDate: string;
  distributionCenterId: number;
  vehicle: RouteVehicle;
  metrics: RouteMetrics;
  stops: RouteStop[];
  schedule: RouteSchedule;
  optimizationScore: number | null;
  createdAt: string;
  createdBy: string;
}

export interface RouteDates {
  generationDate: string;
  plannedDate: string;
}

export interface RouteOptimization {
  score: number;
  strategy: OptimizationStrategy;
  hasColdChainProducts: boolean;
}

export interface RouteTimes {
  estimatedStart: string;
  actualStart: string | null;
  estimatedEnd: string;
  actualEnd: string | null;
}

export interface RouteCosts {
  estimated: number;
  actual: number | null;
}

export interface RouteVehicleInfo {
  id: number;
  plate: string;
  vehicleType: string;
  capacityKg: number;
  capacityM3: number;
  coldChainCapable: boolean;
  status: string;
  driverName: string;
  driverPhone: string;
}

export interface RouteListItem {
  id: number;
  routeCode: string;
  vehicleId: number;
  driver: RouteDriver;
  dates: RouteDates;
  status: RouteStatus;
  metrics: RouteMetrics;
  optimization: RouteOptimization;
  distributionCenterId: number;
  times: RouteTimes;
  costs: RouteCosts;
  notes: string | null;
  polyline: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  vehicle: RouteVehicleInfo;
}

export interface RouteDateSummary {
  totalRoutes: number;
  totalDistanceKm: number;
  totalOrders: number;
  statusCounts: Record<RouteStatus, number>;
}

export interface RoutesByDateResponse {
  date: string;
  distributionCenterId: number;
  routes: RouteListItem[];
  summary: RouteDateSummary;
}

export interface ListRoutesFilters {
  distributionCenterId?: number;
  plannedDate?: string;
  status?: RouteStatus;
  vehicleId?: number;
  page?: number;
  perPage?: number;
}

export interface ListRoutesResponse {
  routes: RouteListItem[];
  total: number;
  page: number;
  perPage: number;
  hasMore: boolean;
}
