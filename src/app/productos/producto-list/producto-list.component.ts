import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ProductoService } from '../producto.service';
import { Producto } from '../producto';
import { NotificationService } from '../../notification.service';


@Component({
  selector: 'app-producto-list',
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
