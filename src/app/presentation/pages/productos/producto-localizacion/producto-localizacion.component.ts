import { Component, ViewChild, AfterViewInit, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { SearchProductLocationUseCase } from '../../../../core/application/use-cases/product-location/product-location.use-cases';
import { ProductLocationItem } from '../../../../core/domain/entities/product-location.entity';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-producto-localizacion',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatSelectModule,
    TranslateModule
  ],
  templateUrl: './producto-localizacion.component.html',
  styleUrls: ['./producto-localizacion.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductoLocalizacionComponent implements AfterViewInit {
  private searchUseCase = inject(SearchProductLocationUseCase);
  private notify = inject(NotificationService);
  private translate: TranslateService = inject(TranslateService);

  // Signals para estado reactivo
  locations = signal<ProductLocationItem[]>([]);
  loading = signal(false);
  errorMessage = signal<string | null>(null);
  selectedLocation = signal<ProductLocationItem | null>(null);
  searchPerformed = signal(false);

  // Form controls
  searchControl = new FormControl('');
  orderByControl = new FormControl<'fefo' | 'fifo' | 'lifo'>('fefo');

  // MatTable
  dataSource = new MatTableDataSource<ProductLocationItem>();
  displayedColumns = [
    'product_sku',
    'batch_number',
    'location',
    'quantity',
    'expiry_date',
    'zone_type',
    'temperature',
    'distribution_center',
    'status',
    'acciones'
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Computed values
  totalQuantity = computed(() => {
    return this.locations().reduce((sum, loc) => sum + loc.batch.batch_info.quantity, 0);
  });

  totalLocations = computed(() => this.locations().length);

  refrigeratedZones = computed(() => {
    return this.locations().filter(loc => loc.physical_location.is_refrigerated).length;
  });

  hasResults = computed(() => this.locations().length > 0);

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.setupSearchListener();
  }

  setupSearchListener(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged()
      )
      .subscribe(() => {
        if (this.searchControl.value && this.searchControl.value.trim().length >= 3) {
          this.search();
        }
      });
  }

  search(): void {
    const searchTerm = this.searchControl.value?.trim();
    
    if (!searchTerm || searchTerm.length < 3) {
      this.notify.warning(this.translate.instant('PRODUCT_LOCATION.MIN_SEARCH_LENGTH'));
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);
    this.searchPerformed.set(true);

    this.searchUseCase.execute(searchTerm, true)
      .subscribe({
        next: (response) => {
          this.loading.set(false);
          
          if (!response.found || response.locations.length === 0) {
            this.locations.set([]);
            this.dataSource.data = [];
            this.notify.info(this.translate.instant('PRODUCT_LOCATION.NO_LOCATIONS_FOUND'));
          } else {
            this.locations.set(response.locations);
            this.dataSource.data = response.locations;
            this.notify.success(this.translate.instant('PRODUCT_LOCATION.LOCATIONS_FOUND', { count: response.total_locations }));
          }
        },
        error: (error) => {
          this.loading.set(false);
          this.errorMessage.set(error.message);
          this.locations.set([]);
          this.dataSource.data = [];
          this.notify.error(error.message);
          console.error('Error al buscar ubicación:', error);
        }
      });
  }

  verDetalle(location: ProductLocationItem): void {
    this.selectedLocation.set(location);
  }

  cerrarDetalle(): void {
    this.selectedLocation.set(null);
  }

  getLocationCode(location: ProductLocationItem): string {
    return location.physical_location.location_code;
  }

  getFullLocation(location: ProductLocationItem): string {
    const pl = location.physical_location;
    return `Pasillo ${pl.aisle} - Estante ${pl.shelf} - Nivel ${pl.level_position}`;
  }

  getZoneIcon(location: ProductLocationItem): string {
    return location.physical_location.is_refrigerated ? '❄️' : '🌡️';
  }

  getZoneLabel(location: ProductLocationItem): string {
    return location.physical_location.zone_type === 'refrigerated' 
      ? this.translate.instant('PRODUCT_LOCATION.ZONE.REFRIGERATED') 
      : this.translate.instant('PRODUCT_LOCATION.ZONE.AMBIENT');
  }

  getStatusChipColor(location: ProductLocationItem): string {
    if (location.batch.status.is_expired) return 'warn';
    if (!location.batch.status.is_available) return 'basic';
    return 'primary';
  }

  getStatusLabel(location: ProductLocationItem): string {
    if (location.batch.status.is_expired) return this.translate.instant('PRODUCT_LOCATION.STATUS.EXPIRED');
    if (!location.batch.status.is_available) return this.translate.instant('PRODUCT_LOCATION.STATUS.UNAVAILABLE');
    return this.translate.instant('PRODUCT_LOCATION.STATUS.AVAILABLE');
  }

  getTemperatureStatus(location: ProductLocationItem): string {
    const tempReq = location.batch.temperature_requirements;
    if (!tempReq.range) return 'N/A';
    
    return tempReq.range;
  }

  getTemperatureColor(location: ProductLocationItem): 'primary' | 'warn' {
    return 'primary';
  }

  getDaysUntilExpiry(expiryDate: string): number {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getExpiryColor(expiryDate: string): string {
    const days = this.getDaysUntilExpiry(expiryDate);
    if (days < 0) return 'warn';
    if (days <= 30) return 'accent';
    return 'primary';
  }

  copiarUbicacion(locationCode: string): void {
    navigator.clipboard.writeText(locationCode);
    this.notify.success(this.translate.instant('PRODUCT_LOCATION.LOCATION_COPIED', { code: locationCode }));
  }

  resetSearch(): void {
    this.searchControl.setValue('');
    this.locations.set([]);
    this.dataSource.data = [];
    this.errorMessage.set(null);
    this.selectedLocation.set(null);
    this.searchPerformed.set(false);
  }
}