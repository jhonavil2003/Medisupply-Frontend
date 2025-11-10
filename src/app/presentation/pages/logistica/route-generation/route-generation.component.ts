import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { SelectionModel } from '@angular/cdk/collections';
import { GetOrdersUseCase } from '../../../../core/application/use-cases/order/get-orders.usecase';
import { GenerateRoutesUseCase } from '../../../../core/application/use-cases/generate-routes.usecase';
import { GetAvailableVehiclesUseCase } from '../../../../core/application/use-cases/get-available-vehicles.usecase';
import { OrderEntity, OrdersListResponse } from '../../../../core/domain/entities/order.entity';
import { VehicleEntity, GenerateRoutesResponse, GeneratedRoute } from '../../../../core/infrastructure/repositories/route.repository';

@Component({
  selector: 'app-route-generation',
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDatepickerModule,
    MatInputModule,
    MatFormFieldModule,
    MatNativeDateModule,
    MatSelectModule,
    MatChipsModule,
    MatDialogModule,
    MatExpansionModule
  ],
  templateUrl: './route-generation.component.html',
  styleUrls: ['./route-generation.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RouteGenerationComponent implements OnInit {
  private getOrdersUseCase = inject(GetOrdersUseCase);
  private generateRoutesUseCase = inject(GenerateRoutesUseCase);
  private getAvailableVehiclesUseCase = inject(GetAvailableVehiclesUseCase);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  confirmedOrders = signal<OrderEntity[]>([]);
  availableVehicles = signal<VehicleEntity[]>([]);
  loadingOrders = signal(false);
  loadingVehicles = signal(false);
  generating = signal(false);
  generationProgress = signal(0);
  generationMessage = signal('Iniciando generación de rutas...');
  
  selectedDate = signal<Date>(new Date(new Date().setDate(new Date().getDate() + 1)));
  distributionCenterId = signal(1);
  optimizationStrategy = signal<'balanced' | 'minimize_distance' | 'minimize_time' | 'minimize_cost' | 'priority_first'>('balanced');
  
  minDate = new Date();
  
  selection = new SelectionModel<OrderEntity>(true, []);
  selectionCount = signal(0);
  
  generationResult = signal<GenerateRoutesResponse | null>(null);
  showResults = signal(false);

  displayedColumns: string[] = ['select', 'orderNumber', 'customerName', 'date', 'totalAmount', 'actions'];
  vehicleColumns: string[] = ['plate', 'type', 'capacity', 'driver', 'status'];

  distributionCenters = [
    { id: 1, code: 'CEDIS-BOG', name: 'Centro de Distribución Bogotá' },
    { id: 2, code: 'CEDIS-MED', name: 'Centro de Distribución Medellín' },
    { id: 3, code: 'CEDIS-CALI', name: 'Centro de Distribución Cali' }
  ];

  optimizationStrategies = [
    { value: 'balanced', label: '⭐ Balanceada (Recomendada)', description: 'Balance entre distancia, tiempo y capacidad' },
    { value: 'minimize_distance', label: '🛣️ Minimizar Distancia', description: 'Reduce kilómetros recorridos y combustible' },
    { value: 'minimize_time', label: '⏱️ Minimizar Tiempo', description: 'Optimiza tiempo de entrega' },
    { value: 'minimize_cost', label: '💰 Minimizar Costo', description: 'Reduce costo operativo total' },
    { value: 'priority_first', label: '🔥 Prioridad Primero', description: 'Atiende primero clientes críticos' }
  ];

  selectedOrdersCount = computed(() => this.selectionCount());
  totalWeight = computed(() => 
    this.selection.selected.reduce((sum, order) => sum + (order.totalAmount / 10000), 0)
  );
  totalAmount = computed(() =>
    this.selection.selected.reduce((sum, order) => sum + order.totalAmount, 0)
  );

  canGenerate = computed(() => 
    this.selectionCount() > 0 && 
    this.selectedDate() && 
    !this.generating()
  );

  ngOnInit(): void {
    this.loadConfirmedOrders();
  }

  loadConfirmedOrders(): void {
    this.loadingOrders.set(true);
    this.getOrdersUseCase.execute({ status: 'confirmed', perPage: 1000 }).subscribe({
      next: (response: OrdersListResponse) => {
        this.confirmedOrders.set(response.orders);
        this.loadingOrders.set(false);
      },
      error: (error: any) => {
        console.error('Error loading confirmed orders:', error);
        this.snackBar.open('Error al cargar órdenes confirmadas', 'Cerrar', { duration: 3000 });
        this.loadingOrders.set(false);
      }
    });
  }

  onDateChange(date: Date | null): void {
    if (date) {
      this.selectedDate.set(date);
      this.loadAvailableVehicles();
    }
  }

  loadAvailableVehicles(): void {
    const dateStr = this.formatDate(this.selectedDate());
    this.loadingVehicles.set(true);
    
    this.getAvailableVehiclesUseCase.execute(this.distributionCenterId(), dateStr).subscribe({
      next: (vehicles) => {
        this.availableVehicles.set(vehicles);
        this.loadingVehicles.set(false);
      },
      error: (error) => {
        console.error('Error loading vehicles:', error);
        this.snackBar.open('Error al cargar vehículos disponibles', 'Cerrar', { duration: 3000 });
        this.loadingVehicles.set(false);
      }
    });
  }

  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.confirmedOrders().length;
    return numSelected === numRows && numRows > 0;
  }

  toggleAll(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.confirmedOrders().forEach(order => this.selection.select(order));
    }
    this.selectionCount.set(this.selection.selected.length);
  }

  toggleSelection(order: OrderEntity): void {
    this.selection.toggle(order);
    this.selectionCount.set(this.selection.selected.length);
  }

  viewOrderDetail(order: OrderEntity): void {
    this.router.navigate(['/ordenes', order.id]);
  }

  async generateRoutes(): Promise<void> {
    if (!this.canGenerate()) return;

    this.generating.set(true);
    this.generationProgress.set(0);
    this.showResults.set(false);

    const progressInterval = setInterval(() => {
      const current = this.generationProgress();
      if (current < 90) {
        this.generationProgress.set(current + 10);
        this.updateGenerationMessage(current);
      }
    }, 500);

    const orderIds = this.selection.selected.map(order => order.id);
    const dateStr = this.formatDate(this.selectedDate());

    this.generateRoutesUseCase.execute({
      distributionCenterId: this.distributionCenterId(),
      plannedDate: dateStr,
      orderIds: orderIds,
      optimizationStrategy: this.optimizationStrategy(),
      forceRegenerate: false,
      createdBy: 'user@medisupply.com'
    }).subscribe({
      next: (result) => {
        clearInterval(progressInterval);
        this.generationProgress.set(100);
        this.generationMessage.set('¡Rutas generadas exitosamente!');
        
        setTimeout(() => {
          this.generationResult.set(result);
          this.showResults.set(true);
          this.generating.set(false);
          
          if (result.status === 'success') {
            this.snackBar.open(
              `✅ ${result.summary.routesGenerated} rutas generadas exitosamente`,
              'Cerrar',
              { duration: 5000 }
            );
          } else if (result.status === 'partial') {
            this.snackBar.open(
              `⚠️ Rutas generadas con ${result.summary.ordersUnassigned} órdenes sin asignar`,
              'Ver Detalles',
              { duration: 7000 }
            );
          }
        }, 500);
      },
      error: (error) => {
        clearInterval(progressInterval);
        console.error('Error generating routes:', error);
        this.generating.set(false);
        this.generationProgress.set(0);
        
        let errorMessage = 'Error al generar rutas';
        if (error.status === 409) {
          errorMessage = error.error?.message || 'Ya existen rutas para esta fecha';
        } else if (error.status === 404) {
          errorMessage = 'No se encontraron órdenes válidas';
        } else if (error.status === 503) {
          errorMessage = 'Servicio de ventas no disponible';
        }
        
        this.snackBar.open(errorMessage, 'Cerrar', { duration: 5000 });
      }
    });
  }

  private updateGenerationMessage(progress: number): void {
    const messages = [
      'Analizando órdenes confirmadas...',
      'Optimizando asignación de vehículos...',
      'Calculando rutas eficientes...',
      'Evaluando restricciones de capacidad...',
      'Minimizando distancias...',
      'Generando secuencia de entregas...',
      'Calculando tiempos estimados...',
      'Validando restricciones...',
      'Finalizando generación...'
    ];
    
    const index = Math.floor(progress / 10);
    if (index < messages.length) {
      this.generationMessage.set(messages[index]);
    }
  }

  resetGeneration(): void {
    this.selection.clear();
    this.selectionCount.set(0);
    this.showResults.set(false);
    this.generationResult.set(null);
    this.generationProgress.set(0);
    this.loadConfirmedOrders();
  }

  viewGeneratedRoutes(): void {
    this.router.navigate(['/rutas']);
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  }

  formatWeight(kg: number): string {
    return `${kg.toFixed(2)} kg`;
  }

  formatDistance(km: number): string {
    return `${km.toFixed(1)} km`;
  }

  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  }

  getVehicleTypeLabel(type: string): string {
    const types: Record<string, string> = {
      'refrigerated_truck': '🧊 Refrigerado',
      'standard_truck': '🚚 Estándar',
      'van': '🚐 Van',
      'motorcycle': '🏍️ Moto'
    };
    return types[type] || type;
  }

  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      'available': 'check_circle',
      'in_use': 'local_shipping',
      'maintenance': 'build'
    };
    return icons[status] || 'help';
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'available': '#4caf50',
      'in_use': '#ff9800',
      'maintenance': '#f44336'
    };
    return colors[status] || '#9e9e9e';
  }
}
