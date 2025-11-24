import { Component, OnInit, ViewChild, AfterViewInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

// Clean Architecture Imports
import { GetAllProveedoresUseCase } from '../../core/application/use-cases/proveedor/get-all-proveedores.use-case';
import { DeleteProveedorUseCase } from '../../core/application/use-cases/proveedor/delete-proveedor.use-case';
import { SearchProveedoresUseCase } from '../../core/application/use-cases/proveedor/search-proveedores.use-case';

import { ProveedorEntity, EstadoProveedor } from '../../core/domain/entities/proveedor.entity';
import { NotificationService } from '../../presentation/shared/services/notification.service';
import { ConfirmDialogService } from '../../presentation/shared/services/confirm-dialog.service';
import { ProveedorCreateComponent } from '../proveedor-create/proveedor-create.component';
import { ProveedorEditComponent } from '../proveedor-edit/proveedor-edit.component';
import { ProveedorDetailComponent } from '../../presentation/pages/proveedores/proveedor-detail/proveedor-detail.component';

/**
 * Componente de lista de proveedores usando Clean Architecture
 * 
 * CAMBIOS PRINCIPALES:
 * 1. Inyecta Use Cases en lugar de servicios
 * 2. Usa entidades del dominio
 * 3. La lógica de negocio está en los Use Cases
 * 4. El componente solo maneja presentación
 */
@Component({
  selector: 'app-proveedor-list-clean-alt',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
    MatTooltipModule,
    TranslateModule
  ],
  templateUrl: './proveedor-list-clean.component.html',
  styleUrls: ['./proveedor-list-clean.component.css']
})
export class ProveedorListComponentClean implements OnInit, AfterViewInit {
  // Inyección de Use Cases (en lugar de servicios)
  private getAllProveedoresUseCase = inject(GetAllProveedoresUseCase);
  private deleteProveedorUseCase = inject(DeleteProveedorUseCase);
  private searchProveedoresUseCase = inject(SearchProveedoresUseCase);
  private notify = inject(NotificationService);
  private dialog = inject(MatDialog);
  private confirmDialog = inject(ConfirmDialogService);
  private translate = inject(TranslateService);

  // Signals para estado reactivo (opcional)
  isLoading = signal(false);
  dataLoaded = signal(false);
  
  proveedores: ProveedorEntity[] = [];
  filtroBusqueda: string = '';
  
  dataSource = new MatTableDataSource<ProveedorEntity>();
  displayedColumns: string[] = ['razonSocial', 'ruc', 'telefono', 'correoContacto', 'estado', 'acciones'];

  // Estados disponibles
  estadosDisponibles = Object.values(EstadoProveedor);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.cargarProveedores();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.configurarFiltro();
  }

  /**
   * Carga todos los proveedores usando el caso de uso
   */
  cargarProveedores(): void {
    this.isLoading.set(true);
    
    this.getAllProveedoresUseCase.execute().subscribe({
      next: (proveedores) => {
        // Filtrar solo proveedores activos
        const proveedoresActivos = proveedores.filter(p => p.estado === EstadoProveedor.ACTIVO);
        this.proveedores = proveedoresActivos;
        this.dataSource.data = proveedoresActivos;
        
        // Reasignar paginator después de cargar datos
        setTimeout(() => {
          if (this.paginator) {
            this.dataSource.paginator = this.paginator;
            this.paginator.firstPage();
          }
        }, 0);
        
        this.isLoading.set(false);
        this.dataLoaded.set(true);
      },
      error: (error) => {
        this.notify.error('Error al cargar proveedores', 'Error');
        console.error(error);
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Busca proveedores usando el caso de uso
   */
  filtrarProveedores(): void {
    if (!this.filtroBusqueda || this.filtroBusqueda.trim() === '') {
      this.cargarProveedores();
      return;
    }

    this.isLoading.set(true);
    
    this.searchProveedoresUseCase.execute(this.filtroBusqueda).subscribe({
      next: (proveedores) => {
        // Filtrar solo proveedores activos
        const proveedoresActivos = proveedores.filter(p => p.estado === EstadoProveedor.ACTIVO);
        this.dataSource.data = proveedoresActivos;
        
        // Reasignar paginator después de filtrar
        setTimeout(() => {
          if (this.paginator) {
            this.dataSource.paginator = this.paginator;
            this.paginator.firstPage();
          }
        }, 0);
        
        this.isLoading.set(false);
        this.dataLoaded.set(true);
      },
      error: (error) => {
        this.notify.error('Error al buscar proveedores', 'Error');
        console.error(error);
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Abre el modal para agregar un nuevo proveedor
   */
  agregarProveedor(): void {
    const dialogRef = this.dialog.open(ProveedorCreateComponent, {
      width: '900px',
      maxHeight: '90vh',
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarProveedores();
      }
    });
  }

  /**
   * Abre el modal para editar un proveedor existente
   */
  editarProveedor(proveedor: ProveedorEntity): void {
    if (!proveedor.id) return;

    const dialogRef = this.dialog.open(ProveedorEditComponent, {
      width: '900px',
      maxHeight: '90vh',
      disableClose: false,
      data: { proveedorId: parseInt(proveedor.id) }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarProveedores();
      }
    });
  }

  /**
   * Elimina un proveedor usando el caso de uso
   */
  async eliminarProveedor(proveedor: ProveedorEntity): Promise<void> {
    if (!proveedor.id) return;
    
    const confirmed = await this.confirmDialog.confirmDelete(proveedor.razonSocial).toPromise();
    
    if (confirmed) {
      this.isLoading.set(true);

      this.deleteProveedorUseCase.execute(proveedor.id).subscribe({
        next: (success) => {
          if (success) {
            this.isLoading.set(false);
            this.notify.success(this.translate.instant('SUPPLIERS.DELETE_SUCCESS', { name: proveedor.razonSocial }));
            this.cargarProveedores();
          } else {
            this.notify.error(this.translate.instant('SUPPLIERS.DELETE_ERROR_GENERIC'));
            this.isLoading.set(false);
          }
        },
        error: (error) => {
          this.isLoading.set(false);
          this.notify.error(this.translate.instant('SUPPLIERS.DELETE_ERROR_GENERIC'));
          console.error(error);
        }
      });
    }
  }

  /**
   * Muestra el detalle de un proveedor
   */
  verProveedor(proveedor: ProveedorEntity): void {
    this.dialog.open(ProveedorDetailComponent, {
      width: '1000px',
      maxHeight: '90vh',
      disableClose: false,
      autoFocus: false,
      data: { proveedor: proveedor }
    });
  }

  private configurarFiltro(): void {
    this.dataSource.filterPredicate = (data: ProveedorEntity, filter: string) => {
      filter = filter.trim().toLowerCase();
      return (
        data.razonSocial.toLowerCase().includes(filter) ||
        data.ruc.toLowerCase().includes(filter) ||
        data.telefono.toLowerCase().includes(filter) ||
        data.correoContacto.toLowerCase().includes(filter) ||
        data.estado.toLowerCase().includes(filter) ||
        (data.certificacionesVigentes && data.certificacionesVigentes.join(', ').toLowerCase().includes(filter))
      );
    };
  }
}
