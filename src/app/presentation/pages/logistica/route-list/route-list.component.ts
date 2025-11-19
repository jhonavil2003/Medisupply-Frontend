import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { GetRoutesUseCase } from '../../../../core/application/use-cases/get-routes.usecase';
import { UpdateRouteStatusUseCase } from '../../../../core/application/use-cases/update-route-status.usecase';
import { ListRoutesFilters, RouteListItem, RouteStatus } from '../../../../core/domain/entities/route.entity';
import { ActivateRouteDialogComponent } from './activate-route-dialog.component';

@Component({
  selector: 'app-route-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDialogModule,
    MatProgressBarModule,
    TranslateModule
  ],
  templateUrl: './route-list.component.html',
  styleUrl: './route-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RouteListComponent implements OnInit {
  private readonly getRoutesUseCase = inject(GetRoutesUseCase);
  private readonly updateRouteStatusUseCase = inject(UpdateRouteStatusUseCase);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly translate = inject(TranslateService);

  // Estado
  routes = signal<RouteListItem[]>([]);
  loading = signal(false);
  total = signal(0);
  page = signal(1);
  perPage = signal(10);
  hasMore = signal(false);

  // Filtros
  filters = signal<ListRoutesFilters>({
    distributionCenterId: 1, // Por ahora hardcoded
    page: 1,
    perPage: 10
  });

  plannedDate: Date | null = null;
  selectedStatus: RouteStatus | '' = '';
  selectedVehicleId: number | null = null;

  // Configuración de tabla
  displayedColumns: string[] = [
    'routeNumber',
    'plannedDate',
    'status',
    'vehicle',
    'driver',
    'stops',
    'metrics',
    'actions'
  ];

  // Opciones de estado
  statusOptions: { value: RouteStatus; labelKey: string; color: string }[] = [
    { value: 'draft', labelKey: 'LOGISTICS.ROUTE.STATUS.DRAFT', color: 'accent' },
    { value: 'active', labelKey: 'LOGISTICS.ROUTE.STATUS.ACTIVE', color: 'primary' },
    { value: 'in_progress', labelKey: 'LOGISTICS.ROUTE.STATUS.IN_PROGRESS', color: 'primary' },
    { value: 'completed', labelKey: 'LOGISTICS.ROUTE.STATUS.COMPLETED', color: '' },
    { value: 'cancelled', labelKey: 'LOGISTICS.ROUTE.STATUS.CANCELLED', color: 'warn' }
  ];

  ngOnInit(): void {
    this.loadRoutes();
  }

  loadRoutes(): void {
    this.loading.set(true);
    
    this.getRoutesUseCase.execute(this.filters()).subscribe({
      next: (response) => {
        this.routes.set(response.routes);
        this.total.set(response.total);
        this.page.set(response.page);
        this.perPage.set(response.perPage);
        this.hasMore.set(response.hasMore);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading routes:', error);
        this.loading.set(false);
      }
    });
  }

  applyFilters(): void {
    this.filters.update(f => ({
      ...f,
      plannedDate: this.plannedDate ? this.formatDate(this.plannedDate) : undefined,
      status: this.selectedStatus || undefined,
      vehicleId: this.selectedVehicleId || undefined,
      page: 1 // Reset to first page
    }));
    this.loadRoutes();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.plannedDate = null;
    this.selectedStatus = '';
    this.selectedVehicleId = null;
    this.filters.set({
      distributionCenterId: 1,
      page: 1,
      perPage: 10
    });
    this.loadRoutes();
  }

  onPageChange(event: PageEvent): void {
    this.filters.update(f => ({
      ...f,
      page: event.pageIndex + 1,
      perPage: event.pageSize
    }));
    this.loadRoutes();
  }

  viewRoute(route: RouteListItem): void {
    this.router.navigate(['/rutas', route.id]);
  }

  viewOnMap(route: RouteListItem): void {
    this.router.navigate(['/rutas', route.id, 'mapa']);
  }

  activateRoute(route: RouteListItem, event: Event): void {
    event.stopPropagation();

    // Validar que la ruta esté en estado draft
    if (route.status !== 'draft') {
      this.translate.get('LOGISTICS.MESSAGES.ONLY_DRAFT_ROUTES_CAN_BE_ACTIVATED').subscribe(message => {
        this.snackBar.open(message, this.translate.instant('COMMON.CLOSE'), {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      });
      return;
    }

    // Abrir diálogo de confirmación profesional
    const dialogRef = this.dialog.open(ActivateRouteDialogComponent, {
      width: '600px',
      data: {
        routeCode: route.routeCode,
        driverName: route.driver.name,
        vehiclePlate: route.vehicle.plate,
        totalStops: route.metrics.totalStops,
        totalOrders: route.metrics.totalOrders
      },
      disableClose: false,
      autoFocus: true
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) {
        return;
      }

      // Activar ruta
      this.loading.set(true);
      
      this.updateRouteStatusUseCase.activateRoute(route.id, 'supervisor@medisupply.com').subscribe({
        next: (response) => {
          if (response.status === 'success') {
            this.translate.get('LOGISTICS.MESSAGES.ROUTE_ACTIVATED_SUCCESSFULLY').subscribe(message => {
              this.snackBar.open(message, this.translate.instant('COMMON.CLOSE'), {
                duration: 3000,
                panelClass: ['success-snackbar']
              });
            });
            
            // Recargar la lista de rutas
            this.loadRoutes();
          } else {
            this.translate.get('COMMON.ERROR').subscribe(errorLabel => {
              this.snackBar.open(`${errorLabel}: ${response.message}`, this.translate.instant('COMMON.CLOSE'), {
                duration: 5000,
                panelClass: ['error-snackbar']
              });
            });
            this.loading.set(false);
          }
        },
        error: (err) => {
          console.error('Error activating route:', err);
          this.translate.get('LOGISTICS.MESSAGES.ERROR_ACTIVATING_ROUTE').subscribe(message => {
            this.snackBar.open(
              `${message}: ${err.message || this.translate.instant('COMMON.UNKNOWN_ERROR')}`, 
              this.translate.instant('COMMON.CLOSE'), 
              {
                duration: 5000,
                panelClass: ['error-snackbar']
              }
            );
          });
          this.loading.set(false);
        }
      });
    });
  }

  canActivateRoute(route: RouteListItem): boolean {
    return route.status === 'draft';
  }

  getStatusColor(status: RouteStatus): string {
    const statusConfig = this.statusOptions.find(s => s.value === status);
    return statusConfig?.color || '';
  }

  getStatusLabel(status: RouteStatus): string {
    const statusConfig = this.statusOptions.find(s => s.value === status);
    if (statusConfig) {
      return this.translate.instant(statusConfig.labelKey);
    }
    return status;
  }

  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return `${hours}h ${mins}m`;
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
