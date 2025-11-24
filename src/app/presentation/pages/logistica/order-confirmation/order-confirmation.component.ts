import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SelectionModel } from '@angular/cdk/collections';
import { GetOrdersUseCase } from '../../../../core/application/use-cases/order/get-orders.usecase';
import { UpdateOrderStatusUseCase } from '../../../../core/application/use-cases/order/update-order-status.usecase';
import { UpdateMultipleOrdersStatusUseCase } from '../../../../core/application/use-cases/order/update-multiple-orders-status.usecase';
import { OrderEntity } from '../../../../core/domain/entities/order.entity';
import { OrderDetailComponent } from '../order-detail/order-detail.component';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatCardModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    TranslateModule
  ],
  templateUrl: './order-confirmation.component.html',
  styleUrls: ['./order-confirmation.component.css']
})
export class OrderConfirmationComponent implements OnInit {
  private getOrdersUseCase = inject(GetOrdersUseCase);
  private updateOrderStatusUseCase = inject(UpdateOrderStatusUseCase);
  private updateMultipleOrdersStatusUseCase = inject(UpdateMultipleOrdersStatusUseCase);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private translate = inject(TranslateService);

  orders = signal<OrderEntity[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  totalOrders = signal<number>(0);
  currentPage = signal<number>(1);
  pageSize = signal<number>(10);
  confirmingIds = signal<Set<number>>(new Set());

  displayedColumns = ['select', 'orderNumber', 'customer', 'orderDate', 'deliveryDate', 'totalAmount', 'actions'];
  selection = new SelectionModel<OrderEntity>(true, []);

  totalPages = computed(() => Math.ceil(this.totalOrders() / this.pageSize()));
  hasSelectedOrders = computed(() => this.selection.selected.length > 0);
  selectedCount = computed(() => this.selection.selected.length);

  ngOnInit(): void {
    this.loadPreparedOrders();
  }

  loadPreparedOrders(): void {
    this.loading.set(true);
    this.error.set(null);

    this.getOrdersUseCase.execute({
      status: 'pending',
      page: this.currentPage(),
      perPage: this.pageSize(),
      includeDetails: false
    }).subscribe({
      next: (response) => {
        this.orders.set(response.orders);
        this.totalOrders.set(response.total);
        this.loading.set(false);
        this.selection.clear();
      },
      error: (err) => {
        this.error.set('CONFIRM_ORDERS.ERROR_LOADING');
        this.loading.set(false);
        console.error('Error loading prepared orders:', err);
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage.set(event.pageIndex + 1);
    this.pageSize.set(event.pageSize);
    this.loadPreparedOrders();
  }

  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.orders().length;
    return numSelected === numRows && numRows > 0;
  }

  toggleAllRows(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.orders().forEach(order => this.selection.select(order));
    }
  }

  confirmSingleOrder(order: OrderEntity): void {
    const currentConfirming = new Set(this.confirmingIds());
    currentConfirming.add(order.id);
    this.confirmingIds.set(currentConfirming);

    this.updateOrderStatusUseCase.execute(order.id, 'confirmed').subscribe({
      next: (updatedOrder) => {
        this.translate.get('CONFIRM_ORDERS.SUCCESS.SINGLE', { orderNumber: order.orderNumber }).subscribe(msg => {
          this.snackBar.open(msg, this.translate.instant('COMMON.CLOSE'), {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['success-snackbar']
          });
        });

        const updatedConfirming = new Set(this.confirmingIds());
        updatedConfirming.delete(order.id);
        this.confirmingIds.set(updatedConfirming);

        this.loadPreparedOrders();
      },
      error: (err) => {
        this.translate.get('CONFIRM_ORDERS.ERROR.SINGLE', { orderNumber: order.orderNumber }).subscribe(msg => {
          this.snackBar.open(msg, this.translate.instant('COMMON.CLOSE'), {
            duration: 5000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          });
        });

        const updatedConfirming = new Set(this.confirmingIds());
        updatedConfirming.delete(order.id);
        this.confirmingIds.set(updatedConfirming);

        console.error('Error confirming order:', err);
      }
    });
  }

  confirmSelectedOrders(): void {
    const selectedOrders = this.selection.selected;
    const orderIds = selectedOrders.map(order => order.id);

    if (orderIds.length === 0) {
      this.snackBar.open(
        this.translate.instant('CONFIRM_ORDERS.NO_SELECTED'), 
        this.translate.instant('COMMON.CLOSE'), 
        {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        }
      );
      return;
    }

    this.loading.set(true);

    this.updateMultipleOrdersStatusUseCase.execute(orderIds, 'confirmed').subscribe({
      next: (result) => {
        this.translate.get('CONFIRM_ORDERS.SUCCESS.MULTIPLE', { count: result.updatedCount }).subscribe(msg => {
          this.snackBar.open(msg, this.translate.instant('COMMON.CLOSE'), {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['success-snackbar']
          });
        });

        this.loading.set(false);
        this.loadPreparedOrders();
      },
      error: (err) => {
        this.snackBar.open(
          this.translate.instant('CONFIRM_ORDERS.ERROR.MULTIPLE'), 
          this.translate.instant('COMMON.CLOSE'), 
          {
            duration: 5000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          }
        );

        this.loading.set(false);
        console.error('Error confirming multiple orders:', err);
      }
    });
  }

  isConfirming(orderId: number): boolean {
    return this.confirmingIds().has(orderId);
  }

  viewOrderDetail(order: OrderEntity): void {
    this.dialog.open(OrderDetailComponent, {
      width: '1200px',
      maxHeight: '90vh',
      disableClose: false,
      autoFocus: false,
      data: { id: order.id }
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  }

  retry(): void {
    this.loadPreparedOrders();
  }
}
