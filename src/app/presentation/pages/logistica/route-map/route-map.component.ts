import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { GoogleMapsModule } from '@angular/google-maps';
import { GetRouteByIdUseCase } from '../../../../core/application/use-cases/get-route-by-id.usecase';
import { RouteSummary, RouteStop } from '../../../../core/domain/entities/route.entity';

@Component({
  selector: 'app-route-map',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    GoogleMapsModule
  ],
  templateUrl: './route-map.component.html',
  styleUrls: ['./route-map.component.css']
})
export class RouteMapComponent implements OnInit {
  private readonly getRouteByIdUseCase = inject(GetRouteByIdUseCase);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  routeDetail = signal<RouteSummary | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  // Map configuration
  center = signal<google.maps.LatLngLiteral>({ lat: 4.6097, lng: -74.0817 }); // Bogotá default
  zoom = signal(12);
  mapOptions = signal<google.maps.MapOptions>({
    mapTypeId: 'roadmap',
    zoomControl: true,
    scrollwheel: true,
    disableDoubleClickZoom: false,
    maxZoom: 20,
    minZoom: 8,
    mapTypeControl: true,
    streetViewControl: false,
    fullscreenControl: true
  });

  // Route polyline
  polylineOptions = signal<google.maps.PolylineOptions>({
    strokeColor: '#1976d2',
    strokeOpacity: 0.8,
    strokeWeight: 4
  });
  routePath = signal<google.maps.LatLngLiteral[]>([]);

  // Directions Service & Renderer
  directionsService: google.maps.DirectionsService | null = null;
  directionsRenderer = signal<google.maps.DirectionsRenderer | null>(null);
  directionsResult = signal<google.maps.DirectionsResult | null>(null);

  // Markers
  markerOptions = signal<google.maps.MarkerOptions>({
    draggable: false
  });
  stops = signal<RouteStop[]>([]);
  selectedStop = signal<RouteStop | null>(null);
  infoWindowOptions = signal<google.maps.InfoWindowOptions>({
    maxWidth: 300
  });

  ngOnInit(): void {
    const routeId = this.route.snapshot.paramMap.get('id');
    if (routeId) {
      this.loadRouteDetails(parseInt(routeId, 10));
    }
    
    // Initialize Directions Service
    this.directionsService = new google.maps.DirectionsService();
  }

  private loadRouteDetails(routeId: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.getRouteByIdUseCase.execute(routeId).subscribe({
      next: (route) => {
        this.routeDetail.set(route);
        this.stops.set(route.stops);
        this.setupMap(route);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar los detalles de la ruta');
        console.error('Error loading route details:', err);
        this.loading.set(false);
      }
    });
  }

  private setupMap(route: RouteSummary): void {
    if (route.stops.length === 0) {
      return;
    }

    // Filter stops with valid coordinates
    const validStops = route.stops.filter(
      stop => stop.coordinates.lat && stop.coordinates.lng
    );

    if (validStops.length === 0) {
      return;
    }

    // Build simple path for fallback
    const path: google.maps.LatLngLiteral[] = validStops.map(stop => ({
      lat: stop.coordinates.lat,
      lng: stop.coordinates.lng
    }));

    this.routePath.set(path);

    // Calculate center
    if (path.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      path.forEach(point => bounds.extend(point));
      
      const center = bounds.getCenter();
      this.center.set({ lat: center.lat(), lng: center.lng() });

      // Adjust zoom based on bounds
      const ne = bounds.getNorthEast();
      const sw = bounds.getSouthWest();
      const distance = Math.max(
        Math.abs(ne.lat() - sw.lat()),
        Math.abs(ne.lng() - sw.lng())
      );
      
      if (distance < 0.01) this.zoom.set(15);
      else if (distance < 0.05) this.zoom.set(13);
      else if (distance < 0.1) this.zoom.set(12);
      else if (distance < 0.5) this.zoom.set(10);
      else this.zoom.set(9);
    }

    // Calculate directions using Google Maps Directions API
    if (validStops.length >= 2) {
      this.calculateDirections(validStops);
    }
  }

  private calculateDirections(stops: RouteStop[]): void {
    if (!this.directionsService) {
      return;
    }

    const origin = {
      lat: stops[0].coordinates.lat,
      lng: stops[0].coordinates.lng
    };

    const destination = {
      lat: stops[stops.length - 1].coordinates.lat,
      lng: stops[stops.length - 1].coordinates.lng
    };

    // Waypoints (intermediate stops)
    // Google Maps API has a limit of 25 waypoints for free tier
    const maxWaypoints = 25;
    const intermediateStops = stops.slice(1, stops.length - 1);
    
    let waypoints: google.maps.DirectionsWaypoint[] = intermediateStops
      .map(stop => ({
        location: {
          lat: stop.coordinates.lat,
          lng: stop.coordinates.lng
        },
        stopover: true
      }));

    // If we have too many waypoints, we need to sample them
    if (waypoints.length > maxWaypoints) {
      console.warn(`Route has ${waypoints.length} waypoints, limiting to ${maxWaypoints}`);
      // Take evenly distributed waypoints
      const step = Math.ceil(waypoints.length / maxWaypoints);
      waypoints = waypoints.filter((_, index) => index % step === 0).slice(0, maxWaypoints);
    }

    const request: google.maps.DirectionsRequest = {
      origin,
      destination,
      waypoints,
      optimizeWaypoints: false, // Keep the order as defined by the route
      travelMode: google.maps.TravelMode.DRIVING,
      unitSystem: google.maps.UnitSystem.METRIC,
      avoidHighways: false,
      avoidTolls: false
    };

    this.directionsService.route(request, (result, status) => {
      if (status === google.maps.DirectionsStatus.OK && result) {
        this.directionsResult.set(result);
        
        // Extract the path from directions for custom rendering if needed
        const route = result.routes[0];
        if (route && route.overview_path) {
          const detailedPath = route.overview_path.map(point => ({
            lat: point.lat(),
            lng: point.lng()
          }));
          this.routePath.set(detailedPath);
        }

        // Log route information
        if (route && route.legs) {
          const totalDistance = route.legs.reduce((sum, leg) => sum + (leg.distance?.value || 0), 0) / 1000;
          const totalDuration = route.legs.reduce((sum, leg) => sum + (leg.duration?.value || 0), 0) / 60;
          console.log(`Calculated route: ${totalDistance.toFixed(2)} km, ${totalDuration.toFixed(0)} minutes`);
        }
      } else {
        console.error('Directions request failed:', status);
        if (status === google.maps.DirectionsStatus.OVER_QUERY_LIMIT) {
          console.warn('Google Maps API quota exceeded. Using simple polyline as fallback.');
        }
        // Keep the simple straight-line path as fallback
      }
    });
  }

  getMarkerPosition(stop: RouteStop): google.maps.LatLngLiteral {
    return {
      lat: stop.coordinates.lat,
      lng: stop.coordinates.lng
    };
  }

  getMarkerOptions(stop: RouteStop): google.maps.MarkerOptions {
    let iconColor = '#1976d2'; // default blue
    
    if (stop.sequence === 1) {
      iconColor = '#4caf50'; // green for start
    } else if (stop.sequence === this.stops().length) {
      iconColor = '#f44336'; // red for end
    }

    return {
      label: {
        text: stop.sequence.toString(),
        color: 'white',
        fontWeight: 'bold',
        fontSize: '14px'
      },
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 15,
        fillColor: iconColor,
        fillOpacity: 1,
        strokeColor: 'white',
        strokeWeight: 2
      }
    };
  }

  openInfoWindow(stop: RouteStop): void {
    this.selectedStop.set(stop);
  }

  closeInfoWindow(): void {
    this.selectedStop.set(null);
  }

  goBack(): void {
    const routeId = this.route.snapshot.paramMap.get('id');
    this.router.navigate(['/rutas', routeId]);
  }

  viewDetails(): void {
    const routeId = this.route.snapshot.paramMap.get('id');
    this.router.navigate(['/rutas', routeId]);
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      pending: 'accent',
      in_progress: 'primary',
      completed: '',
      cancelled: 'warn'
    };
    return colors[status] || '';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      in_progress: 'En Progreso',
      completed: 'Completada',
      cancelled: 'Cancelada'
    };
    return labels[status] || status;
  }

  formatDate(isoString: string): string {
    const date = new Date(isoString);
    return date.toLocaleDateString('es-CO', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  getStopStatusColor(status: string): string {
    const colors: Record<string, string> = {
      pending: '',
      in_progress: 'primary',
      completed: '',
      failed: 'warn'
    };
    return colors[status] || '';
  }
}
