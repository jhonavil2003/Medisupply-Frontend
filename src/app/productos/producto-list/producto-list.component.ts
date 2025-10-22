import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
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
import { ProductoService } from '../producto.service';
import { Producto } from '../producto';
import { NotificationService } from '../../notification.service';


@Component({
  selector: 'app-producto-list',
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
  templateUrl: './producto-list.component.html',
  styleUrls: ['./producto-list.component.css']
})
export class ProductoListComponent implements OnInit, AfterViewInit {
  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  filtroBusqueda: string = '';
  productoEditando: Producto | null = null;
  productoEditIndex: number | null = null;
  mostrarModal: boolean = false;
  modoEdicion: boolean = false;
  mostrarDetalle: boolean = false;
  productoDetalle: Producto | null = null;

  dataSource = new MatTableDataSource<Producto>();
  displayedColumns: string[] = ['codigo', 'nombre', 'categoria', 'proveedor', 'estado', 'acciones'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private productoService: ProductoService,
    private notify: NotificationService
  ) {}

  ngOnInit(): void {
    this.productoService.getProductos().subscribe(data => {
      this.productos = data;
      this.productosFiltrados = [...data];
      this.dataSource.data = this.productosFiltrados;
    });
  }



  filtrarProductos() {
    const filtro = this.filtroBusqueda.trim().toLowerCase();
    if (filtro === '') {
      this.productosFiltrados = [...this.productos];
    } else {
      this.productosFiltrados = this.productos.filter(producto =>
        producto.nombre.toLowerCase().includes(filtro) ||
        producto.codigo.toLowerCase().includes(filtro) ||
        producto.categoria.toLowerCase().includes(filtro) ||
        producto.proveedor.toLowerCase().includes(filtro)
      );
    }
    this.dataSource.data = this.productosFiltrados;
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }

  // Para que el filtro busque en todas las columnas relevantes
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.filterPredicate = (data: Producto, filter: string) => {
      return (
        data.nombre.toLowerCase().includes(filter) ||
        data.codigo.toLowerCase().includes(filter) ||
        data.categoria.toLowerCase().includes(filter) ||
        data.proveedor.toLowerCase().includes(filter)
      );
    };
  }

  agregarProducto() {
    this.productoEditando = this.productoService.crearProductoAleatorio();
    this.productoEditIndex = null;
    this.mostrarModal = true;
    this.modoEdicion = false;
  }

  editarProducto(index: number) {
    this.productoEditando = { ...this.productosFiltrados[index] };
    this.productoEditIndex = index;
    this.mostrarModal = true;
    this.modoEdicion = true;
  }

  guardarEdicionProducto() {
    if (this.productoEditando) {
      if (this.productoEditIndex !== null) {
        // Editar
        const idxGlobal = this.productos.findIndex(p => p.codigo === this.productosFiltrados[this.productoEditIndex!].codigo);
        if (idxGlobal !== -1) {
          this.productos[idxGlobal] = { ...this.productoEditando };
        }
      } else {
        // Agregar
        this.productoService.addProducto(this.productoEditando);
        this.productos = [...this.productoService['productos']];
      }
      this.filtrarProductos();
      this.mostrarModal = false;
      this.productoEditando = null;
      this.productoEditIndex = null;
      this.modoEdicion = false;
      this.notify.success('Registro guardado correctamente');
    }
  }

  cancelarEdicionProducto() {
    this.mostrarModal = false;
    this.productoEditando = null;
    this.productoEditIndex = null;
    this.modoEdicion = false;
  }

  eliminarProducto(index: number) {
    if (confirm('¿Está seguro de eliminar este producto?')) {
      const codigo = this.productosFiltrados[index].codigo;
      this.productos = this.productos.filter(p => p.codigo !== codigo);
      this.filtrarProductos();
      this.notify.success('Registro eliminado');
    }
  }

  verProducto(index: number) {
    this.productoDetalle = this.productosFiltrados[index];
    this.mostrarDetalle = true;
  }

  cerrarDetalleProducto() {
    this.mostrarDetalle = false;
    this.productoDetalle = null;
  }
}
