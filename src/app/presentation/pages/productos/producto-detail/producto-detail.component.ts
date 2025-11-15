import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatLabel } from '@angular/material/form-field';
import { TranslateModule } from '@ngx-translate/core';

import { ProductoDetailedEntity } from '../../../../core/domain/entities/producto.entity';

@Component({
  selector: 'app-producto-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressBarModule,
    MatLabel,
    TranslateModule
  ],
  templateUrl: './producto-detail.component.html',
  styleUrl: './producto-detail.component.css'
})
export class ProductoDetailComponent {
  private dialogRef = inject(MatDialogRef<ProductoDetailComponent>);
  product = inject<ProductoDetailedEntity>(MAT_DIALOG_DATA);

  getTemperatureRange(): string | null {
    if (!this.product || !this.product.storage_conditions) return null;
    
    const conditions = this.product.storage_conditions;
    if (conditions.temperature_min !== null && conditions.temperature_max !== null) {
      return `${conditions.temperature_min}°C - ${conditions.temperature_max}°C`;
    }
    return null;
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  cerrar(): void {
    this.dialogRef.close();
  }
}