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
import { TranslateModule, TranslateService } from '@ngx-translate/core';

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
    MatProgressSpinnerModule,
    TranslateModule
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
  private translate: TranslateService = inject(TranslateService);

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
      this.notificationService.warning(this.translate.instant('GOALS.COMPLETE_REQUIRED_FIELDS'));
      return;
    }

    if (!this.metaId) {
      this.notificationService.error(this.translate.instant('GOALS.INVALID_ID'));
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
        this.notificationService.success(this.translate.instant('GOALS.UPDATE_SUCCESS'));
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
          const errorMsg = error.error?.error || error.error?.message || this.translate.instant('GOALS.INVALID_DATA');
          this.notificationService.error(errorMsg);
        } 
        // Error HTTP 404
        else if (error.status === 404) {
          const errorMsg = error.error?.error || error.error?.message || this.translate.instant('GOALS.NOT_FOUND_UPDATE');
          this.notificationService.error(errorMsg);
        }
        // Otros errores HTTP
        else if (error.status) {
          this.notificationService.error(`${this.translate.instant('GOALS.SERVER_ERROR')}: ${error.statusText || this.translate.instant('GOALS.UNKNOWN_ERROR')}`);
        }
        // Error genérico
        else {
          this.notificationService.error(this.translate.instant('GOALS.UPDATE_ERROR'));
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
      return this.translate.instant('GOALS.FIELD_REQUIRED');
    }
    if (control?.hasError('minlength')) {
      return `${this.translate.instant('GOALS.MIN_LENGTH')} ${control.errors?.['minlength'].requiredLength}`;
    }
    if (control?.hasError('min')) {
      return `${this.translate.instant('GOALS.MIN_VALUE')} ${control.errors?.['min'].min}`;
    }
    if (control?.hasError('vendedorNotExists')) {
      return this.translate.instant('GOALS.SALESPERSON_NOT_EXISTS');
    }
    if (control?.hasError('productoNotExists')) {
      return this.translate.instant('GOALS.PRODUCT_NOT_EXISTS');
    }
    
    return '';
  }

  getTipoDisplay(tipo: TipoMeta): string {
    return tipo === TipoMeta.UNIDADES 
      ? this.translate.instant('GOALS.UNITS') 
      : this.translate.instant('GOALS.MONETARY');
  }
}
