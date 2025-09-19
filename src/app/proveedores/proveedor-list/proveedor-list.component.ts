import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ProveedorService } from '../proveedor.service';
import { Proveedor } from '../proveedor';

@Component({
  selector: 'app-proveedor-list',
  templateUrl: './proveedor-list.component.html',
  styleUrls: ['./proveedor-list.component.css']
})
export class ProveedorListComponent implements OnInit, AfterViewInit {
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

  constructor(private proveedorService: ProveedorService) {}

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
    // Siempre trabajar sobre la lista actualizada
    this.dataSource.data = this.proveedores;
    const filtro = this.filtroBusqueda.trim().toLowerCase();
    this.dataSource.filter = filtro;
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
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
    const data = this.dataSource.filteredData;
    this.proveedorEditando = { ...data[index] };
    this.proveedorEditIndex = index;
    this.mostrarModal = true;
    this.modoEdicion = true;
  }

  guardarEdicionProveedor() {
    if (this.proveedorEditando) {
      if (this.proveedorEditIndex !== null) {
        // Editar existente
        const data = this.dataSource.filteredData;
        const idxGlobal = this.proveedores.findIndex(p => p.ruc === data[this.proveedorEditIndex!].ruc);
        if (idxGlobal !== -1) {
          this.proveedores[idxGlobal] = { ...this.proveedorEditando };
        }
      } else {
        // Agregar nuevo
        this.proveedorService.addProveedor(this.proveedorEditando);
        this.proveedores = [...this.proveedorService['proveedores']];
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
