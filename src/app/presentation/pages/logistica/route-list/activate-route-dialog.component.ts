import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

export interface ActivateRouteDialogData {
  routeCode: string;
  driverName?: string;
  vehiclePlate?: string;
  totalStops: number;
  totalOrders: number;
}

@Component({
  selector: 'app-activate-route-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <h2 mat-dialog-title>Confirmar Activación de Ruta</h2>
      </div>

      <mat-dialog-content>
        <div class="route-info">
          <div class="info-item">
            <mat-icon>route</mat-icon>
            <span><strong>Código de Ruta:</strong> {{ data.routeCode }}</span>
          </div>
          
          @if (data.driverName) {
            <div class="info-item">
              <mat-icon>person</mat-icon>
              <span><strong>Conductor:</strong> {{ data.driverName }}</span>
            </div>
          }
          
          @if (data.vehiclePlate) {
            <div class="info-item">
              <mat-icon>local_shipping</mat-icon>
              <span><strong>Vehículo:</strong> {{ data.vehiclePlate }}</span>
            </div>
          }
          
          <div class="info-item">
            <mat-icon>location_on</mat-icon>
            <span><strong>Total de Paradas:</strong> {{ data.totalStops }}</span>
          </div>
          
          <div class="info-item">
            <mat-icon>shopping_cart</mat-icon>
            <span><strong>Total de Pedidos:</strong> {{ data.totalOrders }}</span>
          </div>
        </div>

        <div class="consequences-section">
          <h3>
            <mat-icon>info</mat-icon>
            Al activar esta ruta:
          </h3>
          <ul>
            <li>
              <mat-icon class="check-icon">check_circle</mat-icon>
              El conductor podrá iniciar la ruta
            </li>
            <li>
              <mat-icon class="check-icon">check_circle</mat-icon>
              El vehículo quedará asignado y no podrá ser usado en otras rutas
            </li>
            <li>
              <mat-icon class="warning-icon-small">lock</mat-icon>
              <strong>No se podrá volver al estado de borrador</strong>
            </li>
          </ul>
        </div>

        <div class="confirmation-question">
          <mat-icon>help_outline</mat-icon>
          <p>¿Está seguro que desea activar esta ruta?</p>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()" class="cancel-button">
          <mat-icon>close</mat-icon>
          Cancelar
        </button>
        <button mat-raised-button color="primary" (click)="onConfirm()" class="confirm-button">
          <mat-icon>check_circle</mat-icon>
          Activar Ruta
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container {
      min-width: 500px;
      max-width: 600px;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }

    .dialog-header .warning-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #ff9800;
    }

    .dialog-header h2 {
      margin: 0;
      font-size: 22px;
      font-weight: 500;
    }

    mat-dialog-content {
      padding: 0 24px;
      max-height: 70vh;
      overflow-y: auto;
    }

    .route-info {
      background-color: #f5f5f5;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 24px;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }

    .info-item:last-child {
      margin-bottom: 0;
    }

    .info-item mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: #666;
    }

    .info-item span {
      font-size: 14px;
      color: #333;
    }

    .consequences-section {
      margin-bottom: 24px;
    }

    .consequences-section h3 {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
      font-weight: 500;
      color: #333;
      margin-bottom: 16px;
    }

    .consequences-section h3 mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: #2196f3;
    }

    .consequences-section ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .consequences-section li {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 12px;
      font-size: 14px;
      line-height: 1.5;
    }

    .consequences-section li:last-child {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #e0e0e0;
    }

    .check-icon {
      font-size: 18px !important;
      width: 18px !important;
      height: 18px !important;
      color: #4caf50 !important;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .warning-icon-small {
      font-size: 18px !important;
      width: 18px !important;
      height: 18px !important;
      color: #ff9800 !important;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .confirmation-question {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background-color: #fff3e0;
      border-left: 4px solid #ff9800;
      border-radius: 4px;
      margin-bottom: 24px;
    }

    .confirmation-question mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
      color: #ff9800;
    }

    .confirmation-question p {
      margin: 0;
      font-size: 15px;
      font-weight: 500;
      color: #333;
    }

    mat-dialog-actions {
      padding: 16px 24px;
      margin: 0;
      gap: 12px;
    }

    .cancel-button {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .confirm-button {
      display: flex;
      align-items: center;
      gap: 8px;
      background-color: #4caf50 !important;
    }

    .confirm-button mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .cancel-button mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActivateRouteDialogComponent {
  private dialogRef = inject(MatDialogRef<ActivateRouteDialogComponent>);
  protected data = inject<ActivateRouteDialogData>(MAT_DIALOG_DATA);

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
