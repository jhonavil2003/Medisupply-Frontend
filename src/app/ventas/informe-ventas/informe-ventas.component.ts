import { Component, OnInit, ViewChild } from '@angular/core';
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
import { InformeVenta } from './informe-ventas.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-informe-ventas',
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
  templateUrl: './informe-ventas.component.html',
  styleUrls: ['./informe-ventas.component.css']
})
export class InformeVentasComponent implements OnInit {
  vendedores: string[] = ['Juan Pérez', 'Ana Torres', 'Carlos Ruiz'];
  productos: string[] = ['Producto A', 'Producto B', 'Producto C'];
  zonas: string[] = ['Norte', 'Sur', 'Este', 'Oeste'];

  filtroVendedor: string = '';
  filtroProducto: string = '';
  filtroZona: string = '';

  ventas: InformeVenta[] = [];
  dataSource = new MatTableDataSource<InformeVenta>();
  displayedColumns: string[] = ['vendedor', 'producto', 'zona', 'volumen', 'valorTotal', 'cumplimiento', 'tendencia'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private toastr: ToastrService) {}

  ngOnInit() {
    this.simularDatos();
    this.filtrar();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  simularDatos() {
    this.ventas = [
      { vendedor: 'Juan Pérez', producto: 'Producto A', zona: 'Norte', volumen: 120, valorTotal: 24000, cumplimiento: 95, tendencia: '↑' },
      { vendedor: 'Ana Torres', producto: 'Producto B', zona: 'Sur', volumen: 80, valorTotal: 16000, cumplimiento: 88, tendencia: '→' },
      { vendedor: 'Carlos Ruiz', producto: 'Producto C', zona: 'Este', volumen: 60, valorTotal: 12000, cumplimiento: 70, tendencia: '↓' },
      { vendedor: 'Juan Pérez', producto: 'Producto B', zona: 'Norte', volumen: 100, valorTotal: 20000, cumplimiento: 100, tendencia: '↑' },
      { vendedor: 'Ana Torres', producto: 'Producto A', zona: 'Oeste', volumen: 90, valorTotal: 18000, cumplimiento: 92, tendencia: '→' },
      { vendedor: 'Carlos Ruiz', producto: 'Producto A', zona: 'Sur', volumen: 50, valorTotal: 10000, cumplimiento: 60, tendencia: '↓' }
    ];
  }

  filtrar() {
    const filtradas = this.ventas.filter(v =>
      (!this.filtroVendedor || v.vendedor === this.filtroVendedor) &&
      (!this.filtroProducto || v.producto === this.filtroProducto) &&
      (!this.filtroZona || v.zona === this.filtroZona)
    );
    this.dataSource.data = filtradas;
  }

  exportar(tipo: 'pdf' | 'excel') {
    this.toastr.info('Funcionalidad de exportación simulada', tipo === 'pdf' ? 'PDF' : 'Excel');
    // Aquí iría la lógica real de exportación
  }
}
