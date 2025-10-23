import { Component, OnInit, ViewChild, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { VendedorService } from './vendedor.service';
import { Vendedor } from './vendedor';
import { NotificationService } from '../notification.service';


@Component({
  selector: 'app-vendedor-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  templateUrl: './vendedor-list.component.html',
  styleUrls: ['./vendedor-list.component.css']
})
export class VendedorListComponent implements OnInit, AfterViewInit {
  private vendedorService = inject(VendedorService);
  private notify = inject(NotificationService);

  vendedores: Vendedor[] = [];
  filtroBusqueda: string = '';
  vendedorEditando: Vendedor | null = null;
  vendedorEditIndex: number | null = null;
  mostrarModal: boolean = false;
  modoEdicion: boolean = false;
  mostrarDetalle: boolean = false;
  vendedorDetalle: Vendedor | null = null;
  dataSource = new MatTableDataSource<Vendedor>();
  displayedColumns: string[] = ['documento', 'nombre', 'correo', 'telefono', 'region', 'acciones'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.vendedorService.getVendedores().subscribe(data => {
      this.vendedores = data;
      this.dataSource.data = this.vendedores;
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.filterPredicate = (data: Vendedor, filter: string) => {
      filter = filter.trim().toLowerCase();
      return (
        data.documento.toLowerCase().includes(filter) ||
        data.nombre.toLowerCase().includes(filter) ||
        data.correo.toLowerCase().includes(filter) ||
        data.telefono.toLowerCase().includes(filter) ||
        data.region.toLowerCase().includes(filter)
      );
    };
  }

  filtrarVendedores() {
    this.dataSource.data = this.vendedores;
    const filtro = this.filtroBusqueda.trim().toLowerCase();
    this.dataSource.filter = filtro;
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  agregarVendedor() {
    this.vendedorEditando = this.vendedorService.crearVendedorAleatorio();
    this.vendedorEditIndex = null;
    this.mostrarModal = true;
    this.modoEdicion = false;
  }

  editarVendedor(index: number) {
    const data = this.dataSource.filteredData;
    this.vendedorEditando = { ...data[index] };
    this.vendedorEditIndex = index;
    this.mostrarModal = true;
    this.modoEdicion = true;
  }

  guardarEdicionVendedor() {
    if (this.vendedorEditando) {
      if (this.vendedorEditIndex !== null) {
        const data = this.dataSource.filteredData;
        const idxGlobal = this.vendedores.findIndex(v => v.documento === data[this.vendedorEditIndex!].documento);
        if (idxGlobal !== -1) {
          this.vendedores[idxGlobal] = { ...this.vendedorEditando };
        }
      } else {
        this.vendedorService.addVendedor(this.vendedorEditando);
        this.vendedores = [...this.vendedorService['vendedores']];
      }
      this.filtrarVendedores();
      this.mostrarModal = false;
      this.vendedorEditando = null;
      this.vendedorEditIndex = null;
      this.modoEdicion = false;
      this.notify.success('Registro guardado correctamente');
    }
  }

  cancelarEdicionVendedor() {
    this.mostrarModal = false;
    this.vendedorEditando = null;
    this.vendedorEditIndex = null;
    this.modoEdicion = false;
  }

  eliminarVendedor(index: number) {
    if (confirm('¿Está seguro de eliminar este vendedor?')) {
      const data = this.dataSource.filteredData;
      const documento = data[index].documento;
      this.vendedores = this.vendedores.filter(v => v.documento !== documento);
      this.filtrarVendedores();
      this.notify.success('Registro eliminado');
    }
  }

  verVendedor(index: number) {
    const data = this.dataSource.filteredData;
    this.vendedorDetalle = data[index];
    this.mostrarDetalle = true;
  }

  cerrarDetalleVendedor() {
    this.mostrarDetalle = false;
    this.vendedorDetalle = null;
  }  
}
