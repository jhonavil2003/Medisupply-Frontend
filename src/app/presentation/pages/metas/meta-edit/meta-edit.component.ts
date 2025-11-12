import { Component, inject, signal, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import {
  GetMetaByIdUseCase,
  UpdateMetaVentaUseCase
} from '../../../../core/application/use-cases/meta/meta-venta.use-cases';
import { UpdateMetaVentaDto, Region, Trimestre, TipoMeta } from '../../../../core/domain/entities/meta-venta.entity';
import { NotificationService } from '../../../shared/services/notification.service';
import { VendedorRepository } from '../../../../core/domain/repositories/vendedor.repository';
import { ProductoRepository } from '../../../../core/domain/repositories/producto.repository';
import { vendedorExistsValidator, productoExistsValidator } from '../validators/meta-validators';

@Component({
  selector: 'app-meta-edit',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './meta-edit.component.html',
  styleUrls: ['./meta-edit.component.css']
})
export class MetaEditComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<MetaEditComponent>);
  private getMetaByIdUseCase = inject(GetMetaByIdUseCase);
  private updateMetaUseCase = inject(UpdateMetaVentaUseCase);
  private notificationService = inject(NotificationService);
  private vendedorRepository = inject(VendedorRepository);
  private productoRepository = inject(ProductoRepository);

  loading = signal(false);
  metaId: number;
  metaForm!: FormGroup;

  readonly regiones = [Region.NORTE, Region.SUR, Region.ESTE, Region.OESTE];
  readonly trimestres = [Trimestre.Q1, Trimestre.Q2, Trimestre.Q3, Trimestre.Q4];
  readonly tipos = [TipoMeta.UNIDADES, TipoMeta.MONETARIO];

  constructor(@Inject(MAT_DIALOG_DATA) public data: { metaId: number }) {
    this.metaId = data.metaId;
  }

  ngOnInit(): void {
    this.metaForm = this.fb.group({
      idVendedor: ['', 
        [Validators.required, Validators.minLength(2)],
        [vendedorExistsValidator(this.vendedorRepository)]
      ],
      idProducto: ['', 
        [Validators.required, Validators.minLength(2)],
        [productoExistsValidator(this.productoRepository)]
      ],
      region: ['', Validators.required],
      trimestre: ['', Validators.required],
      valorObjetivo: [0, [Validators.required, Validators.min(1)]],
      tipo: ['', Validators.required]
    });

    if (this.metaId) {
      this.loadMeta(this.metaId);
    } else {
      this.notificationService.error('ID de meta no válido');
      this.dialogRef.close(false);
    }
  }

  loadMeta(id: number): void {
    this.loading.set(true);
    
    this.getMetaByIdUseCase.execute(id).subscribe({
      next: (meta) => {
        if (meta) {
          this.metaForm.patchValue({
            idVendedor: meta.idVendedor,
            idProducto: meta.idProducto,
            region: meta.region,
            trimestre: meta.trimestre,
            valorObjetivo: meta.valorObjetivo,
            tipo: meta.tipo
          });
          this.loading.set(false);
        } else {
          this.notificationService.error('Meta no encontrada');
          this.dialogRef.close(false);
        }
      },
      error: (error) => {
        console.error('Error al cargar meta:', error);
        this.notificationService.error('Error al cargar meta');
        this.loading.set(false);
        this.dialogRef.close(false);
      }
    });
  }

  onSubmit(): void {
    if (this.metaForm.invalid) {
      this.metaForm.markAllAsTouched();
      this.notificationService.warning('Por favor complete los campos requeridos correctamente');
      return;
    }

    if (!this.metaId) {
      this.notificationService.error('ID de meta no válido');
      return;
    }

    this.loading.set(true);
    const formValue = this.metaForm.value;

    const metaDto: UpdateMetaVentaDto = {
      id: this.metaId,
      idVendedor: formValue.idVendedor.trim(),
      idProducto: formValue.idProducto.trim(),
      region: formValue.region,
      trimestre: formValue.trimestre,
      valorObjetivo: Number(formValue.valorObjetivo),
      tipo: formValue.tipo
    };

    this.updateMetaUseCase.execute(metaDto).subscribe({
      next: (meta) => {
        this.loading.set(false);
        this.notificationService.success('Meta actualizada exitosamente');
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.loading.set(false);
        console.error('Error al actualizar meta:', error);
        
        // Si el error tiene un mensaje personalizado del repositorio
        if (error.userMessage) {
          this.notificationService.error(error.userMessage);
        }
        // Error de validación del use case
        else if (error.message && !error.status) {
          this.notificationService.error(error.message);
        }
        // Error HTTP 400 (validación backend)
        else if (error.status === 400) {
          const errorMsg = error.error?.error || error.error?.message || 'Datos inválidos. Verifique que el vendedor y producto existan';
          this.notificationService.error(errorMsg);
        } 
        // Error HTTP 404
        else if (error.status === 404) {
          const errorMsg = error.error?.error || error.error?.message || 'Meta, vendedor o producto no encontrado';
          this.notificationService.error(errorMsg);
        }
        // Otros errores HTTP
        else if (error.status) {
          this.notificationService.error(`Error del servidor: ${error.statusText || 'Error desconocido'}`);
        }
        // Error genérico
        else {
          this.notificationService.error('Error al actualizar meta. Verifique los datos ingresados');
        }
      }
    });
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  getErrorMessage(field: string): string {
    const control = this.metaForm.get(field);
    
    if (control?.hasError('required')) {
      return 'Este campo es requerido';
    }
    if (control?.hasError('minlength')) {
      return `Mínimo ${control.errors?.['minlength'].requiredLength} caracteres`;
    }
    if (control?.hasError('min')) {
      return `El valor debe ser mayor a ${control.errors?.['min'].min}`;
    }
    if (control?.hasError('vendedorNotExists')) {
      return 'El vendedor no existe en el sistema';
    }
    if (control?.hasError('productoNotExists')) {
      return 'El producto no existe en el sistema';
    }
    
    return '';
  }

  getTipoDisplay(tipo: TipoMeta): string {
    return tipo === TipoMeta.UNIDADES ? 'Unidades' : 'Monetario';
  }
}
