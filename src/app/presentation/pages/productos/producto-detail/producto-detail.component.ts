import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatBadgeModule } from '@angular/material/badge';

import { ProductoDetailedEntity } from '../../../../core/domain/entities/producto.entity';
import { GetProductByIdUseCase } from '../../../../core/application/use-cases/producto/get-product-by-id.use-case';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-producto-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressBarModule,
    MatGridListModule,
    MatBadgeModule
  ],
  template: `
    <div class="producto-detail-container">
      <!-- Loading -->
      <mat-progress-bar *ngIf="loading()" mode="indeterminate"></mat-progress-bar>

      <!-- Error -->
      <mat-card *ngIf="errorMessage()" class="error-card">
        <mat-card-header>
          <mat-icon color="warn">error</mat-icon>
          <mat-card-title>Error al cargar el producto</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>{{ errorMessage() }}</p>
        </mat-card-content>
        <mat-card-actions>
          <button mat-button color="primary" (click)="goBack()">
            <mat-icon>arrow_back</mat-icon>
            Volver
          </button>
        </mat-card-actions>
      </mat-card>

      <!-- Product Detail -->
      <div *ngIf="product() && !loading()" class="product-detail-content">
        
        <!-- Header Card -->
        <mat-card class="header-card">
          <mat-card-header>
            <div class="product-header">
              <div class="product-title">
                <h1>{{ product()?.name }}</h1>
                <div class="product-badges">
                  <mat-chip *ngIf="product()?.requires_cold_chain" color="primary">
                    <mat-icon>ac_unit</mat-icon>
                    Cadena de Frío
                  </mat-chip>
                  <mat-chip *ngIf="product()?.regulatory_info?.requires_prescription" color="accent">
                    <mat-icon>local_pharmacy</mat-icon>
                    Requiere Receta
                  </mat-chip>
                  <mat-chip [color]="product()?.is_active ? 'primary' : 'warn'">
                    {{ product()?.is_active ? 'Activo' : 'Inactivo' }}
                  </mat-chip>
                </div>
              </div>
            </div>
          </mat-card-header>
          
          <mat-card-actions>
            <button mat-button (click)="goBack()">
              <mat-icon>arrow_back</mat-icon>
              Volver al Listado
            </button>
            <button mat-raised-button color="accent" (click)="editProduct()">
              <mat-icon>edit</mat-icon>
              Editar Producto
            </button>
          </mat-card-actions>
        </mat-card>

        <!-- Main Info Grid -->
        <div class="info-grid">
          
          <!-- Basic Information -->
          <mat-card class="info-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>info</mat-icon>
              <mat-card-title>Información Básica</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="info-row">
                <span class="label">SKU:</span>
                <span class="value">{{ product()?.sku }}</span>
              </div>
              <div class="info-row">
                <span class="label">Código de Barras:</span>
                <span class="value">{{ product()?.barcode || 'N/A' }}</span>
              </div>
              <div class="info-row">
                <span class="label">Categoría:</span>
                <span class="value">{{ product()?.category }}</span>
              </div>
              <div class="info-row" *ngIf="product()?.subcategory">
                <span class="label">Subcategoría:</span>
                <span class="value">{{ product()?.subcategory }}</span>
              </div>
              <div class="info-row" *ngIf="product()?.description">
                <span class="label">Descripción:</span>
                <span class="value">{{ product()?.description }}</span>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Pricing Information -->
          <mat-card class="info-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>attach_money</mat-icon>
              <mat-card-title>Información de Precios</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="price-info">
                <div class="price-main">
                  <span class="currency">{{ product()?.currency }}</span>
                  <span class="amount">{{ product()?.unit_price | number:'1.2-2' }}</span>
                  <span class="unit">/ {{ product()?.unit_of_measure }}</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Supplier Information -->
          <mat-card class="info-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>business</mat-icon>
              <mat-card-title>Información del Proveedor</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="info-row">
                <span class="label">Proveedor:</span>
                <span class="value">{{ product()?.supplier_name || 'N/A' }}</span>
              </div>
              <div class="info-row">
                <span class="label">Fabricante:</span>
                <span class="value">{{ product()?.manufacturer || 'N/A' }}</span>
              </div>
              <div class="info-row">
                <span class="label">País de Origen:</span>
                <span class="value">{{ product()?.country_of_origin || 'N/A' }}</span>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Storage Conditions -->
          <mat-card class="info-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>thermostat</mat-icon>
              <mat-card-title>Condiciones de Almacenamiento</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="info-row" *ngIf="getTemperatureRange()">
                <span class="label">Temperatura:</span>
                <span class="value">{{ getTemperatureRange() }}</span>
              </div>
              <div class="info-row" *ngIf="product()?.storage_conditions?.humidity_max">
                <span class="label">Humedad Máxima:</span>
                <span class="value">{{ product()?.storage_conditions?.humidity_max }}%</span>
              </div>
              <div class="info-row">
                <span class="label">Cadena de Frío:</span>
                <span class="value">{{ product()?.requires_cold_chain ? 'Requerida ❄️' : 'No requerida' }}</span>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Regulatory Information -->
          <mat-card class="info-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>gavel</mat-icon>
              <mat-card-title>Información Regulatoria</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="info-row">
                <span class="label">Registro Sanitario:</span>
                <span class="value">{{ product()?.regulatory_info?.sanitary_registration || 'N/A' }}</span>
              </div>
              <div class="info-row">
                <span class="label">Clase Regulatoria:</span>
                <span class="value">{{ product()?.regulatory_info?.regulatory_class || 'N/A' }}</span>
              </div>
              <div class="info-row">
                <span class="label">Requiere Prescripción:</span>
                <span class="value">{{ product()?.regulatory_info?.requires_prescription ? 'Sí 📋' : 'No' }}</span>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Physical Dimensions -->
          <mat-card class="info-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>straighten</mat-icon>
              <mat-card-title>Dimensiones Físicas</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="info-row">
                <span class="label">Peso:</span>
                <span class="value">{{ product()?.physical_dimensions?.weight_kg }} kg</span>
              </div>
              <div class="info-row">
                <span class="label">Dimensiones:</span>
                <span class="value">
                  {{ product()?.physical_dimensions?.length_cm }} × 
                  {{ product()?.physical_dimensions?.width_cm }} × 
                  {{ product()?.physical_dimensions?.height_cm }} cm
                </span>
              </div>
            </mat-card-content>
          </mat-card>

        </div>

        <!-- Metadata -->
        <mat-card class="metadata-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>schedule</mat-icon>
            <mat-card-title>Metadatos</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="metadata-grid">
              <div class="info-row">
                <span class="label">Fecha de Creación:</span>
                <span class="value">{{ formatDate(product()?.created_at) }}</span>
              </div>
              <div class="info-row">
                <span class="label">Última Actualización:</span>
                <span class="value">{{ formatDate(product()?.updated_at) }}</span>
              </div>
              <div class="info-row">
                <span class="label">Descontinuado:</span>
                <span class="value">{{ product()?.is_discontinued ? 'Sí' : 'No' }}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

      </div>
    </div>
  `,
  styles: [`
    .producto-detail-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .error-card {
      margin: 20px;
    }

    .product-detail-content {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .header-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .header-card .mat-card-header {
      padding-bottom: 0;
    }

    .product-header {
      width: 100%;
    }

    .product-title h1 {
      margin: 0;
      font-size: 2rem;
      font-weight: 500;
    }

    .product-badges {
      margin-top: 16px;
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .product-badges mat-chip {
      font-weight: 500;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 20px;
    }

    .info-card {
      height: fit-content;
    }

    .info-card .mat-card-header {
      padding-bottom: 16px;
    }

    .info-card .mat-icon[mat-card-avatar] {
      background-color: #f5f5f5;
      color: #666;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .info-row:last-child {
      border-bottom: none;
    }

    .label {
      font-weight: 500;
      color: #666;
      flex: 0 0 40%;
    }

    .value {
      text-align: right;
      flex: 1;
      font-weight: 400;
    }

    .price-info {
      text-align: center;
      padding: 20px 0;
    }

    .price-main {
      font-size: 2rem;
      font-weight: 500;
      color: #2e7d32;
    }

    .currency {
      font-size: 1.2rem;
      margin-right: 8px;
    }

    .amount {
      font-weight: 700;
    }

    .unit {
      font-size: 1rem;
      color: #666;
      margin-left: 8px;
    }

    .metadata-card {
      background-color: #fafafa;
    }

    .metadata-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
    }

    .metadata-grid .info-row {
      border-bottom: 1px solid #e0e0e0;
    }

    @media (max-width: 768px) {
      .producto-detail-container {
        padding: 10px;
      }
      
      .info-grid {
        grid-template-columns: 1fr;
      }
      
      .product-title h1 {
        font-size: 1.5rem;
      }
      
      .price-main {
        font-size: 1.5rem;
      }
    }
  `]
})
export class ProductoDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private getProductByIdUseCase = inject(GetProductByIdUseCase);
  private notify = inject(NotificationService);

  product = signal<ProductoDetailedEntity | null>(null);
  loading = signal(false);
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.loadProduct(+productId);
    } else {
      this.errorMessage.set('ID de producto no válido');
    }
  }

  loadProduct(id: number): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.getProductByIdUseCase.execute(id)
      .subscribe({
        next: (product) => {
          this.loading.set(false);
          this.product.set(product);
        },
        error: (error) => {
          this.loading.set(false);
          this.errorMessage.set(error.message);
          this.notify.error(`Error al cargar el producto: ${error.message}`);
        }
      });
  }

  getTemperatureRange(): string | null {
    const product = this.product();
    if (!product) return null;
    
    const conditions = product.storage_conditions;
    if (conditions.temperature_min !== null && conditions.temperature_max !== null) {
      return `${conditions.temperature_min}°C - ${conditions.temperature_max}°C`;
    }
    return null;
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  goBack(): void {
    this.router.navigate(['/producto-list']);
  }

  editProduct(): void {
    const product = this.product();
    if (product) {
      this.router.navigate(['/producto-edit', product.id]);
    }
  }
}