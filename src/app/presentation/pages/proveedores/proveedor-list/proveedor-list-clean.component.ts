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

import { GetAllProveedoresUseCase } from '../../../../core/application/use-cases/proveedor/get-all-proveedores.use-case';
import { CreateProveedorUseCase } from '../../../../core/application/use-cases/proveedor/create-proveedor.use-case';
import { UpdateProveedorUseCase } from '../../../../core/application/use-cases/proveedor/update-proveedor.use-case';
import { DeleteProveedorUseCase } from '../../../../core/application/use-cases/proveedor/delete-proveedor.use-case';
import { SearchProveedoresUseCase } from '../../../../core/application/use-cases/proveedor/search-proveedores.use-case';

import { ProveedorEntity, EstadoProveedor } from '../../../../core/domain/entities/proveedor.entity';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-proveedor-list-clean',
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
    MatCardModule
  ],
  templateUrl: './proveedor-list.component.html',
  styleUrls: ['./proveedor-list.component.css']
})
export class ProveedorListComponentClean implements OnInit, AfterViewInit {
  private getAllProveedoresUseCase = inject(GetAllProveedoresUseCase);
  private createProveedorUseCase = inject(CreateProveedorUseCase);
  private updateProveedorUseCase = inject(UpdateProveedorUseCase);
  private deleteProveedorUseCase = inject(DeleteProveedorUseCase);
  private searchProveedoresUseCase = inject(SearchProveedoresUseCase);
  private notify = inject(NotificationService);

  isLoading = signal(false);
  
  proveedores: ProveedorEntity[] = [];
  proveedorEditando: Partial<ProveedorEntity> | null = null;
  mostrarModal: boolean = false;
  modoEdicion: boolean = false;
  mostrarDetalle: boolean = false;
  proveedorDetalle: ProveedorEntity | null = null;
  filtroBusqueda: string = '';
  
  dataSource = new MatTableDataSource<ProveedorEntity>();
  displayedColumns: string[] = ['razonSocial', 'ruc', 'telefono', 'correoContacto', 'estado', 'certificacionesVigentes', 'acciones'];

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

  cargarProveedores(): void {
    this.isLoading.set(true);
    
    this.getAllProveedoresUseCase.execute().subscribe({
      next: (proveedores) => {
        this.proveedores = proveedores;
        this.dataSource.data = proveedores;
        this.isLoading.set(false);
      },
      error: (error) => {
        this.notify.error('Error al cargar proveedores', 'Error');
        console.error(error);
        this.isLoading.set(false);
      }
    });
  }

  filtrarProveedores(): void {
    if (!this.filtroBusqueda || this.filtroBusqueda.trim() === '') {
      this.cargarProveedores();
      return;
    }

    this.isLoading.set(true);
    
    this.searchProveedoresUseCase.execute(this.filtroBusqueda).subscribe({
      next: (proveedores) => {
        this.dataSource.data = proveedores;
        this.isLoading.set(false);
      },
      error: (error) => {
        this.notify.error('Error al buscar proveedores', 'Error');
        console.error(error);
        this.isLoading.set(false);
      }
    });
  }

  agregarProveedor(): void {
    this.proveedorEditando = {
      razonSocial: '',
      ruc: '',
      telefono: '',
      correoContacto: '',
      estado: EstadoProveedor.ACTIVO,
      certificacionesVigentes: []
    };
    this.modoEdicion = false;
    this.mostrarModal = true;
  }

  editarProveedor(proveedor: ProveedorEntity): void {
    this.proveedorEditando = { ...proveedor };
    this.modoEdicion = true;
    this.mostrarModal = true;
  }

  guardarProveedor(): void {
    if (!this.proveedorEditando) return;

    this.isLoading.set(true);

    if (this.modoEdicion && this.proveedorEditando.id) {
      this.updateProveedorUseCase.execute({
        id: this.proveedorEditando.id,
        ...this.proveedorEditando
      } as any).subscribe({
        next: () => {
          this.notify.success('Proveedor actualizado correctamente');
          this.cerrarModal();
          this.cargarProveedores();
        },
        error: (error) => {
          this.notify.error(error.message || 'Error al actualizar', 'Error');
          this.isLoading.set(false);
        }
      });
    } else {
      this.createProveedorUseCase.execute(this.proveedorEditando as any).subscribe({
        next: () => {
          this.notify.success('Proveedor creado correctamente');
          this.cerrarModal();
          this.cargarProveedores();
        },
        error: (error) => {
          this.notify.error(error.message || 'Error al crear', 'Error');
          this.isLoading.set(false);
        }
      });
    }
  }

  eliminarProveedor(proveedor: ProveedorEntity): void {
    if (!proveedor.id) return;
    
    if (!confirm(`¿Está seguro de eliminar el proveedor "${proveedor.razonSocial}"?`)) {
      return;
    }

    this.isLoading.set(true);

    this.deleteProveedorUseCase.execute(proveedor.id).subscribe({
      next: (success) => {
        if (success) {
          this.notify.success('Proveedor eliminado correctamente');
          this.cargarProveedores();
        } else {
          this.notify.error('No se pudo eliminar el proveedor', 'Error');
          this.isLoading.set(false);
        }
      },
      error: (error) => {
        this.notify.error('Error al eliminar', 'Error');
        console.error(error);
        this.isLoading.set(false);
      }
    });
  }

  verProveedor(proveedor: ProveedorEntity): void {
    this.proveedorDetalle = proveedor;
    this.mostrarDetalle = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.proveedorEditando = null;
    this.modoEdicion = false;
    this.isLoading.set(false);
  }

  cerrarDetalle(): void {
    this.mostrarDetalle = false;
    this.proveedorDetalle = null;
  }

  cerrarDetalleProveedor(): void {
    this.mostrarDetalle = false;
    this.proveedorDetalle = null;
  }

  // Método para permitir solo números en campos específicos
  onlyNumbers(event: KeyboardEvent): boolean {
    const charCode = event.which || event.keyCode;
    // Permitir: backspace, delete, tab, escape, enter
    if ([8, 9, 27, 13, 46].indexOf(charCode) !== -1 ||
        // Permitir: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        (charCode === 65 && event.ctrlKey) ||
        (charCode === 67 && event.ctrlKey) ||
        (charCode === 86 && event.ctrlKey) ||
        (charCode === 88 && event.ctrlKey)) {
      return true;
    }
    // Solo números (0-9)
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  // Método para permitir números y algunos caracteres especiales en teléfono
  onlyPhoneChars(event: KeyboardEvent): boolean {
    const charCode = event.which || event.keyCode;
    // Permitir: backspace, delete, tab, escape, enter
    if ([8, 9, 27, 13, 46].indexOf(charCode) !== -1 ||
        // Permitir: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        (charCode === 65 && event.ctrlKey) ||
        (charCode === 67 && event.ctrlKey) ||
        (charCode === 86 && event.ctrlKey) ||
        (charCode === 88 && event.ctrlKey)) {
      return true;
    }
    // Permitir: números (0-9), +, -, (), espacio
    if ((charCode >= 48 && charCode <= 57) || // 0-9
        charCode === 43 || // +
        charCode === 45 || // -
        charCode === 40 || // (
        charCode === 41 || // )
        charCode === 32) { // espacio
      return true;
    }
    event.preventDefault();
    return false;
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
