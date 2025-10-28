import { Component, OnInit, ViewChild, AfterViewInit, inject } from '@angular/core';
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
import { ProveedorService } from '../proveedor.service';
import { Proveedor } from '../proveedor';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-proveedor-list',
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
export class ProveedorListComponent implements OnInit, AfterViewInit {
  private proveedorService = inject(ProveedorService);
  private notify = inject(NotificationService);

  proveedores: Proveedor[] = [];
  proveedorEditando: Proveedor | null = null;
  proveedorEditIndex: number | null = null;
  mostrarModal: boolean = false;
  modoEdicion: boolean = false;
  mostrarDetalle: boolean = false;
  proveedorDetalle: Proveedor | null = null;
  filtroBusqueda: string = '';
  proveedoresFiltrados: Proveedor[] = [];
  dataSource = new MatTableDataSource<Proveedor>();
  displayedColumns: string[] = ['razonSocial', 'ruc', 'telefono', 'correoContacto', 'estado', 'certificacionesVigentes', 'acciones'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.proveedorService.getProveedores().subscribe(data => {
      this.proveedores = data;
      this.proveedoresFiltrados = [...data];
      this.dataSource.data = this.proveedoresFiltrados;
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.filterPredicate = (data: Proveedor, filter: string) => {
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

  filtrarProveedores() {
    const filtro = this.filtroBusqueda.trim().toLowerCase();
    if (filtro === '') {
      this.proveedoresFiltrados = [...this.proveedores];
    } else {
      this.proveedoresFiltrados = this.proveedores.filter(proveedor =>
        proveedor.razonSocial.toLowerCase().includes(filtro) ||
        proveedor.ruc.toLowerCase().includes(filtro) ||
        proveedor.telefono.toLowerCase().includes(filtro) ||
        proveedor.correoContacto.toLowerCase().includes(filtro) ||
        proveedor.estado.toLowerCase().includes(filtro) ||
        (proveedor.certificacionesVigentes && proveedor.certificacionesVigentes.join(', ').toLowerCase().includes(filtro))
      );
    }
    this.dataSource.data = this.proveedoresFiltrados;
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }

  agregarProveedorAleatorio() {
    const nuevo = this.proveedorService.crearProveedorAleatorio();
    this.proveedorEditando = { ...nuevo };
    this.proveedorEditIndex = null;
    this.mostrarModal = true;
    this.modoEdicion = false;
  }

  editarProveedor(index: number) {
    this.proveedorEditando = { ...this.proveedoresFiltrados[index] };
    this.proveedorEditIndex = index;
    this.mostrarModal = true;
    this.modoEdicion = true;
  }

  guardarEdicionProveedor() {
    if (this.proveedorEditando) {
      if (this.proveedorEditIndex !== null) {
        // Editar existente
        const idxGlobal = this.proveedores.findIndex(p => p.ruc === this.proveedoresFiltrados[this.proveedorEditIndex!].ruc);
        if (idxGlobal !== -1) {
          this.proveedores[idxGlobal] = { ...this.proveedorEditando };
        }
        this.notify.success('Se guardaron los cambios del proveedor');
      } else {
        // Agregar nuevo
        this.proveedorService.addProveedor(this.proveedorEditando);
        this.proveedores = [...this.proveedorService['proveedores']];
        this.notify.success('Se agrego el nuevo proveedor');
      }
      this.filtrarProveedores();
      this.mostrarModal = false;
      this.proveedorEditando = null;
      this.proveedorEditIndex = null;
      this.modoEdicion = false;
    }
  }

  cancelarEdicionProveedor() {
    this.mostrarModal = false;
    this.proveedorEditando = null;
    this.proveedorEditIndex = null;
    this.modoEdicion = false;
  }


  eliminarProveedor(index: number) {
    if (confirm('¿Está seguro de eliminar este proveedor?')) {
      const data = this.dataSource.filteredData;
      const ruc = data[index].ruc;
      this.proveedores = this.proveedores.filter(p => p.ruc !== ruc);
      this.filtrarProveedores();
      this.notify.success('Registro eliminado');
    }
  }
  verProveedor(index: number) {
    const data = this.dataSource.filteredData;
    this.proveedorDetalle = data[index];
    this.mostrarDetalle = true;
  }

  cerrarDetalleProveedor() {
    this.mostrarDetalle = false;
    this.proveedorDetalle = null;
  }
}
