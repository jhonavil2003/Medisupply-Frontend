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
import { MatDialog } from '@angular/material/dialog';
import { ProveedorService } from '../proveedor.service';
import { Proveedor } from '../proveedor';
import { NotificationService } from '../../../shared/services/notification.service';
import { ConfirmDialogService } from '../../../shared/services/confirm-dialog.service';
import { ProveedorDetailComponent } from '../proveedor-detail/proveedor-detail.component';

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
  private notificationService = inject(NotificationService);
  private confirmDialog = inject(ConfirmDialogService);
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);

  proveedores: Proveedor[] = [];
  proveedorEditando: Proveedor | null = null;
  proveedorEditIndex: number | null = null;
  mostrarModal: boolean = false;
  modoEdicion: boolean = false;
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
      // Filtrar solo proveedores activos para mostrar en la tabla
      const proveedoresActivos = this.filtrarProveedoresActivos(data);
      this.proveedores = proveedoresActivos;
      this.proveedoresFiltrados = [...proveedoresActivos];
      this.dataSource.data = this.proveedoresFiltrados;
    });

    // trigger initial load
    this.proveedorService.getProveedores().subscribe({ error: (err) => this.notificationService.error(`Error al cargar proveedores: ${err.message || err}`) });

    this.proveedorForm = this.fb.group({
      razonSocial: ['', Validators.required],
      ruc: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(15), Validators.pattern(/^\d+$/)]],
      telefono: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(20)]],
      correoContacto: ['', [Validators.required, Validators.email]],
      country: ['', Validators.required],
      estado: ['Activo', Validators.required],
      certificacionesVigentes: [''],
      website: ['', [Validators.pattern(/^(www\.)?[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/)]],
      addressLine1: ['', [Validators.maxLength(100)]],
      city: ['', [Validators.maxLength(50)]],
      state: ['', [Validators.maxLength(50)]],
      paymentTerms: ['', [Validators.maxLength(50)]],
      creditLimit: ['', [Validators.min(0)]],
      currency: ['', [Validators.maxLength(3), Validators.pattern(/^[A-Z]{3}$/)]]
    });
  }
  
  /**
   * Filtra solo proveedores activos para mostrar en la tabla principal
   */
  private filtrarProveedoresActivos(proveedores: Proveedor[]): Proveedor[] {
    return proveedores.filter(p => p.estado === 'Activo');
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
    // Open create modal with EMPTY fields (do not prefill)
    this.proveedorEditando = null;
    this.proveedorEditIndex = null;
    this.mostrarModal = true;
    this.modoEdicion = false;
    this.proveedorForm.reset({
      razonSocial: '',
      ruc: '',
      telefono: '',
      correoContacto: '',
      country: '',
      estado: '',
      certificacionesVigentes: '',
      website: '',
      addressLine1: '',
      city: '',
      state: '',
      paymentTerms: '',
      creditLimit: '',
      currency: ''
    });
  }

  editarProveedor(proveedor: Proveedor) {
    // Encontrar el índice real en el array filtrado usando el ID
    const index = this.proveedoresFiltrados.findIndex(p => p.id === proveedor.id);
    
    if (index === -1) {
      console.error('[ProveedorList] editarProveedor - Proveedor not found in filtered array');
      return;
    }

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
      country: item.country ?? '',
      estado: item.estado,
      certificacionesVigentes: (item.certificacionesVigentes || []).join(', '),
      website: item.website || '',
      addressLine1: item.addressLine1 || '',
      city: item.city || '',
      state: item.state || '',
      paymentTerms: item.paymentTerms || '',
      creditLimit: item.creditLimit ?? '',
      currency: item.currency || ''
    });
    console.log('[ProveedorList] editarProveedor - found index:', index, 'id:', item.id, 'modoEdicion:', this.modoEdicion);
    console.log('[ProveedorList] item data:', JSON.stringify(item, null, 2));
  }

  guardarEdicionProveedor() {
    console.log('[ProveedorList] guardarEdicionProveedor called. modoEdicion:', this.modoEdicion, 'editIndex:', this.proveedorEditIndex);
    if (this.proveedorForm.invalid) {
      this.proveedorForm.markAllAsTouched();
      console.log('[ProveedorList] Form invalid:', this.proveedorForm.errors, this.proveedorForm.value);
      this.notificationService.warning('Por favor complete los campos requeridos correctamente');
      return;
    }

    const formValue = this.proveedorForm.value;
    const proveedorPayload: Proveedor = {
      razonSocial: formValue.razonSocial,
      ruc: formValue.ruc,
      telefono: formValue.telefono,
      correoContacto: formValue.correoContacto,
  country: formValue.country,
  website: formValue.website || undefined,
  addressLine1: formValue.addressLine1 || undefined,
  city: formValue.city || undefined,
  state: formValue.state || undefined,
  paymentTerms: formValue.paymentTerms || undefined,
  creditLimit: formValue.creditLimit ? Number(formValue.creditLimit) : undefined,
  currency: formValue.currency || undefined,
      estado: formValue.estado,
      certificacionesVigentes: formValue.certificacionesVigentes ? formValue.certificacionesVigentes.split(',').map((s: string) => s.trim()) : []
    };

    if (this.modoEdicion && this.proveedorEditIndex !== null) {
      const id = this.proveedoresFiltrados[this.proveedorEditIndex].id;
      console.log('[ProveedorList] Updating proveedor id:', id, 'payload:', proveedorPayload);
      if (id) {
        this.proveedorService.updateProveedor(id, proveedorPayload).subscribe({
          next: () => {
            this.notificationService.success('Se guardaron los cambios del proveedor');
            this.closeModalAfterSave();
          },
          error: (err) => {
            console.error('[ProveedorList] update error', err);
            this.notificationService.error(`Error al actualizar proveedor: ${err.message || err}`);
          }
        });
      }
    } else {
      console.log('[ProveedorList] Creating proveedor payload:', proveedorPayload);
      this.proveedorService.addProveedor(proveedorPayload).subscribe({
        next: () => {
          this.notificationService.success('Se agregó el nuevo proveedor');
          this.closeModalAfterSave();
        },
        error: (err) => {
          console.error('[ProveedorList] create error', err);
          this.notificationService.error(`Error al crear proveedor: ${err.message || err}`);
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


  async eliminarProveedor(proveedor: Proveedor): Promise<void> {
    // Usar confirmAction en lugar de confirmDelete para personalizar el mensaje
    const confirmed = await this.confirmDialog.confirmAction(
      'Confirmar desactivación',
      `¿Está seguro que desea desactivar el proveedor "${proveedor.razonSocial}"? El proveedor ya no aparecerá en la lista principal.`
    ).toPromise();
    
    if (confirmed) {
      if (proveedor.id) {
        // Soft delete: cambiar estado a Inactivo en lugar de eliminar
        const proveedorInactivo: Proveedor = {
          ...proveedor,
          estado: 'Inactivo'
        };
        
        this.proveedorService.updateProveedor(proveedor.id, proveedorInactivo).subscribe({
          next: () => {
            this.notificationService.success('Proveedor desactivado correctamente');
            // No necesitamos filtrar manualmente, la suscripción se encargará
            // de actualizar automáticamente la vista con solo proveedores activos
          },
          error: (err) => this.notificationService.error(`Error al desactivar proveedor: ${err.message || err}`)
        });
      } else {
        // Para proveedores locales sin ID, simplemente remover de la lista
        const ruc = proveedor.ruc;
        this.proveedores = this.proveedores.filter(p => p.ruc !== ruc);
        this.filtrarProveedores();
        this.notificationService.success('Proveedor removido (local)');
      }
    }
  }
  
  verProveedor(proveedor: Proveedor) {
    const dialogRef = this.dialog.open(ProveedorDetailComponent, {
      width: '1000px',
      maxHeight: '90vh',
      disableClose: false,
      autoFocus: true,
      data: { proveedor: proveedor }
    });
  }

  // Método para permitir solo números en campos específicos
  onlyNumbers(event: KeyboardEvent): boolean {
    const charCode = event.which || event.keyCode;
    // Permitir: backspace, delete, tab, escape, enter
    if ([8, 9, 27, 13, 46].indexOf(charCode) !== -1 ||
        // Permitir: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        (charCode === 65 && event.ctrlKey) ||
        (charCode === 67 && event.ctrlKey) ||
        (charCode === 86 && event.ctrlKey) ||
        (charCode === 88 && event.ctrlKey)) {
      return true;
    }
    // Solo números (0-9)
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  // Método para permitir números y algunos caracteres especiales en teléfono
  onlyPhoneChars(event: KeyboardEvent): boolean {
    const charCode = event.which || event.keyCode;
    // Permitir: backspace, delete, tab, escape, enter
    if ([8, 9, 27, 13, 46].indexOf(charCode) !== -1 ||
        // Permitir: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        (charCode === 65 && event.ctrlKey) ||
        (charCode === 67 && event.ctrlKey) ||
        (charCode === 86 && event.ctrlKey) ||
        (charCode === 88 && event.ctrlKey)) {
      return true;
    }
    // Permitir: números (0-9), +, -, (), espacio
    if ((charCode >= 48 && charCode <= 57) || // 0-9
        charCode === 43 || // +
        charCode === 45 || // -
        charCode === 40 || // (
        charCode === 41 || // )
        charCode === 32) { // espacio
      return true;
    }
    event.preventDefault();
    return false;
  }
}
