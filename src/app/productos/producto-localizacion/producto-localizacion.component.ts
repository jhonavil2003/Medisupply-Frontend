import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ProductoLocalizacionService } from './producto-localizacion.service';
import { ProductoLocalizacion } from './producto-localizacion.model';

@Component({
  selector: 'app-producto-localizacion',
  templateUrl: './producto-localizacion.component.html',
  styleUrls: ['./producto-localizacion.component.css']
})
export class ProductoLocalizacionComponent implements AfterViewInit {
  query = '';
  resultados: ProductoLocalizacion[] = [];
  cargando = false;
  error = '';
  usuario = 'bodegaUser'; // Simulado
  mostrarDetalle = false;
  productoDetalle: ProductoLocalizacion | null = null;
  filtroBusqueda: string = '';
  dataSource = new MatTableDataSource<ProductoLocalizacion>();
  displayedColumns: string[] = ['nombre', 'ubicacion', 'lote', 'fechaVencimiento', 'temperatura', 'cantidad', 'zona', 'acciones'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private service: ProductoLocalizacionService) {}

  buscar() {
    this.error = '';
    this.resultados = [];
    if (!this.query.trim()) {
      this.error = 'Ingrese un criterio de búsqueda.';
      return;
    }
    this.cargando = true;
    this.service.buscarProducto(this.query).subscribe(res => {
      this.cargando = false;
      if (res.length === 0) {
        this.error = 'Producto no encontrado';
        this.dataSource.data = [];
      } else {
        // FEFO: ordenar por fecha de vencimiento más próxima
        this.resultados = res.sort((a, b) => a.fechaVencimiento.localeCompare(b.fechaVencimiento));
        this.dataSource.data = this.resultados;
        this.service.registrarAuditoria({ usuario: this.usuario, query: this.query, fecha: new Date().toISOString() });
      }
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.filterPredicate = (data: ProductoLocalizacion, filter: string) => {
      filter = filter.trim().toLowerCase();
      const ubicacion = `${data.ubicacion.pasillo}-${data.ubicacion.estanteria}-${data.ubicacion.nivel}-${data.ubicacion.posicion}`;
      return (
        data.nombre.toLowerCase().includes(filter) ||
        data.sku.toLowerCase().includes(filter) ||
        data.lote.toLowerCase().includes(filter) ||
        data.fechaVencimiento.toLowerCase().includes(filter) ||
        data.temperatura.toLowerCase().includes(filter) ||
        String(data.cantidad).includes(filter) ||
        data.ubicacion.zona.toLowerCase().includes(filter) ||
        ubicacion.includes(filter)
      );
    };
  }

  filtrarBusqueda() {
    const filtro = this.filtroBusqueda.trim().toLowerCase();
    this.dataSource.filter = filtro;
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  verDetalle(producto: ProductoLocalizacion) {
    this.productoDetalle = producto;
    this.mostrarDetalle = true;
  }

  cerrarDetalle() {
    this.mostrarDetalle = false;
    this.productoDetalle = null;
  }

  copiarUbicacion(ubicacion: string) {
    navigator.clipboard.writeText(ubicacion);
    alert('Ubicación copiada al portapapeles');
  }
}