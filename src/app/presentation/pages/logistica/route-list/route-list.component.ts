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
import { FormsModule } from '@angular/forms';
import { GetRoutesUseCase } from '../../../../core/application/use-cases/get-routes.usecase';
import { ListRoutesFilters, RouteListItem, RouteStatus } from '../../../../core/domain/entities/route.entity';

@Component({
  selector: 'app-route-list',
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
    MatTooltipModule
  ],
  templateUrl: './route-list.component.html',
  styleUrl: './route-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RouteListComponent implements OnInit {
  private readonly getRoutesUseCase = inject(GetRoutesUseCase);
  private readonly router = inject(Router);

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
  statusOptions: { value: RouteStatus; label: string; color: string }[] = [
    { value: 'draft', label: 'Borrador', color: 'accent' },
    { value: 'active', label: 'Activa', color: 'primary' },
    { value: 'in_progress', label: 'En Progreso', color: 'primary' },
    { value: 'completed', label: 'Completada', color: '' },
    { value: 'cancelled', label: 'Cancelada', color: 'warn' }
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

  getStatusColor(status: RouteStatus): string {
    const statusConfig = this.statusOptions.find(s => s.value === status);
    return statusConfig?.color || '';
  }

  getStatusLabel(status: RouteStatus): string {
    const statusConfig = this.statusOptions.find(s => s.value === status);
    return statusConfig?.label || status;
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
