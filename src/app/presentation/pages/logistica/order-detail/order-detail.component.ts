import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { GetOrderByIdUseCase } from '../../../../core/application/use-cases/order/get-order-by-id.usecase';
import { OrderEntity, OrderItemEntity } from '../../../../core/domain/entities/order.entity';
import { GoogleMapComponent } from '../../../shared/components/google-map/google-map.component';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDividerModule,
    GoogleMapComponent
  ],
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.css']
})
export class OrderDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private getOrderByIdUseCase = inject(GetOrderByIdUseCase);

  // Signals
  order = signal<OrderEntity | null>(null);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  // Computed values
  orderId = computed(() => {
    const id = this.route.snapshot.paramMap.get('id');
    return id ? parseInt(id, 10) : 0;
  });

  totalItems = computed(() => this.order()?.items?.length || 0);
  
  totalQuantity = computed(() => 
    this.order()?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0
  );

  averageDiscount = computed(() => {
    const items = this.order()?.items || [];
    if (items.length === 0) return 0;
    const sum = items.reduce((acc, item) => acc + item.discountPercentage, 0);
    return sum / items.length;
  });

  itemsWithDiscount = computed(() => 
    this.order()?.items?.filter(item => item.discountPercentage > 0).length || 0
  );

  discountRate = computed(() => {
    const order = this.order();
    if (!order || order.subtotal === 0) return 0;
    return (order.discountAmount / order.subtotal) * 100;
  });

  taxRate = computed(() => {
    const order = this.order();
    if (!order) return 0;
    const base = order.subtotal - order.discountAmount;
    if (base === 0) return 0;
    return (order.taxAmount / base) * 100;
  });

  ngOnInit(): void {
    this.loadOrder();
  }

  loadOrder(): void {
    const id = this.orderId();
    if (!id) {
      this.error.set('ID de orden inválido');
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.getOrderByIdUseCase.execute(id).subscribe({
      next: (order) => {
        if (order) {
          this.order.set(order);
        } else {
          this.error.set('Orden no encontrada');
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading order:', err);
        this.error.set(err.message || 'Error al cargar la orden');
        this.loading.set(false);
      }
    });
  }

  retry(): void {
    this.loadOrder();
  }

  goBack(): void {
    this.router.navigate(['/ordenes']);
  }

  handlePrint(): void {
    window.print();
  }

  copyAddress(): void {
    const order = this.order();
    if (!order) return;

    const fullAddress = `${order.deliveryAddress}, ${order.deliveryCity}, ${order.deliveryDepartment}`;
    
    navigator.clipboard.writeText(fullAddress).then(() => {
      alert('Dirección copiada al portapapeles');
    });
  }

  openGoogleMaps(): void {
    const order = this.order();
    if (!order?.deliveryLatitude || !order?.deliveryLongitude) return;

    const url = `https://www.google.com/maps?q=${order.deliveryLatitude},${order.deliveryLongitude}`;
    window.open(url, '_blank');
  }

  getStatusConfig(status: string): { label: string; className: string; icon: string } {
    const configs: Record<string, { label: string; className: string; icon: string }> = {
      pending: { label: 'Pendiente', className: 'status-pending', icon: 'schedule' },
      confirmed: { label: 'Confirmada', className: 'status-confirmed', icon: 'check_circle' },
      processing: { label: 'Procesando', className: 'status-processing', icon: 'settings' },
      in_transit: { label: 'En Tránsito', className: 'status-in-transit', icon: 'local_shipping' },
      delivered: { label: 'Entregada', className: 'status-delivered', icon: 'inventory' },
      cancelled: { label: 'Cancelada', className: 'status-cancelled', icon: 'cancel' }
    };
    return configs[status] || { label: status, className: 'status-default', icon: 'circle' };
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDateOnly(dateString?: string): string {
    if (!dateString) return 'No especificada';
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
