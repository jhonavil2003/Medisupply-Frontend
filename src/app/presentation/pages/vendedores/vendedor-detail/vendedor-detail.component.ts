import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatLabel } from '@angular/material/form-field';
import { TranslateModule } from '@ngx-translate/core';

import { VendedorEntity } from '../../../../core/domain/entities/vendedor.entity';

@Component({
  selector: 'app-vendedor-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatLabel,
    TranslateModule
],
  templateUrl: './vendedor-detail.component.html',
  styleUrls: ['./vendedor-detail.component.css']
})
export class VendedorDetailComponent {
  private dialogRef = inject(MatDialogRef<VendedorDetailComponent>);
  vendedor = inject<VendedorEntity>(MAT_DIALOG_DATA);

  formatDate(dateString?: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  cerrar(): void {
    this.dialogRef.close();
  }
}