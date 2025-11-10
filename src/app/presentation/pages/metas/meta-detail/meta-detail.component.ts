import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';

import { GetMetaByIdUseCase } from '../../../../core/application/use-cases/meta/meta-venta.use-cases';
import { MetaVentaEntity, TipoMeta } from '../../../../core/domain/entities/meta-venta.entity';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-meta-detail',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDividerModule
  ],
  templateUrl: './meta-detail.component.html',
  styleUrls: ['./meta-detail.component.css']
})
export class MetaDetailComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private getMetaByIdUseCase = inject(GetMetaByIdUseCase);
  private notificationService = inject(NotificationService);

  meta = signal<MetaVentaEntity | null>(null);
  loading = signal(false);

  readonly TipoMeta = TipoMeta;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadMeta(parseInt(id, 10));
    } else {
      this.notificationService.error('ID de meta no válido');
      this.router.navigate(['/metas']);
    }
  }

  loadMeta(id: number): void {
    this.loading.set(true);
    
    this.getMetaByIdUseCase.execute(id).subscribe({
      next: (meta) => {
        if (meta) {
          this.meta.set(meta);
        } else {
          this.notificationService.error('Meta no encontrada');
          this.router.navigate(['/metas']);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar meta:', error);
        this.notificationService.error('Error al cargar meta');
        this.loading.set(false);
        this.router.navigate(['/metas']);
      }
    });
  }

  navigateToEdit(): void {
    const id = this.meta()?.id;
    if (id) {
      this.router.navigate(['/metas', id, 'edit']);
    }
  }

  navigateBack(): void {
    this.router.navigate(['/metas']);
  }

  getTipoDisplay(tipo: TipoMeta): string {
    return tipo === TipoMeta.UNIDADES ? 'Unidades' : 'Monetario';
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
