import { Component, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatLabel } from '@angular/material/form-field';
import { TranslateModule } from '@ngx-translate/core';

import { Proveedor } from '../proveedor';

@Component({
  selector: 'app-proveedor-detail',
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
  templateUrl: './proveedor-detail.component.html',
  styleUrls: ['./proveedor-detail.component.css']
})
export class ProveedorDetailComponent {
  private dialogRef = inject(MatDialogRef<ProveedorDetailComponent>);
  proveedor: Proveedor;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { proveedor: Proveedor }) {
    this.proveedor = data.proveedor;
  }

  cerrar(): void {
    this.dialogRef.close();
  }
}
