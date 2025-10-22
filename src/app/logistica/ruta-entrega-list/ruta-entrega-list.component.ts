import { Component, ViewChild, AfterViewInit } from '@angular/core';
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
import { MatListModule } from '@angular/material/list';
import { RutaEntregaService } from '../ruta-entrega.service';
import { RutaEntrega } from '../ruta-entrega.model';

@Component({
  selector: 'app-ruta-entrega-lista',
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
    MatListModule
  ],
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