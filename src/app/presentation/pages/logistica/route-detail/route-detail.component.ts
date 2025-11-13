import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { GetRouteByIdUseCase } from '../../../../core/application/use-cases/get-route-by-id.usecase';
import { RouteSummary, RouteStatus } from '../../../../core/domain/entities/route.entity';

@Component({
  selector: 'app-route-detail',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatDividerModule,
    MatTabsModule
  ],
  templateUrl: './route-detail.component.html',
  styleUrl: './route-detail.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RouteDetailComponent implements OnInit {
  private readonly getRouteByIdUseCase = inject(GetRouteByIdUseCase);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // Estado
  routeDetail = signal<RouteSummary | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  // Opciones de estado
  statusOptions: { value: RouteStatus; label: string; color: string }[] = [
    { value: 'draft', label: 'Borrador', color: 'accent' },
    { value: 'active', label: 'Activa', color: 'primary' },
    { value: 'in_progress', label: 'En Progreso', color: 'primary' },
    { value: 'completed', label: 'Completada', color: '' },
    { value: 'cancelled', label: 'Cancelada', color: 'warn' }
  ];

  ngOnInit(): void {
    const routeId = this.route.snapshot.paramMap.get('id');
    if (routeId) {
      this.loadRouteDetail(parseInt(routeId, 10));
    }
  }

  loadRouteDetail(routeId: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.getRouteByIdUseCase.execute(routeId).subscribe({
      next: (route) => {
        this.routeDetail.set(route);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading route detail:', error);
        this.error.set(error.message || 'Error al cargar el detalle de la ruta');
        this.loading.set(false);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/rutas']);
  }

  viewOnMap(): void {
    const route = this.routeDetail();
    if (route) {
      this.router.navigate(['/rutas', route.id, 'mapa']);
    }
  }

  getStatusColor(status: RouteStatus): string {
    const statusConfig = this.statusOptions.find(s => s.value === status);
    return statusConfig?.color || '';
  }

  getStatusLabel(status: RouteStatus): string {
    const statusConfig = this.statusOptions.find(s => s.value === status);
    return statusConfig?.label || status;
  }

  formatTime(isoString: string | null): string {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  }

  formatDate(isoString: string): string {
    const date = new Date(isoString);
    return date.toLocaleDateString('es-CO', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return `${hours}h ${mins}m`;
  }

  getStopStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      pending: 'schedule',
      in_progress: 'local_shipping',
      completed: 'check_circle',
      failed: 'error'
    };
    return icons[status] || 'help';
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

  getPriorityColor(priority: string): string {
    const colors: Record<string, string> = {
      high: '#e74c3c',
      medium: '#f39c12',
      low: '#3498db'
    };
    return colors[priority] || '#95a5a6';
  }
}
