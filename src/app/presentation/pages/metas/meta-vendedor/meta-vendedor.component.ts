import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { GetMetasByVendedorUseCase } from '../../../../core/application/use-cases/meta/meta-venta.use-cases';
import { MetaVentaEntity, TipoMeta, Region, Trimestre } from '../../../../core/domain/entities/meta-venta.entity';

@Component({
  selector: 'app-meta-vendedor',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    TranslateModule
  ],
  templateUrl: './meta-vendedor.component.html',
  styleUrls: ['./meta-vendedor.component.css']
})
export class MetaVendedorComponent implements OnInit {
  private getMetasByVendedorUseCase = inject(GetMetasByVendedorUseCase);
  private translate: TranslateService = inject(TranslateService);

  metas = signal<MetaVentaEntity[]>([]);
  metasFiltradas = signal<MetaVentaEntity[]>([]);
  loading = signal(false);
  errorMessage = signal<string | null>(null);
  vendedorId = signal<string>('');

  // Filtros
  regionControl = new FormControl('');
  trimestreControl = new FormControl('');
  tipoControl = new FormControl('');

  // Enums para los selects
  readonly regiones = [Region.NORTE, Region.SUR, Region.ESTE, Region.OESTE];
  readonly trimestres = [Trimestre.Q1, Trimestre.Q2, Trimestre.Q3, Trimestre.Q4];
  readonly tipos = [TipoMeta.UNIDADES, TipoMeta.MONETARIO];
  readonly TipoMeta = TipoMeta;

  ngOnInit(): void {
    // TODO: Obtener el employeeId del usuario logueado
    // Por ahora, usaremos un ID de ejemplo para pruebas
    // this.vendedorId.set(this.authService.getCurrentUser().employeeId);
    
    // TEMPORAL: ID de prueba - REEMPLAZAR cuando tengas autenticación
    this.vendedorId.set('VE-01'); // ← Cambia 'V001' por un employeeId real de tu base de datos
    this.loadMetas();

    // Suscribirse a cambios en los filtros
    this.regionControl.valueChanges.subscribe(() => this.aplicarFiltros());
    this.trimestreControl.valueChanges.subscribe(() => this.aplicarFiltros());
    this.tipoControl.valueChanges.subscribe(() => this.aplicarFiltros());
  }

  loadMetas(): void {
    const employeeId = this.vendedorId();
    
    if (!employeeId) {
      this.errorMessage.set('No se pudo identificar al vendedor');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    this.getMetasByVendedorUseCase.execute(employeeId).subscribe({
      next: (metas) => {
        this.metas.set(metas);
        this.metasFiltradas.set(metas);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar metas del vendedor:', error);
        this.errorMessage.set('Error al cargar las metas');
        this.loading.set(false);
      }
    });
  }

  aplicarFiltros(): void {
    let metasFiltradas = [...this.metas()];

    // Filtrar por región
    const region = this.regionControl.value;
    if (region) {
      metasFiltradas = metasFiltradas.filter(meta => meta.region === region);
    }

    // Filtrar por trimestre
    const trimestre = this.trimestreControl.value;
    if (trimestre) {
      metasFiltradas = metasFiltradas.filter(meta => meta.trimestre === trimestre);
    }

    // Filtrar por tipo
    const tipo = this.tipoControl.value;
    if (tipo) {
      metasFiltradas = metasFiltradas.filter(meta => meta.tipo === tipo);
    }

    this.metasFiltradas.set(metasFiltradas);
  }

  limpiarFiltros(): void {
    this.regionControl.setValue('');
    this.trimestreControl.setValue('');
    this.tipoControl.setValue('');
    this.metasFiltradas.set(this.metas());
  }

  setVendedorId(employeeId: string): void {
    this.vendedorId.set(employeeId);
    this.loadMetas();
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
    return `${meta.valorObjetivo} ${this.translate.instant('MY_GOALS.UNITS_LABEL')}`;
  }

  getProductoDisplay(meta: MetaVentaEntity): string {
    return meta.producto?.name || meta.idProducto;
  }
}
