import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { CreateMetaVentaUseCase } from '../../../../core/application/use-cases/meta/meta-venta.use-cases';
import { CreateMetaVentaDto, Region, Trimestre, TipoMeta } from '../../../../core/domain/entities/meta-venta.entity';
import { NotificationService } from '../../../shared/services/notification.service';
import { VendedorRepository } from '../../../../core/domain/repositories/vendedor.repository';
import { ProductoRepository } from '../../../../core/domain/repositories/producto.repository';
import { vendedorExistsValidator, productoExistsValidator } from '../validators/meta-validators';

@Component({
  selector: 'app-meta-create',
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
  templateUrl: './meta-create.component.html',
  styleUrls: ['./meta-create.component.css']
})
export class MetaCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<MetaCreateComponent>);
  private createMetaUseCase = inject(CreateMetaVentaUseCase);
  private notificationService = inject(NotificationService);
  private vendedorRepository = inject(VendedorRepository);
  private productoRepository = inject(ProductoRepository);
  private translate: TranslateService = inject(TranslateService);

  loading = signal(false);
  metaForm!: FormGroup;

  // Enums para los selects
  readonly regiones = [Region.NORTE, Region.SUR, Region.ESTE, Region.OESTE];
  readonly trimestres = [Trimestre.Q1, Trimestre.Q2, Trimestre.Q3, Trimestre.Q4];
  readonly tipos = [TipoMeta.UNIDADES, TipoMeta.MONETARIO];

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
  }

  onSubmit(): void {
    if (this.metaForm.invalid) {
      this.metaForm.markAllAsTouched();
      this.notificationService.warning(this.translate.instant('GOALS.COMPLETE_REQUIRED_FIELDS'));
      return;
    }

    this.loading.set(true);
    const formValue = this.metaForm.value;

    const metaDto: CreateMetaVentaDto = {
      idVendedor: formValue.idVendedor.trim(),
      idProducto: formValue.idProducto.trim(),
      region: formValue.region,
      trimestre: formValue.trimestre,
      valorObjetivo: Number(formValue.valorObjetivo),
      tipo: formValue.tipo
    };

    console.log('📝 MetaDTO a crear:', metaDto);

    this.createMetaUseCase.execute(metaDto).subscribe({
      next: (meta) => {
        this.loading.set(false);
        this.notificationService.success(this.translate.instant('GOALS.CREATE_SUCCESS'));
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.loading.set(false);
        console.error('Error al crear meta:', error);
        
        // Si el error tiene un mensaje personalizado del repositorio
        if (error.userMessage) {
          this.notificationService.error(error.userMessage);
        }
        // Error de validación del use case
        else if (error.message && !error.status) {
          this.notificationService.error(error.message);
        }
        // Error HTTP 400 (duplicado o validación backend)
        else if (error.status === 400) {
          const errorMsg = error.error?.error || error.error?.message || this.translate.instant('GOALS.INVALID_DATA');
          this.notificationService.error(errorMsg);
        } 
        // Error HTTP 404 (vendedor o producto no encontrado)
        else if (error.status === 404) {
          const errorMsg = error.error?.error || error.error?.message || this.translate.instant('GOALS.NOT_FOUND');
          this.notificationService.error(errorMsg);
        }
        // Otros errores HTTP
        else if (error.status) {
          this.notificationService.error(`${this.translate.instant('GOALS.SERVER_ERROR')}: ${error.statusText || this.translate.instant('GOALS.UNKNOWN_ERROR')}`);
        }
        // Error genérico
        else {
          this.notificationService.error(this.translate.instant('GOALS.CREATE_ERROR'));
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
