import { Component, OnInit, ViewChild, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
import { ProveedorService } from '../proveedor.service';
import { Proveedor } from '../proveedor';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-proveedor-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
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
  templateUrl: './proveedor-list.component.html',
  styleUrls: ['./proveedor-list.component.css']
})
export class ProveedorListComponent implements OnInit, AfterViewInit {
  private proveedorService = inject(ProveedorService);
  private notify = inject(NotificationService);
    private fb = inject(FormBuilder);

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

  proveedorForm!: FormGroup;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    // subscribe to the live proveedores$ so UI updates after create/update/delete
    this.proveedorService.proveedores$.subscribe(data => {
      this.proveedores = data;
      this.proveedoresFiltrados = [...data];
      this.dataSource.data = this.proveedoresFiltrados;
    });

    // trigger initial load
    this.proveedorService.getProveedores().subscribe({ error: (err) => this.notify.error(`Error al cargar proveedores: ${err.message || err}`) });

    this.proveedorForm = this.fb.group({
      razonSocial: ['', [Validators.required, Validators.minLength(3)]],
      ruc: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
      telefono: ['', Validators.required],
      correoContacto: ['', [Validators.required, Validators.email]],
      country: ['Colombia', Validators.required],
      estado: ['Activo', Validators.required],
      certificacionesVigentes: ['']
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
    const filtro = this.filtroBusqueda.trim().toLowerCase();
    if (filtro === '') {
      this.proveedoresFiltrados = [...this.proveedores];
    } else {
      this.proveedoresFiltrados = this.proveedores.filter(proveedor =>
        proveedor.razonSocial.toLowerCase().includes(filtro) ||
        proveedor.ruc.toLowerCase().includes(filtro) ||
        proveedor.telefono.toLowerCase().includes(filtro) ||
        proveedor.correoContacto.toLowerCase().includes(filtro) ||
        proveedor.estado.toLowerCase().includes(filtro) ||
        (proveedor.certificacionesVigentes && proveedor.certificacionesVigentes.join(', ').toLowerCase().includes(filtro))
      );
    }
    this.dataSource.data = this.proveedoresFiltrados;
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }

  agregarProveedorAleatorio() {
    const nuevo = this.proveedorService.crearProveedorAleatorio();
    this.proveedorEditando = { ...nuevo };
    this.proveedorEditIndex = null;
    this.mostrarModal = true;
    this.modoEdicion = false;
    this.proveedorForm.reset({
      razonSocial: nuevo.razonSocial,
      ruc: nuevo.ruc,
      telefono: nuevo.telefono,
      correoContacto: nuevo.correoContacto,
      country: nuevo.country || 'Colombia',
      estado: nuevo.estado,
      certificacionesVigentes: (nuevo.certificacionesVigentes || []).join(', ')
    });
  }

  editarProveedor(index: number) {
    this.proveedorEditando = { ...this.proveedoresFiltrados[index] };
    this.proveedorEditIndex = index;
    this.mostrarModal = true;
    this.modoEdicion = true;
    const item = this.proveedoresFiltrados[index];
    this.proveedorForm.reset({
      razonSocial: item.razonSocial,
      ruc: item.ruc,
      telefono: item.telefono,
      correoContacto: item.correoContacto,
      country: item.country || 'Colombia',
      estado: item.estado,
      certificacionesVigentes: (item.certificacionesVigentes || []).join(', ')
    });
    console.log('[ProveedorList] editarProveedor - index:', index, 'id:', item.id, 'modoEdicion:', this.modoEdicion);
  }

  guardarEdicionProveedor() {
    console.log('[ProveedorList] guardarEdicionProveedor called. modoEdicion:', this.modoEdicion, 'editIndex:', this.proveedorEditIndex);
    if (this.proveedorForm.invalid) {
      this.proveedorForm.markAllAsTouched();
      console.log('[ProveedorList] Form invalid:', this.proveedorForm.errors, this.proveedorForm.value);
      this.notify.warning('Por favor complete los campos requeridos correctamente');
      return;
    }

    const formValue = this.proveedorForm.value;
    const proveedorPayload: Proveedor = {
      razonSocial: formValue.razonSocial,
      ruc: formValue.ruc,
      telefono: formValue.telefono,
      correoContacto: formValue.correoContacto,
      estado: formValue.estado,
      certificacionesVigentes: formValue.certificacionesVigentes ? formValue.certificacionesVigentes.split(',').map((s: string) => s.trim()) : []
    };

    if (this.modoEdicion && this.proveedorEditIndex !== null) {
      const id = this.proveedoresFiltrados[this.proveedorEditIndex].id;
      console.log('[ProveedorList] Updating proveedor id:', id, 'payload:', proveedorPayload);
      if (id) {
        this.proveedorService.updateProveedor(id, proveedorPayload).subscribe({
          next: () => {
            this.notify.success('Se guardaron los cambios del proveedor');
            this.closeModalAfterSave();
          },
          error: (err) => {
            console.error('[ProveedorList] update error', err);
            this.notify.error(`Error al actualizar proveedor: ${err.message || err}`);
          }
        });
      }
    } else {
      console.log('[ProveedorList] Creating proveedor payload:', proveedorPayload);
      this.proveedorService.addProveedor(proveedorPayload).subscribe({
        next: () => {
          this.notify.success('Se agregó el nuevo proveedor');
          this.closeModalAfterSave();
        },
        error: (err) => {
          console.error('[ProveedorList] create error', err);
          this.notify.error(`Error al crear proveedor: ${err.message || err}`);
        }
      });
    }
  }

  private closeModalAfterSave() {
    this.filtrarProveedores();
    this.mostrarModal = false;
    this.proveedorEditando = null;
    this.proveedorEditIndex = null;
    this.modoEdicion = false;
    this.proveedorForm.reset();
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
      const item = data[index];
      if (item.id) {
        this.proveedorService.deleteProveedor(item.id).subscribe({
          next: () => this.notify.success('Registro eliminado'),
          error: (err) => this.notify.error(`Error al eliminar proveedor: ${err.message || err}`)
        });
      } else {
        const ruc = item.ruc;
        this.proveedores = this.proveedores.filter(p => p.ruc !== ruc);
        this.filtrarProveedores();
        this.notify.success('Registro eliminado (local)');
      }
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
