import { Component, inject, signal, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { GetMetaByIdUseCase } from '../../../../core/application/use-cases/meta/meta-venta.use-cases';
import { MetaVentaEntity, TipoMeta } from '../../../../core/domain/entities/meta-venta.entity';
import { NotificationService } from '../../../shared/services/notification.service';
import { MatLabel } from '@angular/material/form-field';

@Component({
  selector: 'app-meta-detail',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatLabel,
    TranslateModule
],
  templateUrl: './meta-detail.component.html',
  styleUrls: ['./meta-detail.component.css']
})
export class MetaDetailComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<MetaDetailComponent>);
  private getMetaByIdUseCase = inject(GetMetaByIdUseCase);
  private notificationService = inject(NotificationService);
  private translate: TranslateService = inject(TranslateService);

  meta = signal<MetaVentaEntity | null>(null);
  loading = signal(false);
  metaId: number;

  readonly TipoMeta = TipoMeta;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { metaId: number }) {
    this.metaId = data.metaId;
  }

  ngOnInit(): void {
    if (this.metaId) {
      this.loadMeta(this.metaId);
    } else {
      this.notificationService.error(this.translate.instant('GOALS.INVALID_ID'));
      this.dialogRef.close();
    }
  }

  loadMeta(id: number): void {
    this.loading.set(true);
    
    this.getMetaByIdUseCase.execute(id).subscribe({
      next: (meta) => {
        if (meta) {
          this.meta.set(meta);
        } else {
          this.notificationService.error(this.translate.instant('GOALS.NOT_FOUND'));
          this.dialogRef.close();
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar meta:', error);
        this.notificationService.error(this.translate.instant('GOALS.LOAD_ERROR'));
        this.loading.set(false);
        this.dialogRef.close();
      }
    });
  }

  navigateBack(): void {
    this.dialogRef.close();
  }

  getTipoDisplay(tipo: TipoMeta): string {
    return tipo === TipoMeta.UNIDADES 
      ? this.translate.instant('GOALS.UNITS') 
      : this.translate.instant('GOALS.MONETARY');
  }

  getValorDisplay(meta: MetaVentaEntity): string {
    if (meta.tipo === TipoMeta.MONETARIO) {
      return new Intl.NumberFormat('es-CO', { 
        style: 'currency', 
        currency: 'COP',
        minimumFractionDigits: 0 
      }).format(meta.valorObjetivo);
    }
    return meta.valorObjetivo.toString();
  }

  formatDate(dateString?: string): string {
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
}
