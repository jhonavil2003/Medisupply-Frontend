import { Component, Input, OnInit, OnDestroy, PLATFORM_ID, inject, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { environment } from '../../../../../environments/environment';

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

@Component({
  selector: 'app-google-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="map-container">
      @if (loading()) {
        <div class="map-loading">
          <div class="spinner"></div>
          <p>Cargando mapa...</p>
        </div>
      }
      @if (error()) {
        <div class="map-error">
          <p>{{ error() }}</p>
        </div>
      }
      <div #mapElement id="map" class="map"></div>
    </div>
  `,
  styles: [`
    .map-container {
      position: relative;
      width: 100%;
      height: 100%;
      min-height: 300px;
      border-radius: 8px;
      overflow: hidden;
    }

    .map {
      width: 100%;
      height: 100%;
      min-height: 300px;
    }

    .map-loading,
    .map-error {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #f5f5f5;
      z-index: 1;
    }

    .map-loading p,
    .map-error p {
      margin-top: 12px;
      color: #666;
      font-size: 14px;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #1976d2;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .map-error {
      background: #fff3e0;
    }

    .map-error p {
      color: #d84315;
    }
  `]
})
export class GoogleMapComponent implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);

  @Input() latitude!: number;
  @Input() longitude!: number;
  @Input() markerTitle: string = 'Ubicación de entrega';
  @Input() zoom: number = 15;

  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  private map: any;
  private marker: any;
  private scriptLoaded = false;

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      if (!this.latitude || !this.longitude) {
        this.error.set('Coordenadas no disponibles');
        this.loading.set(false);
        return;
      }

      this.loadGoogleMapsScript();
    }
  }

  ngOnDestroy(): void {
    // Limpiar el mapa si existe
    if (this.map) {
      this.map = null;
    }
  }

  private loadGoogleMapsScript(): void {
    // Verificar si el script ya está cargado
    if (window.google && window.google.maps) {
      this.initializeMap();
      return;
    }

    // Verificar si el script ya está en el DOM
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      // Esperar a que se cargue
      const checkInterval = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(checkInterval);
          this.initializeMap();
        }
      }, 100);
      return;
    }

    // Cargar el script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      this.scriptLoaded = true;
      this.initializeMap();
    };

    script.onerror = () => {
      this.error.set('Error al cargar Google Maps');
      this.loading.set(false);
    };

    document.head.appendChild(script);
  }

  private initializeMap(): void {
    try {
      const mapElement = document.getElementById('map');

      if (!mapElement) {
        this.error.set('Elemento del mapa no encontrado');
        this.loading.set(false);
        return;
      }

      const position = {
        lat: this.latitude,
        lng: this.longitude
      };

      // Crear el mapa
      this.map = new window.google.maps.Map(mapElement, {
        center: position,
        zoom: this.zoom,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      // Crear el marcador
      this.marker = new window.google.maps.Marker({
        position: position,
        map: this.map,
        title: this.markerTitle,
        animation: window.google.maps.Animation.DROP
      });

      // Crear InfoWindow
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px;">
            <h4 style="margin: 0 0 8px 0; color: #333;">${this.markerTitle}</h4>
            <p style="margin: 0; color: #666; font-size: 13px;">
              <strong>Coordenadas:</strong><br>
              Lat: ${this.latitude.toFixed(6)}<br>
              Lng: ${this.longitude.toFixed(6)}
            </p>
            <a
              href="https://www.google.com/maps?q=${this.latitude},${this.longitude}"
              target="_blank"
              style="display: inline-block; margin-top: 8px; color: #1976d2; text-decoration: none; font-size: 13px;"
            >
              Abrir en Google Maps →
            </a>
          </div>
        `
      });

      // Abrir InfoWindow al hacer clic en el marcador
      this.marker.addListener('click', () => {
        infoWindow.open(this.map, this.marker);
      });

      // Abrir InfoWindow por defecto
      infoWindow.open(this.map, this.marker);

      this.loading.set(false);
      this.error.set(null);
    } catch (err: any) {
      console.error('Error initializing map:', err);
      this.error.set('Error al inicializar el mapa');
      this.loading.set(false);
    }
  }

  /**
   * Actualiza la posición del mapa y marcador
   */
  updatePosition(lat: number, lng: number): void {
    if (!this.map || !this.marker) return;

    const newPosition = { lat, lng };

    this.map.setCenter(newPosition);
    this.marker.setPosition(newPosition);
  }

  /**
   * Cambia el nivel de zoom
   */
  setZoom(zoom: number): void {
    if (this.map) {
      this.map.setZoom(zoom);
    }
  }
}
