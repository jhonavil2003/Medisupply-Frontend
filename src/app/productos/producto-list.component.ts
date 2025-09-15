import { Component, OnInit } from '@angular/core';
import { ProductoService } from './producto.service';
import { Producto } from './producto';

@Component({
  selector: 'app-producto-list',
  templateUrl: './producto-list.component.html',
  styleUrls: ['./producto-list.component.css']
})
export class ProductoListComponent implements OnInit {
  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  filtroBusqueda: string = '';
  productoEditando: Producto | null = null;
  productoEditIndex: number | null = null;
  mostrarModal: boolean = false;
  modoEdicion: boolean = false;
  mostrarDetalle: boolean = false;
  productoDetalle: Producto | null = null;

  constructor(private productoService: ProductoService) {}

  ngOnInit(): void {
    this.productoService.getProductos().subscribe(data => {
      this.productos = data;
      this.productosFiltrados = [...data];
    });
  }

  filtrarProductos() {
    const filtro = this.filtroBusqueda.trim().toLowerCase();
    if (!filtro) {
      this.productosFiltrados = [...this.productos];
      return;
    }
    this.productosFiltrados = this.productos.filter(p =>
      p.nombre.toLowerCase().includes(filtro) ||
      p.codigo.toLowerCase().includes(filtro) ||
      p.categoria.toLowerCase().includes(filtro) ||
      p.proveedor.toLowerCase().includes(filtro)
    );
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
        const idxGlobal = this.productos.findIndex(p => p.codigo === this.productosFiltrados[this.productoEditIndex!].codigo);
        if (idxGlobal !== -1) {
          this.productos[idxGlobal] = { ...this.productoEditando };
        }
      } else {
        this.productoService.addProducto(this.productoEditando);
        this.productos = [...this.productoService['productos']];
      }
      this.filtrarProductos();
      this.mostrarModal = false;
      this.productoEditando = null;
      this.productoEditIndex = null;
      this.modoEdicion = false;
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
