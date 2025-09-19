import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { RutaEntregaService } from '../ruta-entrega.service';
import { RutaEntrega } from '../ruta-entrega.model';

@Component({
  selector: 'app-ruta-entrega-lista',
  templateUrl: './ruta-entrega-list.component.html',
  styleUrls: ['./ruta-entrega-list.component.css']
})
export class RutaEntregaListaComponent implements AfterViewInit {
  rutas: RutaEntrega[] = [];
  filtroEstado: '' | 'pendiente' | 'en_curso' | 'completada' = '';
  filtroBusqueda: string = '';
  rutaSeleccionada: RutaEntrega | null = null;
  mostrarDetalle = false;
  dataSource = new MatTableDataSource<RutaEntrega>();
  displayedColumns: string[] = ['id', 'fecha', 'vehiculos', 'conductor', 'pedidos', 'estado', 'acciones'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private rutaService: RutaEntregaService) {
    this.rutaService.getRutas().subscribe(rutas => {
      this.rutas = rutas;
      this.aplicarFiltros();
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.filterPredicate = (data: RutaEntrega, filter: string) => {
      filter = filter.trim().toLowerCase();
      // Filtro por texto
      const texto = [
        data.id,
        data.fecha,
        data.vehiculos.join(', '),
        data.conductor,
        data.estado,
        data.pedidos.map(p => p.id + p.destino + p.detalle + p.estado).join(' ')
      ].join(' ').toLowerCase();
      return texto.includes(filter);
    };
  }

  aplicarFiltros() {
    let filtradas = this.rutas;
    if (this.filtroEstado) {
      filtradas = filtradas.filter(r => r.estado === this.filtroEstado);
    }
    this.dataSource.data = filtradas;
    this.filtrarBusqueda();
  }

  filtrarBusqueda() {
    const filtro = this.filtroBusqueda.trim().toLowerCase();
    this.dataSource.filter = filtro;
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  seleccionarRuta(ruta: RutaEntrega) {
    this.rutaSeleccionada = ruta;
    this.mostrarDetalle = true;
  }

  cerrarDetalle() {
    this.mostrarDetalle = false;
    this.rutaSeleccionada = null;
  }
}