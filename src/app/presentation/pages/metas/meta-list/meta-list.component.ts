import { Component, OnInit, ViewChild, AfterViewInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { MetaVentaEntity, Region, Trimestre, TipoMeta } from '../../../../core/domain/entities/meta-venta.entity';
import { MetaVentaFilters } from '../../../../core/domain/repositories/meta-venta.repository';
import {
  GetAllMetasUseCase,
  DeleteMetaVentaUseCase
} from '../../../../core/application/use-cases/meta/meta-venta.use-cases';
import { NotificationService } from '../../../shared/services/notification.service';
import { ConfirmDialogService } from '../../../shared/services/confirm-dialog.service';
import { MetaCreateComponent } from '../meta-create/meta-create.component';
import { MetaEditComponent } from '../meta-edit/meta-edit.component';
import { MetaDetailComponent } from '../meta-detail/meta-detail.component';

@Component({
  selector: 'app-meta-list',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressBarModule,
    TranslateModule
  ],
  templateUrl: './meta-list.component.html',
  styleUrls: ['./meta-list.component.css']
})
export class MetaListComponent implements OnInit, AfterViewInit {
  private getAllMetasUseCase = inject(GetAllMetasUseCase);
  private deleteMetaUseCase = inject(DeleteMetaVentaUseCase);
  private notify = inject(NotificationService);
  private confirmDialog = inject(ConfirmDialogService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private translate: TranslateService = inject(TranslateService);

  metas = signal<MetaVentaEntity[]>([]);
  loading = signal(false);
  errorMessage = signal<string | null>(null);

  // Controles de filtros
  regionControl = new FormControl<Region | ''>('');
  trimestreControl = new FormControl<Trimestre | ''>('');
  tipoControl = new FormControl<'unidades' | 'monetario' | ''>('');

  // Enums para las opciones de los select
  readonly Region = Region;
  readonly Trimestre = Trimestre;
  readonly TipoMeta = TipoMeta;

  readonly regiones = [Region.NORTE, Region.SUR, Region.ESTE, Region.OESTE];
  readonly trimestres = [Trimestre.Q1, Trimestre.Q2, Trimestre.Q3, Trimestre.Q4];
  readonly tipos: ('unidades' | 'monetario')[] = ['unidades', 'monetario'];

  dataSource = new MatTableDataSource<MetaVentaEntity>();
  displayedColumns = ['idVendedor', 'idProducto', 'region', 'trimestre', 'tipo', 'valorObjetivo', 'acciones'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.loadMetas();
    this.setupFilters();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private setupFilters(): void {
    this.regionControl.valueChanges.subscribe(() => this.applyFilters());
    this.trimestreControl.valueChanges.subscribe(() => this.applyFilters());
    this.tipoControl.valueChanges.subscribe(() => this.applyFilters());
  }

  loadMetas(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    console.log('🔍 Cargando metas de venta...');
    this.getAllMetasUseCase.execute().subscribe({
      next: (metas) => {
        console.log('✅ Metas recibidas:', metas);
        console.log('📊 Cantidad:', metas.length);
        this.metas.set(metas);
        this.dataSource.data = metas;
        this.loading.set(false);
      },
      error: (error) => {
        console.error('❌ Error al cargar metas:', error);
        this.errorMessage.set('Error al cargar metas de venta');
        this.notify.error('Error al cargar la lista de metas');
        this.loading.set(false);
      }
    });
  }

  applyFilters(): void {
    const filters: MetaVentaFilters = {};

    const region = this.regionControl.value;
    const trimestre = this.trimestreControl.value;
    const tipo = this.tipoControl.value;

    if (region) filters.region = region;
    if (trimestre) filters.trimestre = trimestre;
    if (tipo) filters.tipo = tipo;

    this.loading.set(true);
    this.errorMessage.set(null);

    console.log('🔍 Aplicando filtros:', filters);
    this.getAllMetasUseCase.execute(filters).subscribe({
      next: (metas) => {
        console.log('✅ Metas filtradas:', metas);
        this.metas.set(metas);
        this.dataSource.data = metas;
        this.loading.set(false);
      },
      error: (error) => {
        console.error('❌ Error al filtrar metas:', error);
        this.errorMessage.set('Error al filtrar metas');
        this.notify.error('Error al aplicar filtros');
        this.loading.set(false);
      }
    });
  }

  clearFilters(): void {
    this.regionControl.setValue('');
    this.trimestreControl.setValue('');
    this.tipoControl.setValue('');
    this.loadMetas();
  }

  navigateToCreate(): void {
    const dialogRef = this.dialog.open(MetaCreateComponent, {
      width: '900px',
      maxHeight: '90vh',
      disableClose: false,
      autoFocus: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Recargar la lista después de crear
        this.loadMetas();
      }
    });
  }

  navigateToDetail(id: number): void {
    const dialogRef = this.dialog.open(MetaDetailComponent, {
      width: '1000px',
      maxHeight: '90vh',
      disableClose: false,
      autoFocus: true,
      data: { metaId: id }
    });
  }

  navigateToEdit(id: number): void {
    const dialogRef = this.dialog.open(MetaEditComponent, {
      width: '900px',
      maxHeight: '90vh',
      disableClose: false,
      autoFocus: true,
      data: { metaId: id }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Recargar la lista después de editar
        this.loadMetas();
      }
    });
  }

  async deleteMeta(meta: MetaVentaEntity): Promise<void> {
    if (!meta.id) {
      this.notify.error(this.translate.instant('GOALS.DELETE_ERROR_NO_ID'));
      return;
    }

    const vendedorNombre = meta.vendedor?.nombreCompleto || meta.idVendedor;
    const productoNombre = meta.producto?.name || meta.idProducto;
    const metaDescription = `${vendedorNombre} - ${productoNombre} (${meta.region} - ${meta.trimestre})`;

    const confirmed = await this.confirmDialog.confirmDelete(metaDescription).toPromise();
    
    if (confirmed && meta.id) {
      this.loading.set(true);
      
      this.deleteMetaUseCase.execute(meta.id).subscribe({
        next: (success) => {
          if (success) {
            this.notify.success(this.translate.instant('GOALS.DELETE_SUCCESS'));
            this.loadMetas();
          } else {
            this.notify.error(this.translate.instant('GOALS.DELETE_ERROR_GENERIC'));
            this.loading.set(false);
          }
        },
        error: (error) => {
          console.error('Error al eliminar meta:', error);
          this.notify.error(this.translate.instant('GOALS.DELETE_ERROR_GENERIC'));
          this.loading.set(false);
        }
      });
    }
  }

  navigateBack(): void {
    this.router.navigate(['/dashboard-admin']);
  }

  // Helpers para mostrar información en la tabla
  getVendedorDisplay(meta: MetaVentaEntity): string {
    return meta.vendedor?.nombreCompleto || meta.idVendedor;
  }

  getProductoDisplay(meta: MetaVentaEntity): string {
    return meta.producto?.name || meta.idProducto;
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
}
