import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { GetOrdersUseCase } from '../../../../core/application/use-cases/order/get-orders.usecase';
import { OrderEntity, GetOrdersFilters, OrderStatus } from '../../../../core/domain/entities/order.entity';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule
  ],
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.css']
})
export class OrderListComponent implements OnInit {
  private getOrdersUseCase = inject(GetOrdersUseCase);

  // Signals para el estado del componente
  orders = signal<OrderEntity[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  
  // Paginación
  currentPage = signal<number>(1);
  perPage = signal<number>(20);
  totalOrders = signal<number>(0);
  totalPages = signal<number>(1);

  // Filtros
  filterStatus = signal<OrderStatus | ''>('');
  filterOrderDateFrom = signal<string>('');
  filterOrderDateTo = signal<string>('');
  filterDeliveryDateFrom = signal<string>('');
  filterDeliveryDateTo = signal<string>('');

  // Columnas de la tabla
  displayedColumns: string[] = [
    'orderNumber',
    'customer',
    'status',
    'orderDate',
    'deliveryDate',
    'deliveryCity',
    'totalAmount',
    'actions'
  ];

  // Estados disponibles
  statusOptions: Array<{ value: OrderStatus | '', label: string }> = [
    { value: '', label: 'Todos' },
    { value: 'pending', label: 'Pendiente' },
    { value: 'confirmed', label: 'Confirmada' },
    { value: 'processing', label: 'Procesando' },
    { value: 'in_transit', label: 'En Tránsito' },
    { value: 'delivered', label: 'Entregada' },
    { value: 'cancelled', label: 'Cancelada' }
  ];

  // Opciones de items por página
  pageSizeOptions: number[] = [10, 20, 50, 100];

  // Computed para verificar si hay filtros activos
  hasActiveFilters = computed(() => {
    return this.filterStatus() !== '' ||
           this.filterOrderDateFrom() !== '' ||
           this.filterOrderDateTo() !== '' ||
           this.filterDeliveryDateFrom() !== '' ||
           this.filterDeliveryDateTo() !== '';
  });

  ngOnInit(): void {
    this.loadOrders();
  }

  /**
   * Carga las órdenes con los filtros actuales
   */
  loadOrders(): void {
    this.loading.set(true);
    this.error.set(null);

    const filters: GetOrdersFilters = {
      page: this.currentPage(),
      perPage: this.perPage(),
      status: this.filterStatus() || undefined,
      orderDateFrom: this.filterOrderDateFrom() || undefined,
      orderDateTo: this.filterOrderDateTo() || undefined,
      deliveryDateFrom: this.filterDeliveryDateFrom() || undefined,
      deliveryDateTo: this.filterDeliveryDateTo() || undefined,
      includeDetails: false
    };

    this.getOrdersUseCase.execute(filters).subscribe({
      next: (response) => {
        this.orders.set(response.orders);
        this.totalOrders.set(response.total);
        this.totalPages.set(response.totalPages);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading orders:', err);
        this.error.set('Error al cargar las órdenes. Por favor, intente nuevamente.');
        this.loading.set(false);
      }
    });
  }

  /**
   * Maneja el cambio de página
   */
  onPageChange(event: PageEvent): void {
    this.currentPage.set(event.pageIndex + 1);
    this.perPage.set(event.pageSize);
    this.loadOrders();
  }

  /**
   * Maneja el cambio de filtros
   */
  onFilterChange(): void {
    this.currentPage.set(1); // Resetear a la primera página
    this.loadOrders();
  }

  /**
   * Limpia todos los filtros
   */
  clearFilters(): void {
    this.filterStatus.set('');
    this.filterOrderDateFrom.set('');
    this.filterOrderDateTo.set('');
    this.filterDeliveryDateFrom.set('');
    this.filterDeliveryDateTo.set('');
    this.currentPage.set(1);
    this.loadOrders();
  }

  /**
   * Reintentar cargar órdenes
   */
  retry(): void {
    this.loadOrders();
  }

  /**
   * Obtiene la clase CSS para el badge de estado
   */
  getStatusBadgeClass(status: OrderStatus): string {
    const statusClasses: Record<OrderStatus, string> = {
      'pending': 'status-pending',
      'confirmed': 'status-confirmed',
      'processing': 'status-processing',
      'in_transit': 'status-in-transit',
      'delivered': 'status-delivered',
      'cancelled': 'status-cancelled'
    };
    return statusClasses[status] || 'status-default';
  }

  /**
   * Obtiene la etiqueta del estado
   */
  getStatusLabel(status: OrderStatus): string {
    const statusLabels: Record<OrderStatus, string> = {
      'pending': 'Pendiente',
      'confirmed': 'Confirmada',
      'processing': 'Procesando',
      'in_transit': 'En Tránsito',
      'delivered': 'Entregada',
      'cancelled': 'Cancelada'
    };
    return statusLabels[status] || status;
  }

  /**
   * Formatea un monto como moneda colombiana
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  }

  /**
   * Formatea una fecha
   */
  formatDate(dateString: string | undefined): string {
    if (!dateString) return '-';
    
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Formatea solo la fecha sin hora
   */
  formatDateOnly(dateString: string | undefined): string {
    if (!dateString) return '-';
    
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
