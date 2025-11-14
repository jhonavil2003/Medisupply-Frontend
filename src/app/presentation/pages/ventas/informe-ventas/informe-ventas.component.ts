import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ReportsService, SalesSummaryFilters, SalesSummaryItem } from './reports.service';

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
    MatCardModule,
    MatProgressSpinnerModule,
    TranslateModule
  ],
  templateUrl: './informe-ventas.component.html',
  styleUrls: ['./informe-ventas.component.css']
})
export class InformeVentasComponent implements OnInit {
  private toastr = inject(ToastrService);
  private reportsService = inject(ReportsService);

  // Signals para estado
  loading = signal(false);
  
  // Listas únicas para filtros (se cargarán de la respuesta)
  vendedores = signal<Array<{id: string, nombre: string}>>([]);
  productos = signal<Array<{sku: string, nombre: string}>>([]);
  regiones = signal<string[]>([]);
  
  // Filtros
  filtroVendedor: string = '';
  filtroProducto: string = '';
  filtroRegion: string = '';
  filtroMes: number | null = null;
  filtroAnio: number = new Date().getFullYear();
  
  // Meses para el selector
  meses = [
    { value: 1, nombre: 'Enero' },
    { value: 2, nombre: 'Febrero' },
    { value: 3, nombre: 'Marzo' },
    { value: 4, nombre: 'Abril' },
    { value: 5, nombre: 'Mayo' },
    { value: 6, nombre: 'Junio' },
    { value: 7, nombre: 'Julio' },
    { value: 8, nombre: 'Agosto' },
    { value: 9, nombre: 'Septiembre' },
    { value: 10, nombre: 'Octubre' },
    { value: 11, nombre: 'Noviembre' },
    { value: 12, nombre: 'Diciembre' }
  ];

  // Años disponibles
  anios: number[] = [];

  ventas: SalesSummaryItem[] = [];
  dataSource = new MatTableDataSource<SalesSummaryItem>();
  displayedColumns: string[] = [
    'fecha',
    'vendedor',
    'region',
    'skuProducto',
    'producto',
    'tipoObjetivo',
    'volumenVentas',
    'valorTotal',
    'valorObjetivo',
    'cumplimiento'
  ];

  // Totales
  totales = {
    volumen: 0,
    valor: 0,
    vendedores: 0,
    productos: 0
  };

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit() {
    this.inicializarAnios();
    this.filtroMes = new Date().getMonth() + 1; // Mes actual
    this.cargarDatos();
  }

  ngAfterViewInit() {
    // El paginator y sort se asignan después de cargar los datos en cargarDatos()
    // No es necesario asignarlos aquí
  }

  inicializarAnios() {
    const anioActual = new Date().getFullYear();
    for (let i = anioActual; i >= anioActual - 5; i--) {
      this.anios.push(i);
    }
  }

  cargarDatos() {
    this.loading.set(true);
    
    const filters: SalesSummaryFilters = {
      year: this.filtroAnio
    };

    if (this.filtroMes) {
      filters.month = this.filtroMes;
    }
    if (this.filtroVendedor) {
      filters.employee_id = this.filtroVendedor;
    }
    if (this.filtroProducto) {
      filters.product_sku = this.filtroProducto;
    }
    if (this.filtroRegion) {
      filters.region = this.filtroRegion;
    }

    this.reportsService.getSalesSummary(filters).subscribe({
      next: (response) => {
        this.ventas = response.summary;
        this.dataSource.data = this.ventas;
        
        // Actualizar totales
        this.totales = {
          volumen: response.totals.total_volumen_ventas,
          valor: response.totals.total_valor_total,
          vendedores: response.totals.unique_salespersons,
          productos: response.totals.unique_products
        };

        // Extraer listas únicas para filtros
        this.actualizarListasFiltros();
        
        // Reasignar paginator y sort después de cargar datos
        // Usar setTimeout para asegurar que Angular detecte los cambios
        setTimeout(() => {
          if (this.paginator) {
            this.dataSource.paginator = this.paginator;
            this.paginator.firstPage(); // Volver a la primera página
          }
          if (this.sort) {
            this.dataSource.sort = this.sort;
          }
        }, 0);
        
        this.loading.set(false);
        this.toastr.success('Datos cargados correctamente');
      },
      error: (error) => {
        console.error('Error al cargar reportes:', error);
        this.toastr.error('Error al cargar los datos de reportes');
        this.loading.set(false);
      }
    });
  }

  actualizarListasFiltros() {
    // Extraer vendedores únicos con ID y nombre
    const vendedoresMap = new Map<string, string>();
    this.ventas.forEach(v => {
      vendedoresMap.set(v.employee_id, v.vendedor);
    });
    const vendedoresArray = Array.from(vendedoresMap.entries()).map(([id, nombre]) => ({ id, nombre }));
    this.vendedores.set(vendedoresArray.sort((a, b) => a.nombre.localeCompare(b.nombre)));

    // Extraer productos únicos con SKU y nombre
    const productosMap = new Map<string, string>();
    this.ventas.forEach(v => {
      productosMap.set(v.product_sku, v.product_name);
    });
    const productosArray = Array.from(productosMap.entries()).map(([sku, nombre]) => ({ sku, nombre }));
    this.productos.set(productosArray.sort((a, b) => a.nombre.localeCompare(b.nombre)));

    // Extraer regiones únicas (filtrar nulls)
    const regionesSet = new Set(
      this.ventas
        .map(v => v.region)
        .filter((r): r is string => r !== null)
    );
    this.regiones.set(Array.from(regionesSet).sort());
  }

  filtrar() {
    this.cargarDatos();
  }

  limpiarFiltros() {
    this.filtroVendedor = '';
    this.filtroProducto = '';
    this.filtroRegion = '';
    this.filtroMes = new Date().getMonth() + 1;
    this.filtroAnio = new Date().getFullYear();
    this.cargarDatos();
  }

  getCumplimientoClass(percent: number): string {
    if (percent >= 100) return 'cumplimiento-alto';
    if (percent >= 80) return 'cumplimiento-medio';
    return 'cumplimiento-bajo';
  }

  exportar(tipo: 'pdf' | 'excel') {
    this.toastr.info(`Exportando a ${tipo.toUpperCase()}...`);
    // TODO: Implementar exportación real
  }
}
